import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from "../context/AuthContext";

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allEnrollments, setAllEnrollments] = useState([]); // Öğrencileri bulmak için yeni state
  
  const [deptName, setDeptName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newCourse, setNewCourse] = useState({ 
    name: '', code: '', credit: '', departmentId: '' 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [deptRes, courseRes, enrollRes] = await Promise.all([
        api.get('/departments'),
        api.get('/courses'),
        api.get('/enrollments') // Tüm kayıtları çekiyoruz
      ]);
      setDepartments(deptRes.data);
      setAllEnrollments(enrollRes.data); // Kayıtları state'e at
      
      // Sadece giriş yapan öğretmenin derslerini filtrele
      setCourses(courseRes.data.filter(c => c.teacherName === user.name));
      
      if (deptRes.data.length > 0 && !editMode) {
        setNewCourse(prev => ({ ...prev, departmentId: deptRes.data[0].id }));
      }
    } catch (err) { console.error("Veriler yüklenemedi"); }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim()) return;
    try {
      await api.post('/departments', { name: deptName });
      alert(`"${deptName}" Bölümü Başarıyla Eklendi! ✨`);
      setDeptName('');
      loadData();
    } catch (err) { alert("Bölüm eklenirken hata oluştu."); }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    const payload = {
      name: newCourse.name,
      code: newCourse.code.toUpperCase(),
      credit: Number(newCourse.credit),
      teacherName: user.name,
      capacity: 30,
      enrolled: 0,
      department: { id: Number(newCourse.departmentId) } 
    };

    try {
      if (editMode) {
        await api.put(`/courses/${editId}`, payload);
        alert("Ders Güncellendi! ✅");
      } else {
        await api.post('/courses', payload);
        alert("Ders Sisteme Kaydedildi! 📚");
      }
      resetForm();
      loadData();
    } catch (err) { alert("Ders işlemi başarısız."); }
  };

  const resetForm = () => {
    setEditMode(false);
    setEditId(null);
    setNewCourse({ 
      name: '', code: '', credit: '', 
      departmentId: departments[0]?.id || '' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      
      {/* ÜST NAVIGASYON */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border-b-4 border-indigo-600">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black italic">T</div>
          <div>
            <h1 className="font-black text-lg uppercase leading-none">Öğretmen Paneli</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hoş geldin, {user.name}</p>
          </div>
        </div>
        <button onClick={logout} className="bg-rose-50 text-rose-600 px-6 py-2 rounded-xl font-black text-xs hover:bg-rose-600 hover:text-white transition-all">ÇIKIŞ YAP</button>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL TARAF: FORM ALANLARI (DEĞİŞMEDİ) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-indigo-50">
            <h2 className="font-black text-indigo-600 mb-4 text-xs uppercase italic tracking-widest">1. Yeni Bölüm Tanımla 🏗️</h2>
            <form onSubmit={handleSaveDepartment} className="flex gap-2">
              <input className="flex-1 p-4 bg-slate-50 rounded-2xl font-bold outline-none ring-2 ring-transparent focus:ring-indigo-200 transition-all" placeholder="Örn: Bilgisayar" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
              <button className="bg-indigo-600 text-white px-6 rounded-2xl font-black hover:bg-slate-900 transition-all">EKLE</button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-emerald-50">
            <h2 className="font-black text-emerald-600 mb-6 text-xs uppercase italic tracking-widest">{editMode ? 'Dersi Güncelle ✏️' : '2. Bölüme Ders Tanımla 📖'}</h2>
            <form onSubmit={handleSaveCourse} className="space-y-4">
              <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none ring-2 ring-transparent focus:ring-emerald-200" value={newCourse.departmentId} onChange={e => setNewCourse({...newCourse, departmentId: e.target.value})} required>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" placeholder="Ders Adı" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input className="p-4 bg-slate-50 rounded-2xl font-bold text-center uppercase" placeholder="Kod" value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} required />
                <input className="p-4 bg-slate-50 rounded-2xl font-bold text-center" type="number" placeholder="Kredi" value={newCourse.credit} onChange={e => setNewCourse({...newCourse, credit: e.target.value})} required />
              </div>
              <button className={`w-full py-5 rounded-2xl font-black text-white shadow-lg transition-all uppercase text-xs tracking-widest ${editMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-slate-900'}`}>
                {editMode ? 'Değişiklikleri Uygula' : 'Dersi Sisteme Kaydet'}
              </button>
              {editMode && <button type="button" onClick={resetForm} className="w-full text-xs font-black text-slate-400 uppercase hover:text-rose-500 transition-all">İşlemi İptal Et</button>}
            </form>
          </div>
        </div>

        {/* SAĞ TARAF: DERS LİSTESİ VE ÖĞRENCİLER */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-black text-slate-400 uppercase italic ml-4 text-sm tracking-widest">Yayındaki Dersleriniz & Öğrenci Listesi</h3>
          
          {courses.map(c => {
            // BU DERSİ SEÇEN ÖĞRENCİLERİ FİLTRELE
            const enrolledStudents = allEnrollments
              .filter(en => String(en.course?.id || en.courseId) === String(c.id))
              .map(en => en.student);

            return (
              <div key={c.id} className="bg-white rounded-[2.5rem] shadow-sm border-l-8 border-emerald-500 overflow-hidden group hover:shadow-xl transition-all border-2 border-slate-100">
                <div className="p-6 flex justify-between items-center bg-white">
                  <div>
                    <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase">{c.department?.name}</span>
                    <h4 className="font-black text-slate-800 text-lg uppercase mt-1 italic">{c.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.code} • {c.credit} Kredi</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditMode(true); setEditId(c.id); setNewCourse({ name: c.name, code: c.code, credit: c.credit, departmentId: c.department?.id || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-3 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all">✏️</button>
                    <button onClick={async () => { if(window.confirm("Silinsin mi?")) { await api.delete(`/courses/${c.id}`); loadData(); } }} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white transition-all">🗑️</button>
                  </div>
                </div>

                {/* ÖĞRENCİ LİSTESİ ALANI (YENİ EKLENDİ) */}
                <div className="bg-slate-50 p-4 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-3 ml-2 tracking-widest">Kayıtlı Öğrenciler ({enrolledStudents.length})</p>
                  <div className="space-y-2">
                    {enrolledStudents.length > 0 ? (
                      enrolledStudents.map((st, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl flex justify-between items-center border border-slate-200 shadow-sm">
                          <span className="text-xs font-black text-slate-700 uppercase italic">👤 {st?.name}</span>
                          <span className="text-[10px] font-bold text-slate-400">{st?.email}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-300 italic ml-2">Bu derse henüz öğrenci kayıt olmadı.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;