import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import './Home.css';
import logo from '../assets/logo.png';

const Home = () => {
    const [events, setEvents] = useState([]);
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [fade, setFade] = useState(true);

    // Fetch Events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await apiService.get('/documentation');
                // Sort by date descending (newest first)
                const sortedData = data.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
                setEvents(sortedData.slice(0, 5)); // Take latest 5 events
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };

        fetchEvents();
    }, []);

    // Carousel Logic
    useEffect(() => {
        if (events.length <= 1) return;

        const interval = setInterval(() => {
            setFade(false); // Start fade out
            setTimeout(() => {
                setCurrentEventIndex((prevIndex) => (prevIndex + 1) % events.length);
                setFade(true); // Start fade in
            }, 500); // Wait for fade out to complete (0.5s)
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [events]);

    const currentEvent = events[currentEventIndex];

    return (
        <div className="home-page">
            <div className="hero-container container">

                {/* Background Logo Layer (Faded) */}
                <div className="hero-logo-bg">
                    <img src={logo} alt="HMIF Logo Background" />
                </div>

                {/* Main Text Layer (Foreground) */}
                <div className="hero-text text-display">
                    <div className="line">HMIF</div>
                    <div className="line">USD</div>
                </div>

                {/* Floating Orb */}
                <div className="floating-orb"></div>

                {/* Left Content */}
                <div className="hero-info">
                    <h3>Himpunan Mahasiswa Informatika</h3>
                    <p>
                        Pusat informasi terpadu bagi mahasiswa untuk terhubung, berinovasi, dan membentuk masa depan.
                        Akses sumber daya, kegiatan, dan sampaikan aspirasimu.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/aspirations" className="arrow-link">
                            Sampaikan Aspirasi
                        </Link>
                    </div>
                </div>

                {/* Right Side Card - Dynamic Events */}
                <div className="side-card">
                    <div className="card-header">
                        <span>Kegiatan Terbaru</span>
                        {events.length > 0 && (
                            <div className="carousel-indicators">
                                {events.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`indicator ${idx === currentEventIndex ? 'active' : ''}`}
                                    ></span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card-image">
                        {currentEvent ? (
                            <>
                                <div
                                    className={`event-image-container ${fade ? 'fade-in' : 'fade-out'}`}
                                    style={{
                                        backgroundImage: `url(http://localhost:5000${currentEvent.imageUrl})`
                                    }}
                                >
                                    <div className="event-overlay">
                                        <span className="event-title">{currentEvent.title}</span>
                                        <span className="event-date">
                                            {new Date(currentEvent.uploadedAt).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short'
                                            })}
                                        </span>
                                    </div>
                                </div>
                                <Link to="/events" className="play-icon-overlay">
                                    ▶
                                </Link>
                            </>
                        ) : (
                            // Loading / Empty State
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #111, #333)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ color: '#666', fontSize: '0.8rem' }}>Memuat Kegiatan...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="action-button-container">
                    <Link to="/about">
                        <button className="start-btn text-display">
                            Kenali HMIF
                        </button>
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Home;
