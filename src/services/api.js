import axios from 'axios';

// Temel URL tanımı
const BASE_URL = 'https://webprojeokul.onrender.com';

const api = axios.create({
  baseURL: BASE_URL
});

export const courseService = {
  // Tüm dersleri getir
  getAll: () => api.get('/courses'),
  
  // ÖNEMLİ: Sadece giriş yapan öğrencinin kayıtlarını getirir
  // Artık userId'yi düzgün bir şekilde Query Parametresi olarak gönderiyoruz
  getStudentEnrollments: (userId) => api.get(`/enrollments?userId=${userId}`),
  
  // Yeni ders ekle (Öğretmen için)
  create: (courseData) => api.post('/courses', courseData),
  
  // ÖNEMLİ: Derse kaydol (Öğrenci için)
  // Backend'deki 'userId' ve 'courseId' beklentisine göre isimleri eşitledik
  enroll: (userId, courseId) => api.post('/enrollments', {
    userId: Number(userId),
    courseId: Number(courseId)
  }),
  
  // Ders sil (Öğretmen için)
  delete: (id) => api.delete(`/courses/${id}`),
  
  // Kayıt sil (Öğrenci için)
  cancelEnrollment: (id) => api.delete(`/enrollments/${id}`)
};

export default api;