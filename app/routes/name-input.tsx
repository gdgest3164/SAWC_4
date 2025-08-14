import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { consonants, vowels, type FingerLetter, combineJamos, groupJamosByCharacter } from "~/utils/fingerLetters";
import BusinessCard from "~/components/BusinessCard";

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


  return (
    <div className="h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col">
        {/* 상단: 명함 미리보기 */}
        <div className="bg-gradient-to-br from-white to-teal-50 rounded-3xl shadow-xl border border-teal-200/50 p-4 mb-3 flex-shrink-0 backdrop-blur-sm" style={{ height: "420px" }}>
          <div className="flex h-full gap-4">
            <div className="flex-1">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 h-full flex items-center justify-center border border-teal-100">
                {selectedLetters.length === 0 ? (
                  <div className="bg-white border-2 border-teal-200/50 rounded-2xl p-6 shadow-xl flex items-center justify-center" style={{ width: "600px", height: "340px" }}>
                    <div className="text-stone-400 text-center">
                      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                        <div className="w-8 h-8 rounded-full bg-stone-300"></div>
                      </div>
                      <p className="text-base font-light">아래에서 지화를 선택해보세요</p>
                    </div>
                  </div>
                ) : (
                  <BusinessCard
                    letters={selectedLetters}
                    userName={combineJamos(selectedLetters)}
                    signSize={signSize}
                    layoutDirection={layoutDirection}
                    width="600px"
                    height="340px"
                  />
                )}
              </div>
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex flex-col gap-2 h-full" style={{ width: "160px" }}>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-3 bg-stone-600 active:bg-stone-700 text-white text-base font-medium rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px]"
                >
                  처음으로
                </button>
                <button
                  onClick={handleBackspace}
                  disabled={selectedLetters.length === 0}
                  className="px-4 py-3 bg-red-500 disabled:bg-stone-300 active:bg-red-600 text-white text-base font-medium rounded-lg shadow-md active:scale-95 transition-all duration-150 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                >
                  지우기
                </button>
                <button
                  onClick={handleClear}
                  disabled={selectedLetters.length === 0}
                  className="px-4 py-3 bg-orange-500 disabled:bg-stone-300 active:bg-orange-600 text-white text-base font-medium rounded-lg shadow-md active:scale-95 transition-all duration-150 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                >
                  전체삭제
                </button>
                <button
                  onClick={() => {
                    if (selectedLetters.length > 0) {
                      // sessionStorage에 데이터 저장
                      const letterData = selectedLetters.map((l) => ({
                        char: l.char,
                        imagePath: l.imagePath,
                      }));
                      sessionStorage.setItem("selectedLetters", JSON.stringify(letterData));
                      sessionStorage.setItem("signSize", signSize.toString());
                      sessionStorage.setItem("layoutDirection", layoutDirection);
                      navigate("/contact-input");
                    }
                  }}
                  disabled={selectedLetters.length === 0}
                  className="px-4 py-3 bg-green-600 disabled:bg-stone-300 active:bg-green-700 text-white text-base font-medium rounded-lg shadow-md active:scale-95 transition-all duration-150 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
                >
                  다음
                </button>
              </div>

              <div className="flex flex-col gap-2 flex-1 min-h-0">
                {/* 지화 크기 조절 */}
                <div className="bg-stone-100 rounded-lg p-2 border border-stone-200">
                  <p className="text-xs font-medium text-stone-700 text-center mb-1">지화 크기</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setSignSize(Math.max(8, signSize - 2))}
                      className="flex-1 px-3 py-2 bg-blue-500 active:bg-blue-600 text-white text-sm font-medium rounded active:scale-95 transition-all touch-manipulation min-h-[40px]"
                    >
                      작게
                    </button>
                    <button
                      onClick={() => setSignSize(Math.min(getMaxSignSize(), signSize + 2))}
                      className="flex-1 px-3 py-2 bg-blue-500 active:bg-blue-600 text-white text-sm font-medium rounded active:scale-95 transition-all touch-manipulation min-h-[40px]"
                    >
                      크게
                    </button>
                  </div>
                </div>

                {/* 레이아웃 방향 조절 */}
                <div className="bg-stone-100 rounded-lg p-2 border border-stone-200">
                  <p className="text-xs font-medium text-stone-700 text-center mb-1">배치 방향</p>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setLayoutDirection("horizontal")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded active:scale-95 transition-all touch-manipulation min-h-[40px] ${
                        layoutDirection === "horizontal" ? "bg-emerald-500 active:bg-emerald-600 text-white" : "bg-white text-emerald-500 border border-emerald-500 active:bg-emerald-50"
                      }`}
                    >
                      가로
                    </button>
                    <button
                      onClick={() => setLayoutDirection("vertical")}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded active:scale-95 transition-all touch-manipulation min-h-[40px] ${
                        layoutDirection === "vertical" ? "bg-emerald-500 active:bg-emerald-600 text-white" : "bg-white text-emerald-500 border border-emerald-500 active:bg-emerald-50"
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
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-4 flex-1 overflow-hidden">
          <div className="h-full flex flex-row gap-4">
            <div className="flex-1">
              <h3 className="text-base font-medium mb-2 text-center bg-blue-500 text-white rounded-lg p-2">자음</h3>
              <div className="grid grid-cols-5 gap-2">
                {consonants.map((letter) => (
                  <button
                    key={letter.char}
                    onClick={() => handleLetterClick(letter)}
                    className="p-1 bg-blue-500 active:bg-blue-600 rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[72px] flex flex-col items-center justify-center"
                  >
                    <img src={letter.imagePath} alt={letter.char} className="w-16 h-16 object-contain mx-auto" />
                    <p className="text-base font-medium mt-1 text-center text-white">{letter.char}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-base font-medium mb-2 text-center bg-emerald-500 text-white rounded-lg p-2">모음</h3>
              <div className="grid grid-cols-5 gap-2">
                {vowels.map((letter) => (
                  <button
                    key={letter.char}
                    onClick={() => handleLetterClick(letter)}
                    className="p-1 bg-emerald-500 active:bg-emerald-600 rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[72px] flex flex-col items-center justify-center"
                  >
                    <img src={letter.imagePath} alt={letter.char} className="w-16 h-16 object-contain mx-auto" />
                    <p className="text-base font-medium mt-1 text-center text-white">{letter.char}</p>
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
