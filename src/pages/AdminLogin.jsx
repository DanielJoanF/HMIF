import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiService.post('/admin/login', { password });

            if (response.success) {
                // [SECURITY] Store the JWT token returned from the server
                // Previously only stored a boolean flag — now uses a real token
                // that the server validates on every admin API call
                sessionStorage.setItem('adminAuth', 'true');
                sessionStorage.setItem('adminToken', response.token);
                sessionStorage.setItem('loginTime', Date.now().toString());
                navigate('/admin-hmif-secret');
            } else {
                setError('Password salah!');
            }
        } catch (error) {
            // Handle rate limit (429) with user-friendly message
            if (error.status === 429) {
                setError('Terlalu banyak percobaan login. Coba lagi dalam 15 menit.');
            } else {
                setError('Login gagal. Pastikan server berjalan.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <h1 className={styles.title}>Admin Login</h1>
                <p className={styles.subtitle}>HMIF Platform Dashboard</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <input
                        type="password"
                        placeholder="Enter admin password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.input}
                        autoFocus
                    />

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                        type="submit"
                        className={styles.button}
                        disabled={isLoading || !password}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default AdminLogin;
