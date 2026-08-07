"use client";

export default function MechanicProfile() {
  const mechanicData = {
    name: "Thợ Tuấn",
    location: "Tòa S2.02 - Ocean Park 1",
    rating: 4.9,
    completedOrders: 128,
    badge: "TOP 1 THỢ ĐIỆN NƯỚC OCP1",
    tags: [
      { id: "dien-am-tuong", label: "⚡ Điện Âm Tường", color: "bg-amber-50 text-amber-700 border-amber-200" },
      { id: "treo-tv", label: "📺 Treo Tivi", color: "bg-blue-50 text-blue-700 border-blue-200" },
      { id: "quat-tran", label: "🌀 Lắp Quạt Trần", color: "bg-teal-50 text-teal-700 border-teal-200" },
      { id: "thay-den-led", label: "💡 Thay Đèn Led", color: "bg-yellow-50 text-yellow-800 border-yellow-200" },
      { id: "sua-bep-tu", label: "🔧 Sửa Bếp Từ", color: "bg-purple-50 text-purple-700 border-purple-200" },
    ],
    bio: "Kinh nghiệm 8 năm làm điện nước dân dụng. Nhiệt tình, có mặt sau 5 phút nếu cùng tòa S2. Dọn dẹp sạch sẽ sau khi thi công.",
  };

  return (
    <div className="w-full bg-slate-100 min-h-screen pb-28 relative">
      
      {/* 1. KHỐI HEADER PROFILE & COVER */}
      <div className="bg-white rounded-b-3xl shadow-sm border-b border-slate-200/80 overflow-hidden">
        
        {/* Cover Gradient */}
        <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 relative flex items-start justify-end p-3">
          <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            👑 {mechanicData.badge}
          </span>
        </div>

        {/* Avatar nổi 3D đẹp mắt */}
        <div className="px-4 pb-4 text-center relative">
          <div className="-mt-12 mb-2 inline-block">
            <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md border-2 border-white">
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-inner">
                👨‍🔧
              </div>
            </div>
          </div>

          <h1 className="text-lg font-bold text-slate-800">{mechanicData.name}</h1>
          <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1 mt-0.5">
            <span>📍</span> {mechanicData.location}
          </p>

          {/* Chỉ số Đánh giá & Số đơn */}
          <div className="grid grid-cols-2 gap-3 mt-4 bg-slate-50 rounded-2xl p-3 border border-slate-200/80">
            <div className="text-center border-r border-slate-200">
              <p className="text-lg font-black text-amber-500 flex items-center justify-center gap-1">
                ⭐ {mechanicData.rating}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Đánh giá uy tín
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-blue-600">
                {mechanicData.completedOrders}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Đơn đã hoàn thành
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. CÁC THẺ NỘI DUNG DỊCH VỤ */}
      <div className="p-4 space-y-3">
        
        {/* Skill Tags */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              🏷️ Dịch vụ nhận làm
            </h2>
            <span className="text-[10px] text-blue-600 font-bold">Chạm để chọn</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {mechanicData.tags.map((tag) => (
              <a
                key={tag.id}
                href={`/services?tag=${tag.id}`}
                className={`${tag.color} text-xs font-bold px-3 py-1.5 rounded-xl border transition-all active:scale-95 shadow-2xs`}
              >
                {tag.label}
              </a>
            ))}
          </div>
        </div>

        {/* Mô tả bản thân */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60">
          <h2 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
            📝 Giới thiệu bản thân
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {mechanicData.bio}
          </p>
        </div>

      </div>

      {/* 3. ĐỌC VỊ ĐÁY CỐ ĐỊNH - NÚT ĐẶT & CHAT */}
      <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex gap-2 shadow-2xl">
        <button 
          onClick={() => alert("Mở ngay khung Chat vãng lai với Thợ!")}
          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-slate-300"
        >
          <span>💬</span> Chat Ngay
        </button>
        <button 
          onClick={() => alert("Vui lòng Xác minh Cư dân để tạo đơn chính thức!")}
          className="flex-[2] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs py-3 rounded-xl transition-all active:scale-95 shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 uppercase tracking-wide"
        >
          <span>⚡</span> Đặt Thợ Ngay
        </button>
      </div>

    </div>
  );
}