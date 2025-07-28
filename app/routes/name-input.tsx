import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "이름 입력 - 지화 명함 만들기" },
    { name: "description", content: "명함에 들어갈 이름을 입력하세요" },
  ];
};

export default function NameInput() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (name.trim()) {
      navigate(`/finger-letters?name=${encodeURIComponent(name)}`);
    }
  };

  const handleKeyClick = (char: string) => {
    if (name.length < 4) {
      setName(name + char);
    }
  };

  const handleBackspace = () => {
    setName(name.slice(0, -1));
  };

  const handleClear = () => {
    setName("");
  };

  const koreanKeyboard = [
    ["ㅂ", "ㅈ", "ㄷ", "ㄱ", "ㅅ", "ㅛ", "ㅕ", "ㅑ"],
    ["ㅁ", "ㄴ", "ㅇ", "ㄹ", "ㅎ", "ㅗ", "ㅓ", "ㅏ"],
    ["ㅋ", "ㅌ", "ㅊ", "ㅍ", "ㅠ", "ㅜ", "ㅡ", "ㅣ"],
  ];

  const specialKeys = ["ㅃ", "ㅉ", "ㄸ", "ㄲ", "ㅆ", "ㅒ", "ㅖ"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            이름을 입력해주세요
          </h1>
          <p className="text-xl text-gray-600">
            최대 4글자까지 입력 가능합니다
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-block min-w-[400px] min-h-[80px] bg-gray-100 rounded-xl p-4">
              <p className="text-4xl font-bold text-gray-800 h-12">
                {name || <span className="text-gray-400">이름 입력...</span>}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {koreanKeyboard.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-3">
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    className="w-24 h-24 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95"
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}

            <div className="flex justify-center gap-3">
              {specialKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyClick(key)}
                  className="w-20 h-20 bg-purple-500 hover:bg-purple-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95"
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleClear}
                className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95"
              >
                전체 지우기
              </button>
              <button
                onClick={handleBackspace}
                className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95"
              >
                ← 지우기
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="px-12 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
              >
                다음 단계 →
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 hover:text-gray-800 text-lg underline"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}