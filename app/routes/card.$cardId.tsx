import { useState, useEffect, useRef } from "react";
import { useParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import { type FingerLetter, groupJamosByCharacter } from "~/utils/fingerLetters";

export const meta: MetaFunction = () => {
  return [{ title: "지화 명함 - 디지털 명함" }, { name: "description", content: "QR코드로 공유된 지화 명함입니다" }];
};

export default function CardView() {
  const { cardId } = useParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<{
    letters: FingerLetter[];
    userName: string;
    signSize: number;
    layoutDirection: "horizontal" | "vertical";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // URL에서 카드 ID 파싱하여 데이터 복원
    if (cardId) {
      try {
        const parts = cardId.split("-");
        const userName = parts.slice(0, -1).join("-"); // 마지막 timestamp 제외

        // 실제 서비스에서는 서버에서 데이터를 가져와야 하지만,
        // 현재는 클라이언트 사이드에서만 동작하므로 기본값 사용
        const defaultData = {
          letters: [], // 실제로는 서버에서 가져와야 함
          userName: userName || "지화명함",
          signSize: 12,
          layoutDirection: "horizontal" as const,
        };

        setCardData(defaultData);
      } catch (error) {
        console.error("카드 데이터 파싱 실패:", error);
      }
    }
    setLoading(false);
  }, [cardId]);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse mx-auto mb-4"></div>
          <p className="text-lg text-slate-600 font-medium">명함을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-red-400 to-pink-400 flex items-center justify-center mx-auto">
            <span className="text-2xl text-white">!</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">명함을 찾을 수 없습니다</h1>
            <p className="text-slate-600 mb-6">올바르지 않은 QR코드이거나 만료된 링크입니다.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">지화 명함</h1>
          <p className="text-slate-600 font-medium">QR코드로 공유된 디지털 명함입니다</p>
        </div>

        {/* 명함 */}
        <div className="flex justify-center">
          <div className="bg-white border-2 border-indigo-200/50 rounded-2xl p-8 shadow-2xl" style={{ width: "600px", height: "340px" }}>
            <div className="h-full flex flex-col">
              {/* 지화 이미지 영역 */}
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="text-center w-full">
                  {cardData.letters.length > 0 ? (
                    <div className={`flex ${cardData.layoutDirection === "horizontal" ? "flex-wrap gap-4 justify-center" : "flex-col gap-2 items-center"}`}>
                      {groupJamosByCharacter(cardData.letters).map((group, groupIndex) => (
                        <div key={groupIndex} className={`flex ${cardData.layoutDirection === "horizontal" ? "gap-2" : "gap-2"}`}>
                          {group.map((letter, letterIndex) => (
                            <div key={letterIndex} className="text-center">
                              <img src={letter.imagePath} alt={letter.char} className="object-contain mx-auto" style={{ width: `${cardData.signSize * 4}px`, height: `${cardData.signSize * 4}px` }} />
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-indigo-400 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-indigo-200/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"></div>
                      </div>
                      <p className="text-lg font-medium text-indigo-600">지화 명함</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 조합된 글자 */}
              <div className="text-center py-3 border-t-2 border-indigo-200 flex-shrink-0">
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 drop-shadow-sm">{cardData.userName}</p>
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
              isSaved ? "from-green-500 to-green-600" : isGenerating ? "from-gray-400 to-gray-500 cursor-not-allowed" : "from-purple-600 to-pink-600 active:from-purple-700 active:to-pink-700"
            }`}
          >
            {isSaved ? "저장 완료!" : isGenerating ? "저장 중..." : "명함 이미지 저장"}
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200/50 shadow-sm">
            <p className="text-slate-700 text-sm font-medium">
              <span className="text-purple-600 font-bold">서대문농아인복지관</span>에서 제공하는 지화 명함 서비스입니다
            </p>
            {isSaved && <p className="text-green-600 text-sm font-medium mt-2">저장되었습니다!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
