'use client';
import { useState, useEffect } from 'react';

export default function Block6AiAssistant() {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="fixed bottom-16 right-4 z-30 flex flex-col items-end group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {showTooltip && (
        <div className="bg-slate-900/90 text-white text-[10px] font-medium py-1 px-2.5 rounded-xl shadow-xl mb-1.5 whitespace-nowrap backdrop-blur-sm border border-slate-700">
          🤖 Hỏi trợ lý AI ngay!
        </div>
      )}

      <button 
        onClick={() => alert("🟢 Mở Chat Trợ Lý AI...")}
        className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center transition-all duration-200 active:scale-90"
        title="Trợ lý Ocean"
      >
        <span className="text-xl">🤖</span>
      </button>
    </div>
  );
}