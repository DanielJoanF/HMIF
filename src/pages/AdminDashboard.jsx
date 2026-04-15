import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check auth
        const isAuth = sessionStorage.getItem('adminAuth');
        if (!isAuth) {
            navigate('/admin-hmif-secret/login');
            return;
        }

        fetchStats();

        // Auto refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const data = await apiService.get('/admin/stats');
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuth');
        sessionStorage.removeItem('loginTime');
        navigate('/admin-hmif-secret/login');
    };

    if (loading) {
        return <div className={styles.loading}>Loading dashboard...</div>;
    }

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>HMIF Admin</h2>
                </div>
                <nav className={styles.nav}>
                    <button className={styles.navItem + ' ' + styles.active}>
                        Dashboard
                    </button>
                    <button
                        className={styles.navItem}
                        onClick={() => navigate('/admin-hmif-secret/gallery')}
                    >
                        Gallery
                    </button>
                    <button
                        className={styles.navItem}
                        onClick={() => navigate('/admin-hmif-secret/aspirations')}
                    >
                        Aspirations
                    </button>
                    <button
                        className={styles.navItem}
                        onClick={() => navigate('/admin-hmif-secret/forum')}
                    >
                        Forum
                    </button>
                </nav>
                <button className={styles.logoutBtn} onClick={handleLogout}>
                    Logout
                </button>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1>Dashboard Overview</h1>
                    <button onClick={fetchStats} className={styles.refreshBtn}>
                        Refresh
                    </button>
                </header>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Total Aspirasi</p>
                            <h2 className={styles.statValue}>{stats?.counts.aspirations || 0}</h2>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Forum Messages</p>
                            <h2 className={styles.statValue}>{stats?.counts.forum || 0}</h2>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Dokumentasi</p>
                            <h2 className={styles.statValue}>{stats?.counts.documentation || 0}</h2>
                        </div>
                    </div>

                    <div className={styles.statCard}>
                        <div className={styles.statInfo}>
                            <p className={styles.statLabel}>Chatbot Messages</p>
                            <h2 className={styles.statValue}>{stats?.counts.chatbot || 0}</h2>
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>Aspirasi by Tag</h3>
                    <div className={styles.tagGrid}>
                        {stats?.aspirationsByTag.map((item) => (
                            <div key={item._id} className={styles.tagCard}>
                                <span className={styles.tagName}>{item._id}</span>
                                <span className={styles.tagCount}>{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h3>Recent Activity</h3>
                    <div className={styles.activityList}>
                        {stats?.recentActivity.length === 0 ? (
                            <p className={styles.emptyState}>No recent activity</p>
                        ) : (
                            stats?.recentActivity.map((activity, index) => (
                                <div key={index} className={styles.activityItem}>
                                    <div className={styles.activityDetails}>
                                        <p className={styles.activityText}>
                                            <strong>{activity.action}</strong> in {activity.collection}
                                        </p>
                                        <p className={styles.activityTime}>
                                            {new Date(activity.timestamp).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
