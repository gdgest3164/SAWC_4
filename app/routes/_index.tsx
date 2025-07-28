import { Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "지화 명함 만들기" },
    { name: "description", content: "나만의 특별한 수어 명함을 만들어보세요" },
  ];
};

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center overflow-hidden">
      <div className="text-center space-y-12 px-8">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <img
            src="/시립서대문농아인복지관-로고(검정).png"
            alt="서대문농아인복지관"
            className="h-24 mx-auto mb-8"
          />
          <h1 className="text-6xl font-bold text-gray-800 mb-4">
            지화 명함 만들기
          </h1>
          <p className="text-2xl text-gray-600">
            나만의 특별한 수어 명함을 만들어보세요
          </p>
        </div>

        <Link
          to="/name-input"
          className={`inline-block transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
        >
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold py-8 px-16 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 active:scale-95">
            터치하여 시작하기
          </button>
        </Link>

        <div
          className={`text-gray-500 text-lg animate-pulse transition-all duration-1000 delay-1000 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          화면을 터치해주세요
        </div>
      </div>
    </div>
  );
}
