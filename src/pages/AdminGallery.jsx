import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import styles from './AdminGallery.module.css';

const AdminGallery = () => {
    const [documentation, setDocumentation] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadData, setUploadData] = useState({ title: '', caption: '', image: null });
    const [isUploading, setIsUploading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const isAuth = sessionStorage.getItem('adminAuth');
        if (!isAuth) {
            navigate('/admin-hmif-secret/login');
            return;
        }
        fetchDocs();
    }, [navigate]);

    const fetchDocs = async () => {
        try {
            const data = await apiService.get('/documentation');
            setDocumentation(data);
        } catch (error) {
            console.error('Failed to fetch documentation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.title || !uploadData.image) {
            alert('Title and image are required!');
            return;
        }

        const formData = new FormData();
        formData.append('title', uploadData.title);
        formData.append('caption', uploadData.caption);
        formData.append('image', uploadData.image);

        setIsUploading(true);
        try {
            await apiService.postFormData('/documentation', formData);
            setUploadData({ title: '', caption: '', image: null });
            fetchDocs();
            alert('Photo uploaded successfully!');
        } catch (error) {
            alert('Failed to upload. Ensure server is running.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this photo?')) return;

        try {
            const response = await fetch(`http://localhost:5000/api/admin/documentation/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            fetchDocs();
            alert('Photo deleted successfully!');
        } catch (error) {
            alert('Failed to delete photo.');
        }
    };

    const handleUpdate = async (id, title, caption) => {
        try {
            await fetch(`http://localhost:5000/api/admin/documentation/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, caption })
            });
            setEditingId(null);
            fetchDocs();
            alert('Updated successfully!');
        } catch (error) {
            alert('Failed to update.');
        }
    };

    if (loading) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}><h2>HMIF Admin</h2></div>
                <nav className={styles.nav}>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret')}>
                        Dashboard
                    </button>
                    <button className={styles.navItem + ' ' + styles.active}>Gallery</button>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret/aspirations')}>
                        Aspirations
                    </button>
                    <button className={styles.navItem} onClick={() => navigate('/admin-hmif-secret/forum')}>
                        Forum
                    </button>
                </nav>
                <button className={styles.logoutBtn} onClick={() => {
                    sessionStorage.clear();
                    navigate('/admin-hmif-secret/login');
                }}>Logout</button>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h1>Gallery Management</h1>
                    <p>{documentation.length} photos total</p>
                </header>

                <div className={styles.uploadSection}>
                    <h3>Upload New Photo</h3>
                    <form onSubmit={handleUpload} className={styles.uploadForm}>
                        <input
                            type="text"
                            placeholder="Title *"
                            value={uploadData.title}
                            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                            className={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Caption (optional)"
                            value={uploadData.caption}
                            onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                            className={styles.input}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setUploadData({ ...uploadData, image: e.target.files[0] })}
                            className={styles.fileInput}
                        />
                        <button type="submit" disabled={isUploading} className={styles.uploadBtn}>
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </div>

                <div className={styles.grid}>
                    {documentation.map((doc) => (
                        <div key={doc._id} className={styles.card}>
                            <img src={`http://localhost:5000${doc.imageUrl}`} alt={doc.title} />
                            {editingId === doc._id ? (
                                <div className={styles.editForm}>
                                    <input
                                        type="text"
                                        defaultValue={doc.title}
                                        id={`title-${doc._id}`}
                                        className={styles.editInput}
                                    />
                                    <input
                                        type="text"
                                        defaultValue={doc.caption}
                                        id={`caption-${doc._id}`}
                                        className={styles.editInput}
                                    />
                                    <button onClick={() => {
                                        const title = document.getElementById(`title-${doc._id}`).value;
                                        const caption = document.getElementById(`caption-${doc._id}`).value;
                                        handleUpdate(doc._id, title, caption);
                                    }} className={styles.saveBtn}>Save</button>
                                    <button onClick={() => setEditingId(null)} className={styles.cancelBtn}>Cancel</button>
                                </div>
                            ) : (
                                <div className={styles.cardContent}>
                                    <h4>{doc.title}</h4>
                                    <p>{doc.caption || 'No caption'}</p>
                                    <div className={styles.cardActions}>
                                        <button onClick={() => setEditingId(doc._id)} className={styles.editBtn}>Edit</button>
                                        <button onClick={() => handleDelete(doc._id)} className={styles.deleteBtn}>Delete</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default AdminGallery;
