import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('student');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/users');
      const foundUser = res.data.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        String(u.password) === String(password) &&
        u.role === activeTab
      );

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('user', JSON.stringify(foundUser));
        navigate('/dashboard');
      } else {
        alert(`Bir şeyler ters gitti! Bilgilerini kontrol eder misin?`);
      }
    } catch (err) {
      alert('Sistem şu an uyuyor gibi, lütfen sonra tekrar dene! ✨');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#F0F4FF]">
      {/* SOL TARAF: */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#6366F1] via-[#A855F7] to-[#EC4899] items-center justify-center p-12 overflow-hidden">
        {/* Dekoratif Balonlar */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-bounce"></div>
        
        <div className="relative z-10 text-center text-white">
          <div className="text-8xl mb-6 animate-bounce">🎓</div>
          <h1 className="text-6xl font-black tracking-tighter leading-none mb-4">
            AKADEMİK <br /> <span className="text-yellow-300">DÜNYA</span>
          </h1>
          <p className="text-xl font-medium opacity-90"> ✨</p>
        </div>
      </div>

      {/* SAĞ TARAF: BUBBLE FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-10 border-8 border-[#F8FAFC]">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">TEKRAR MERHABA! 👋</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Giriş yap ve maceraya devam et</p>
          </div>

          {/* Şirin Sekmeler */}
          <div className="flex bg-slate-100 p-2 rounded-[2rem] mb-8">
            <button onClick={() => setActiveTab('student')} className={`flex-1 py-4 rounded-[1.8rem] text-xs font-black transition-all ${activeTab === 'student' ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg' : 'text-slate-400'}`}>ÖĞRENCİ</button>
            <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 rounded-[1.8rem] text-xs font-black transition-all ${activeTab === 'admin' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-slate-400'}`}>AKADEMİSYEN</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="E-posta adresin 📧" className="w-full p-5 bg-slate-50 border-4 border-transparent rounded-[2rem] focus:border-indigo-200 outline-none font-bold text-slate-700 transition-all text-center" onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Şifren 🔑" className="w-full p-5 bg-slate-50 border-4 border-transparent rounded-[2rem] focus:border-indigo-200 outline-none font-bold text-slate-700 transition-all text-center" onChange={(e) => setPassword(e.target.value)} required />
            
            <button type="submit" disabled={loading} className={`w-full py-5 rounded-[2rem] font-black text-white uppercase tracking-widest transition-all shadow-xl active:scale-95 ${activeTab === 'student' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}>
              {loading ? 'YÜKLENİYOR... ✨' : 'Sisteme gir🚀'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-black text-slate-400 uppercase tracking-widest">
            Henüz katılmadın mı? <Link to="/register" className="text-indigo-600 underline">Kayıt Ol🧾</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login;