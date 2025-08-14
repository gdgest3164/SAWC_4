import { useState } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { consonants, vowels, type FingerLetter, combineJamos } from "~/utils/fingerLetters";
import BusinessCard from "~/components/BusinessCard";
import QRCode from "qrcode";

export const meta: MetaFunction = () => {
  return [{ title: "지화 명함 키오스크" }, { name: "description", content: "가로화면 터치스크린 키오스크 인터페이스" }];
};

// 명함 디자인 옵션 - 기존 design-select에서 가져옴
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
    id: "nature",
    name: "내츄럴",
    cardClass: "bg-gradient-to-br from-emerald-50 to-teal-50 shadow-2xl border-t-4 border-t-emerald-600 border border-emerald-200/60",
    borderColor: "border-emerald-300/50",
    textColor: "text-emerald-900",
    subtextColor: "text-emerald-700",
    dividerColor: "border-emerald-600",
    accentColor: "bg-gradient-to-r from-emerald-600 to-teal-600",
    characterBg: "bg-emerald-100 border border-emerald-300/50",
  },
];

const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

export default function KioskInterface() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: 이름, 2: 연락처, 3: 디자인, 4: 완성, 5: QR코드 표시
  const [selectedLetters, setSelectedLetters] = useState<FingerLetter[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedDesign, setSelectedDesign] = useState(cardDesigns[0]);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleLetterClick = (letter: FingerLetter) => {
    setSelectedLetters([...selectedLetters, letter]);
  };

  const handleNumberClick = (number: string) => {
    if (number === "*" || number === "#") return;
    if (phoneNumber.length < 11) {
      setPhoneNumber(phoneNumber + number);
    }
  };

  const handleDelete = () => {
    if (step === 1) {
      setSelectedLetters(selectedLetters.slice(0, -1));
    } else if (step === 2) {
      setPhoneNumber(phoneNumber.slice(0, -1));
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedLetters.length > 0) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) setStep(4);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "010-____-____";
    if (phone.length <= 3) return `${phone}${"-____-____".slice(phone.length - 3)}`;
    if (phone.length <= 7) return `${phone.slice(0, 3)}-${phone.slice(3)}${"-____".slice(phone.length - 7)}`;
    return `${phone.slice(0, 3)}-${phone.slice(3, 7)}-${phone.slice(7)}`;
  };

  const handleComplete = async () => {
    const cardData = {
      letters: selectedLetters.map((l) => ({ char: l.char, imagePath: l.imagePath })),
      userName: combineJamos(selectedLetters),
      phoneNumber: phoneNumber,
      design: selectedDesign,
      timestamp: new Date().getTime(),
    };

    const shortId = cardData.timestamp.toString(36);

    try {
      const response = await fetch(`/api/card/${shortId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardData),
      });

      if (response.ok) {
        // QR 코드 생성
        const url = `${window.location.origin}/card/shared?id=${shortId}`;
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        
        setQrCodeUrl(qrDataUrl);
        setStep(5); // QR 코드 표시 단계로 이동
        
        sessionStorage.setItem("selectedLetters", JSON.stringify(cardData.letters));
        sessionStorage.setItem("phoneNumber", phoneNumber);
        sessionStorage.setItem("selectedDesign", JSON.stringify(selectedDesign));
        sessionStorage.setItem("currentQRId", shortId);
      }
    } catch (error) {
      console.error("저장 실패:", error);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      {/* 상단 프로그레스 바 */}
      <div className="h-20 bg-white shadow-sm flex items-center justify-between px-12">
        <button
          onClick={() => navigate("/")}
          className="px-8 py-4 bg-gray-500 text-white rounded-lg font-bold text-xl active:scale-95 transition-all touch-manipulation min-h-[64px] min-w-[120px]"
        >
          처음으로
        </button>
        
        <div className="flex items-center gap-8">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                step >= num ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {num}
              </div>
              <span className={`ml-3 font-medium ${step >= num ? "text-blue-600" : "text-gray-400"}`}>
                {num === 1 ? "이름" : num === 2 ? "연락처" : num === 3 ? "디자인" : num === 4 ? "완성" : "QR코드"}
              </span>
              {num < 5 && <div className={`w-16 h-1 ml-8 ${step > num ? "bg-blue-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="w-[120px]" /> {/* 균형을 위한 공간 */}
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex">
        {/* 왼쪽: 명함 미리보기 */}
        <div className="w-2/5 bg-white p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">명함 미리보기</h2>
          
          <div className="flex-1 flex items-center justify-center">
            <BusinessCard
              letters={selectedLetters}
              userName={combineJamos(selectedLetters) || "이름을 입력해주세요"}
              phoneNumber={step >= 2 ? phoneNumber : ""}
              signSize={12}
              layoutDirection="horizontal"
              design={selectedDesign}
              width="520px"
              height="320px"
            />
          </div>

          {/* 현재 입력 상태 */}
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-lg font-medium text-gray-600 mb-2">
              {step === 1 ? "현재 입력중인 이름" : step === 2 ? "현재 입력중인 연락처" : "선택된 디자인"}
            </p>
            <p className="text-3xl font-bold text-gray-800">
              {step === 1 ? (combineJamos(selectedLetters) || "지화를 선택하세요") :
               step === 2 ? formatPhone(phoneNumber) :
               selectedDesign.name}
            </p>
          </div>
        </div>

        {/* 오른쪽: 입력 영역 */}
        <div className="flex-1 bg-gray-50 p-8 flex flex-col">
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">이름을 지화로 입력하세요</h2>
              <div className="flex-1 flex gap-8">
                <div className="flex-1">
                  <h3 className="text-center font-bold text-blue-600 mb-6 text-2xl">자음</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {consonants.map((letter) => (
                      <button
                        key={letter.char}
                        onClick={() => handleLetterClick(letter)}
                        className="bg-blue-500 text-white rounded-xl font-bold text-xl active:scale-95 transition-all touch-manipulation min-h-[96px] min-w-[96px] flex flex-col items-center justify-center p-3 hover:bg-blue-600"
                      >
                        <img src={letter.imagePath} alt={letter.char} className="w-12 h-12 object-contain mb-2" />
                        <span className="text-lg">{letter.char}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-center font-bold text-emerald-600 mb-6 text-2xl">모음</h3>
                  <div className="grid grid-cols-5 gap-4">
                    {vowels.map((letter) => (
                      <button
                        key={letter.char}
                        onClick={() => handleLetterClick(letter)}
                        className="bg-emerald-500 text-white rounded-xl font-bold text-xl active:scale-95 transition-all touch-manipulation min-h-[96px] min-w-[96px] flex flex-col items-center justify-center p-3 hover:bg-emerald-600"
                      >
                        <img src={letter.imagePath} alt={letter.char} className="w-12 h-12 object-contain mb-2" />
                        <span className="text-lg">{letter.char}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">연락처를 입력하세요</h2>
              <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-6 max-w-md">
                  {numbers.map((number) => (
                    <button
                      key={number}
                      onClick={() => handleNumberClick(number)}
                      disabled={number === "*" || number === "#" || phoneNumber.length >= 11}
                      className={`rounded-xl font-bold text-3xl transition-all touch-manipulation min-h-[96px] min-w-[96px] ${
                        number === "*" || number === "#" || phoneNumber.length >= 11
                          ? "bg-gray-300 text-gray-500"
                          : "bg-purple-500 text-white active:scale-95 hover:bg-purple-600"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">디자인을 선택하세요</h2>
              <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-8">
                  {cardDesigns.map((design, idx) => (
                    <button
                      key={design.id}
                      onClick={() => setSelectedDesign(design)}
                      className={`p-8 rounded-2xl font-bold text-xl transition-all active:scale-95 touch-manipulation min-h-[120px] min-w-[160px] ${
                        selectedDesign.id === design.id
                          ? "ring-4 ring-blue-500 scale-105 shadow-xl"
                          : "border-2 border-gray-300 hover:border-gray-400"
                      } ${design.cardClass} ${design.textColor} flex flex-col items-center justify-center`}
                    >
                      <div className={`w-12 h-12 ${design.accentColor} rounded-full mb-3`} />
                      {design.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">명함이 완성되었습니다!</h2>
              <div className="flex-1 flex items-center justify-center">
                <button
                  onClick={handleComplete}
                  className="px-16 py-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-3xl font-bold rounded-2xl shadow-xl active:scale-95 transition-all touch-manipulation"
                >
                  QR코드 생성하기
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">QR코드가 생성되었습니다!</h2>
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-gray-200 mb-6">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto rounded-xl" />
                  </div>
                  <p className="text-xl text-gray-600 font-medium mb-4">
                    스마트폰으로 QR코드를 촬영하여<br/>
                    디지털 명함을 확인하세요
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="px-12 py-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-2xl font-bold rounded-xl shadow-xl active:scale-95 transition-all touch-manipulation"
                  >
                    홈화면으로
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 하단 컨트롤 */}
          <div className="flex justify-between gap-6 mt-8">
            <button
              onClick={handleDelete}
              disabled={step === 3 || step === 4 || step === 5}
              className={`px-8 py-4 rounded-xl font-bold text-xl transition-all touch-manipulation min-h-[72px] min-w-[120px] ${
                step === 3 || step === 4 || step === 5
                  ? "bg-gray-300 text-gray-500"
                  : "bg-red-500 text-white active:scale-95"
              }`}
            >
              지우기
            </button>

            <div className="flex gap-4">
              {step > 1 && step < 5 && (
                <button
                  onClick={handlePrev}
                  className="px-8 py-4 bg-gray-500 text-white rounded-xl font-bold text-xl active:scale-95 transition-all touch-manipulation min-h-[72px] min-w-[120px]"
                >
                  이전
                </button>
              )}
              
              {step < 4 && (
                <button
                  onClick={handleNext}
                  disabled={(step === 1 && selectedLetters.length === 0)}
                  className={`px-8 py-4 rounded-xl font-bold text-xl transition-all touch-manipulation min-h-[72px] min-w-[120px] ${
                    (step === 1 && selectedLetters.length === 0)
                      ? "bg-gray-300 text-gray-500"
                      : "bg-blue-500 text-white active:scale-95"
                  }`}
                >
                  다음
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}