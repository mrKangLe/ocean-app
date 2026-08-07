"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Block5BottomNav from "@/components/home/Block5BottomNav";

export default function ProviderChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = (params?.id as string) || "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99";

  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false); // Menu 📸/🖼️
  const [activeReactionMenu, setActiveReactionMenu] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"; // ID Thợ Tuấn

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

    const channel = supabase.channel(`chat_provider_room_${conversationId}`);
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
      {/* HEADER CỐ ĐỊNH TẠI ĐỈNH */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center space-x-3 z-20 shadow-xs shrink-0">
        <button
          onClick={() => router.push("/provider/chat")}
          className="text-slate-500 hover:text-slate-800 font-bold text-base p-1 transition"
          title="Về danh sách khách hàng"
        >
          ✕
        </button>
        <div>
          <h2 className="text-xs font-bold text-slate-800">Khách Cư Dân (Căn S2.05)</h2>
          <p className="text-[10px] text-blue-500 font-medium">● Khách hàng trực tuyến</p>
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
                {isMe ? "Bạn (Thợ Tuấn)" : "Khách Cư Dân"}
              </span>

              <div className="relative max-w-[80%]">
                <div
                  onClick={() => setActiveReactionMenu(activeReactionMenu === msg.id ? null : msg.id)}
                  className={`rounded-2xl p-3 text-xs cursor-pointer select-none ${
                    isMe
                      ? "bg-blue-600 text-white rounded-br-none shadow-xs"
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

      {/* POPUP CHỌN ẢNH */}
      {showImageMenu && (
        <div className="fixed bottom-[105px] left-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 flex flex-col space-y-1 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 rounded-xl transition font-medium"
          >
            <span>📸</span>
            <span>Chụp ảnh trực tiếp</span>
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 rounded-xl transition font-medium"
          >
            <span>🖼️</span>
            <span>Chọn từ thư viện</span>
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

      {/* KHUNG NHẬP */}
      <form
        onSubmit={handleSendMessage}
        className="fixed bottom-[53px] max-w-md w-full bg-white p-2.5 border-t border-slate-200 flex items-center space-x-2 z-20 shadow-md"
      >
        <button
          type="button"
          onClick={() => {
            setShowImageMenu(!showImageMenu);
            setShowEmojiPicker(false);
          }}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition text-lg"
        >
          {uploading ? <span className="text-xs animate-spin">⏳</span> : <span>📷</span>}
        </button>

        {/* INPUT CAMERA */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleSendImage}
          disabled={uploading}
          className="hidden"
        />
        {/* INPUT THƯ VIỆN */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleSendImage}
          disabled={uploading}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowImageMenu(false);
          }}
          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition text-lg"
        >
          😀
        </button>

        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Thợ Tuấn nhập tin nhắn..."
          className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition"
        >
          Trả lời
        </button>
      </form>

      <Block5BottomNav />
    </div>
  );
}