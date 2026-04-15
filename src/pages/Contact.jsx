import React from 'react';
import './Contact.css';
import logo from '../assets/default-member.jpg';

const Contact = () => {
    return (
        <div className="contact-page">
            <div className="contact-grid">

                {/* Left: Info */}
                <div className="contact-info">
                    {/* Header Text from Original */}
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 className="text-display" style={{ fontSize: '3rem', marginBottom: '1rem' }}>HUBUNGI KAMI</h1>
                        <p style={{ color: '#888', maxWidth: '400px' }}>
                            Punya pertanyaan atau ingin berkolaborasi? Jangan ragu untuk menghubungi kami!
                        </p>
                    </div>

                    <div className="contact-block">
                        <span className="label">EMAIL OFFICIAL</span>
                        <a href="mailto:hmjtisanatadharma@gmail.com" className="contact-link text-display">hmjtisanatadharma@gmail.com</a>
                    </div>

                    <div className="contact-block">
                        <span className="label">MARKAS KAMI</span>
                        <p className="address">
                            Kampus III USD, Paingan,<br />
                            Yogyakarta, Indonesia
                        </p>
                    </div>

                    <div className="socials">
                        <span className="label" style={{ marginRight: '1rem', alignSelf: 'center', marginBottom: 0 }}>MEDIA SOSIAL:</span>
                        <a href="https://instagram.com/hmif.usd" target="_blank" rel="noopener noreferrer">@hmif.usd</a>
                    </div>
                </div>

                {/* Right: Visual */}
                <div className="contact-visual">
                    <img src={logo} alt="HMIF Logo Art" />
                </div>

            </div>
        </div>
    );
};

export default Contact;
