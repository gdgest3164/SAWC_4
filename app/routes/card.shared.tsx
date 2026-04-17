import { useState, useEffect, useRef, useCallback } from "react";
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

type LogEntry = { ts: string; msg: string; level: "info" | "warn" | "error" };

export default function SharedCard() {
  const [searchParams] = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [scale, setScale] = useState(1);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const preparedBlobRef = useRef<Blob | null>(null);
  const [blobReady, setBlobReady] = useState(false);

  const addLog = useCallback((msg: string, level: "info" | "warn" | "error" = "info") => {
    const ts = new Date().toLocaleTimeString("ko-KR", { hour12: false });
    setLogs((prev) => [...prev, { ts, msg, level }].slice(-30));
  }, []);

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
            if (data.error) {
              setError(data.error);
            } else {
              setCardData(data);
            }
            setLoading(false);
          })
          .catch((err) => {
            console.error("서버 데이터 로드 실패:", err);
            setError("명함 데이터를 불러올 수 없습니다.");
            setLoading(false);
          });
        return;
      } else if (data) {
        const decodedData = JSON.parse(decodeURIComponent(data)) as CardData;
        setCardData(decodedData);
      } else {
        setError("명함 데이터가 없습니다.");
      }
    } catch (err) {
      console.error("데이터 파싱 실패:", err);
      setError("잘못된 명함 데이터입니다.");
    }
    setLoading(false);
  }, [searchParams]);

  // 카드 렌더 후 미리 blob 준비 (iOS user gesture 보존용)
  useEffect(() => {
    if (!cardData || !cardRef.current) return;
    let cancelled = false;

    addLog("이미지 사전 생성 시작");

    const waitForImages = async (root: HTMLElement) => {
      const imgs = Array.from(root.querySelectorAll("img"));
      addLog(`이미지 ${imgs.length}개 로드 대기`);
      await Promise.all(
        imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
            // 안전망: 5초 timeout
            setTimeout(done, 5000);
          });
        })
      );
      const failed = imgs.filter((i) => !i.complete || i.naturalWidth === 0);
      if (failed.length > 0) addLog(`로드 실패/0크기 이미지 ${failed.length}개`, "warn");
      else addLog("모든 이미지 로드 완료");
    };

    const prepare = async () => {
      try {
        if (!cardRef.current) {
          addLog("cardRef가 비어있음", "error");
          return;
        }

        await waitForImages(cardRef.current);
        if (cancelled) return;

        const rect = cardRef.current.getBoundingClientRect();
        addLog(`cardRef rect=${Math.round(rect.width)}x${Math.round(rect.height)}`);

        addLog("html-to-image 렌더 시도");
        const blob = await htmlToBlob(cardRef.current, {
          pixelRatio: 2,
          backgroundColor: "#FFFFFF",
          width: 620,
          height: 380,
          cacheBust: true,
          style: {
            transform: "none",
            transformOrigin: "top left",
          },
        });

        if (cancelled) return;
        if (!blob) {
          addLog("Blob 변환 실패 (html-to-image)", "error");
          return;
        }
        addLog(`html-to-image 성공 (${Math.round(blob.size / 1024)}KB)`);

        preparedBlobRef.current = blob;
        setBlobReady(true);
        addLog(`이미지 준비 완료 (${Math.round(blob.size / 1024)}KB)`);
      } catch (e) {
        addLog(`사전 생성 실패: ${(e as Error).message || e}`, "error");
      }
    };

    // 레이아웃 안정화 대기
    const timer = setTimeout(prepare, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [cardData, addLog]);

  const getOrCreateBlob = async (): Promise<{ blob: Blob; fileName: string }> => {
    const fileName = `지화명함_${cardData!.userName}_${new Date().getTime()}.png`;
    let blob = preparedBlobRef.current;

    if (!blob) {
      addLog("사전 생성 안 됨, 지금 생성 중...", "warn");
      if (!cardRef.current) throw new Error("cardRef 없음");

      try {
        blob = await htmlToBlob(cardRef.current, {
          pixelRatio: 2,
          backgroundColor: "#FFFFFF",
          width: 620,
          height: 380,
          cacheBust: true,
          style: { transform: "none", transformOrigin: "top left" },
        });
      } catch (e) {
        addLog(`html-to-image 실패, html2canvas 폴백: ${(e as Error).message}`, "warn");
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: "#FFFFFF",
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: 620,
          height: 380,
        });
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/png");
        });
      }
    }

    if (!blob) throw new Error("이미지 변환 실패");
    return { blob, fileName };
  };

  const isIOS = (): boolean => {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
  };

  // 기본 저장: iOS는 Web Share(사진첩), 그 외는 직접 다운로드
  const saveAsImage = async () => {
    if (!cardData) return;
    setIsGenerating(true);
    try {
      const { blob, fileName } = await getOrCreateBlob();
      addLog(`저장 시작 (${Math.round(blob.size / 1024)}KB)`);

      if (isIOS()) {
        // iOS: Web Share만 사진첩 저장 가능
        const file = new File([blob], fileName, { type: "image/png" });
        const navShare = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
        if (navShare.canShare && navShare.canShare({ files: [file] }) && typeof navigator.share === "function") {
          try {
            await navigator.share({ files: [file], title: "지화 명함" });
            addLog("공유(저장) 완료");
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
            return;
          } catch (shareError) {
            const name = (shareError as Error).name;
            addLog(`share 실패: ${name}`, "warn");
            if (name === "AbortError") return;
          }
        }
        // iOS 구형: blob URL 새 탭 → 길게 눌러 저장
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank") || (window.location.href = url);
        addLog("iOS 구형: 새 탭 열기");
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        // Android/Desktop: 직접 다운로드 (다운로드 폴더 → 갤러리 자동 인식)
        FileSaver.saveAs(blob, fileName);
        addLog("다운로드 시작");
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      const msg = (err as Error).message || String(err);
      addLog(`저장 실패: ${msg}`, "error");
      setError(`저장 중 오류: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 공유하기: 명시적으로 공유 시트 호출 (카카오톡/메일 등)
  const shareImage = async () => {
    if (!cardData) return;
    setIsGenerating(true);
    try {
      const { blob, fileName } = await getOrCreateBlob();
      const file = new File([blob], fileName, { type: "image/png" });
      const navShare = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      if (navShare.canShare && navShare.canShare({ files: [file] }) && typeof navigator.share === "function") {
        try {
          await navigator.share({ files: [file], title: "지화 명함" });
          addLog("공유 완료");
        } catch (shareError) {
          const name = (shareError as Error).name;
          addLog(`share 실패: ${name}`, "warn");
        }
      } else {
        addLog("이 기기는 공유 기능 미지원", "warn");
        setError("이 기기는 공유 기능을 지원하지 않습니다. 저장 후 공유하세요.");
      }
    } catch (err) {
      addLog(`공유 실패: ${(err as Error).message}`, "error");
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
              disabled={isGenerating}
              className={`px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px] sm:min-h-[56px] min-w-[120px] sm:min-w-[140px] border border-white/20 rounded-xl shadow-xl font-bold text-base sm:text-lg text-white ${
                isSaved ? "from-green-500 to-green-600" : isGenerating ? "from-gray-400 to-gray-500 cursor-not-allowed" : "from-teal-600 to-emerald-600 active:from-teal-700 active:to-emerald-700"
              }`}
            >
              {isSaved ? "저장 완료!" : isGenerating ? "저장 중..." : "명함 저장"}
            </button>
            <button
              onClick={shareImage}
              disabled={isGenerating}
              className="px-5 sm:px-6 py-3 sm:py-4 bg-white active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px] sm:min-h-[56px] border-2 border-teal-500 rounded-xl shadow-md font-bold text-base sm:text-lg text-teal-600 disabled:opacity-50"
            >
              공유하기
            </button>
          </div>
          {!blobReady && !isSaved && <p className="text-xs text-slate-500">이미지 준비 중...</p>}
          {blobReady && !isSaved && <p className="text-xs text-emerald-600 font-medium">저장 준비 완료</p>}
        </div>

        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-teal-200/50 shadow-sm">
            <p className="text-slate-700 text-xs sm:text-sm font-medium">
              <span className="text-emerald-600 font-bold">서대문농아인복지관</span>에서 제공하는 지화 명함 서비스입니다
            </p>
            <p className="text-slate-500 text-xs mt-2">※ &quot;명함 저장&quot; 탭 후 갤러리/사진첩에서 확인하세요</p>
            <p className="text-slate-500 text-xs">※ 아이폰: 공유 메뉴에서 &quot;이미지 저장&quot; 선택</p>
            {isSaved && <p className="text-green-600 text-xs sm:text-sm font-medium mt-2">저장되었습니다!</p>}
            {error && <p className="text-red-600 text-xs sm:text-sm font-medium mt-2">{error}</p>}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowLogs((v) => !v)}
            className="text-xs text-slate-400 underline"
          >
            {showLogs ? "로그 숨기기" : "문제가 있으신가요? 로그 보기"}
          </button>
        </div>

        {showLogs && (
          <div className="bg-slate-900 text-slate-100 rounded-lg p-3 text-xs font-mono max-h-60 overflow-auto">
            <div className="text-slate-400 mb-2">
              UA: {typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : ""}
            </div>
            {logs.length === 0 ? (
              <div className="text-slate-500">로그 없음</div>
            ) : (
              logs.map((l, i) => (
                <div key={i} className={l.level === "error" ? "text-red-400" : l.level === "warn" ? "text-yellow-300" : "text-slate-200"}>
                  [{l.ts}] {l.msg}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
