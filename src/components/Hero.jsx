import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import styles from './Hero.module.css';

const Hero = () => {
    const heroRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Text Entry
            gsap.from(contentRef.current.children, {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: 'power3.out',
            });

            // Background Shapes
            gsap.to('.hero-shape', {
                y: 'random(-30, 30)',
                x: 'random(-30, 30)',
                rotation: 'random(-15, 15)',
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
                stagger: 2,
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className={styles.hero} ref={heroRef}>
            {/* Background Shapes */}
            <div className={styles.shapes}>
                <div className={`${styles.shape} ${styles.shape1} hero-shape`}></div>
                <div className={`${styles.shape} ${styles.shape2} hero-shape`}></div>
            </div>

            <div className={`container ${styles.content}`}>
                <div className={styles.textContent} ref={contentRef}>
                    <h2 className={styles.subtitle}>Himpunan Mahasiswa Informatika</h2>
                    <h1 className={styles.title}>
                        Masa Depan <span className="gradient-text">Informatika</span>
                    </h1>
                    <p className={styles.description}>
                        Pusat informasi terpadu bagi mahasiswa untuk terhubung, berinovasi, dan membentuk masa depan.
                        Akses sumber daya, kegiatan, dan sampaikan aspirasimu.
                    </p>

                    <div className={styles.actions}>
                        <Link to="/about" className={styles.btnPrimary}>
                            Kenali HMIF
                        </Link>
                        <Link to="/aspirations" className={styles.btnSecondary}>
                            Sampaikan Aspirasi
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
