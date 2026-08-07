'use client';

import { useState } from 'react';

interface NotificationItem {
  id: number;
  title: string;
  time: string;
  content: string;
  read: boolean;
}

export default function Block1Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  // Danh sách thông báo mẫu
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 1,
      title: '🎁 Ưu đãi Phở Thìn S2.06',
      time: '10 phút trước',
      content: 'Cư dân S2.06 được giảm ngay 10k/bát khi chốt đơn qua Chat hôm nay. Nhập mã PHOTHIN102!',
      read: false,
    },
    {
      id: 2,
      title: '📢 Thông báo bảo trì điện nước',
      time: '1 giờ trước',
      content: 'Ban quản lý xin thông báo lịch bảo trì hệ thống nước khu S2 từ 14h00 đến 16h00 chiều nay.',
      read: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotif = (notif: NotificationItem) => {
    setSelectedNotif(notif);
    setNotifications((prev) =>
      prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
    );
  };

  return (
    <>
      {/* HEADER CHÍNH - THIẾT KẾ BỀ THẾ, ĐẦY ĐẶN HƠN */}
      <header className="bg-orange-500 px-4 py-3.5 flex items-center justify-between gap-3 shadow-md">
        <span className="text-white font-black text-lg tracking-wider shrink-0">ocean.app</span>

        {/* Ô TÌM KIẾM MỞ RỘNG LINH HOẠT */}
        <div className="flex-1 bg-white/95 rounded-full px-3.5 py-1.5 text-xs text-gray-500 flex items-center gap-2 shadow-inner">
          <span className="text-sm">🔍</span>
          <input
            type="text"
            placeholder="Bún chả, phở thìn, sửa điều hòa..."
            className="bg-transparent outline-none w-full text-xs text-gray-800 placeholder:text-gray-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* NÚT CHUÔNG THÔNG BÁO */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 bg-white/20 hover:bg-white/30 rounded-full transition active:scale-95"
          >
            <span className="text-base block">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-orange-500">
                {unreadCount}
              </span>
            )}
          </button>

          {/* VỊ TRÍ CƯ DÂN */}
          <span className="bg-orange-600 border border-orange-400/40 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-xs">
            👤 S2.06 VIP
          </span>
        </div>
      </header>

      {/* CỬA SỔ TRƯỢT THÔNG BÁO */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => {
              setIsOpen(false);
              setSelectedNotif(null);
            }}
          ></div>

          <div className="relative w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            <div className="bg-orange-500 text-white p-4 flex items-center justify-between shadow-sm">
              <h3 className="font-bold text-base flex items-center gap-2">
                🔔 Thông báo hệ thống
              </h3>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedNotif(null);
                }}
                className="text-white text-xl font-bold p-1 hover:bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {selectedNotif ? (
                <div className="space-y-4 max-w-lg mx-auto">
                  <button
                    onClick={() => setSelectedNotif(null)}
                    className="text-xs text-orange-600 font-semibold flex items-center gap-1 hover:underline bg-orange-50 px-3 py-1.5 rounded-lg w-fit"
                  >
                    ← Quay lại danh sách
                  </button>
                  <div className="border-b pb-3">
                    <h4 className="font-bold text-gray-800 text-base">{selectedNotif.title}</h4>
                    <span className="text-xs text-gray-400 mt-1 block">{selectedNotif.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {selectedNotif.content}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-w-lg mx-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleOpenNotif(item)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition ${
                        item.read
                          ? 'bg-white border-gray-100 opacity-75'
                          : 'bg-orange-50/60 border-orange-200 shadow-sm'
                      } hover:border-orange-400`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h5 className="font-semibold text-sm text-gray-800">
                          {item.title}
                        </h5>
                        {!item.read && (
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
                        {item.content}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-2 block">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}