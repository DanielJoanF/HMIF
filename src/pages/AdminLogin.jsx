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
                // Store auth token in sessionStorage
                sessionStorage.setItem('adminAuth', 'true');
                sessionStorage.setItem('loginTime', Date.now().toString());
                navigate('/admin-hmif-secret');
            } else {
                setError('Password salah!');
            }
        } catch (error) {
            setError('Login gagal. Pastikan server berjalan.');
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
