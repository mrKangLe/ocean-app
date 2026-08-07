"use client";

import { useEffect, useState } from "react";
import Block1Header from "@/components/home/Block1Header";
import Block2HeroBanner from "@/components/home/Block2HeroBanner";
import Block3CoreServices from "@/components/home/Block3CoreServices";
import Block4HotNews from "@/components/home/Block4HotNews";
import Block5BottomNav from "@/components/home/Block5BottomNav";
import Block6AiAssistant from "@/components/home/Block6AiAssistant";

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Chỉ hiện nếu chưa từng cài hoặc chưa từng tắt
    const hasVisited = localStorage.getItem("ocean_app_visited");
    if (!hasVisited) {
      setShowModal(true);
      localStorage.setItem("ocean_app_visited", "true");
    }
  }, []);

  return (
    <main className="max-w-md mx-auto bg-slate-50 min-h-screen pb-20 relative overflow-hidden">
      <Block1Header />
      <Block2HeroBanner />
      <Block3CoreServices />
      <Block4HotNews />
      <Block6AiAssistant />
      <Block5BottomNav />

      {/* MODAL CÀI ĐẶT SANG CHẢNH */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🌊</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Chào mừng đến với Ocean</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Cài đặt ứng dụng để trải nghiệm mượt mà, tiện lợi và không còn thanh địa chỉ vướng víu.
            </p>
            <button 
              onClick={() => setShowModal(false)}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-200 active:scale-95 transition"
            >
              Trải nghiệm ngay
            </button>
            <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Gợi ý: Bấm 3 chấm &gt; Thêm vào màn hình chính
            </p>
          </div>
        </div>
      )}
    </main>
  );
}