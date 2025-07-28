import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

export const meta: MetaFunction = () => {
  return [
    { title: "명함 완성 - 지화 명함 만들기" },
    { name: "description", content: "완성된 지화 명함을 저장하세요" },
  ];
};

interface SelectedLetter {
  char: string;
  imagePath: string;
}

export default function Preview() {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedLetters, setSelectedLetters] = useState<SelectedLetter[]>([]);
  const [userName, setUserName] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const letters = sessionStorage.getItem("selectedLetters");
    const name = sessionStorage.getItem("userName");
    
    if (!letters || !name) {
      navigate("/name-input");
      return;
    }

    setSelectedLetters(JSON.parse(letters));
    setUserName(name);
    generateQRCode();
  }, [navigate]);

  const generateQRCode = async () => {
    try {
      const timestamp = new Date().getTime();
      const cardId = `${userName}-${timestamp}`;
      const url = `${window.location.origin}/card/${cardId}`;
      
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 150,
        margin: 1,
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
          saveAs(blob, fileName);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            명함이 완성되었습니다!
          </h1>
          <p className="text-xl text-gray-600">
            QR코드가 포함된 명함을 저장할 수 있습니다
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-12">
          <div className="flex justify-center mb-8">
            <div
              ref={cardRef}
              className="bg-white border-2 border-gray-300 rounded-2xl p-8 shadow-lg"
              style={{ width: "360px", height: "200px" }}
            >
              <div className="h-full flex flex-col justify-between">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {userName}
                  </h2>
                  <div className="grid grid-cols-4 gap-1 justify-center mb-2">
                    {selectedLetters.map((letter, index) => (
                      <img
                        key={index}
                        src={letter.imagePath}
                        alt={letter.char}
                        className="w-12 h-12 object-contain"
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                  <div className="text-xs text-gray-600">
                    <p>지화로 만든 명함</p>
                    <p className="text-[10px]">서대문농아인복지관</p>
                  </div>
                  {qrCodeUrl && (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-16 h-16"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={saveAsImage}
              disabled={isGenerating}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isGenerating ? "저장 중..." : "이미지로 저장하기"}
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95"
            >
              새로운 명함 만들기
            </button>
          </div>

          {isSaved && (
            <div className="text-center">
              <p className="text-green-600 text-lg font-semibold animate-pulse">
                ✓ 명함이 저장되었습니다!
              </p>
            </div>
          )}

          <div className="text-center mt-8">
            <div className="inline-block bg-gray-100 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-2">명함 활용 팁</h3>
              <ul className="text-left text-gray-700 space-y-1">
                <li>• 저장된 이미지를 프린트하여 실제 명함으로 사용하세요</li>
                <li>• QR코드를 스캔하면 디지털 명함을 볼 수 있습니다</li>
                <li>• SNS에 공유하여 수어에 대한 관심을 높여보세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}