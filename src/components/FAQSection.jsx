import { useState } from 'react';
import styles from './FAQSection.module.css';

const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            question: "Bagaimana cara bergabung dengan HMIF?",
            answer: "Pendaftaran biasanya dibuka di awal semester ganjil. Pantau Instagram kami untuk informasi jadwal Open Recruitment (Oprec)."
        },
        {
            question: "Divisi apa saja yang tersedia?",
            answer: "Kami memiliki beberapa divisi: Minat & Bakat, Media Komunikasi & Informasi, Humas & Advokasi, Sosial, Web Holder, PSDM, dan Kewirausahaan. Setiap divisi memiliki peran penting dalam ekosistem HMIF."
        },
        {
            question: "Di mana saya bisa menemukan materi akademik?",
            answer: "Materi akademik seperti bank soal dan rangkuman modul tersedia di menu 'Akademik' platform ini (segera hadir)."
        },
        {
            question: "Bagaimana cara berkolaborasi untuk event?",
            answer: "Kamu bisa menghubungi divisi Humas & Advokasi melalui halaman Kontak atau email langsung ke hmif@usd.ac.id."
        },
        {
            question: "Apa saja kegiatan rutin HMIF?",
            answer: "HMIF menyelenggarakan berbagai kegiatan seperti Makrab, Workshop, Seminar, dan Dies Natalis. Informasi lengkap tersedia di halaman Kegiatan."
        }
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className={styles.faqSection}>
            <h2 className={`gradient-text ${styles.title}`}>Pertanyaan yang Sering Diajukan</h2>
            <div className={styles.list}>
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`${styles.item} ${activeIndex === index ? styles.active : ''}`}
                        onClick={() => toggleFAQ(index)}
                    >
                        <div className={styles.question}>
                            {faq.question}
                            <span className={styles.icon}>{activeIndex === index ? '-' : '+'}</span>
                        </div>
                        <div className={styles.answer}>
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FAQSection;
