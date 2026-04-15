import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import styles from './AdminAspirations.module.css';

const AdminAspirations = () => {
    const [aspirations, setAspirations] = useState([]);
    const [filter, setFilter] = useState('All');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const isAuth = sessionStorage.getItem('adminAuth');
        if (!isAuth) {
            navigate('/admin-hmif-secret/login');
            return;
        }
        fetchAspirations();
    }, [navigate]);

    const fetchAspirations = async () => {
        try {
            const data = await apiService.get('/aspirations');
            setAspirations(data);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this aspiration?')) return;

        try {
            await fetch(`http://localhost:5000/api/admin/aspirations/${id}`, { method: 'DELETE' });
            fetchAspirations();
            alert('Deleted successfully!');
        } catch (error) {
            alert('Failed to delete.');
        }
    };

    const filteredAspirations = filter === 'All'
        ? aspirations
        : aspirations.filter(a => a.tag === filter);

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}><h2>HMIF Admin</h2></div>
                <nav className={styles.nav}>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret')}>Dashboard</button>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret/gallery')}>Gallery</button>
                    <button className={styles.navItem + ' ' + styles.active}>Aspirations</button>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret/forum')}>Forum</button>
                </nav>
                <button className={styles.logoutBtn} onClick={() => { sessionStorage.clear(); navigate('/admin-hmif-secret/login'); }}>Logout</button>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1>Aspirations Management</h1>
                    <div className={styles.filters}>
                        {['All', 'Umum', 'Akademik', 'Fasilitas', 'Kegiatan'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setFilter(tag)}
                                className={filter === tag ? styles.filterActive : styles.filterBtn}
                            >
                                {tag} ({tag === 'All' ? aspirations.length : aspirations.filter(a => a.tag === tag).length})
                            </button>
                        ))}
                    </div>
                </header>

                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <div>Tag</div>
                        <div>Text</div>
                        <div>Date</div>
                        <div>Actions</div>
                    </div>
                    {filteredAspirations.map(asp => (
                        <div key={asp._id} className={styles.tableRow}>
                            <div><span className={styles.tag}>{asp.tag}</span></div>
                            <div className={styles.text}>{asp.text}</div>
                            <div className={styles.date}>{new Date(asp.createdAt).toLocaleDateString('id-ID')}</div>
                            <div>
                                <button onClick={() => handleDelete(asp._id)} className={styles.deleteBtn}>🗑️ Delete</button>
                            </div>
                        </div>
                    ))}
                    {filteredAspirations.length === 0 && (
                        <div className={styles.empty}>No aspirations found</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminAspirations;
