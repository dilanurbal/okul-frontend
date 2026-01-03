import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';

// İçerik kısmını ayrı bir bileşen yapıyoruz ki useAuth() çalışabilsin
const AppRoutes = () => {
  // login fonksiyonunu (veya setUser hangisi varsa) Context'ten çekiyoruz
  const { user, login } = useAuth(); 

  return (
    <Routes>
      {/* DİKKAT: Login bileşenine AuthContext'ten gelen login fonksiyonunu 
          setUser ismiyle prop olarak gönderiyoruz. 
      */}
      <Route path="/" element={<Login setUser={login} />} />
      <Route path="/register" element={<Register />} />
      
      <Route 
        path="/dashboard" 
        element={
          !user ? <Navigate to="/" /> : (
            user.role === 'admin' || user.role === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />
          )
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;