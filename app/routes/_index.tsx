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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center overflow-hidden">
      <div className="text-center space-y-16 px-8">
        <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <img src="/logo-black.png" alt="서대문농아인복지관" className="h-32 mx-auto mb-36" />
          <h1 className="text-7xl font-bold text-gray-900 mb-8">🤟 지화 명함 만들기</h1>
          <p className="text-3xl text-gray-700 font-medium">나만의 특별한 수어 명함을 만들어보세요</p>
        </div>

        <Link to="/name-input" className={`inline-block transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
          <button className="bg-blue-600 text-white text-4xl font-bold py-12 px-24 rounded-2xl shadow-lg active:scale-95 active:shadow-md transition-all duration-150 touch-manipulation min-h-[100px]">
            👆 터치하여 시작하기
          </button>
        </Link>
      </div>
    </div>
  );
}
