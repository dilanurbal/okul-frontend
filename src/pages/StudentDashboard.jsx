import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from "../context/AuthContext";



const StudentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]); 
  const [departments, setDepartments] = useState([]); 
  const [myEnrollments, setMyEnrollments] = useState([]); 
  const [selectedDept, setSelectedDept] = useState('All'); 
  const [actionLoading, setActionLoading] = useState(null); 

  const MAX_CREDIT = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptRes, courseRes, enrollRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses'),
        api.get('/enrollments')
      ]);

      setDepartments(deptRes.data);
      setCourses(courseRes.data);

      const currentUserId = String(user.id);
      const studentEnrollments = enrollRes.data.filter(e => {
        const dbId = String(e.studentId || e.userId || e.student?.id || "");
        return dbId === currentUserId;
      });

      setMyEnrollments(studentEnrollments);
    } catch (err) {
      console.error("Yükleme hatası:", err);
    }
  };

  const currentTotalCredit = myEnrollments.reduce((sum, en) => sum + (en.course?.credit || 0), 0);

  const handleEnroll = async (course) => {
    if (currentTotalCredit + course.credit > MAX_CREDIT) {
      alert("Kredi sınırı aşıldı!");
      return;
    }
    setActionLoading(course.id);
    try {
      await api.post('/enrollments', { userId: user.id, courseId: course.id });
      await loadData();
    } catch (err) {
      alert("Kayıt sırasında bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnenroll = async (enrollId, courseId) => {
    if (!window.confirm("Bu ders kaydını silmek istediğine emin misin?")) return;
    
    setActionLoading(courseId);
    try {
      await api.delete(`/enrollments/${enrollId}`);
      await loadData();
    } catch (err) {
      alert("Silme işlemi başarısız.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCourses = courses.filter(course => {
  const matchesDept =
    selectedDept === 'All' ||
    String(course.department?.id) === String(selectedDept);

  const search = searchTerm.toLowerCase();
  const matchesSearch =
    course.name?.toLowerCase().includes(search) ||
    course.teacherName?.toLowerCase().includes(search);

  return matchesDept && matchesSearch;
});


  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <nav className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-xl border-b-8 border-indigo-600 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl italic shadow-lg">🎓</div>
          <div>
            <h1 className="font-black text-xl uppercase italic tracking-tighter">{user.name}</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Öğrenci Paneli</p>
          </div>
        </div>
        <div className="flex-1 max-w-md w-full px-6 text-center">
            <p className="text-[11px] font-black uppercase italic text-slate-400 mb-1">Kredi: {currentTotalCredit} / {MAX_CREDIT}</p>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(currentTotalCredit/MAX_CREDIT)*100}%` }}></div>
            </div>
        </div>
        <button onClick={logout} className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase italic hover:bg-slate-900 transition-all">Çıkış</button>
      </nav>

      <div className="max-w-7xl mx-auto mb-6">
  <input
    type="text"
    placeholder="🔍 Ders veya öğretmen ara..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full p-4 rounded-2xl border border-slate-200 shadow-sm font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
</div>


      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL KOLON: ÖZET VE BÖLÜMLER */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl">
            <h2 className="font-black text-xs uppercase italic text-emerald-400 mb-4 tracking-widest">Seçtiğin Dersler</h2>
            <div className="space-y-2">
              {myEnrollments.map(en => (
                <div key={en.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black italic truncate">{en.course?.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold italic">
                      {en.course?.teacherName || "Öğretmen Atanmadı"}
                    </span>
                  </div>
                  <button onClick={() => handleUnenroll(en.id, en.courseId)} className="text-rose-500 hover:text-white font-black text-lg p-1">✕</button>
                </div>
              ))}
              {myEnrollments.length === 0 && <p className="text-[10px] text-slate-500 italic text-center">Henüz ders seçilmedi.</p>}
            </div>
          </section>

          <section className="bg-white p-6 rounded-[2rem] shadow-md border border-slate-100">
            <h2 className="font-black text-xs uppercase italic text-slate-400 mb-4 tracking-widest ml-2">Bölümler</h2>
            <div className="flex flex-col gap-2">
              <button onClick={() => setSelectedDept('All')} className={`text-left p-4 rounded-2xl font-black text-xs uppercase italic transition-all ${selectedDept === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>Tüm Dersler</button>
              {departments.map(dept => (
                <button key={dept.id} onClick={() => setSelectedDept(dept.id)} className={`text-left p-4 rounded-2xl font-black text-xs uppercase italic transition-all ${selectedDept === dept.id ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{dept.name}</button>
              ))}
            </div>
          </section>
        </div>

        {/* SAĞ KOLON: DERS KARTLARI */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCourses.map(course => {
              const enrollment = myEnrollments.find(
  e => String(e.course?.id) === String(course.id)
);

              const isEnrolled = !!enrollment;
              
              return (
                <div key={course.id} className={`relative bg-white p-8 rounded-[3rem] shadow-xl border-4 transition-all duration-300 ${isEnrolled ? 'border-emerald-500 scale-[0.98]' : 'border-transparent hover:border-indigo-600'}`}>
                  
                  {/* İPTAL BUTONU (ÇARPI) */}
                  {isEnrolled && (
                    <button 
                      onClick={() => handleUnenroll(enrollment.id, course.id)}
                      className="absolute -top-3 -right-3 bg-rose-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black shadow-lg hover:scale-110 active:scale-90 transition-all z-20"
                    >
                      ✕
                    </button>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase italic tracking-tighter">{course.department?.name}</span>
                    <span className="font-black text-slate-300 italic">{course.credit} CR</span>
                  </div>
                  
                  <div className="mb-8">
                    <h3 className="font-black text-slate-800 text-xl uppercase italic leading-tight mb-2">
                      {course.name}
                    </h3>
                    {/* ÖĞRETMEN ALANI: teacherName OLARAK GÜNCELLENDİ */}
                    <p className="text-[11px] font-bold text-indigo-500 uppercase italic tracking-wider">
                      👨‍🏫 {course.teacherName || "Eğitmen Belirtilmedi"}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleEnroll(course)}
                    disabled={isEnrolled || actionLoading === course.id}
                    className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase italic transition-all shadow-xl ${
                      isEnrolled 
                      ? 'bg-emerald-500 text-white cursor-default' 
                      : 'bg-slate-900 text-white hover:bg-indigo-600 active:scale-95'
                    }`}
                  >
                    {actionLoading === course.id ? 'İŞLENİYOR...' : isEnrolled ? 'SEÇİLDİ ✓' : 'LİSTEYE EKLE ➕'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;