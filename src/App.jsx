import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Aspirations from './pages/Aspirations';
import Contact from './pages/Contact';

// Lazy load admin routes to optimize initial bundle size
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminGallery = lazy(() => import('./pages/AdminGallery'));
const AdminAspirations = lazy(() => import('./pages/AdminAspirations'));
const AdminForum = lazy(() => import('./pages/AdminForum'));

// Loading fallback component
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-bg)', color: 'var(--primary)' }}>
    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', letterSpacing: '2px' }}>LOADING...</div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
    </Router>
  );
}

export default App;
