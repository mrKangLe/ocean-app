'use client';

export default function Block2HeroBanner() {
  return (
    <section className="mt-3 max-w-3xl mx-auto px-2.5 sm:px-4">
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm flex justify-between items-center relative overflow-hidden">
        <div className="z-10">
          <span className="bg-amber-300 text-orange-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            🔥 SIÊU DEAL BÁN KÍNH 200M
          </span>
          <h2 className="text-base font-black mt-1">Phở Thin - Chân Đế S2.06</h2>
          <p className="text-xs text-orange-100 mt-0.5">Giảm ngay 10k/bát cho Cư Dân & Khách</p>
        </div>
        
        <button 
          onClick={() => alert("🎉 Đã lấy mã PHOTHIN10K!")}
          className="z-10 bg-white text-orange-600 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md hover:bg-orange-50 transition active:scale-95 shrink-0"
        >
          Lấy Mã
        </button>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>
    </section>
  );
}