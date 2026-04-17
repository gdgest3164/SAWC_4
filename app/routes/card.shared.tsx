import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import html2canvas from "html2canvas";
import { toBlob as htmlToBlob } from "html-to-image";
import * as FileSaver from "file-saver";
import BusinessCard from "~/components/BusinessCard";

export const meta: MetaFunction = () => {
  return [{ title: "지화 명함 - 디지털 명함" }, { name: "description", content: "QR코드로 공유된 지화 명함입니다" }];
};

interface CardData {
  letters: { char: string; imagePath: string }[];
  userName: string;
  signSize: number;
  layoutDirection: "horizontal" | "vertical";
  phoneNumber?: string;
  design?: {
    id: string;
    name: string;
    cardClass: string;
    borderColor: string;
    textColor: string;
    subtextColor: string;
    dividerColor: string;
    accentColor: string;
    characterBg: string;
  };
  timestamp: number;
}

const isIOS = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
};

const waitForImages = async (root: HTMLElement) => {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
        setTimeout(resolve, 5000);
      });
    })
  );
};

// iOS에서 html-to-image의 img fetch가 실패해 이미지가 빠지는 문제 회피:
// 모든 <img>를 canvas로 그려서 data URL로 치환
const inlineImagesAsDataUrl = async (root: HTMLElement): Promise<() => void> => {
  const imgs = Array.from(root.querySelectorAll("img"));
  const originals = new Map<HTMLImageElement, string>();

  await Promise.all(
    imgs.map(async (img) => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      if (img.src.startsWith("data:")) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        originals.set(img, img.src);
        img.src = dataUrl;
      } catch {
        // tainted canvas 등 실패 시 원본 유지
      }
    })
  );

  return () => {
    originals.forEach((src, img) => {
      img.src = src;
    });
  };
};

const renderCardToBlob = async (el: HTMLElement): Promise<Blob> => {
  try {
    const blob = await htmlToBlob(el, {
      pixelRatio: 2,
      backgroundColor: "#FFFFFF",
      width: 620,
      height: 380,
      skipFonts: true,
      style: { transform: "none", transformOrigin: "top left" },
    });
    if (blob) return blob;
    throw new Error("html-to-image 결과 없음");
  } catch {
    const canvas = await html2canvas(el, {
      scale: 2,
      backgroundColor: "#FFFFFF",
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: 620,
      height: 380,
    });
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob 실패"))), "image/png");
    });
  }
};

export default function SharedCard() {
  const [searchParams] = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [scale, setScale] = useState(1);
  const preparedBlobRef = useRef<Blob | null>(null);
  const [blobReady, setBlobReady] = useState(false);

  useEffect(() => {
    const updateScale = () => {
      setScale(Math.min(1, (window.innerWidth - 32) / 620));
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    try {
      const id = searchParams.get("id");
      const data = searchParams.get("data");

      if (id) {
        fetch(`/api/card/${id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error) setError(data.error);
            else setCardData(data);
            setLoading(false);
          })
          .catch(() => {
            setError("명함 데이터를 불러올 수 없습니다.");
            setLoading(false);
          });
        return;
      } else if (data) {
        setCardData(JSON.parse(decodeURIComponent(data)) as CardData);
      } else {
        setError("명함 데이터가 없습니다.");
      }
    } catch {
      setError("잘못된 명함 데이터입니다.");
    }
    setLoading(false);
  }, [searchParams]);

  // 카드 렌더 후 blob 사전 생성 (iOS user gesture 보존 + 즉시 저장 가능)
  useEffect(() => {
    if (!cardData || !cardRef.current) return;
    let cancelled = false;

    const prepare = async () => {
      try {
        if (!cardRef.current) return;
        await waitForImages(cardRef.current);
        if (cancelled) return;
        const restore = await inlineImagesAsDataUrl(cardRef.current);
        try {
          if (cancelled) return;
          const blob = await renderCardToBlob(cardRef.current);
          if (cancelled) return;
          preparedBlobRef.current = blob;
          setBlobReady(true);
        } finally {
          restore();
        }
      } catch (e) {
        console.error("이미지 사전 생성 실패:", e);
      }
    };

    const timer = setTimeout(prepare, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cardData]);

  const getBlob = async (): Promise<{ blob: Blob; fileName: string }> => {
    const fileName = `지화명함_${cardData!.userName}_${new Date().getTime()}.png`;
    let blob = preparedBlobRef.current;
    if (!blob) {
      if (!cardRef.current) throw new Error("카드 요소 없음");
      await waitForImages(cardRef.current);
      const restore = await inlineImagesAsDataUrl(cardRef.current);
      try {
        blob = await renderCardToBlob(cardRef.current);
      } finally {
        restore();
      }
    }
    return { blob, fileName };
  };

  // 기본 저장: iOS는 Web Share(사진첩), 그 외는 직접 다운로드
  const saveAsImage = async () => {
    if (!cardData) return;
    setIsGenerating(true);
    setError(null);
    try {
      const { blob, fileName } = await getBlob();

      if (isIOS()) {
        const file = new File([blob], fileName, { type: "image/png" });
        const navShare = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
        if (navShare.canShare && navShare.canShare({ files: [file] }) && typeof navigator.share === "function") {
          try {
            await navigator.share({ files: [file], title: "지화 명함" });
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
            return;
          } catch (shareError) {
            if ((shareError as Error).name === "AbortError") return;
          }
        }
        // iOS 구형 폴백: 새 탭에서 길게 눌러 저장
        const url = URL.createObjectURL(blob);
        if (!window.open(url, "_blank")) window.location.href = url;
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        FileSaver.saveAs(blob, fileName);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      setError(`저장 중 오류가 발생했습니다: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 공유하기: 명시적 공유 시트 (카톡/메일 등)
  const shareImage = async () => {
    if (!cardData) return;
    setIsGenerating(true);
    setError(null);
    try {
      const { blob, fileName } = await getBlob();
      const file = new File([blob], fileName, { type: "image/png" });
      const navShare = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (navShare.canShare && navShare.canShare({ files: [file] }) && typeof navigator.share === "function") {
        try {
          await navigator.share({ files: [file], title: "지화 명함" });
        } catch (shareError) {
          if ((shareError as Error).name !== "AbortError") {
            setError("공유에 실패했습니다.");
          }
        }
      } else {
        setError("이 기기는 공유 기능을 지원하지 않습니다. 저장 후 공유해주세요.");
      }
    } catch {
      setError("공유 준비 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 animate-pulse mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 font-medium">명함을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center mx-auto">
            <span className="text-2xl text-white">!</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">명함을 찾을 수 없습니다</h1>
            <p className="text-slate-600 mb-6">{error || "올바르지 않은 QR코드이거나 만료된 링크입니다."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center px-3 py-6 sm:p-4">
      <div className="max-w-2xl w-full space-y-5 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 mb-1 sm:mb-2">지화 명함</h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">QR코드로 공유된 디지털 명함입니다</p>
        </div>

        <div className="flex justify-center">
          <div
            style={{
              width: `${620 * scale}px`,
              height: `${380 * scale}px`,
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <BusinessCard
                ref={cardRef}
                letters={cardData.letters || []}
                userName={cardData.userName}
                phoneNumber={cardData.phoneNumber}
                signSize={cardData.signSize ?? 12}
                layoutDirection={cardData.layoutDirection ?? "horizontal"}
                design={cardData.design}
                width="620px"
                height="380px"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 mb-2">
          <div className="flex gap-3">
            <button
              onClick={saveAsImage}
              disabled={isGenerating || !blobReady}
              className={`px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px] sm:min-h-[56px] min-w-[120px] sm:min-w-[140px] border border-white/20 rounded-xl shadow-xl font-bold text-base sm:text-lg text-white ${
                isSaved ? "from-green-500 to-green-600" : isGenerating || !blobReady ? "from-gray-400 to-gray-500 cursor-not-allowed" : "from-teal-600 to-emerald-600 active:from-teal-700 active:to-emerald-700"
              }`}
            >
              {isSaved ? "저장 완료!" : isGenerating ? "저장 중..." : !blobReady ? "준비 중..." : "명함 저장"}
            </button>
            <button
              onClick={shareImage}
              disabled={isGenerating || !blobReady}
              className="px-5 sm:px-6 py-3 sm:py-4 bg-white active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px] sm:min-h-[56px] border-2 border-teal-500 rounded-xl shadow-md font-bold text-base sm:text-lg text-teal-600 disabled:opacity-50"
            >
              공유하기
            </button>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-teal-200/50 shadow-sm">
            <p className="text-slate-700 text-xs sm:text-sm font-medium">
              <span className="text-emerald-600 font-bold">서대문농아인복지관</span>에서 제공하는 지화 명함 서비스입니다
            </p>
            <p className="text-slate-500 text-xs mt-2">※ 저장 후 갤러리/사진첩에서 확인하세요</p>
            <p className="text-slate-500 text-xs">※ 아이폰: 공유 메뉴에서 &quot;이미지 저장&quot; 선택</p>
            {isSaved && <p className="text-green-600 text-xs sm:text-sm font-medium mt-2">저장되었습니다!</p>}
            {error && <p className="text-red-600 text-xs sm:text-sm font-medium mt-2">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
