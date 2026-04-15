import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Aspirations from './pages/Aspirations';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminGallery from './pages/AdminGallery';
import AdminAspirations from './pages/AdminAspirations';
import AdminForum from './pages/AdminForum';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes (Hidden) */}
        <Route path="/admin-hmif-secret/login" element={<AdminLogin />} />
        <Route path="/admin-hmif-secret" element={<AdminDashboard />} />
        <Route path="/admin-hmif-secret/gallery" element={<AdminGallery />} />
        <Route path="/admin-hmif-secret/aspirations" element={<AdminAspirations />} />
        <Route path="/admin-hmif-secret/forum" element={<AdminForum />} />

        {/* Public Routes */}
        <Route path="/*" element={
          <>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/events" element={<Events />} />
                <Route path="/aspirations" element={<Aspirations />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
            <ChatWidget />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
