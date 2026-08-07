"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function RegisterProviderPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    skill: "Điện nước",
    documentUrl: "", // Link ảnh CCCD
    selfieUrl: "",   // Link ảnh Avatar khuôn mặt
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Tạo tài khoản Auth
    const { data: auth, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });
    if (error) return alert("Lỗi đăng ký: " + error.message);

    // 2. Lưu thông tin profiles với role là 'provider' (thợ)
    await supabase.from("profiles").insert({
      id: auth.user?.id,
      email: formData.email,
      full_name: formData.fullName,
      role: 'provider',
      status: 'pending'
    });

    // 3. Đẩy vào bảng chờ duyệt của Admin (kèm CCCD & Selfie để lưu trữ pháp lý)
    await supabase.from("verification_requests").insert({
      user_id: auth.user?.id,
      full_name: `${formData.fullName} (Thợ: ${formData.skill})`,
      building: "Nội khu",
      selfie_url: formData.selfieUrl,
      document_url: formData.documentUrl, // Ảnh CCCD mặt trước/sau
      status: 'pending'
    });

    alert("Đăng ký thợ thành công! Hồ sơ định danh CCCD đã gửi cho Bố (Admin) xét duyệt.");
    router.push("/login");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-50 min-h-screen">
      <h1 className="text-xl font-bold mb-2 text-slate-800">🔧 Đăng Ký Tài Khoản Thợ Kỹ Thuật</h1>
      <p className="text-xs text-slate-500 mb-6">Bắt buộc cung cấp CCCD và ảnh khuôn mặt để đối chiếu pháp lý.</p>
      
      <form onSubmit={handleRegister} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Email</label>
          <input type="email" placeholder="tho.kythuat@gmail.com" onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-slate-100 rounded-xl text-xs outline-none" required />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Mật khẩu</label>
          <input type="password" placeholder="••••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full p-3 bg-slate-100 rounded-xl text-xs outline-none" required />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Họ và tên thợ</label>
          <input type="text" placeholder="Trần Văn Thợ" onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full p-3 bg-slate-100 rounded-xl text-xs outline-none" required />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Lĩnh vực chuyên môn</label>
          <select onChange={(e) => setFormData({...formData, skill: e.target.value})} className="w-full p-3 bg-slate-100 rounded-xl text-xs outline-none">
            <option value="Điện nước">Sửa chữa Điện nước</option>
            <option value="Điều hòa">Lắp đặt & Sửa Điều hòa</option>
            <option value="Khóa cửa / SmartHome">Khóa cửa / Nhà thông minh</option>
            <option value="Thông cống / Vệ sinh">Thông tắc / Vệ sinh nội khu</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Link Ảnh Selfie (Làm Avatar nhận diện)</label>
          <input type="text" placeholder="Dán link ảnh khuôn mặt rõ nét" onChange={(e) => setFormData({...formData, selfieUrl: e.target.value})} className="w-full p-3 bg-slate-100 rounded-xl text-xs outline-none" required />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1">Link Ảnh CCCD (Mặt trước lưu hồ sơ pháp lý)</label>
          <input type="text" placeholder="Dán link ảnh CCCD" onChange={(e) => setFormData({...formData, documentUrl: e.target.value})} className="w-full p-3 bg-slate-100 rounded-xl text-xs outline-none" required />
        </div>

        <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs shadow-md transition">
          Gửi Hồ Sơ Định Danh Thợ
        </button>
      </form>
    </div>
  );
}