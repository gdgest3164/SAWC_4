import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import {
  decomposeHangul,
  consonants,
  vowels,
  type FingerLetter,
} from "~/utils/fingerLetters";

export const meta: MetaFunction = () => {
  return [
    { title: "지화 선택 - 지화 명함 만들기" },
    { name: "description", content: "이름을 지화로 변환합니다" },
  ];
};

export default function FingerLetters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "";
  const [decomposedName, setDecomposedName] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<FingerLetter[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!name) {
      navigate("/name-input");
      return;
    }
    const decomposed = decomposeHangul(name);
    setDecomposedName(decomposed);
  }, [name, navigate]);

  const handleLetterClick = (letter: FingerLetter) => {
    if (currentIndex < decomposedName.length && letter.char === decomposedName[currentIndex]) {
      setSelectedLetters([...selectedLetters, letter]);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReset = () => {
    setSelectedLetters([]);
    setCurrentIndex(0);
  };

  const handleComplete = () => {
    if (currentIndex === decomposedName.length) {
      const letterData = selectedLetters.map(l => ({
        char: l.char,
        imagePath: l.imagePath
      }));
      sessionStorage.setItem("selectedLetters", JSON.stringify(letterData));
      sessionStorage.setItem("userName", name);
      navigate("/preview");
    }
  };

  const isComplete = currentIndex === decomposedName.length;
  const currentLetter = decomposedName[currentIndex];
  const isCurrentConsonant = consonants.some(c => c.char === currentLetter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            지화로 이름 만들기
          </h1>
          <p className="text-xl text-gray-600">
            {name}를 지화로 표현해보세요
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
                명함 미리보기
              </h2>
              <div className="bg-gray-100 rounded-xl p-8 h-[400px] flex flex-col items-center justify-center">
                <p className="text-3xl font-bold mb-6">{name}</p>
                <div className="grid grid-cols-4 gap-2">
                  {selectedLetters.map((letter, index) => (
                    <img
                      key={index}
                      src={letter.imagePath}
                      alt={letter.char}
                      className="w-20 h-20 object-contain"
                    />
                  ))}
                  {!isComplete && (
                    <div className="w-20 h-20 border-2 border-dashed border-gray-400 rounded-lg animate-pulse" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-700 mb-4 text-center">
                지화 선택
              </h2>
              
              <div className="text-center mb-4">
                <p className="text-lg">
                  현재 선택할 글자: 
                  <span className="text-3xl font-bold text-blue-600 ml-2">
                    {currentLetter || "완료!"}
                  </span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {decomposedName.map((char, index) => (
                    <span
                      key={index}
                      className={`mx-1 ${
                        index < currentIndex
                          ? "text-green-600 font-bold"
                          : index === currentIndex
                          ? "text-blue-600 font-bold text-2xl"
                          : "text-gray-400"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </p>
              </div>

              <div className="space-y-4">
                {!isComplete && (
                  <>
                    {isCurrentConsonant ? (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">자음</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {consonants.map((letter) => (
                            <button
                              key={letter.char}
                              onClick={() => handleLetterClick(letter)}
                              disabled={letter.char !== currentLetter}
                              className={`relative p-2 rounded-lg transition-all duration-150 ${
                                letter.char === currentLetter
                                  ? "bg-blue-100 hover:bg-blue-200 transform hover:scale-105 shadow-lg"
                                  : "bg-gray-100 opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <img
                                src={letter.imagePath}
                                alt={letter.char}
                                className="w-16 h-16 object-contain mx-auto"
                              />
                              <p className="text-sm font-bold mt-1">{letter.char}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">모음</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {vowels.map((letter) => (
                            <button
                              key={letter.char}
                              onClick={() => handleLetterClick(letter)}
                              disabled={letter.char !== currentLetter}
                              className={`relative p-2 rounded-lg transition-all duration-150 ${
                                letter.char === currentLetter
                                  ? "bg-blue-100 hover:bg-blue-200 transform hover:scale-105 shadow-lg"
                                  : "bg-gray-100 opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <img
                                src={letter.imagePath}
                                alt={letter.char}
                                className="w-16 h-16 object-contain mx-auto"
                              />
                              <p className="text-sm font-bold mt-1">{letter.char}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/name-input")}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95"
            >
              이름 다시 입력
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95"
            >
              다시 선택하기
            </button>
            <button
              onClick={handleComplete}
              disabled={!isComplete}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
            >
              명함 완성하기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}