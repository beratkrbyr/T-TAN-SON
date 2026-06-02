"use client";
import { useState } from "react";

interface BeforeAfterProps {
  beforeImage: string;
  afterImage: string;
  labelBefore?: string;
  labelAfter?: string;
  title: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  labelBefore = "Öncesi",
  labelAfter = "Sonrası",
  title
}: BeforeAfterProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderPosition(Number(e.target.value));
  };

  return (
    <div className="flex flex-col items-center bg-white rounded-3xl p-6 border border-slate-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
      <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none shadow-inner bg-slate-100">
        {/* After Image (Sonrası) - Arka Plan */}
        <img
          src={afterImage}
          alt="Sonrası"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <span className="absolute bottom-4 right-4 z-20 bg-emerald-500 text-white px-3 py-1 text-xs font-bold rounded-lg shadow-md">
          {labelAfter}
        </span>

        {/* Before Image (Öncesi) - Üstteki Resim (clipPath ile kırpılır) */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img
            src={beforeImage}
            alt="Öncesi"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ width: "100%", height: "100%" }}
          />
        </div>
        <span className="absolute bottom-4 left-4 z-20 bg-slate-900/80 text-white px-3 py-1 text-xs font-bold rounded-lg shadow-md">
          {labelBefore}
        </span>

        {/* Kaydırıcı Çizgi ve Daire */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-30 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.3)]"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white border-4 border-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>

        {/* Görünmez Range Input (Sürükleme Tıklamalarını Yakalar) */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40 accent-transparent"
        />
      </div>
    </div>
  );
}
