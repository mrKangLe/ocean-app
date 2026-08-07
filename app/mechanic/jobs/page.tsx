"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Block5BottomNav from "@/components/home/Block5BottomNav";

export default function UserMechanicJobsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState<any>(null); // Trạng thái bài đang sửa
  const [reviewingAuction, setReviewingAuction] = useState<any>(null); // Trạng thái bài đang đánh giá

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);

  // Review State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const myUserId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"; // ID Cư Dân

  useEffect(() => {
    let isMounted = true;

    const fetchAuctions = async () => {
      const { data } = await supabase
        .from("auctions")
        .select("*, bids(*)")
        .order("created_at", { ascending: false });

      if (data && isMounted) {
        setAuctions(data);
      }
    };

    fetchAuctions();

    const channel = supabase.channel("realtime_mechanic_jobs");
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "bids" }, () => fetchAuctions())
      .on("postgres_changes", { event: "*", schema: "public", table: "auctions" }, () => fetchAuctions())
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Upload Ảnh R2
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowImageMenu(false);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "auction-jobs");

      const res = await fetch("/api/upload-r2", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.url) setImageUrl(data.url);
      }
    } catch (err) {
      console.error("Lỗi upload R2:", err);
    } finally {
      setUploading(false);
    }
  };

  // Mở Modal Đăng Mới
  const handleOpenCreate = () => {
    setEditingAuction(null);
    setTitle("");
    setDescription("");
    setBudget("");
    setImageUrl("");
    setShowCreateModal(true);
  };

  // Mở Modal Sửa Bài
  const handleOpenEdit = (item: any) => {
    setEditingAuction(item);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setBudget(item.budget ? item.budget.toString() : "");
    setImageUrl(item.image_url || "");
    setShowCreateModal(true);
  };

  // Lưu Bài (Đăng mới hoặc Cập nhật)
  const handleSaveAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingAuction) {
      // Cập nhật bài
      await supabase
        .from("auctions")
        .update({
          title: title.trim(),
          description: description.trim(),
          budget: budget ? parseFloat(budget) : 0,
          image_url: imageUrl,
        })
        .eq("id", editingAuction.id);
    } else {
      // Đăng bài mới
      await supabase.from("auctions").insert([
        {
          user_id: myUserId,
          title: title.trim(),
          description: description.trim(),
          budget: budget ? parseFloat(budget) : 0,
          image_url: imageUrl,
          status: "open",
        },
      ]);
    }

    setShowCreateModal(false);
  };

  // ❌ XÓA BÀI ĐĂNG
  const handleDeleteAuction = async (id: string) => {
    if (confirm("Bố có chắc chắn muốn xóa bài đăng việc này không?")) {
      await supabase.from("auctions").delete().eq("id", id);
    }
  };

  // Chọn Thợ Báo Giá
  const handleAcceptBid = async (auctionId: string, bid: any) => {
    await supabase.from("auctions").update({ status: "accepted" }).eq("id", auctionId);
    await supabase.from("bids").update({ status: "accepted" }).eq("id", bid.id);

    const conversationId = "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a99";
    router.push(`/chat/${conversationId}`);
  };

  // ⭐ GỬI ĐÁNH GIÁ THỢ
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingAuction) return;

    // Đánh dấu công việc hoàn thành
    await supabase
      .from("auctions")
      .update({
        status: "completed",
        rating: rating,
        review_comment: comment,
      })
      .eq("id", reviewingAuction.id);

    setReviewingAuction(null);
    setComment("");
    setRating(5);
    alert("Cảm ơn bố đã đánh giá chất lượng thợ!");
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col justify-between shadow-2xl relative pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-20 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-sm font-bold text-slate-800">Sàn Đấu Giá Tìm Thợ</h1>
          <p className="text-[10px] text-slate-500">Đăng việc - Thợ xung quanh tự báo giá</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition active:scale-95"
        >
          + Đăng việc
        </button>
      </div>

      {/* Danh Sách Bài Đăng */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {auctions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Chưa có công việc nào. Bấm <b>"+ Đăng việc"</b> để tìm thợ!
          </div>
        ) : (
          auctions.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3 relative">
              <div className="flex justify-between items-start">
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.status === "open"
                        ? "bg-orange-100 text-orange-600"
                        : item.status === "accepted"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {item.status === "open"
                      ? "● Đang nhận báo giá"
                      : item.status === "accepted"
                      ? "⚙️ Đang thi công"
                      : "✓ Đã hoàn thành"}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 mt-1">{item.title}</h3>
                </div>

                <div className="flex items-center space-x-2 shrink-0 ml-2">
                  <span className="text-xs font-extrabold text-orange-600">
                    {item.budget ? `${item.budget.toLocaleString()}đ` : "Thỏa thuận"}
                  </span>

                  {/* NÚT SỬA & XÓA BÀI */}
                  {item.status === "open" && (
                    <div className="flex items-center space-x-1 pl-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-slate-400 hover:text-blue-600 text-xs p-1"
                        title="Sửa bài"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteAuction(item.id)}
                        className="text-slate-400 hover:text-red-500 text-xs p-1"
                        title="Xóa bài"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">{item.description}</p>
              )}

              {item.image_url && (
                <img
                  src={item.image_url}
                  alt="Ảnh sự cố"
                  loading="lazy"
                  className="w-full h-44 object-cover rounded-xl border border-slate-100 shadow-2xs cursor-pointer"
                  onClick={() => window.open(item.image_url, "_blank")}
                />
              )}

              {/* TÍNH NĂNG BÁO GIÁ & NÚT HOÀN THÀNH REVIEW */}
              <div className="border-t border-slate-100 pt-3">
                {item.status === "accepted" && (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-blue-700">Thợ đang qua sửa...</span>
                    <button
                      onClick={() => setReviewingAuction(item)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
                    >
                      ✓ Đã xong (Đánh giá)
                    </button>
                  </div>
                )}

                {item.status === "completed" && (
                  <div className="bg-emerald-50 p-3 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-800">Đã hoàn thành xuất sắc</span>
                      <span className="text-xs text-amber-500 font-extrabold">{"⭐".repeat(item.rating || 5)}</span>
                    </div>
                    {item.review_comment && (
                      <p className="text-[11px] text-slate-600 italic">"{item.review_comment}"</p>
                    )}
                  </div>
                )}

                {item.status === "open" && (
                  <>
                    <h4 className="text-[11px] font-bold text-slate-500 mb-2">
                      Danh sách thợ chào giá ({item.bids?.length || 0}):
                    </h4>
                    {item.bids?.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">Đang chờ thợ báo giá...</p>
                    ) : (
                      <div className="space-y-2">
                        {item.bids?.map((bid: any) => (
                          <div key={bid.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl">
                            <div>
                              <p className="text-xs font-bold text-slate-800">{bid.provider_name}</p>
                              <p className="text-[10px] text-slate-500">{bid.note || "Đến ngay sau 15 phút"}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-emerald-600">{bid.price.toLocaleString()}đ</span>
                              <button
                                onClick={() => handleAcceptBid(item.id, bid)}
                                className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-600 transition"
                              >
                                Chọn thợ này
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL ĐĂNG HOẶC SỬA BÀI */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                {editingAuction ? "Sửa bài đăng việc" : "Đăng tìm thợ khẩn cấp"}
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAuction} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Tên việc / Sự cố</label>
                <input
                  type="text"
                  placeholder="VD: Sửa ống nước chảy tràn nhà vệ sinh căn S2.05"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Mô tả sự cố</label>
                <textarea
                  placeholder="Mô tả cụ thể để thợ báo giá chính xác..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-orange-500 h-20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Ngân sách dự kiến (đ)</label>
                <input
                  type="number"
                  placeholder="VD: 150000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Tùy Chọn Upload Ảnh */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Hình ảnh sự cố</label>
                {imageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200">
                    <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowImageMenu(!showImageMenu)}
                    className="w-full bg-slate-100 hover:bg-slate-200 border-dashed border-2 border-slate-300 rounded-xl py-3 text-xs text-slate-600 font-medium transition"
                  >
                    {uploading ? "⏳ Đang tải ảnh lên Cloudflare R2..." : "📷 Chụp ảnh sự cố hoặc Chọn từ máy"}
                  </button>
                )}

                {showImageMenu && !imageUrl && (
                  <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2 shadow-md flex justify-around">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="text-xs font-bold text-slate-700 hover:text-orange-500 p-1"
                    >
                      📸 Chụp ảnh ngay
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-bold text-slate-700 hover:text-orange-500 p-1"
                    >
                      🖼️ Chọn từ máy
                    </button>
                  </div>
                )}

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleUploadImage}
                  disabled={uploading}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {uploading ? "Đang xử lý..." : editingAuction ? "Lưu thay đổi" : "Đăng việc ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP REVIEW & ĐÁNH GIÁ THỢ SAO */}
      {reviewingAuction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 space-y-4 animate-in zoom-in duration-150">
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-800">Đánh giá chất lượng Thợ</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Việc: {reviewingAuction.title}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Chọn số sao */}
              <div className="flex justify-center space-x-2 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="hover:scale-125 transition transform"
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nhận xét chi tiết</label>
                <textarea
                  placeholder="Thợ làm nhiệt tình, nhanh chóng, đúng giờ..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 h-20"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setReviewingAuction(null)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl"
                >
                  Bỏ qua
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Block5BottomNav />
    </div>
  );
}