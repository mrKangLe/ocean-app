'use client';
import Link from 'next/link';

export default function Block3CoreServices() {
  return (
    <section className="my-3 max-w-3xl mx-auto px-2.5 sm:px-4">
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 grid grid-cols-2 gap-4 text-center">
        <Link href="/chat" className="flex flex-col items-center group p-3 bg-orange-50/50 rounded-2xl border border-orange-100/80 hover:bg-orange-100/50 transition">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition shadow-md">
            🍜
          </div>
          <span className="text-sm font-bold text-slate-800 mt-2">Đồ Ăn Chân Đế</span>
          <span className="text-[10px] text-orange-600 font-medium mt-0.5">Phở, Trà sữa, Ăn vặt</span>
        </Link>

        <Link href="/services" className="flex flex-col items-center group p-3 bg-amber-50/50 rounded-2xl border border-amber-100/80 hover:bg-amber-100/50 transition">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl flex items-center justify-center text-3xl group-hover:scale-105 transition shadow-md">
            🛠️
          </div>
          <span className="text-sm font-bold text-slate-800 mt-2">Thợ Sửa Chữa</span>
          <span className="text-[10px] text-amber-600 font-medium mt-0.5">Điện nước, TV (Đấu giá)</span>
        </Link>
      </div>
    </section>
  );
}