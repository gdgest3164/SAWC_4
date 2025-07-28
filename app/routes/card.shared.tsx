import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import { type FingerLetter, groupJamosByCharacter } from "~/utils/fingerLetters";

export const meta: MetaFunction = () => {
  return [{ title: "지화 명함 - 디지털 명함" }, { name: "description", content: "QR코드로 공유된 지화 명함입니다" }];
};

interface CardData {
  letters: { char: string; imagePath: string }[];
  userName: string;
  signSize: number;
  layoutDirection: "horizontal" | "vertical";
  timestamp: number;
}

export default function SharedCard() {
  const [searchParams] = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    try {
      // 새로운 방식: id로 localStorage에서 데이터 가져오기
      const id = searchParams.get("id");
      const data = searchParams.get("data");

      console.log("SharedCard - 받은 id:", id);
      console.log("SharedCard - 받은 data:", data);

      if (id) {
        // 새로운 방식: 서버에서 데이터 가져오기
        fetch(`/api/card/${id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
            } else {
              console.log("SharedCard - 서버에서 가져온 데이터:", data);
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
        // 기존 방식: URL 파라미터에서 데이터 가져오기 (호환성)
        const decodedData = JSON.parse(decodeURIComponent(data)) as CardData;
        console.log("SharedCard - URL에서 가져온 데이터:", decodedData);
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

  const saveAsImage = async () => {
    if (!cardRef.current || !cardData) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `지화명함_${cardData.userName}_${new Date().getTime()}.png`;
          FileSaver.saveAs(blob, fileName);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        }
      });
    } catch (error) {
      console.error("이미지 저장 실패:", error);
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

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center mx-auto">
            <span className="text-2xl text-white">!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 mb-2">지화 명함</h1>
          <p className="text-slate-600 font-medium">QR코드로 공유된 디지털 명함입니다</p>
        </div>

        {/* 명함 */}
        <div className="flex justify-center">
          <div ref={cardRef} className="bg-white border-2 border-teal-200/50 rounded-2xl p-6 shadow-2xl" style={{ width: "600px", height: "340px" }}>
            <div className="h-full flex flex-col">
              {/* 지화 이미지 영역 */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="text-center w-full">
                  {cardData.letters && cardData.letters.length > 0 ? (
                    <div className={`flex ${cardData.layoutDirection === "horizontal" ? "flex-wrap gap-4 justify-center" : "flex-col gap-2 items-center"}`}>
                      {groupJamosByCharacter(cardData.letters.map((l) => ({ ...l, type: "consonant" as const, displayOrder: 1 }))).map((group, groupIndex) => (
                        <div key={groupIndex} className={`flex ${cardData.layoutDirection === "horizontal" ? "gap-2" : "gap-2"}`}>
                          {group.map((letter, letterIndex) => (
                            <div key={letterIndex} className="text-center">
                              <img
                                src={letter.imagePath}
                                alt={letter.char}
                                className="object-contain mx-auto"
                                style={{ width: `${cardData.signSize * 4}px`, height: `${cardData.signSize * 4}px` }}
                                onError={(e) => {
                                  console.error("이미지 로드 실패:", letter.imagePath);
                                  e.currentTarget.style.border = "2px solid red";
                                }}
                                onLoad={() => {
                                  console.log("이미지 로드 성공:", letter.imagePath);
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-teal-400 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-teal-200/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-400 to-emerald-400"></div>
                      </div>
                      <p className="text-lg font-medium text-teal-600">지화 명함</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 조합된 글자 */}
              <div className="text-center py-3 border-t-2 border-teal-200 flex-shrink-0">
                <p className="text-2xl font-bold text-emerald-600">{cardData.userName}</p>
              </div>

              {/* 하단 정보 */}
              <div className="flex items-center justify-center pt-2 flex-shrink-0">
                <div>
                  <img src="/logo-black.png" alt="서대문농아인복지관" className="h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-center gap-3 mb-6">
          <button
            onClick={saveAsImage}
            disabled={isGenerating}
            className={`px-8 py-4 bg-gradient-to-r active:scale-95 transition-all duration-150 touch-manipulation min-h-[56px] min-w-[140px] border border-white/20 rounded-xl shadow-xl font-bold text-lg text-white ${
              isSaved ? "from-green-500 to-green-600" : isGenerating ? "from-gray-400 to-gray-500 cursor-not-allowed" : "from-teal-600 to-emerald-600 active:from-teal-700 active:to-emerald-700"
            }`}
          >
            {isSaved ? "저장 완료!" : isGenerating ? "저장 중..." : "명함 저장"}
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border-2 border-teal-200/50 shadow-sm">
            <p className="text-slate-700 text-sm font-medium">
              <span className="text-emerald-600 font-bold">서대문농아인복지관</span>에서 제공하는 지화 명함 서비스입니다
            </p>
            {isSaved && <p className="text-green-600 text-sm font-medium mt-2">파일이 다운로드 폴더에 저장되었습니다!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
