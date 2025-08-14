import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "연락처 입력 - 지화 명함 만들기" }, { name: "description", content: "지숫자로 연락처를 입력하세요" }];
};

// 지숫자 이미지 데이터 (추후 이미지 받으면 업데이트)
const fingerNumbers = [
  { number: "0", imagePath: "/finger-numbers/0.png" },
  { number: "1", imagePath: "/finger-numbers/1.png" },
  { number: "2", imagePath: "/finger-numbers/2.png" },
  { number: "3", imagePath: "/finger-numbers/3.png" },
  { number: "4", imagePath: "/finger-numbers/4.png" },
  { number: "5", imagePath: "/finger-numbers/5.png" },
  { number: "6", imagePath: "/finger-numbers/6.png" },
  { number: "7", imagePath: "/finger-numbers/7.png" },
  { number: "8", imagePath: "/finger-numbers/8.png" },
  { number: "9", imagePath: "/finger-numbers/9.png" },
  { number: "-", imagePath: "/finger-numbers/dash.png" },
];

export default function ContactInput() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  // sessionStorage에서 이전 상태 복원 및 필수 데이터 검증
  useEffect(() => {
    const savedLetters = sessionStorage.getItem("selectedLetters");
    
    // 이름 입력 데이터가 없으면 name-input으로 리디렉션
    if (!savedLetters) {
      navigate("/name-input");
      return;
    }

    const savedPhoneNumber = sessionStorage.getItem("phoneNumber");
    if (savedPhoneNumber) {
      setPhoneNumber(savedPhoneNumber);
    }
  }, [navigate]);

  // 상태 변경시 sessionStorage에 저장
  useEffect(() => {
    sessionStorage.setItem("phoneNumber", phoneNumber);
  }, [phoneNumber]);

  const handleNumberClick = (number: string) => {
    setPhoneNumber(phoneNumber + number);
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleClear = () => {
    setPhoneNumber("");
  };

  const handleComplete = () => {
    // 연락처 입력 완료 후 디자인 선택 페이지로 이동
    navigate("/design-select");
  };

  const handleSkip = () => {
    // 연락처 입력 건너뛰기
    setPhoneNumber("");
    navigate("/design-select");
  };

  // 전화번호 포맷팅 (010-1234-5678)
  const formatPhoneNumber = (number: string) => {
    return number.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  return (
    <div className="h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col">
        {/* 상단: 제목 */}
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 mb-3 drop-shadow-sm">
            연락처 입력
          </h1>
          <p className="text-xl text-slate-700 font-medium">
            지숫자로 <span className="text-emerald-600 font-bold">연락처</span>를 입력하세요
          </p>
        </div>

        {/* 중간: 연락처 미리보기 */}
        <div className="bg-gradient-to-br from-white to-teal-50 rounded-3xl shadow-xl border border-teal-200/50 p-6 mb-4 flex-shrink-0 backdrop-blur-sm">
          <div className="text-center">
            <h3 className="text-xl font-bold text-emerald-600 mb-4">입력된 연락처</h3>
            <div className="bg-white border-2 border-teal-200/50 rounded-2xl p-6 shadow-lg min-h-[80px] flex items-center justify-center">
              {phoneNumber ? (
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600 mb-2">{formatPhoneNumber(phoneNumber)}</p>
                  <div className="flex gap-1 justify-center">
                    {phoneNumber.split("").map((digit, index) => (
                      <div key={index} className="w-8 h-8 bg-emerald-100 rounded border border-emerald-300 flex items-center justify-center">
                        <span className="text-sm font-bold text-emerald-700">{digit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-stone-400 text-center">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                    <div className="w-8 h-8 rounded-full bg-stone-300"></div>
                  </div>
                  <p className="text-base font-light">아래에서 지숫자를 선택해보세요</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단: 지숫자 키보드 */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-4 flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-center bg-emerald-500 text-white rounded-lg p-3">지숫자</h3>
            
            {/* 숫자 키보드 */}
            <div className="flex-1 grid grid-cols-4 gap-3 mb-4">
              {fingerNumbers.map((item) => (
                <button
                  key={item.number}
                  onClick={() => handleNumberClick(item.number)}
                  className="p-2 bg-emerald-500 active:bg-emerald-600 rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[100px] flex flex-col items-center justify-center"
                >
                  {/* 임시 텍스트 (이미지 받으면 교체) */}
                  <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-emerald-700">{item.number}</span>
                  </div>
                  <p className="text-sm font-bold text-white">{item.number}</p>
                </button>
              ))}
            </div>

            {/* 컨트롤 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/name-input")}
                className="flex-1 px-4 py-3 bg-stone-600 active:bg-stone-700 text-white text-base font-bold rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px]"
              >
                이전
              </button>
              <button
                onClick={handleBackspace}
                disabled={phoneNumber.length === 0}
                className="flex-1 px-4 py-3 bg-red-500 disabled:bg-stone-300 active:bg-red-600 text-white text-base font-bold rounded-lg shadow-md active:scale-95 transition-all duration-150 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
              >
                지우기
              </button>
              <button
                onClick={handleClear}
                disabled={phoneNumber.length === 0}
                className="flex-1 px-4 py-3 bg-orange-500 disabled:bg-stone-300 active:bg-orange-600 text-white text-base font-bold rounded-lg shadow-md active:scale-95 transition-all duration-150 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
              >
                전체삭제
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-3 bg-blue-500 active:bg-blue-600 text-white text-base font-bold rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px]"
              >
                건너뛰기
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-4 py-3 bg-green-600 active:bg-green-700 text-white text-base font-bold rounded-lg shadow-md active:scale-95 transition-all duration-150 touch-manipulation min-h-[48px]"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}