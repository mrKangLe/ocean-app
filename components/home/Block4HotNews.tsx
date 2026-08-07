'use client';

export default function Block4HotNews() {
  return (
    <section className="my-3 max-w-3xl mx-auto px-2.5 sm:px-4">
      <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-slate-200/60">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">⚡</span>
            <h2 className="text-xs font-extrabold text-orange-600 uppercase tracking-wide">Mách Nước Hot Hôm Nay</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium cursor-pointer hover:text-orange-500">Xem thêm &gt;</span>
        </div>

        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-xl font-bold shrink-0">
            ☕
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-800">Cà phê muối S2.05 vừa mở cửa</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Mua 2 tặng 1 tuần đầu khai trương...</p>
          </div>
          <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-1 rounded-md">HOT</span>
        </div>
      </div>
    </section>
  );
}