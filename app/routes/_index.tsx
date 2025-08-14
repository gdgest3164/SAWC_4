import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [{ title: "지화 명함 만들기" }, { name: "description", content: "나만의 특별한 수어 명함을 만들어보세요" }];
};

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleStartClick = () => {
    // 새로 시작할 때 이전 데이터 초기화
    sessionStorage.removeItem("selectedLetters");
    sessionStorage.removeItem("signSize");
    sessionStorage.removeItem("layoutDirection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 via-emerald-400/10 to-cyan-400/10 animate-pulse"></div>
      <div className="text-center space-y-16 px-8 relative z-10">
        <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <div className="bg-gradient-to-br from-white to-teal-50 rounded-3xl shadow-xl border border-teal-200/50 p-12 mb-16 backdrop-blur-sm">
            <img src="/logo-black.png" alt="서대문농아인복지관" className="h-24 mx-auto mb-8 filter drop-shadow-lg" />
            <div className="h-1 bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 w-32 mx-auto rounded-full"></div>
          </div>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 mb-6 tracking-tight drop-shadow-sm">
            지화 명함 만들기
          </h1>
          <p className="text-2xl text-slate-700 font-medium leading-relaxed max-w-2xl mx-auto">
            손끝으로 전하는 마음,<br/>
            <span className="text-emerald-600 font-semibold">나만의 특별한 수어 명함</span>을 만들어보세요
          </p>
        </div>

        <Link to="/kiosk-interface" onClick={handleStartClick} className={`inline-block transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
          <button className="group relative bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 active:from-teal-700 active:via-emerald-700 active:to-cyan-700 text-white text-3xl font-bold py-16 px-32 rounded-2xl shadow-2xl active:scale-95 active:shadow-xl transition-all duration-200 touch-manipulation min-h-[120px] min-w-[320px] border border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-active:opacity-100 transition-opacity duration-200"></div>
            <span className="relative z-10 drop-shadow-sm">터치하여 시작하기</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
