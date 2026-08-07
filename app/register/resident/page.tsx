"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterResidentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "", password: "", fullName: "", zone: "S2", building: "S2.01", apartmentNumber: "",
  });
  
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; message: string; type: 'success' | 'error' }>({
    show: false, title: "", message: "", type: "success"
  });

  // Dữ liệu phân khu và tòa
  const zonesData: any = {
    "S2": ["S2.01", "S2.02", "S2.03", "S2.05", "S2.06", "S2.07", "S2.08", "S2.09", "S2.10", "S2.11", "S2.12", "S2.15", "S2.16", "S2.17", "S2.18", "S2.19"],
    "S1": ["S1.01", "S1.02", "S1.03", "S1.05", "S1.06", "S1.07", "S1.08", "S1.09", "S1.10", "S1.11", "S1.12"],
    "Zenpark": ["R1", "R2", "R3", "R4"],
    "Thấp tầng": ["Biệt thự", "Shophouse"]
  };

  const handleZoneChange = (zone: string) => {
    setFormData({...formData, zone, building: zonesData[zone][0]});
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width; let height = img.height;
          const MAX_WIDTH = 1000;
          if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(new File([blob!], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const uploadToR2 = async (file: File) => {
    const compressed = await compressImage(file);
    const formData = new FormData();
    formData.append('file', compressed);
    const res = await fetch('/api/upload-r2', { method: 'POST', body: formData });
    const data = await res.json();
    return data.url;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: auth, error: authError } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
      });
      if (authError) throw authError;

      let selfieUrl = selfieFile ? await uploadToR2(selfieFile) : "";
      let docUrl = docFile ? await uploadToR2(docFile) : "";

      await supabase.from("profiles").insert({
        id: auth.user?.id, email: formData.email, full_name: formData.fullName, role: 'user', status: 'pending'
      });

      await supabase.from("verification_requests").insert({
        user_id: auth.user?.id,
        full_name: formData.fullName,
        building: `${formData.zone} - ${formData.building}`,
        apartment_number: formData.apartmentNumber,
        selfie_url: selfieUrl,
        document_url: docUrl,
        status: 'pending'
      });

      setModalInfo({
        show: true,
        title: "🎉 Gửi Hồ Sơ Thành Công!",
        message: "Quý cư dân đã gửi hồ sơ thành công. Hệ thống đang chờ Admin phê duyệt để kích hoạt tài khoản sử dụng sàn nội khu.",
        type: "success"
      });
    } catch (err: any) {
      setModalInfo({
        show: true,
        title: "❌ Đăng Ký Thất Bại",
        message: err.message || "Đã xảy ra lỗi hệ thống.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-5 bg-slate-50 min-h-screen flex flex-col justify-center">
      <div className="bg-white p-8 rounded-3xl text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-6 border border-slate-100">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">🏠 Đăng Ký Cư Dân</h1>
        <p className="text-xs text-slate-400 mt-1 font-medium">Kết nối dịch vụ & mua sắm nội khu</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4 bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Email đăng nhập</label>
          <input type="email" placeholder="nhapemail@gmail.com" onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-orange-500/20 transition" required />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Mật khẩu</label>
          <input type="password" placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-orange-500/20 transition" required />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Họ và tên</label>
          <input type="text" placeholder="Nguyễn Văn A" onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-orange-500/20 transition" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Phân khu</label>
            <select value={formData.zone} onChange={(e) => handleZoneChange(e.target.value)} className="w-full p-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none cursor-pointer">
              {Object.keys(zonesData).map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Chọn Tòa</label>
            <select value={formData.building} onChange={(e) => setFormData({...formData, building: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-2xl text-xs font-bold outline-none cursor-pointer">
              {zonesData[formData.zone].map((b: string) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Số căn hộ</label>
          <input type="text" placeholder="Ví dụ: 2109" onChange={(e) => setFormData({...formData, apartmentNumber: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-orange-500/20 transition" required />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ảnh Selfie khuôn mặt</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files && setSelfieFile(e.target.files[0])} className="w-full text-[11px] text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition cursor-pointer" />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ảnh Thẻ cư dân / Hợp đồng</label>
          <input type="file" accept="image/*" onChange={(e) => e.target.files && setDocFile(e.target.files[0])} className="w-full text-[11px] text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition cursor-pointer" />
        </div>

        <button disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-slate-900/20 hover:bg-black transition active:scale-[0.98] mt-2">
          {loading ? "Đang xử lý & Nén ảnh..." : "Gửi Hồ Sơ Xác Thực"}
        </button>
      </form>

      {modalInfo.show && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-xs text-center shadow-2xl">
            <div className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${modalInfo.type === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <span className={`text-2xl ${modalInfo.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>✓</span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">{modalInfo.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{modalInfo.message}</p>
            <button onClick={() => { setModalInfo({ ...modalInfo, show: false }); if (modalInfo.type === 'success') router.push("/login"); }} className="w-full bg-orange-500 text-white py-3 rounded-2xl font-bold">Xác nhận</button>
          </div>
        </div>
      )}
    </div>
  );
}