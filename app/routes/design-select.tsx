import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { type FingerLetter, combineJamos } from "~/utils/fingerLetters";
import BusinessCard from "~/components/BusinessCard";

export const meta: MetaFunction = () => {
  return [{ title: "디자인 선택 - 지화 명함 만들기" }, { name: "description", content: "명함 디자인을 선택하세요" }];
};

// 명함 디자인 옵션 - 다양하고 전문적인 명함 스타일
const cardDesigns = [
  {
    id: "minimal",
    name: "미니멀",
    cardClass: "bg-white shadow-2xl border-l-8 border-l-slate-800 border border-slate-200/30",
    borderColor: "border-slate-300/50",
    textColor: "text-slate-900",
    subtextColor: "text-slate-600",
    dividerColor: "border-slate-800",
    accentColor: "bg-slate-800",
    characterBg: "bg-slate-50 border border-slate-200",
  },
  {
    id: "glassmorphism",
    name: "글래스",
    cardClass: "bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl shadow-2xl border border-white/30",
    borderColor: "border-white/40",
    textColor: "text-slate-900",
    subtextColor: "text-slate-700",
    dividerColor: "border-white/50",
    accentColor: "bg-gradient-to-r from-blue-400 to-purple-500",
    characterBg: "bg-white/30 border border-white/40 backdrop-blur-sm",
  },
  {
    id: "luxury",
    name: "럭셔리",
    cardClass: "bg-gradient-to-br from-gray-900 via-slate-800 to-black shadow-2xl border-2 border-yellow-400/50",
    borderColor: "border-yellow-400/30",
    textColor: "text-yellow-100",
    subtextColor: "text-yellow-200/80",
    dividerColor: "border-yellow-400",
    accentColor: "bg-gradient-to-r from-yellow-400 to-amber-500",
    characterBg: "bg-gradient-to-br from-yellow-100/20 to-amber-200/20 border border-yellow-400/30",
  },
  {
    id: "neon",
    name: "네온",
    cardClass: "bg-gray-900 shadow-2xl shadow-cyan-500/25 border-2 border-cyan-400/50",
    borderColor: "border-cyan-400/50",
    textColor: "text-cyan-100",
    subtextColor: "text-cyan-200/80",
    dividerColor: "border-cyan-400",
    accentColor: "bg-gradient-to-r from-cyan-400 to-blue-500",
    characterBg: "bg-cyan-500/20 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30",
  },
  {
    id: "gradient",
    name: "그라디언트",
    cardClass: "bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 shadow-2xl",
    borderColor: "border-pink-300/50",
    textColor: "text-white",
    subtextColor: "text-pink-100",
    dividerColor: "border-white/50",
    accentColor: "bg-white",
    characterBg: "bg-white/20 border border-white/40 backdrop-blur-sm",
  },
  {
    id: "paper",
    name: "페이퍼",
    cardClass: "bg-gradient-to-br from-amber-50 to-orange-50 shadow-2xl border-2 border-amber-200",
    borderColor: "border-amber-300/50",
    textColor: "text-amber-900",
    subtextColor: "text-amber-700",
    dividerColor: "border-amber-400",
    accentColor: "bg-gradient-to-r from-amber-500 to-orange-500",
    characterBg: "bg-amber-100 border border-amber-300",
  },
  {
    id: "corporate",
    name: "기업형",
    cardClass: "bg-gradient-to-br from-blue-50 to-indigo-50 shadow-2xl border-t-4 border-t-blue-600 border border-blue-200/60",
    borderColor: "border-blue-300/50",
    textColor: "text-blue-900",
    subtextColor: "text-blue-700",
    dividerColor: "border-blue-600",
    accentColor: "bg-gradient-to-r from-blue-600 to-indigo-600",
    characterBg: "bg-blue-100 border border-blue-300/50",
  },
  {
    id: "tech",
    name: "테크",
    cardClass: "bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl border border-emerald-400/30",
    borderColor: "border-emerald-400/50",
    textColor: "text-emerald-100",
    subtextColor: "text-emerald-200/80",
    dividerColor: "border-emerald-400",
    accentColor: "bg-gradient-to-r from-emerald-400 to-teal-400",
    characterBg: "bg-emerald-500/20 border border-emerald-400/50",
  },
];

export default function DesignSelect() {
  const [selectedLetters, setSelectedLetters] = useState<FingerLetter[]>([]);
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [signSize, setSignSize] = useState(12);
  const [layoutDirection, setLayoutDirection] = useState<"horizontal" | "vertical">("horizontal");
  const [selectedDesign, setSelectedDesign] = useState(cardDesigns[0]);
  const navigate = useNavigate();

  // sessionStorage에서 이전 상태 복원
  useEffect(() => {
    const savedLetters = sessionStorage.getItem("selectedLetters");
    const savedSignSize = sessionStorage.getItem("signSize");
    const savedLayoutDirection = sessionStorage.getItem("layoutDirection");
    const savedPhoneNumber = sessionStorage.getItem("phoneNumber");

    if (!savedLetters) {
      navigate("/name-input");
      return;
    }

    try {
      const parsedLetters = JSON.parse(savedLetters) as FingerLetter[];
      setSelectedLetters(parsedLetters);
      setUserName(combineJamos(parsedLetters));
    } catch (error) {
      console.error("저장된 지화 데이터 복원 실패:", error);
      navigate("/name-input");
      return;
    }

    if (savedSignSize) {
      setSignSize(parseInt(savedSignSize));
    }

    if (savedLayoutDirection) {
      setLayoutDirection(savedLayoutDirection as "horizontal" | "vertical");
    }

    if (savedPhoneNumber) {
      setPhoneNumber(savedPhoneNumber);
    }
  }, [navigate]);

  const handleDesignSelect = (design: (typeof cardDesigns)[0]) => {
    setSelectedDesign(design);
  };

  const handleComplete = async () => {
    if (selectedLetters.length > 0) {
      const letterData = selectedLetters.map((l) => ({
        char: l.char,
        imagePath: l.imagePath,
      }));

      // Blob에 저장할 카드 데이터
      const cardData = {
        letters: letterData,
        signSize: signSize,
        layoutDirection: layoutDirection,
        userName: userName,
        phoneNumber: phoneNumber,
        design: selectedDesign,
        timestamp: new Date().getTime(),
      };

      // 짧은 ID 생성
      const shortId = cardData.timestamp.toString(36);

      try {
        // Vercel Blob에 저장
        const response = await fetch(`/api/card/${shortId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cardData),
        });

        if (response.ok) {
          // 성공시 sessionStorage에도 저장
          sessionStorage.setItem("selectedLetters", JSON.stringify(letterData));
          sessionStorage.setItem("signSize", signSize.toString());
          sessionStorage.setItem("layoutDirection", layoutDirection);
          sessionStorage.setItem("phoneNumber", phoneNumber);
          sessionStorage.setItem("selectedDesign", JSON.stringify(selectedDesign));
          sessionStorage.setItem("currentQRId", shortId);
          navigate("/preview");
        } else {
          alert("명함 저장에 실패했습니다.");
        }
      } catch (error) {
        console.error("저장 실패:", error);
        alert("명함 저장에 실패했습니다.");
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col">
        {/* 상단: 제목 */}
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 mb-3 drop-shadow-sm">디자인 선택</h1>
          <p className="text-xl text-slate-700 font-medium">
            마음에 드는 <span className="text-emerald-600 font-bold">명함 디자인</span>을 선택하세요
          </p>
        </div>

        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* 왼쪽: 명함 미리보기 */}
          <div className="flex-1 bg-gradient-to-br from-white to-teal-50 rounded-3xl shadow-xl border border-teal-200/50 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-bold text-emerald-600 mb-4 text-center">명함 미리보기</h3>
            <div className="flex items-center justify-center h-full p-4">
              <BusinessCard
                letters={selectedLetters}
                userName={userName}
                phoneNumber={phoneNumber}
                signSize={signSize}
                layoutDirection={layoutDirection}
                design={selectedDesign}
                width="520px"
                height="320px"
                sizeMultiplier={3}
              />
            </div>
          </div>

          {/* 오른쪽: 디자인 선택 */}
          <div className="w-80 bg-white rounded-3xl shadow-sm border border-stone-200 p-4 overflow-hidden">
            <h3 className="text-lg font-bold mb-4 text-center bg-emerald-500 text-white rounded-lg p-3">디자인 선택</h3>

            <div className="grid grid-cols-2 gap-3 mb-4 overflow-y-auto max-h-[calc(100%-120px)]">
              {cardDesigns.map((design) => (
                <button
                  key={design.id}
                  onClick={() => handleDesignSelect(design)}
                  className={`p-3 rounded-xl shadow-lg active:scale-95 transition-all duration-300 touch-manipulation min-h-[120px] border-2 group hover:shadow-xl ${
                    selectedDesign.id === design.id ? "border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {/* 미니 명함 미리보기 */}
                  <div className={`${design.cardClass} rounded-lg p-3 mb-2 h-20 flex flex-col justify-between relative overflow-hidden transition-transform duration-300 group-hover:scale-105`}>
                    {/* 미니 배경 패턴 */}
                    <div className="absolute top-0 right-0 w-8 h-8 opacity-10">
                      <div className={`w-full h-full ${design.accentColor} rounded-full blur-xl`}></div>
                    </div>

                    {/* 미니 헤더 */}
                    <div className="flex justify-between items-start relative z-10">
                      <div className={`w-3 h-3 ${design.characterBg} rounded-sm`}></div>
                      <div className="flex gap-0.5">
                        <div className={`w-1 h-1 ${design.accentColor} rounded-full`}></div>
                        <div className={`w-1 h-1 ${design.accentColor} rounded-full opacity-60`}></div>
                      </div>
                    </div>

                    {/* 미니 콘텐츠 */}
                    <div className="relative z-10">
                      <div className={`h-px ${design.accentColor} mb-1`}></div>
                      <div className="flex justify-between items-end">
                        <div>
                          <div className={`w-8 h-1 ${design.textColor} bg-current rounded-full mb-0.5`}></div>
                          <div className={`w-6 h-0.5 ${design.subtextColor} bg-current rounded-full`}></div>
                        </div>
                        <div className={`w-2 h-1 ${design.subtextColor} bg-current rounded-sm`}></div>
                      </div>
                    </div>
                  </div>

                  <p className={`text-sm font-bold transition-colors duration-300 ${selectedDesign.id === design.id ? "text-emerald-700" : "text-gray-700"}`}>{design.name}</p>
                </button>
              ))}
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/contact-input")}
                className="flex-1 px-4 py-3 bg-stone-600 active:bg-stone-700 text-white text-sm font-bold rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px]"
              >
                이전
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-3 bg-green-600 active:bg-green-700 text-white text-sm font-bold rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px]"
              >
                완성
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
