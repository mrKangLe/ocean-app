"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Block5BottomNav from "@/components/home/Block5BottomNav";

export default function UserChatListPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const myUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // ID Cư Dân

  useEffect(() => {
    let isMounted = true;

    const fetchConversationsList = async () => {
      // 1. Lấy danh sách cuộc hội thoại từ Supabase
      const { data: convs } = await supabase
        .from("conversations")
        .select("*");

      // Nếu DB chưa có bảng conversations, tự lấy dữ liệu mẫu hiển thị tên
      const list = convs && convs.length > 0 ? convs : [
        { id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99", title: "Thợ Tuấn (Sửa Điện Nước)", avatar: "🔧" },
        { id: "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a88", title: "Quán Cà Phê Muối S2.05", avatar: "☕" },
      ];

      // 2. Lấy tin nhắn cuối + đếm tin chưa đọc
      const formatted = await Promise.all(
        list.map(async (conv) => {
          const { data: lastMsg } = await supabase
            .from("messages")
            .select("content, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .or("is_read.is.null,is_read.eq.false")
            .neq("sender_id", myUserId);

          return {
            ...conv,
            title: conv.title || "Thợ Tuấn (Sửa Điện Nước)",
            lastMessage: lastMsg?.content || "Chưa có tin nhắn mới...",
            time: lastMsg?.created_at
              ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "",
            unread: unreadCount || 0,
          };
        })
      );

      if (isMounted) {
        setConversations(formatted);
        setLoading(false);
      }
    };

    fetchConversationsList();

    const channel = supabase.channel(`user_chat_list_realtime_${Math.random()}`);
    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchConversationsList();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [myUserId]);

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col justify-between shadow-2xl relative">
      <div className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <h1 className="text-sm font-bold text-slate-800">Tin nhắn Cư Dân</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-20">
        {loading ? (
          <div className="text-center py-8 text-xs text-slate-400">Đang tải danh sách...</div>
        ) : (
          conversations.map((item) => (
            <Link
              key={item.id}
              href={`/chat/${item.id}`}
              className="flex items-center space-x-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:bg-slate-50 transition active:scale-[0.99]"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-lg shrink-0">
                {item.avatar || "💬"}
              </div>

              <div className="flex-1 min-w-0">
                {/* HÀNG 1: TÊN NICK / ĐỐI TÁC + THỜI GIAN */}
                <div className="flex justify-between items-baseline mb-0.5">
                  <h2 className="text-xs font-bold text-slate-900 truncate">
                    {item.title}
                  </h2>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">{item.time}</span>
                </div>

                {/* HÀNG 2: NỘI DUNG TIN NHẮN CUỐI */}
                <p className={`text-xs truncate ${item.unread > 0 ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                  {item.lastMessage}
                </p>
              </div>

              {/* SỐ TIN NHẮN CHƯA ĐỌC */}
              {item.unread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs shrink-0 animate-pulse ml-1">
                  {item.unread > 99 ? "99+" : item.unread}
                </span>
              )}
            </Link>
          ))
        )}
      </div>

      <Block5BottomNav />
    </div>
  );
}