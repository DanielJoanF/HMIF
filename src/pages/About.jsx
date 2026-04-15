import React from 'react';

import MemberSection from '../components/MemberSection';
import './About.css';
import logo from '../assets/logo.png';

const About = () => {
    return (
        <div className="page-container about-page">
            <div className="container">

                {/* Hero / Intro Section */}
                <div className="about-content">
                    {/* Left Section: Text */}
                    <div className="about-text-section">
                        <h1 className="page-title">TENTANG<br />KAMI</h1>
                        <div className="separator-line"></div>
                        <p className="about-description">
                            HMIF adalah organisasi kemahasiswaan yang berdedikasi untuk mendorong inovasi, membangun komunitas, dan mencapai keunggulan di lingkungan Program Studi Informatika Universitas Sanata Dharma.
                        </p>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <span className="stat-number">#1</span>
                                <span className="stat-label">Informatika</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">100+</span>
                                <span className="stat-label">Anggota</span>
                            </div>
                            <div className="stat-card">
                                <span className="stat-number">∞</span>
                                <span className="stat-label">Inovasi</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Section: Visual */}
                    <div className="about-visual-section">
                        <div className="visual-wrapper">
                            <img src={logo} alt="HMIF Logo Art" />
                            <div className="visual-overlay"></div>
                        </div>
                    </div>
                </div>

                {/* Existing Sections */}
                <div className="sections-wrapper">
                    <MemberSection />

                </div>

            </div>
        </div>
    );
};

export default About;
