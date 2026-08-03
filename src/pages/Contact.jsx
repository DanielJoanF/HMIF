import React from 'react';
import { useSEO } from '../utils/seo';
import './Contact.css';
import logo from '../assets/Foto-bersama.webp';

const Contact = () => {
    useSEO(
        'Kontak | HMIF USD',
        'Hubungi Himpunan Mahasiswa Informatika Universitas Sanata Dharma melalui email, media sosial, atau sekretariat di Kampus III USD.'
    );

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
                        <a href="mailto:hmjtisanatadharma@gmail.com" className="contact-link text-display">HMIF</a>
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
                        <a href="https://instagram.com/hmif.usd" target="_blank" rel="noopener noreferrer">IG: @hmif.usd</a>
                        <a href="https://www.tiktok.com/@hmif_usd?_r=1&_t=ZS-95bpDd9T06O" target="_blank" rel="noopener noreferrer">TikTok: @hmif_usd</a>
                    </div>
                </div>

                {/* Right: Visual */}
                <div className="contact-visual">
                    <img src={logo} alt="HMIF Foto Bersama" width="500" height="400" loading="lazy" decoding="async" />
                </div>

            </div>
        </div>
    );
};

export default Contact;
