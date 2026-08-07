"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Block5BottomNav() {
  const pathname = usePathname();
  const [totalUnread, setTotalUnread] = useState<number>(0);

  const isProvider = pathname.includes("/provider");
  const myUserId = isProvider
    ? "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22" // ID Thợ Tuấn
    : "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // ID Cư Dân

  const isInChatDetailPage = pathname.match(/\/chat\/[^\/]+$/);

  useEffect(() => {
    let isMounted = true;

    const fetchTotalUnread = async () => {
      // Đếm TỔNG tất cả tin nhắn chưa đọc từ MỌI NICK gửi cho mình
      const { count, error } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .or("is_read.is.null,is_read.eq.false")
        .neq("sender_id", myUserId);

      if (!error && count !== null && isMounted) {
        setTotalUnread(count);
      }
    };

    fetchTotalUnread();

    const channelName = `nav_total_unread_${myUserId}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        () => {
          fetchTotalUnread();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [pathname, myUserId]);

  const navItems = [
    { label: "Trang chủ", href: isProvider ? "/provider" : "/", icon: "🏠" },
    {
      label: "Tin nhắn",
      href: isProvider ? "/provider/chat" : "/chat",
      icon: "💬",
      badge: totalUnread,
    },
    { label: "Voucher", href: "/voucher", icon: "🎁" },
    { label: "Tôi", href: "/profile", icon: "👤" },
  ];

  return (
    <div className="fixed bottom-0 max-w-md w-full bg-white border-t border-slate-200 px-6 py-1.5 flex justify-between items-center z-30 shadow-lg">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.label === "Tin nhắn" && pathname.includes("/chat"));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center relative py-1 transition ${
              isActive ? "text-orange-500 font-bold" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="relative text-lg">
              {item.icon}

              {/* TỔNG BÁO SỐ TRÊN ICON CHAT ĐÁY */}
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1 -right-2.5 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border-2 border-white animate-pulse shadow-sm">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}