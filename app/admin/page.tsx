"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast, Toaster } from "sonner";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginTime] = useState(new Date().toLocaleString('vi-VN'));
  const [activeTab, setActiveTab] = useState<"pending" | "residents" | "broadcast">("pending");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [selectedResident, setSelectedResident] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [stats, setStats] = useState({ residents: 0 });
  const [loading, setLoading] = useState(true);

  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [showBanBox, setShowBanBox] = useState(false);
  const [showMsgBox, setShowMsgBox] = useState(false);

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user && session.user.email === "mrlequanghuy@gmail.com") setUser(session.user);
    setLoading(false);
  };

  const fetchData = async () => {
    const { data: reqData } = await supabase.from("verification_requests").select("*, profiles(*)").eq("status", "pending");
    if (reqData) setPendingRequests(reqData);

    const { data: usersData } = await supabase.from("profiles").select("*");
    const { data: verifData } = await supabase.from("verification_requests").select("*");
    
    if (usersData) {
      const mergedUsers = usersData.map(u => {
        const verif = verifData?.find(v => v.user_id === u.id);
        return { 
          ...u, 
          building: verif?.building || "Chưa cập nhật", 
          apartment_number: verif?.apartment_number || "", 
          selfie_url: verif?.selfie_url || "", 
          document_url: verif?.document_url || "",
          created_at: u.created_at || new Date().toISOString(),
          reputation_score: u.reputation_score ?? 100
        };
      });
      setAllUsers(mergedUsers);
      setStats({ residents: usersData.filter(u => u.role === 'user').length });
    }
  };

  useEffect(() => { if (user) fetchData(); }, [user]);

  const handleApprove = async (userId: string, reqId: string) => {
    await supabase.from("profiles").update({ status: "active" }).eq("id", userId);
    await supabase.from("verification_requests").update({ status: "approved" }).eq("id", reqId);
    toast.success("Phê duyệt thành công!"); 
    setSelectedReq(null); 
    fetchData();
  };

  const handleReject = async (reqId: string, userId: string) => {
    if (confirm("Chắc chắn xoá hồ sơ này?")) {
      await supabase.from("verification_requests").delete().eq("id", reqId);
      await supabase.from("profiles").delete().eq("id", userId);
      toast.error("Đã xoá hồ sơ."); 
      setSelectedReq(null); 
      fetchData();
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast.warning("Mật khẩu mới ít nhất 6 ký tự!");
      return;
    }
    const res = await fetch('/api/admin/reset-password', { method: 'POST', body: JSON.stringify({ userId, newPassword }), headers: { 'Content-Type': 'application/json' } });
    if (res.ok) { 
      toast.success("Đổi mật khẩu thành công!"); 
      setNewPassword(""); 
      setShowPasswordBox(false);
    } else {
      toast.error("Lỗi hệ thống khi đổi mật khẩu.");
    }
  };

  if (loading) return <div className="p-10 text-center text-xs">Đang tải...</div>;
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <form onSubmit={(e) => { e.preventDefault(); supabase.auth.signInWithPassword({ email, password }).then(({data}) => data.user?.email === "mrlequanghuy@gmail.com" ? setUser(data.user) : toast.error("Không có quyền Admin!")); }} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold text-center">Admin Đăng Nhập</h2>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 bg-slate-100 rounded-2xl text-xs outline-none" required />
        <input type="password" placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 bg-slate-100 rounded-2xl text-xs outline-none" required />
        <button className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition">Đăng nhập</button>
      </form>
    </div>
  );

  return (
    <div className="p-4 pb-24 max-w-md mx-auto min-h-screen bg-slate-50">
      <Toaster position="top-center" richColors />

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-5 rounded-3xl mb-5 text-white shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black">Chào Admin Huy! 👋</h2>
          <p className="text-[10px] opacity-90 mt-0.5">{loginTime}</p>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); setUser(null); }} className="bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold px-3 py-2 rounded-xl transition">Đăng xuất</button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-200 p-1.5 rounded-2xl">
        <button onClick={() => setActiveTab("pending")} className={`py-2.5 text-[10px] font-bold rounded-xl transition ${activeTab === 'pending' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}>
          CHỜ DUYỆT ({pendingRequests.length})
        </button>
        <button onClick={() => setActiveTab("residents")} className={`py-2.5 text-[10px] font-bold rounded-xl transition ${activeTab === 'residents' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}>
          CƯ DÂN ({stats.residents})
        </button>
        <button onClick={() => setActiveTab("broadcast")} className={`py-2.5 text-[10px] font-bold rounded-xl transition ${activeTab === 'broadcast' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'}`}>
          GỬI THÔNG BÁO
        </button>
      </div>

      {/* TAB 1: PENDING */}
      {activeTab === 'pending' && (
        <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Hồ sơ chờ phê duyệt</h2>
          {pendingRequests.length === 0 ? (
            <p className="text-slate-400 text-xs italic text-center py-8">Không có hồ sơ nào đang chờ.</p>
          ) : (
            pendingRequests.map(req => (
              <div key={req.id} onClick={() => setSelectedReq(req)} className="border-b pb-3 cursor-pointer hover:bg-slate-50 flex justify-between items-center px-2 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-slate-800 text-sm">{req.full_name}</p>
                  <p className="text-[11px] text-slate-500">Tòa {req.building} - Căn {req.apartment_number}</p>
                </div>
                <span className="text-[11px] text-blue-600 font-bold underline">Xem &rarr;</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: RESIDENTS */}
      {activeTab === 'residents' && (
        <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Danh sách cư dân</h2>
          {allUsers.filter(u => u.role === 'user').length === 0 ? (
            <p className="text-slate-400 text-xs italic text-center py-8">Chưa có cư dân nào.</p>
          ) : (
            allUsers.filter(u => u.role === 'user').map(u => (
              <div key={u.id} onClick={() => { setSelectedResident(u); setShowPasswordBox(false); setShowBanBox(false); setShowMsgBox(false); }} className="border-b pb-3 cursor-pointer hover:bg-slate-50 flex justify-between items-center px-2 rounded-xl text-xs">
                <div>
                  <p className="font-bold text-slate-900 text-sm">{u.full_name || "Chưa cập nhật tên"}</p>
                  <p className="text-[10px] text-slate-400">Tòa {u.building} (Căn {u.apartment_number})</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-emerald-600">{u.reputation_score} pts</p>
                  <span className="text-[10px] text-blue-600 font-bold underline">Quản lý</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="bg-white p-5 rounded-3xl border shadow-sm space-y-4">
          <h2 className="font-bold text-xs text-amber-600 uppercase tracking-wider">📢 GỬI THÔNG BÁO HÀNG LOẠT</h2>
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Chọn phân khu / Đối tượng:</label>
            <select id="filterZone" className="w-full p-3.5 bg-slate-100 rounded-2xl text-xs outline-none font-semibold">
              <option value="all">Tất cả cư dân</option>
              <option value="S1">Tòa phân khu S1</option>
              <option value="S2">Tòa phân khu S2</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 mb-1 block">Nội dung thông báo (Sự kiện / Khuyến mãi):</label>
            <textarea id="massMsg" placeholder="Nhập nội dung thông báo gửi đến quả chuông cư dân..." className="w-full p-3.5 bg-slate-100 rounded-2xl text-xs h-32 outline-none resize-none"></textarea>
          </div>
          <button onClick={async () => {
             const zone = (document.getElementById('filterZone') as HTMLSelectElement).value;
             const msg = (document.getElementById('massMsg') as HTMLTextAreaElement).value;
             if (!msg) {
               toast.warning("Vui lòng nhập nội dung thông báo!");
               return;
             }
             const targetUsers = zone === 'all' ? allUsers.filter(u => u.role === 'user') : allUsers.filter(u => u.role === 'user' && u.building?.startsWith(zone));
             await supabase.from("notifications").insert(targetUsers.map(u => ({ user_id: u.id, message: msg, is_read: false })));
             toast.success(`Đã gửi thông báo tới ${targetUsers.length} cư dân!`);
             (document.getElementById('massMsg') as HTMLTextAreaElement).value = "";
          }} className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition">Gửi thông báo ngay</button>
        </div>
      )}

      {/* POPUP QUẢN LÝ CƯ DÂN (ĐÃ FIX CĂN GIỮA, GỌN GÀNG, KHÔNG BỊ LẸM) */}
      {selectedResident && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4 animate-in fade-in zoom-in duration-150">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedResident.selfie_url ? (
                  <img src={selectedResident.selfie_url} className="w-12 h-12 rounded-2xl object-cover border-2 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center text-[10px] font-bold">No Image</div>
                )}
                <div>
                  <h1 className="text-sm font-black text-slate-900">{selectedResident.full_name || "Cư dân"}</h1>
                  <p className="text-[10px] text-orange-600 font-bold">Tòa {selectedResident.building} - Căn {selectedResident.apartment_number}</p>
                </div>
              </div>
              <button onClick={() => setSelectedResident(null)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">✕</button>
            </div>

            {/* ĐIỂM UY TÍN */}
            <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex justify-between items-center shadow-md">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Điểm uy tín</p>
                <p className="text-2xl font-black">{selectedResident.reputation_score}</p>
              </div>
              <div className="text-right text-[10px] opacity-80">
                <p>👍 {selectedResident.good_votes || 0} tốt</p>
                <p>👎 {selectedResident.bad_votes || 0} vi phạm</p>
              </div>
            </div>

            {/* BỘ ẢNH ĐỐI CHIẾU */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] font-bold text-slate-500 mb-1">📸 CHÂN DUNG:</p>
                {selectedResident.selfie_url ? (
                  <img src={selectedResident.selfie_url} className="h-16 w-full object-cover rounded-xl border cursor-pointer hover:opacity-90 transition" onClick={() => window.open(selectedResident.selfie_url, '_blank')} />
                ) : <p className="text-[10px] text-slate-400 italic">Không có</p>}
              </div>
              <div>
                <p className="text-[9px] font-bold text-slate-500 mb-1">📄 GIẤY TỜ:</p>
                {selectedResident.document_url ? (
                  <img src={selectedResident.document_url} className="h-16 w-full object-cover rounded-xl border cursor-pointer hover:opacity-90 transition" onClick={() => window.open(selectedResident.document_url, '_blank')} />
                ) : <p className="text-[10px] text-slate-400 italic">Không có</p>}
              </div>
            </div>

            {/* CÁC NÚT CHỨC NĂNG RÚT GỌN */}
            <div className="space-y-2 pt-1 border-t">
              
              {/* 1. Nút Đổi mật khẩu */}
              {!showPasswordBox ? (
                <button onClick={() => { setShowPasswordBox(true); setShowBanBox(false); setShowMsgBox(false); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-2.5 rounded-xl text-xs font-bold transition flex justify-between px-3 items-center">
                  <span>🔑 Đổi mật khẩu mới</span>
                  <span>▼</span>
                </button>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl space-y-2 border">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-700">Đổi mật khẩu</span><button onClick={() => setShowPasswordBox(false)} className="text-[10px] font-bold text-slate-400">▲ Thu gọn</button></div>
                  <input type="text" placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-2.5 bg-white rounded-xl text-xs outline-none border" />
                  <button onClick={() => handleResetPassword(selectedResident.id)} className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-bold shadow-sm">Xác nhận đổi</button>
                </div>
              )}

              {/* 2. Nút Khoá tài khoản */}
              {!showBanBox ? (
                <button onClick={() => { setShowBanBox(true); setShowPasswordBox(false); setShowMsgBox(false); }} className="w-full bg-red-50 hover:bg-red-100 text-red-700 py-2.5 rounded-xl text-xs font-bold transition flex justify-between px-3 items-center">
                  <span>🚫 Khoá tài khoản (Ban)</span>
                  <span>▼</span>
                </button>
              ) : (
                <div className="bg-red-50/50 p-3 rounded-xl space-y-2 border border-red-200">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-red-600">Khoá tài khoản cư dân</span><button onClick={() => setShowBanBox(false)} className="text-[10px] font-bold text-slate-400">▲ Thu gọn</button></div>
                  <input type="number" id="banDays" placeholder="Nhập số ngày khoá..." className="w-full p-2.5 bg-white rounded-xl text-xs outline-none border text-red-700 font-semibold" />
                  <button onClick={async () => {
                    const days = (document.getElementById('banDays') as HTMLInputElement).value;
                    if (!days) { toast.warning("Vui lòng nhập số ngày!"); return; }
                    const date = new Date(); date.setDate(date.getDate() + parseInt(days));
                    await supabase.from("profiles").update({ is_banned: true, ban_until: date.toISOString() }).eq("id", selectedResident.id);
                    toast.success(`Đã khoá đến ngày ${date.toLocaleDateString('vi-VN')}!`);
                    setSelectedResident(null); fetchData();
                  }} className="w-full bg-red-600 text-white py-2 rounded-xl text-xs font-bold shadow-sm">Xác nhận khoá</button>
                </div>
              )}

              {/* 3. Nút Gửi tin nhắn riêng */}
              {!showMsgBox ? (
                <button onClick={() => { setShowMsgBox(true); setShowPasswordBox(false); setShowBanBox(false); }} className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-2.5 rounded-xl text-xs font-bold transition flex justify-between px-3 items-center">
                  <span>✉️ Gửi tin nhắn riêng (Quả chuông)</span>
                  <span>▼</span>
                </button>
              ) : (
                <div className="bg-blue-50/50 p-3 rounded-xl space-y-2 border border-blue-200">
                  <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-blue-600">Gửi thông báo riêng</span><button onClick={() => setShowMsgBox(false)} className="text-[10px] font-bold text-slate-400">▲ Thu gọn</button></div>
                  <textarea id="privateMsg" placeholder="Nội dung tin nhắn..." className="w-full p-2.5 bg-white rounded-xl text-xs h-14 outline-none border resize-none"></textarea>
                  <button onClick={async () => {
                    const msg = (document.getElementById('privateMsg') as HTMLTextAreaElement).value;
                    if (!msg) { toast.warning("Vui lòng nhập nội dung!"); return; }
                    await supabase.from("notifications").insert({ user_id: selectedResident.id, message: msg, is_read: false });
                    toast.success("Đã gửi tin nhắn riêng!");
                    setShowMsgBox(false);
                  }} className="w-full bg-blue-600 text-white py-2 rounded-xl text-xs font-bold shadow-sm">Gửi ngay</button>
                </div>
              )}

            </div>

            <button onClick={() => setSelectedResident(null)} className="w-full bg-slate-200 hover:bg-slate-300 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition">Đóng</button>
          </div>
        </div>
      )}

      {/* POPUP PHÊ DUYỆT HỒ SƠ */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4">
            <h2 className="font-bold text-xs text-slate-900">Phê duyệt hồ sơ cư dân</h2>
            <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl">
              <p><b>Họ tên:</b> {selectedReq.full_name}</p>
              <p><b>Địa chỉ:</b> Tòa {selectedReq.building} - Căn {selectedReq.apartment_number}</p>
              <p><b>Email:</b> {selectedReq.profiles?.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selectedReq.selfie_url && <img src={selectedReq.selfie_url} className="h-28 w-full object-cover rounded-xl border" />}
              {selectedReq.document_url && <img src={selectedReq.document_url} className="h-28 w-full object-cover rounded-xl border" />}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => handleApprove(selectedReq.user_id, selectedReq.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold shadow-md transition">✓ Phê duyệt</button>
              <button onClick={() => handleReject(selectedReq.id, selectedReq.user_id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-bold shadow-md transition">✕ Từ chối</button>
            </div>
            <button onClick={() => setSelectedReq(null)} className="w-full bg-slate-200 hover:bg-slate-300 py-2.5 rounded-xl text-xs font-bold text-slate-700 transition">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}