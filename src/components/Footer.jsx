import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.brand}>
                    <h3>HMIF<span style={{ color: 'var(--primary)' }}>.</span></h3>
                    <p>Himpunan Mahasiswa Informatika</p>
                    <p className={styles.university}>Universitas Sanata Dharma</p>
                </div>
                <div className={styles.links}>
                    <a href="https://www.instagram.com/hmif.usd/" target="_blank" rel="noopener noreferrer" className={styles.link}>Instagram</a>
                </div>
                <div className={styles.copy}>
                    &copy; 2026 HMIF USD.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
