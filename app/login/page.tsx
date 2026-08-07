'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Xử lý đăng nhập 1 cổng duy nhất
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpSent) {
      if (!phone) return alert('Bố vui lòng nhập Số điện thoại!');
      setIsOtpSent(true);
      alert(`[MOCK OTP] Mã xác thực gửi tới ${phone} là: 123456`);
    } else {
      if (otp === '123456' || otp.length === 6) {
        alert('🎉 Đăng nhập thành công! Hệ thống tự động nhận diện vai trò.');
        router.push('/');
      } else {
        alert('Mã OTP không đúng! Bố nhập thử: 123456 nhé.');
      }
    }
  };

  const handleGmailLogin = () => {
    alert('🎉 Đăng nhập Gmail thành công!');
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-slate-100 p-6 space-y-6 text-center">
        
        {/* LOGO TỐI GIẢN */}
        <div>
          <Link href="/" className="inline-block text-xs font-bold text-slate-400 hover:text-slate-600 mb-4">
            ⬅️ Quay lại trang chủ
          </Link>
          <h1 className="text-2xl font-black italic tracking-tight text-orange-600">ocean.app 🌊</h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">Một tài khoản cho mọi dịch vụ nội khu</p>
        </div>

        {/* NÚT GMAIL 1-TOUCH */}
        <button 
          onClick={handleGmailLogin}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2.5 shadow-md transition active:scale-95"
        >
          <span className="text-base">📧</span>
          <span>Tiếp tục với Gmail</span>
        </button>

        {/* DÒNG PHÂN CÁCH */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-100"></div>
          <span className="text-[10px] text-slate-300 font-bold uppercase">HOẶC</span>
          <div className="flex-1 h-px bg-slate-100"></div>
        </div>

        {/* FORM SĐT VÀ OTP TỐI GIẢN */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="text-left">
            <input 
              type="text" 
              placeholder="Nhập số điện thoại..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isOtpSent}
              className="w-full bg-slate-50 border border-slate-200 text-xs p-3.5 rounded-2xl outline-none focus:border-orange-500 font-medium transition text-center"
            />
          </div>

          {isOtpSent && (
            <div className="animate-in fade-in duration-150">
              <input 
                type="text" 
                placeholder="Nhập mã OTP (123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs p-3.5 rounded-2xl outline-none focus:border-orange-500 tracking-widest text-center font-bold text-slate-800"
              />
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition active:scale-95"
          >
            {isOtpSent ? "Xác Nhận & Tiếp Tục" : "Gửi Mã OTP"}
          </button>
        </form>

        <p className="text-[10px] text-slate-300 leading-relaxed">
          Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ & Chính sách bảo mật của Ocean.app
        </p>

      </div>
    </main>
  );
}