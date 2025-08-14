import { forwardRef } from "react";
import { type FingerLetter, groupJamosByCharacter } from "~/utils/fingerLetters";

// 기본 디자인 설정
const defaultDesign = {
  id: "minimal",
  name: "미니멀",
  cardClass: "bg-white shadow-2xl border-l-8 border-l-slate-800 border border-slate-200/30",
  borderColor: "border-slate-300/50",
  textColor: "text-slate-900",
  subtextColor: "text-slate-600",
  dividerColor: "border-slate-800",
  accentColor: "bg-slate-800",
  characterBg: "bg-slate-50 border border-slate-200",
};

interface DesignType {
  id: string;
  name: string;
  cardClass: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
  dividerColor: string;
  accentColor: string;
  characterBg: string;
}

interface BusinessCardProps {
  letters: FingerLetter[] | { char: string; imagePath: string }[];
  userName: string;
  phoneNumber?: string;
  signSize: number;
  layoutDirection: "horizontal" | "vertical";
  design?: DesignType;
  width?: string;
  height?: string;
  className?: string;
  sizeMultiplier?: number; // signSize에 곱할 배수 (기본값: 4)
}

const BusinessCard = forwardRef<HTMLDivElement, BusinessCardProps>(
  ({ letters, userName, phoneNumber, signSize, layoutDirection, design, width = "620px", height = "380px", className = "", sizeMultiplier = 4 }, ref) => {
    const currentDesign = design || defaultDesign;
    const isSmall = sizeMultiplier <= 3;
    
    // 지화 개수에 따라 동적으로 크기 조정
    const letterCount = letters.length;
    const adjustedSizeMultiplier = letterCount > 8 ? Math.max(sizeMultiplier * 0.85, 2.5) : sizeMultiplier;
    const adjustedSignSize = letterCount > 10 ? Math.max(signSize * 0.9, 10) : signSize;

    // letters 배열을 FingerLetter 형태로 변환
    const fingerLetters = letters.map((letter) => ({
      ...letter,
      type: "consonant" as const,
      displayOrder: 1,
    }));

    return (
      <div
        ref={ref}
        className={`${currentDesign.cardClass} ${isSmall ? "rounded-2xl p-6" : "rounded-3xl p-8"} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl ${className}`}
        style={{ width, height }}
      >
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* 배경 패턴 */}
          <div className={`absolute top-0 right-0 ${isSmall ? "w-28 h-28" : "w-40 h-40"} opacity-5`}>
            <div className={`w-full h-full ${currentDesign.accentColor} rounded-full blur-3xl`}></div>
          </div>

          {/* 헤더 영역 */}
          <div className={`flex justify-between items-start ${isSmall ? "mb-4" : "mb-6"} relative z-10`}>
            {/* 서농복 캐릭터 */}
            <div></div>

            {/* 장식 요소 */}
            <div className={`flex ${isSmall ? "gap-1" : "gap-2"}`}>
              <div className={`${isSmall ? "w-2 h-2" : "w-3 h-3"} ${currentDesign.accentColor} rounded-full animate-pulse`}></div>
              <div className={`${isSmall ? "w-2 h-2" : "w-3 h-3"} ${currentDesign.accentColor} rounded-full opacity-60 animate-pulse`} style={{ animationDelay: "0.2s" }}></div>
              <div className={`${isSmall ? "w-2 h-2" : "w-3 h-3"} ${currentDesign.accentColor} rounded-full opacity-30 animate-pulse`} style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>

          {/* 지화 이미지 영역 */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <div className="text-center w-full max-h-full overflow-hidden">
              {fingerLetters && fingerLetters.length > 0 ? (
                <div className={`flex ${layoutDirection === "horizontal" ? `flex-wrap ${isSmall ? "gap-2" : "gap-3"} justify-center max-h-full overflow-y-auto` : `flex-col ${isSmall ? "gap-2" : "gap-3"} items-center max-h-full overflow-y-auto`}`}>
                  {groupJamosByCharacter(fingerLetters).map((group, groupIndex) => (
                    <div key={groupIndex} className={`flex ${isSmall ? "gap-3" : "gap-4"}`}>
                      {group.map((letter, letterIndex) => (
                        <div key={letterIndex} className="text-center">
                          <div className="relative group">
                            <img
                              src={letter.imagePath}
                              alt={letter.char}
                              className="object-contain mx-auto transition-all duration-300 group-hover:scale-110"
                              style={{ width: `${adjustedSignSize * adjustedSizeMultiplier}px`, height: `${adjustedSignSize * adjustedSizeMultiplier}px` }}
                              onError={(e) => {
                                console.error("이미지 로드 실패:", letter.imagePath);
                                e.currentTarget.style.border = "2px solid red";
                              }}
                              onLoad={() => {
                                console.log("이미지 로드 성공:", letter.imagePath);
                              }}
                            />
                            {/* 호버 시 글로우 효과 */}
                            <div
                              className={`absolute inset-0 ${currentDesign.accentColor} ${
                                isSmall ? "rounded-md" : "rounded-lg"
                              } opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-lg`}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <div
                    className={`${isSmall ? "w-16 h-16" : "w-24 h-24"} rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto ${
                      isSmall ? "mb-4" : "mb-6"
                    } shadow-xl border-2 border-slate-300/50`}
                  >
                    <div className={`${isSmall ? "w-8 h-8" : "w-12 h-12"} rounded-full bg-gradient-to-r from-slate-400 to-slate-500`}></div>
                  </div>
                  <p className={`${isSmall ? "text-lg" : "text-xl"} font-bold text-slate-600`}>지화 명함</p>
                </div>
              )}
            </div>
          </div>

          {/* 정보 영역 */}
          <div className="relative z-10">
            {/* 구분선 */}
            <div className={`h-px ${currentDesign.accentColor} ${isSmall ? "mb-4" : "mb-6"} shadow-sm`}></div>

            {/* 이름과 연락처 */}
            <div className="flex justify-between items-end">
              <div className="flex-1">
                <p className={`${isSmall ? "text-2xl mb-1" : "text-3xl mb-2"} font-bold ${currentDesign.textColor} tracking-wide drop-shadow-sm`}>{userName || "이름"}</p>
                {phoneNumber && (
                  <p className={`${isSmall ? "text-base" : "text-lg"} font-medium ${currentDesign.subtextColor} tracking-wider`}>{phoneNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}</p>
                )}
              </div>

              {/* 기관 정보 */}
              <div className="text-right">
                <img src="/logo-black.png" alt="서대문농아인복지관" className={`${isSmall ? "h-4" : "h-6"} ml-auto opacity-80 drop-shadow-sm`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

BusinessCard.displayName = "BusinessCard";

export default BusinessCard;
