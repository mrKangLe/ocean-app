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
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      // Lưu lại lệnh chờ để khi nào bấm nút là kích hoạt
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Trình duyệt hiện chưa sẵn sàng cài đặt tự động. Bố vui lòng kiểm tra lại cấu hình PWA nhé!");
      return;
    }
    // Gọi lệnh bật bảng xác nhận cài đặt của trình duyệt lên
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowButton(false);
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

      {/* NÚT CÀI ĐẶT SANG CHẢNH - CHỈ HIỆN KHI TRÌNH DUYỆT CHO PHÉP */}
      {showButton && (
        <div className="fixed bottom-20 left-4 right-4 z-50">
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-xl shadow-orange-200 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <span>📥 Cài đặt ứng dụng lên màn hình</span>
          </button>
        </div>
      )}
    </main>
  );
}