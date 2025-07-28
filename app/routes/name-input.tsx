import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { consonants, vowels, type FingerLetter, combineJamos, groupJamosByCharacter } from "~/utils/fingerLetters";

export const meta: MetaFunction = () => {
  return [{ title: "지화로 이름 만들기" }, { name: "description", content: "지화를 터치하여 이름을 만들어보세요" }];
};

export default function NameInput() {
  const [selectedLetters, setSelectedLetters] = useState<FingerLetter[]>([]);
  const [signSize, setSignSize] = useState(12); // 지화 크기 조절 (기본 12 = w-12 h-12)
  const [layoutDirection, setLayoutDirection] = useState<"horizontal" | "vertical">("horizontal"); // 레이아웃 방향
  const navigate = useNavigate();

  // sessionStorage에서 이전 상태 복원
  useEffect(() => {
    const savedLetters = sessionStorage.getItem("selectedLetters");
    const savedSignSize = sessionStorage.getItem("signSize");
    const savedLayoutDirection = sessionStorage.getItem("layoutDirection");

    if (savedLetters) {
      try {
        const parsedLetters = JSON.parse(savedLetters) as FingerLetter[];
        setSelectedLetters(parsedLetters);
      } catch (error) {
        console.error("저장된 지화 데이터 복원 실패:", error);
      }
    }

    if (savedSignSize) {
      setSignSize(parseInt(savedSignSize));
    }

    if (savedLayoutDirection) {
      setLayoutDirection(savedLayoutDirection as "horizontal" | "vertical");
    }
  }, []);

  // 크기 조절 시 명함 크기를 고려한 최대 크기 계산
  const getMaxSignSize = () => {
    const cardHeight = 340; // 명함 높이
    const cardPadding = 32; // 명함 내부 패딩 (p-8 * 2)
    const textAndBottomHeight = 80; // 텍스트와 하단 정보 영역 높이
    const availableHeight = cardHeight - cardPadding - textAndBottomHeight;
    
    if (layoutDirection === "vertical") {
      // 세로 모드에서는 더 작은 크기 제한
      const groupCount = groupJamosByCharacter(selectedLetters).length;
      const maxHeightPerGroup = Math.floor(availableHeight / Math.max(1, groupCount));
      return Math.min(18, Math.floor(maxHeightPerGroup / 4));
    } else {
      // 가로 모드에서는 기존 제한
      return 20;
    }
  };

  const handleLetterClick = (letter: FingerLetter) => {
    setSelectedLetters([...selectedLetters, letter]);
  };

  const handleBackspace = () => {
    setSelectedLetters(selectedLetters.slice(0, -1));
  };

  const handleClear = () => {
    setSelectedLetters([]);
  };

  const handleComplete = () => {
    if (selectedLetters.length > 0) {
      const letterData = selectedLetters.map((l) => ({
        char: l.char,
        imagePath: l.imagePath,
      }));
      sessionStorage.setItem("selectedLetters", JSON.stringify(letterData));
      sessionStorage.setItem("signSize", signSize.toString());
      sessionStorage.setItem("layoutDirection", layoutDirection);
      navigate("/preview");
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col">
        {/* 상단: 명함 미리보기 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-3 flex-shrink-0" style={{ height: "420px" }}>
          <div className="flex h-full gap-4">
            <div className="flex-1">
              <div className="bg-gray-50 rounded-xl p-4 h-full flex items-center justify-center">
                <div className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-lg" style={{ width: "600px", height: "340px" }}>
                  <div className="h-full flex flex-col">
                    {/* 지화 이미지 영역 */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden">
                      <div className="text-center w-full">
                        <div className={`flex ${layoutDirection === "horizontal" ? "flex-wrap gap-4 justify-center" : "flex-col gap-2 items-center"}`}>
                          {groupJamosByCharacter(selectedLetters).map((group, groupIndex) => (
                            <div key={groupIndex} className={`flex ${layoutDirection === "horizontal" ? "gap-2" : "gap-2"}`}>
                              {group.map((letter, letterIndex) => (
                                <div key={letterIndex} className="text-center">
                                  <img src={letter.imagePath} alt={letter.char} className="object-contain mx-auto" style={{ width: `${signSize * 4}px`, height: `${signSize * 4}px` }} />
                                </div>
                              ))}
                            </div>
                          ))}
                          {selectedLetters.length === 0 && (
                            <div className="text-gray-400 text-center">
                              <p className="text-4xl mb-2">🤟</p>
                              <p className="text-base">아래에서 지화를 선택해보세요</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 조합된 글자 */}
                    <div className="text-center py-2 border-t border-gray-200 flex-shrink-0">
                      <p className="text-lg font-bold text-gray-900">{combineJamos(selectedLetters) || "이름"}</p>
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
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex flex-col gap-2 h-full" style={{ width: "160px" }}>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="px-3 py-2 bg-gray-600 text-white text-sm font-bold rounded-lg shadow-md active:scale-95 active:shadow-sm transition-all duration-150 touch-manipulation"
                >
                  🏠 처음으로
                </button>
                <button
                  onClick={handleBackspace}
                  disabled={selectedLetters.length === 0}
                  className="px-3 py-2 bg-red-500 disabled:bg-gray-400 text-white text-sm font-bold rounded-lg shadow-md active:scale-95 active:shadow-sm transition-all duration-150 disabled:cursor-not-allowed touch-manipulation"
                >
                  ⌫ 지우기
                </button>
                <button
                  onClick={handleClear}
                  disabled={selectedLetters.length === 0}
                  className="px-3 py-2 bg-orange-500 disabled:bg-gray-400 text-white text-sm font-bold rounded-lg shadow-md active:scale-95 active:shadow-sm transition-all duration-150 disabled:cursor-not-allowed touch-manipulation"
                >
                  🗑️ 전체삭제
                </button>
                <button
                  onClick={handleComplete}
                  disabled={selectedLetters.length === 0}
                  className="px-3 py-2 bg-green-600 disabled:bg-gray-400 text-white text-sm font-bold rounded-lg shadow-md active:scale-95 active:shadow-sm transition-all duration-150 disabled:cursor-not-allowed touch-manipulation"
                >
                  ✨ 명함완성
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1 min-h-0">
                {/* 지화 크기 조절 */}
                <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
                  <p className="text-xs font-bold text-gray-800 text-center mb-1">지화 크기</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSignSize(Math.max(8, signSize - 2))}
                      className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded active:scale-95 transition-all touch-manipulation"
                    >
                      작게
                    </button>
                    <button
                      onClick={() => setSignSize(Math.min(getMaxSignSize(), signSize + 2))}
                      className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded active:scale-95 transition-all touch-manipulation"
                    >
                      크게
                    </button>
                  </div>
                </div>

                {/* 레이아웃 방향 조절 */}
                <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
                  <p className="text-xs font-bold text-gray-800 text-center mb-1">배치 방향</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLayoutDirection("horizontal")}
                      className={`flex-1 px-2 py-1 text-xs font-bold rounded active:scale-95 transition-all touch-manipulation ${
                        layoutDirection === "horizontal" ? "bg-purple-500 text-white" : "bg-white text-purple-500 border border-purple-500"
                      }`}
                    >
                      가로
                    </button>
                    <button
                      onClick={() => setLayoutDirection("vertical")}
                      className={`flex-1 px-2 py-1 text-xs font-bold rounded active:scale-95 transition-all touch-manipulation ${
                        layoutDirection === "vertical" ? "bg-purple-500 text-white" : "bg-white text-purple-500 border border-purple-500"
                      }`}
                    >
                      세로
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단: 지화 키보드 */}
        <div className="bg-white rounded-2xl shadow-lg p-4 flex-1 overflow-hidden">
          <div className="h-full flex flex-row gap-4">
            <div className="flex-1">
              <h3 className="text-base font-bold mb-2 text-center bg-blue-500 text-white rounded-lg p-2">자음</h3>
              <div className="grid grid-cols-5 gap-2">
                {consonants.map((letter) => (
                  <button
                    key={letter.char}
                    onClick={() => handleLetterClick(letter)}
                    className="p-2 bg-blue-500 rounded-lg shadow-md active:scale-95 active:shadow-sm transition-all duration-150 touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
                  >
                    <img src={letter.imagePath} alt={letter.char} className="w-12 h-12 object-contain mx-auto" />
                    <p className="text-base font-bold mt-1 text-center text-white">{letter.char}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-bold mb-2 text-center bg-purple-500 text-white rounded-lg p-2">모음</h3>
              <div className="grid grid-cols-5 gap-2">
                {vowels.map((letter) => (
                  <button
                    key={letter.char}
                    onClick={() => handleLetterClick(letter)}
                    className="p-2 bg-purple-500 rounded-lg shadow-md active:scale-95 active:shadow-sm transition-all duration-150 touch-manipulation min-h-[60px] flex flex-col items-center justify-center"
                  >
                    <img src={letter.imagePath} alt={letter.char} className="w-12 h-12 object-contain mx-auto" />
                    <p className="text-base font-bold mt-1 text-center text-white">{letter.char}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
