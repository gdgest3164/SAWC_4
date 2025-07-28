import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import * as FileSaver from "file-saver";
import { type FingerLetter, combineJamos, groupJamosByCharacter } from "~/utils/fingerLetters";

export const meta: MetaFunction = () => {
  return [{ title: "명함 완성 - 지화 명함 만들기" }, { name: "description", content: "완성된 지화 명함을 저장하세요" }];
};

export default function Preview() {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const [selectedLetters, setSelectedLetters] = useState<FingerLetter[]>([]);
  const [userName, setUserName] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isQRSaved, setIsQRSaved] = useState(false);
  const [signSize, setSignSize] = useState(12);
  const [layoutDirection, setLayoutDirection] = useState<"horizontal" | "vertical">("horizontal");

  useEffect(() => {
    const letters = sessionStorage.getItem("selectedLetters");
    const savedSignSize = sessionStorage.getItem("signSize");
    const savedLayoutDirection = sessionStorage.getItem("layoutDirection");

    if (!letters) {
      navigate("/name-input");
      return;
    }

    const parsedLetters = JSON.parse(letters) as FingerLetter[];
    setSelectedLetters(parsedLetters);

    if (savedSignSize) {
      setSignSize(parseInt(savedSignSize));
    }

    if (savedLayoutDirection) {
      setLayoutDirection(savedLayoutDirection as "horizontal" | "vertical");
    }

    const combinedName = combineJamos(parsedLetters);
    setUserName(combinedName);
    generateQRCode(combinedName);
  }, [navigate]);

  const generateQRCode = async (name: string) => {
    try {
      const timestamp = new Date().getTime();
      const cardId = `${name}-${timestamp}`;
      const url = `${window.location.origin}/card/${cardId}`;

      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error("QR 코드 생성 실패:", error);
    }
  };

  const saveAsImage = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `지화명함_${userName}_${new Date().getTime()}.png`;
          FileSaver.saveAs(blob, fileName);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 3000);
        }
      });
    } catch (error) {
      console.error("이미지 저장 실패:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveQRAsImage = async () => {
    if (!qrRef.current) return;

    setIsGeneratingQR(true);

    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const fileName = `QR코드_${userName}_${new Date().getTime()}.png`;
          FileSaver.saveAs(blob, fileName);
          setIsQRSaved(true);
          setTimeout(() => setIsQRSaved(false), 3000);
        }
      });
    } catch (error) {
      console.error("QR 이미지 저장 실패:", error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎉 지화 명함 완성!</h1>
          <p className="text-lg text-gray-600">명함을 확인하고 QR코드를 활용하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 flex-1 flex flex-col">
          {/* 명함과 QR코드 */}
          <div className="flex gap-4 mb-4 flex-1 items-center">
            {/* 명함 */}
            <div className="flex-1 flex justify-center">
              <div ref={cardRef} className="bg-white border-2 border-gray-300 rounded-2xl p-6 shadow-lg" style={{ width: "600px", height: "340px" }}>
                <div className="h-full flex flex-col">
                  {/* 지화 이미지 영역 */}
                  <div className="flex-1 flex items-center justify-center overflow-hidden">
                    <div className="text-center w-full">
                      <div className={`flex ${layoutDirection === "horizontal" ? "flex-wrap gap-4 justify-center" : "flex-col gap-2 items-center"}`}>
                        {groupJamosByCharacter(selectedLetters).map((group, groupIndex) => (
                          <div key={groupIndex} className={`flex ${layoutDirection === "horizontal" ? "gap-2" : "gap-2"}`}>
                            {group.map((letter, letterIndex) => (
                              <div key={letterIndex} className="text-center">
                                <img src={letter.imagePath} alt={letter.char} className="object-contain mx-auto" style={{ width: `${signSize * 4}px`, height: `${signSize * 4}px` }} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 조합된 글자 */}
                  <div className="text-center py-2 border-t border-gray-200 flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">{userName}</p>
                  </div>

                  {/* 하단 정보 */}
                  <div className="flex items-center justify-center pt-2 flex-shrink-0">
                    <div>
                      <img src="/logo-black.png" alt="서대문농아인복지관" className="h-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR 코드 */}
            <div className="flex flex-col justify-center items-center" style={{ width: "260px" }}>
              <div className="text-center mb-3">
                <h3 className="text-lg font-bold text-gray-900 mb-1">📱 QR 코드</h3>
                <p className="text-sm text-gray-600">디지털 명함으로 활용하세요</p>
              </div>
              
              <div ref={qrRef} className="bg-white border-2 border-gray-300 rounded-2xl p-4 shadow-lg flex flex-col items-center" style={{ width: "200px", height: "220px" }}>
                {qrCodeUrl ? (
                  <>
                    <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 rounded-lg shadow-sm border border-gray-200 mb-2" />
                    <p className="text-xs font-bold text-gray-700 text-center mb-1">{userName}님의 지화 명함</p>
                    <p className="text-xs text-gray-500 text-center leading-tight">
                      QR코드를 스캔하여<br />디지털 명함을 확인하세요
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-sm">QR 생성 중...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="flex justify-center gap-4 mb-3 flex-shrink-0">
            <button
              onClick={() => navigate("/name-input")}
              className="px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-xl shadow-md active:scale-95 active:shadow-sm transition-all duration-150 touch-manipulation"
            >
              ✏️ 수정하기
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-xl shadow-md active:scale-95 active:shadow-sm transition-all duration-150 touch-manipulation"
            >
              ✨ 새로 만들기
            </button>
          </div>

          {/* 간단한 안내 메시지 */}
          <div className="text-center flex-shrink-0">
            <div className="inline-block bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-blue-700 text-sm font-medium">
                📱 스마트폰으로 QR코드를 촬영하여 디지털 명함을 확인하세요!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
