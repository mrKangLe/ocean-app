"use client";

import { useEffect, useState } from "react";
import Block1Header from "@/components/home/Block1Header";
import Block2HeroBanner from "@/components/home/Block2HeroBanner";
import Block3CoreServices from "@/components/home/Block3CoreServices";
import Block4HotNews from "@/components/home/Block4HotNews";
import Block5BottomNav from "@/components/home/Block5BottomNav";
import Block6AiAssistant from "@/components/home/Block6AiAssistant";

export default function HomePage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // Kiểm tra xem khách đã từng bấm đóng hoặc cài chưa
    const dismissed = localStorage.getItem("install_dismissed");
    if (dismissed) return;

    // Lắng nghe sự kiện trình duyệt cho phép cài PWA
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleDismiss = () => {
    setShowInstallBtn(false);
    localStorage.setItem("install_dismissed", "true"); // Ghi nhớ để không hiện lại
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted" || outcome === "dismissed") {
      setShowInstallBtn(false);
      localStorage.setItem("install_dismissed", "true");
    }
    setDeferredPrompt(null);
  };

  return (
    <main className="max-w-md mx-auto bg-slate-50 min-h-screen pb-20 relative overflow-hidden">
      <Block1Header />
      <Block2HeroBanner />
      <Block3CoreServices />
      <Block4HotNews />
      <Block6AiAssistant />
      <Block5BottomNav />

      {/* BANNER TỰ ĐỘNG HIỆN ĐỂ CÀI APP (THÔNG MINH & LỊCH SỰ) */}
      {showInstallBtn && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-orange-600 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-10 duration-500 relative">
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 bg-slate-800 text-white w-6 h-6 rounded-full text-xs font-bold shadow-md flex items-center justify-center hover:bg-black transition"
            title="Đóng"
          >
            ✕
          </button>
          <div className="mr-2">
            <p className="text-xs font-bold">Cài Ocean App ra màn hình chính?</p>
            <p className="text-[10px] opacity-90">Trải nghiệm như App chuyên nghiệp!</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-white text-orange-600 font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition shrink-0"
          >
            Cài ngay
          </button>
        </div>
      )}
    </main>
  );
}