import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Dashboard({ user }) {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
  if (!user) return;
  setLoading(true);
  try {
    const [coursesRes, enrollmentsRes] = await Promise.all([
      api.get('/courses'),
      api.get('/enrollments')
    ]);

    console.log("API'DEN GELEN TÜM KAYITLAR:", enrollmentsRes.data); // Bu satır çok kritik, konsola bak!

    setCourses(coursesRes.data);

    if (user.role === 'student') {
      // Filtrelemeyi en güvenli şekilde yapıyoruz:
      const myFilteredCourses = enrollmentsRes.data.filter(enroll => {
        // studentId bazen sayı bazen string gelebilir, String() ile ikisini de metne çevirip bakıyoruz
        const apiStudentId = enroll.studentId || (enroll.student && enroll.student.id);
        return String(apiStudentId) === String(user.id);
      });
      
      console.log("FİLTRELENMİŞ DERSLERİM:", myFilteredCourses);
      setMyCourses(myFilteredCourses);
    } else {
      // Eğer kullanıcı admin/öğretmen ise kendi derslerini görsün
      const myTeacherCourses = coursesRes.data.filter(c => c.teacherName === user.name);
      setMyCourses(myTeacherCourses);
    }
  } catch (err) {
    console.error("Veriler yüklenemedi", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      loadData();
    }
  }, [user]);

  // AKADEMİSYEN: Yeni Ders Ekle
  const handleAddCourse = async () => {
    const name = prompt("Ders Adı:");
    const code = prompt("Ders Kodu:");
    const capacity = prompt("Sınıf Kapasitesi:", "30");

    if (name && code && capacity) {
      try {
        await api.post('/courses', {
          name, code, teacherName: user.name,
          capacity: parseInt(capacity), enrolled: 0, credit: 3
        });
        alert("Ders başarıyla eklendi!");
        loadData();
      } catch (err) { alert("Hata oluştu."); }
    }
  };

  // AKADEMİSYEN: Ders Sil
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Dersi silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
      try {
        await api.delete(`/courses/${courseId}`);
        alert("Ders başarıyla silindi.");
        loadData();
      } catch (err) { alert("Ders silinemedi."); }
    }
  };

  // AKADEMİSYEN: Ders Güncelle (Ad, Kod ve Kapasite)
  const handleEditCourse = async (course) => {
    const newName = prompt("Yeni Ders Adı:", course.name);
    const newCode = prompt("Yeni Ders Kodu:", course.code); // KOD GÜNCELLEME EKLENDİ
    const newCapacity = prompt("Yeni Kapasite:", course.capacity);

    if (newName && newCode && newCapacity) {
      try {
        await api.put(`/courses/${course.id}`, {
          ...course,
          name: newName,
          code: newCode,
          capacity: parseInt(newCapacity)
        });
        alert("Ders bilgileri güncellendi!");
        loadData();
      } catch (err) { alert("Güncelleme yapılamadı."); }
    }
  };

  // ÖĞRENCİ: Derse Kaydol
  const handleEnroll = async (courseId) => {
  try {
    // Kayıt yaparken giden veriyi kontrol et
    const payload = { 
      studentId: user.id, // Burada user.id'nin 2 olduğundan eminiz
      courseId: courseId,
      enrollDate: new Date().toISOString()
    };
    
    await api.post('/enrollments', payload);
    alert("Kaydoldunuz!");
    loadData(); // Listeyi yenile
  } catch (err) {
    alert("Kayıt sırasında bir hata oluştu.");
  }
};

  // ÖĞRENCİ: Kayıt İptal
  const handleCancelEnroll = async (enrollmentId) => {
    if (window.confirm("Kaydınızı iptal etmek istiyor musunuz?")) {
      try {
        await api.delete(`/enrollments/${enrollmentId}`);
        alert("Kayıt silindi.");
        loadData();
      } catch (err) { alert("İşlem başarısız."); }
    }
  };

  if (!user) return null;
  console.log("Giriş Yapan Kullanıcı Nesnesi:", user);
  console.log("Seçtiğim Dersler Listesi (State):", myCourses);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Üst Bar */}
      <div className="max-w-6xl mx-auto flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8 border-b-4 border-blue-600">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase">Öğrenci Bilgi Sistemi</h1>
          <p className="text-blue-600 font-bold">{user.name} ({user.role === 'admin' ? 'Akademisyen' : 'Öğrenci'})</p>
        </div>
        <button onClick={() => { localStorage.removeItem('user'); navigate('/'); }} className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold shadow-lg">Çıkış</button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Panel: Ders Listesi */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-xl font-black text-slate-700 mb-6 uppercase tracking-tighter">Açılan Dersler</h2>
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="p-5 border-2 border-gray-50 rounded-2xl bg-slate-50 flex justify-between items-center hover:shadow-md transition-all">
                <div className="flex-1">
                  <h3 className="font-black text-slate-800 uppercase leading-tight">{course.name} <span className="text-blue-500">[{course.code}]</span></h3>
                  <p className="text-sm text-slate-500 italic font-semibold">Hoca: {course.teacherName}</p>
                  <p className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full mt-2 inline-block">👥 Kontenjan: {course.enrolled} / {course.capacity}</p>
                </div>
                
                <div className="flex gap-2">
                  {user.role === 'student' ? (
                    <button onClick={() => handleEnroll(course.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95">Kaydol</button>
                  ) : (
                    <>
                      <button onClick={() => handleEditCourse(course)} className="bg-yellow-500 text-white px-3 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95">Düzenle</button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="bg-red-600 text-white px-3 py-2 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95">Sil</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="space-y-8">
          {user.role === 'admin' ? (
            <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-orange-500">
              <h2 className="text-lg font-black text-slate-800 mb-4 uppercase">Ders Yönetimi</h2>
              <button onClick={handleAddCourse} className="w-full bg-orange-500 text-white p-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest">+ Yeni Ders Ekle</button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl shadow-xl border-t-8 border-indigo-600">
              <h2 className="text-lg font-black text-slate-800 mb-4 uppercase text-center italic">Seçtiğim Dersler</h2>
              {myCourses.length === 0 ? (
                <p className="text-sm text-slate-400 text-center p-4 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">Henüz bir ders seçmediniz.</p>
              ) : (
                <div className="space-y-3">
                  {myCourses.map(item => (
                    <div key={item.id} className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center shadow-sm">
                      <div className="flex flex-col">
                        <p className="font-black text-indigo-900 text-sm uppercase leading-none">{item.courseName || (item.course && item.course.name)}</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase mt-1 italic">{item.courseCode || (item.course && item.course.code)}</p>
                      </div>
                      <button onClick={() => handleCancelEnroll(item.id)} className="text-red-500 font-black text-xs p-2 hover:bg-red-50 rounded-lg transition-all">İptal</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;