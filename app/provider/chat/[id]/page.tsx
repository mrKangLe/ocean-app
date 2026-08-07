"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Block5BottomNav from "@/components/home/Block5BottomNav";

export default function UserChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = (params?.id as string) || "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99";

  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // ID Cư Dân

  const commonEmojis = ["😀", "😁", "😂", "🥰", "👍", "🙏", "🔥", "🎉"];
  const reactionList = ["👍", "❤️", "😂", "😮", "😡"];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data && isMounted) {
        setMessages(data);
        setTimeout(scrollToBottom, 50);

        await supabase
          .from("messages")
          .update({ is_read: true })
          .eq("conversation_id", conversationId)
          .neq("sender_id", myUserId);
      }
    };

    fetchMessages();

    const channel = supabase.channel(`chat_user_room_${conversationId}`);
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          if (!isMounted) return;
          if (payload.eventType === "INSERT") {
            setMessages((prev) => {
              if (prev.some((msg) => msg.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });

            if (payload.new.sender_id !== myUserId) {
              await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", payload.new.id);
            }
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
            );
          }
          setTimeout(scrollToBottom, 50);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, myUserId, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const content = textInput.trim();
    setTextInput("");
    setShowEmojiPicker(false);
    setShowImageMenu(false);

    await supabase.from("messages").insert([
      {
        conversation_id: conversationId,
        sender_id: myUserId,
        content: content,
      },
    ]);
  };

  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowImageMenu(false);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "chat-images");

      const res = await fetch("/api/upload-r2", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          await supabase.from("messages").insert([
            {
              conversation_id: conversationId,
              sender_id: myUserId,
              content: data.url,
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Lỗi gửi ảnh:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleReaction = async (messageId: string, currentReaction: string | null, emoji: string) => {
    const newReaction = currentReaction === emoji ? null : emoji;
    setActiveReactionMenu(null);
    await supabase
      .from("messages")
      .update({ reaction: newReaction })
      .eq("id", messageId);
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 h-screen flex flex-col justify-between shadow-2xl relative overflow-hidden">
      {/* HEADER TREO CỐ ĐỊNH TẠI ĐỈNH */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center space-x-3 z-20 shadow-xs shrink-0">
        <button
          onClick={() => router.push("/chat")}
          className="text-slate-500 hover:text-slate-800 font-bold text-base p-1"
          title="Về danh sách tin nhắn"
        >
          ✕
        </button>
        <div>
          <h2 className="text-xs font-bold text-slate-800">
            {conversationId.includes("88") ? "Quán Cà Phê Muối S2.05" : "Thợ Tuấn (Sửa Điện Nước)"}
          </h2>
          <p className="text-[10px] text-emerald-500 font-medium">● Đang hoạt động</p>
        </div>
      </div>

      {/* KHUNG TIN NHẮN */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-36">
        {messages.map((msg) => {
          const isMe = msg.sender_id === myUserId;
          let rawContent = msg.content || "";
          let isImage = msg.type === "image";

          if (rawContent.startsWith("[IMAGE]:")) {
            isImage = true;
            rawContent = rawContent.replace("[IMAGE]:", "");
          } else if (rawContent.startsWith("http://") || rawContent.startsWith("https://")) {
            isImage = true;
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative`}>
              <span className="text-[10px] text-slate-400 mb-1 px-1">
                {isMe ? "Bạn (Cư Dân)" : "Đối tác"}
              </span>

              <div className="relative max-w-[80%]">
                <div
                  onClick={() => setActiveReactionMenu(activeReactionMenu === msg.id ? null : msg.id)}
                  className={`rounded-2xl p-3 text-xs cursor-pointer select-none ${
                    isMe
                      ? "bg-orange-500 text-white rounded-br-none shadow-xs"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs"
                  }`}
                >
                  {isImage ? (
                    <img
                      src={rawContent}
                      alt="Ảnh chat"
                      loading="lazy"
                      className="rounded-xl max-h-60 object-cover shadow-xs bg-slate-200 min-h-[100px]"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(rawContent, "_blank");
                      }}
                    />
                  ) : (
                    <p className="leading-relaxed whitespace-pre-wrap">{rawContent}</p>
                  )}
                </div>

                {activeReactionMenu === msg.id && (
                  <div className={`absolute -top-10 ${isMe ? "right-0" : "left-0"} bg-white border border-slate-200 rounded-full px-2 py-1 shadow-lg flex space-x-1.5 z-30 animate-in fade-in zoom-in duration-100`}>
                    {reactionList.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleReaction(msg.id, msg.reaction, emoji)}
                        className="text-base hover:scale-125 transition transform"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {msg.reaction && (
                  <div
                    onClick={() => handleReaction(msg.id, msg.reaction, msg.reaction)}
                    className={`absolute -bottom-2 ${isMe ? "-left-2" : "-right-2"} bg-white border border-slate-200 rounded-full px-1 py-0.5 text-[11px] shadow-sm cursor-pointer hover:scale-110 transition z-10`}
                  >
                    {msg.reaction}
                  </div>
                )}
              </div>

              <span className="text-[9px] text-slate-400 mt-1 px-1">
                {msg.created_at
                  ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : ""}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* POPUP CHỌN CHỤP ẢNH / THƯ VIỆN */}
      {showImageMenu && (
        <div className="fixed bottom-[105px] left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 flex flex-col space-y-1 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 rounded-xl transition font-medium"
          >
            <span>📸</span>
            <span>Chụp ảnh trực tiếp</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 rounded-xl transition font-medium"
          >
            <span>🖼️</span>
            <span>Chọn từ thư viện / máy</span>
          </button>
        </div>
      )}

      {/* POPUP EMOJI */}
      {showEmojiPicker && (
        <div className="fixed bottom-[105px] max-w-md w-full bg-white border-t border-slate-200 p-2 flex space-x-2 overflow-x-auto z-30 shadow-lg">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => setTextInput((prev) => prev + emoji)}
              className="text-lg p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* KHUNG NHẬP TIN NHẮN - CÂN ĐỐI, GỌN GÀNG, SANG TRỌNG */}
      <form
        onSubmit={handleSendMessage}
        className="fixed bottom-[53px] max-w-md w-full bg-white px-3 py-2.5 border-t border-slate-200 flex items-center space-x-2 z-20 shadow-md"
      >
        {/* CỤM ICON BÊN TRÁI ĐƯỢC GOM GỌN */}
        <div className="flex items-center space-x-0.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowImageMenu(!showImageMenu);
              setShowEmojiPicker(false);
            }}
            className="p-1.5 text-slate-500 hover:text-orange-500 hover:bg-slate-100 rounded-full transition text-base"
            title="Đính kèm ảnh"
          >
            {uploading ? <span className="text-xs animate-spin">⏳</span> : <span>📷</span>}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowImageMenu(false);
            }}
            className="p-1.5 text-slate-500 hover:text-orange-500 hover:bg-slate-100 rounded-full transition text-base"
            title="Chọn biểu tượng cảm xúc"
          >
            😀
          </button>
        </div>

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleSendImage}
          disabled={uploading}
          className="hidden"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleSendImage}
          disabled={uploading}
          className="hidden"
        />

        {/* Ô NHẬP VĂN BẢN CHIẾM TRỌN KHÔNG GIAN CÂN ĐỐI */}
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Cư dân nhập tin nhắn..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 placeholder:text-slate-400"
        />

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition shrink-0 active:scale-95"
        >
          Gửi
        </button>
      </form>

      <Block5BottomNav />
    </div>
  );
}