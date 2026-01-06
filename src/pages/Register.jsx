import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [activeTab, setActiveTab] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const navigate = useNavigate();

  const handleTabChange = (role) => {
    setActiveTab(role);
    setFormData({ ...formData, role: role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', formData);
      alert('Aramıza Hoş Geldin! 🎉 Şimdi giriş yapabilirsin.');
      navigate('/'); 
    } catch (err) {
      alert('Hay aksi! Kayıt sırasında bir hata oldu. ');
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#FFF5F5]">
      {/* SOL TARAF: KAYIT GÖRSELİ */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#F59E0B] via-[#EF4444] to-[#EC4899] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        <div className="relative z-10 text-center text-white">
          <div className="text-8xl mb-6">⭐</div>
          <h1 className="text-6xl font-black tracking-tighter italic mb-4">YENİ BİR <br /> BAŞLANGIÇ!</h1>
          <p className="text-xl font-bold opacity-90">Sadece birkaç saniyede aramıza katıl.</p>
        </div>
      </div>

      {/* SAĞ TARAF: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 border-8 border-orange-50">
          
          <h2 className="text-3xl font-black text-slate-800 tracking-tight text-center mb-6 italic uppercase">KAYIT OL 🖋️</h2>

          <div className="flex bg-slate-100 p-2 rounded-[2rem] mb-6">
            <button onClick={() => handleTabChange('student')} className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black transition-all ${activeTab === 'student' ? 'bg-white shadow-md text-orange-600' : 'text-slate-400'}`}>ÖĞRENCİ</button>
            <button onClick={() => handleTabChange('admin')} className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black transition-all ${activeTab === 'admin' ? 'bg-white shadow-md text-pink-600' : 'text-slate-400'}`}>AKADEMİSYEN</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="İsmin nedir?" className="w-full p-4 bg-slate-50 border-4 border-transparent rounded-[1.5rem] focus:border-orange-200 outline-none font-bold text-center transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            <input type="email" placeholder="E-posta adresin 📧" className="w-full p-4 bg-slate-50 border-4 border-transparent rounded-[1.5rem] focus:border-orange-200 outline-none font-bold text-center transition-all" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            <input type="password" placeholder="Güçlü bir şifre 🔒" className="w-full p-4 bg-slate-50 border-4 border-transparent rounded-[1.5rem] focus:border-orange-200 outline-none font-bold text-center transition-all" onChange={(e) => setFormData({...formData, password: e.target.value})} required />

            <button type="submit" className={`w-full py-5 rounded-[2rem] font-black text-white uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 mt-4 ${activeTab === 'student' ? 'bg-orange-500 hover:bg-slate-900 shadow-orange-100' : 'bg-pink-500 hover:bg-slate-900 shadow-pink-100'}`}>
              HESABIMI OLUŞTUR ✨
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Zaten bizden misin? <Link to="/" className="text-orange-600 underline">Giriş Yap 🏠</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Register;