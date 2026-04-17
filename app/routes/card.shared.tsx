import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import html2canvas from "html2canvas";
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

        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: "#FFFFFF",
          logging: false,
          useCORS: true,
          allowTaint: true,
          imageTimeout: 15000,
        });

        if (cancelled) return;
        addLog(`캔버스 생성 완료 ${canvas.width}x${canvas.height}`);

        const blob: Blob | null = await new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/png");
        });

        if (cancelled) return;
        if (!blob) {
          addLog("Blob 변환 실패", "error");
          return;
        }

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

  const saveAsImage = async () => {
    if (!cardData) {
      addLog("카드 데이터 없음", "error");
      return;
    }

    setIsGenerating(true);
    const fileName = `지화명함_${cardData.userName}_${new Date().getTime()}.png`;

    try {
      let blob = preparedBlobRef.current;

      if (!blob) {
        addLog("사전 생성 안 됨, 지금 생성 중...", "warn");
        if (!cardRef.current) throw new Error("cardRef 없음");
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          backgroundColor: "#FFFFFF",
          logging: false,
          useCORS: true,
        });
        blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), "image/png");
        });
      }

      if (!blob) throw new Error("이미지 변환 실패");
      addLog(`저장 시작 (${Math.round(blob.size / 1024)}KB)`);

      const file = new File([blob], fileName, { type: "image/png" });
      const navShare = navigator as Navigator & { canShare?: (data: ShareData) => boolean };
      const canShareFiles = typeof navShare.canShare === "function" && navShare.canShare({ files: [file] });
      addLog(`canShare(files)=${canShareFiles}`);

      if (canShareFiles && typeof navigator.share === "function") {
        try {
          await navigator.share({ files: [file], title: "지화 명함" });
          addLog("공유 완료");
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
          return;
        } catch (shareError) {
          const name = (shareError as Error).name;
          addLog(`share 실패: ${name} - ${(shareError as Error).message}`, "warn");
          if (name === "AbortError") return;
        }
      }

      // 폴백 1: FileSaver
      try {
        FileSaver.saveAs(blob, fileName);
        addLog("FileSaver 호출 완료");
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
        return;
      } catch (fsErr) {
        addLog(`FileSaver 실패: ${(fsErr as Error).message}`, "warn");
      }

      // 폴백 2: blob URL 새 탭 (iOS 구형 대응 - 길게 눌러 저장 안내)
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");
      if (!win) {
        addLog("팝업 차단됨 - 같은 탭으로 이동", "warn");
        window.location.href = url;
      } else {
        addLog("새 탭에 이미지 표시 - 길게 눌러 저장");
      }
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      const msg = (err as Error).message || String(err);
      addLog(`저장 실패: ${msg}`, "error");
      setError(`저장 중 오류: ${msg}`);
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
          <button
            onClick={saveAsImage}
            disabled={isGenerating}
            className={`px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px] sm:min-h-[56px] min-w-[120px] sm:min-w-[140px] border border-white/20 rounded-xl shadow-xl font-bold text-base sm:text-lg text-white ${
              isSaved ? "from-green-500 to-green-600" : isGenerating ? "from-gray-400 to-gray-500 cursor-not-allowed" : "from-teal-600 to-emerald-600 active:from-teal-700 active:to-emerald-700"
            }`}
          >
            {isSaved ? "저장 완료!" : isGenerating ? "저장 중..." : "명함 저장"}
          </button>
          {!blobReady && !isSaved && <p className="text-xs text-slate-500">이미지 준비 중... ({logs.length > 0 ? logs[logs.length - 1]?.msg : ""})</p>}
          {blobReady && <p className="text-xs text-emerald-600 font-medium">저장 준비 완료</p>}
        </div>

        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-3 sm:p-4 border-2 border-teal-200/50 shadow-sm">
            <p className="text-slate-700 text-xs sm:text-sm font-medium">
              <span className="text-emerald-600 font-bold">서대문농아인복지관</span>에서 제공하는 지화 명함 서비스입니다
            </p>
            <p className="text-slate-500 text-xs mt-2">※ 아이폰: 공유 메뉴에서 &quot;이미지 저장&quot; 선택</p>
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
