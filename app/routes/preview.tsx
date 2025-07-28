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

    console.log("Preview - sessionStorage letters:", letters);

    if (!letters) {
      navigate("/name-input");
      return;
    }

    const parsedLetters = JSON.parse(letters) as FingerLetter[];
    console.log("Preview - parsedLetters:", parsedLetters);
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

      // sessionStorage에서 직접 가져오기
      const savedLetters = sessionStorage.getItem("selectedLetters");
      const parsedLetters = savedLetters ? JSON.parse(savedLetters) : [];

      console.log("QR 생성 시 sessionStorage letters:", parsedLetters);
      const cardData = {
        letters: parsedLetters,
        signSize: signSize,
        layoutDirection: layoutDirection,
        userName: name,
        timestamp: timestamp,
      };
      console.log("QR 생성 시 cardData:", cardData);

      const encodedData = encodeURIComponent(JSON.stringify(cardData));
      const url = `${window.location.origin}/card/shared?data=${encodedData}`;

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
    <div className="h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 p-4 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <div className="text-center mb-4 flex-shrink-0">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 mb-3 drop-shadow-sm">지화 명함 완성</h1>
          <p className="text-xl text-slate-700 font-medium">
            명함을 확인하고 <span className="text-emerald-600 font-bold">QR코드를 활용</span>하세요
          </p>
        </div>

        <div className="bg-gradient-to-br from-white to-teal-50 rounded-3xl shadow-xl border border-teal-200/50 p-4 flex-1 flex flex-col backdrop-blur-sm">
          {/* 명함과 QR코드 */}
          <div className="flex gap-4 mb-4 flex-1 items-center">
            {/* 명함 */}
            <div className="flex-1 flex justify-center">
              <div ref={cardRef} className="bg-white border-2 border-teal-200/50 rounded-2xl p-6 shadow-xl" style={{ width: "600px", height: "340px" }}>
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
                  <div className="text-center py-3 border-t-2 border-teal-200 flex-shrink-0">
                    <p className="text-2xl font-bold text-emerald-600">{userName}</p>
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
                <h3 className="text-xl font-bold text-emerald-600 mb-2">QR 코드</h3>
                <p className="text-base text-slate-600 font-medium">디지털 명함으로 활용하세요</p>
              </div>

              <div ref={qrRef} className="bg-white border-2 border-emerald-200/50 rounded-2xl p-4 shadow-xl flex flex-col items-center" style={{ width: "200px", height: "220px" }}>
                {qrCodeUrl ? (
                  <>
                    <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28 rounded-xl shadow-lg border-2 border-emerald-200/50 mb-3" />
                    <p className="text-sm font-bold text-emerald-600 text-center mb-2">{userName}님의 지화 명함</p>
                    <p className="text-xs text-slate-600 text-center leading-tight font-medium">
                      QR코드를 스캔하여
                      <br />
                      디지털 명함을 확인하세요
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500 text-sm font-medium">QR 생성 중...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="flex justify-center gap-4 mb-3 flex-shrink-0">
            <button
              onClick={() => navigate("/name-input")}
              className="px-12 py-6 bg-gradient-to-r from-teal-600 to-cyan-600 active:from-teal-700 active:to-cyan-700 text-white text-2xl font-bold rounded-xl shadow-xl active:scale-95 transition-all duration-150 touch-manipulation min-h-[64px] min-w-[160px] border border-white/20"
            >
              수정하기
            </button>

            <button
              onClick={() => {
                // 테스트용 직접 이동 - QR과 동일한 구조
                const cardData = {
                  letters: selectedLetters.map((l) => ({
                    char: l.char,
                    imagePath: l.imagePath,
                  })),
                  signSize: signSize,
                  layoutDirection: layoutDirection,
                  userName: userName,
                  timestamp: new Date().getTime(),
                };
                console.log("테스트 버튼 - cardData:", cardData);
                const encodedData = encodeURIComponent(JSON.stringify(cardData));
                navigate(`/card/shared?data=${encodedData}`);
              }}
              className="px-12 py-6 bg-gradient-to-r from-yellow-600 to-orange-600 active:from-yellow-700 active:to-orange-700 text-white text-2xl font-bold rounded-xl shadow-xl active:scale-95 transition-all duration-150 touch-manipulation min-h-[64px] min-w-[160px] border border-white/20"
            >
              테스트
            </button>

            <button
              onClick={() => navigate("/")}
              className="px-12 py-6 bg-gradient-to-r from-green-600 to-emerald-600 active:from-green-700 active:to-emerald-700 text-white text-2xl font-bold rounded-xl shadow-xl active:scale-95 transition-all duration-150 touch-manipulation min-h-[64px] min-w-[180px] border border-white/20"
            >
              새로 만들기
            </button>
          </div>

          {/* 간단한 안내 메시지 */}
          <div className="text-center flex-shrink-0">
            <div className="inline-block bg-gradient-to-r from-teal-50 to-emerald-50 rounded-xl p-4 border-2 border-teal-200/50 shadow-sm">
              <p className="text-slate-700 text-base font-bold">
                스마트폰으로 <span className="text-emerald-600">QR코드를 촬영</span>하여 디지털 명함을 확인하세요
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
