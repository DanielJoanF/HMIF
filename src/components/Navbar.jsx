import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';
import logo from '../assets/logo.png';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const links = [
        { name: 'BERANDA', path: '/' },
        { name: 'TENTANG', path: '/about' },
        { name: 'KEGIATAN', path: '/events' },
        { name: 'ASPIRASI', path: '/aspirations' },
        { name: 'KONTAK', path: '/contact' },
    ];

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
            <div className={styles.navContainer}>
                <div className={styles.logo}>
                    <img src={logo} alt="HMIF Logo" className={styles.logoImage} />
                </div>

                <div className={`${styles.burger} ${isMobileMenuOpen ? styles.active : ''}`} onClick={toggleMobileMenu}>
                    <div className={styles.line1}></div>
                    <div className={styles.line2}></div>
                    <div className={styles.line3}></div>
                </div>

                <ul className={`${styles.navLinks} ${isMobileMenuOpen ? styles.navActive : ''}`}>
                    {links.map((link, index) => (
                        <li key={link.name} style={{ animationDelay: `${index * 0.1 + 0.2}s` }}>
                            <NavLink
                                to={link.path}
                                className={({ isActive }) =>
                                    `${styles.link} ${isActive ? styles.activeLink : ''}`
                                }
                                onClick={closeMobileMenu}
                            >
                                {link.name}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
