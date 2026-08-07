"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Block5BottomNav from "@/components/home/Block5BottomNav";

export default function ProviderJobsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidNote, setBidNote] = useState("");

  const myProviderId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"; // ID Thợ Tuấn

  useEffect(() => {
    let isMounted = true;

    const fetchJobs = async () => {
      const { data } = await supabase
        .from("auctions")
        .select("*, bids(*)")
        .order("created_at", { ascending: false });

      if (data && isMounted) {
        setAuctions(data);
      }
    };

    fetchJobs();

    const channel = supabase.channel("realtime_provider_jobs");
    channel
      .on("postgres_changes", { event: "*", schema: "public", table: "auctions" }, () => fetchJobs())
      .on("postgres_changes", { event: "*", schema: "public", table: "bids" }, () => fetchJobs())
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuction || !bidPrice) return;

    await supabase.from("bids").insert([
      {
        auction_id: selectedAuction.id,
        provider_id: myProviderId,
        provider_name: "Thợ Tuấn (Sửa Điện Nước)",
        price: parseFloat(bidPrice),
        note: bidNote || "Đến ngay sau 15 phút",
        status: "pending",
      },
    ]);

    setSelectedAuction(null);
    setBidPrice("");
    setBidNote("");
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col justify-between shadow-2xl relative pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <h1 className="text-sm font-bold text-slate-800">Sàn Việc Cư Dân (Thợ Tuấn)</h1>
        <p className="text-[10px] text-slate-500">Xem yêu cầu - Chào giá ngay để nhận đơn</p>
      </div>

      {/* List Công Việc Cư Dân Đang Tìm Thợ */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        {auctions.map((item) => {
          const myBid = item.bids?.find((b: any) => b.provider_id === myProviderId);

          return (
            <div key={item.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'open' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    {item.status === "open" ? "● Đang nhận thầu" : "✓ Đã chốt thợ"}
                  </span>
                  <h3 className="text-xs font-bold text-slate-800 mt-1">{item.title}</h3>
                </div>
                <span className="text-xs font-extrabold text-blue-600 shrink-0 ml-2">
                  Ngân sách: {item.budget ? `${item.budget.toLocaleString()}đ` : "Thỏa thuận"}
                </span>
              </div>

              {item.description && <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">{item.description}</p>}

              {item.image_url && (
                <img src={item.image_url} alt="Sự cố" className="w-full h-40 object-cover rounded-xl border border-slate-100" />
              )}

              {/* Nút Chào Giá Báo Thầu */}
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                {myBid ? (
                  <div className="text-xs text-emerald-600 font-bold">
                    ✓ Bạn đã chào giá: {myBid.price.toLocaleString()}đ
                  </div>
                ) : item.status === "open" ? (
                  <button
                    onClick={() => {
                      setSelectedAuction(item);
                      setBidPrice(item.budget || "");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl shadow-xs transition"
                  >
                    ⚡ Báo giá nhận việc ngay
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">Đơn việc này đã chọn thợ khác</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup Báo Giá */}
      {selectedAuction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-bold text-slate-800">Báo giá nhận việc</h3>
              <button onClick={() => setSelectedAuction(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleSendBid} className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-800 mb-1">{selectedAuction.title}</p>
                <p className="text-[10px] text-slate-500">Ngân sách cư dân: {selectedAuction.budget ? `${selectedAuction.budget.toLocaleString()}đ` : "Tự do"}</p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Giá thợ nhận sửa (đ)</label>
                <input
                  type="number"
                  placeholder="VD: 120000"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-600 font-bold text-blue-600"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Ghi chú cho cư dân</label>
                <input
                  type="text"
                  placeholder="VD: Có mặt sau 10 phút, bảo hành 6 tháng"
                  value={bidNote}
                  onChange={(e) => setBidNote(e.target.value)}
                  className="w-full bg-slate-100 border-none rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedAuction(null)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold text-xs py-2.5 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
                >
                  Gửi báo giá
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