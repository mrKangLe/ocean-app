"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Block5BottomNav from "@/components/home/Block5BottomNav";

export default function ServicesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["Tất cả", "Điện nước", "Sửa TV/Đồ điện", "Điều hòa", "Khóa/Cửa"];

  useEffect(() => {
    let isMounted = true;

    const fetchMechanics = async () => {
      // Lấy danh sách thợ từ bảng providers / mechanics trong Supabase
      const { data } = await supabase.from("providers").select("*");

      // Nếu Supabase chưa có bảng providers thì fallback dữ liệu chuẩn
      const defaultMechanics = [
        {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          conversation_id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
          name: "Thợ Tuấn (Chuyên Điện/TV)",
          category: "Sửa TV/Đồ điện",
          icon: "🔧",
          building: "Tòa S2.02",
          same_building: true,
          bio: "Treo Tivi, sửa điện âm tường, lắp quạt trần",
          rating: 4.9,
          jobs_completed: 128,
          price_range: "Từ 100k - 200k",
        },
        {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
          conversation_id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
          name: "Thợ Dũng - Thông Tắc Sửa Nước",
          category: "Điện nước",
          icon: "🚰",
          building: "Tòa S2.02",
          same_building: true,
          bio: "Sửa rò rỉ nước, thông tắc bồn cầu, hút bể phốt",
          rating: 4.9,
          jobs_completed: 110,
          price_range: "Từ 120k",
        },
        {
          id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
          conversation_id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99",
          name: "Chú Hùng - Điện Lạnh S2",
          category: "Điều hòa",
          icon: "❄️",
          building: "Tòa S2.03",
          same_building: false,
          bio: "Bảo dưỡng, vệ sinh, nạp gas điều hòa",
          rating: 4.8,
          jobs_completed: 95,
          price_range: "Từ 150k/máy",
        },
      ];

      if (isMounted) {
        setMechanics(data && data.length > 0 ? data : defaultMechanics);
        setLoading(false);
      }
    };

    fetchMechanics();
  }, []);

  // Lọc thợ theo Tab danh mục
  const filteredMechanics =
    selectedCategory === "Tất cả"
      ? mechanics
      : mechanics.filter((m) => m.category === selectedCategory);

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col justify-between shadow-2xl relative pb-20">
      {/* Header & Thanh Lọc Danh Mục */}
      <div className="bg-white sticky top-0 z-20 shadow-xs">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <h1 className="text-sm font-bold text-slate-800">Dịch Vụ & Thợ Sửa Chữa</h1>
          <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">
            Khu Đô Thị S2
          </span>
        </div>

        {/* Thanh cuộn Tab danh mục */}
        <div className="flex space-x-2 p-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {/* Banner Đẩy Việc Lên Sàn Đấu Giá (GẮN LINK CHUẨN) */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-950 text-white p-4 rounded-2xl shadow-md flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-1.5">
              <span>📣</span>
              <h3 className="text-xs font-bold">Đẩy công việc lên chợ</h3>
            </div>
            <p className="text-[10px] text-slate-300 mt-1">Nổ thông báo tìm thợ đấu giá báo giá</p>
          </div>
          <Link
            href="/mechanic/jobs"
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition shrink-0 active:scale-95"
          >
            Đăng ngay
          </Link>
        </div>

        {/* Tiêu đề danh sách */}
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Thợ Gần Bạn ({filteredMechanics.length})
          </h2>
          <span className="text-[10px] bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
            Ưu tiên tòa S2.02
          </span>
        </div>

        {/* Danh sách Thợ */}
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Đang tải danh sách thợ...</div>
        ) : (
          filteredMechanics.map((mechanic) => (
            <div
              key={mechanic.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-3 hover:shadow-xs transition"
            >
              <div className="flex space-x-3 items-start">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl shrink-0">
                  {mechanic.icon || "🔧"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xs font-bold text-slate-800 truncate">{mechanic.name}</h3>
                    {mechanic.same_building && (
                      <span className="text-[9px] bg-orange-50 text-orange-600 border border-orange-200 font-bold px-1.5 py-0.5 rounded-md shrink-0 ml-1">
                        🏠 Cùng tòa S2.02
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{mechanic.building}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{mechanic.bio}</p>
                  <div className="flex items-center space-x-2 mt-1.5 text-[11px]">
                    <span className="text-amber-500 font-bold">★ {mechanic.rating}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">{mechanic.jobs_completed} đơn hoàn thành</span>
                  </div>
                </div>
              </div>

              {/* Mức Giá + NÚT CHAT NGAY CHUẨN KẾT NỐI KHUNG CHAT */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-semibold uppercase block">Mức giá ước tính</span>
                  <span className="text-xs font-extrabold text-orange-600">{mechanic.price_range}</span>
                </div>

                <button
                  onClick={() =>
                    router.push(`/chat/${mechanic.conversation_id || "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99"}`)
                  }
                  className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs flex items-center space-x-1.5 transition active:scale-95"
                >
                  <span>💬</span>
                  <span>Chat ngay</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Block5BottomNav />
    </div>
  );
}