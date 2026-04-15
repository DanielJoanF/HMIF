import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import styles from './AdminForum.module.css';

const AdminForum = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const isAuth = sessionStorage.getItem('adminAuth');
        if (!isAuth) {
            navigate('/admin-hmif-secret/login');
            return;
        }
        fetchMessages();
    }, [navigate]);

    const fetchMessages = async () => {
        try {
            const data = await apiService.get('/forum');
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this message?')) return;

        try {
            await fetch(`http://localhost:5000/api/admin/forum/${id}`, { method: 'DELETE' });
            fetchMessages();
            alert('Deleted successfully!');
        } catch (error) {
            alert('Failed to delete.');
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}><h2>HMIF Admin</h2></div>
                <nav className={styles.nav}>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret')}>Dashboard</button>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret/gallery')}>Gallery</button>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret/aspirations')}>Aspirations</button>
                    <button className={styles.navItem + ' ' + styles.active}>Forum</button>
                </nav>
                <button className={styles.logoutBtn} onClick={() => { sessionStorage.clear(); navigate('/admin-hmif-secret/login'); }}>Logout</button>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1>Forum Management</h1>
                    <p>{messages.length} messages total</p>
                </header>

                <div className={styles.messageList}>
                    {messages.map(msg => (
                        <div key={msg._id} className={styles.messageCard}>
                            <div className={styles.messageHeader}>
                                <span className={styles.username}>{msg.username}</span>
                                <span className={styles.time}>{new Date(msg.timestamp).toLocaleString('id-ID')}</span>
                            </div>
                            <p className={styles.messageText}>{msg.text}</p>
                            <button onClick={() => handleDelete(msg._id)} className={styles.deleteBtn}>Delete</button>
                        </div>
                    ))}
                    {messages.length === 0 && <div className={styles.empty}>No messages yet</div>}
                </div>
            </main>
        </div>
    );
};

export default AdminForum;
