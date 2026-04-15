import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import '../pages/Aspirations.css'; // Import the new CSS

const AspirationWall = () => {
    const [aspirations, setAspirations] = useState([]);
    const [newAspiration, setNewAspiration] = useState('');
    const [selectedTag, setSelectedTag] = useState('Umum');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAspirations();
    }, []);

    const fetchAspirations = async () => {
        try {
            const data = await apiService.get('/aspirations');
            setAspirations(data);
        } catch (error) {
            console.error('Failed to fetch aspirations:', error);
        }
    };

    const handleSubmit = async () => {
        if (!newAspiration.trim()) {
            alert('Tolong tulis aspirasimu!');
            return;
        }

        setIsSubmitting(true);
        try {
            const savedAspiration = await apiService.post('/aspirations', {
                tag: selectedTag,
                text: newAspiration.trim()
            });
            setAspirations(prev => [savedAspiration, ...prev]);
            setNewAspiration('');
            setSelectedTag('Umum');
            alert('Aspirasi berhasil dikirim! 🎉');
        } catch (error) {
            console.error('Failed to submit aspiration:', error);
            alert('Gagal mengirim aspirasi. Pastikan server backend berjalan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="aspiration-page">
            <div className="aspiration-container">

                {/* Form Section */}
                <div className="form-section">
                    <h1 className="form-title">SUARAKAN<br />ASPIRASIMU</h1>
                    <p className="form-subtitle">Ide, kritik, dan saran untuk HMIF yang lebih baik.</p>

                    <div className="input-group">
                        <textarea
                            className="main-input"
                            placeholder="Ketik di sini..."
                            value={newAspiration}
                            onChange={(e) => setNewAspiration(e.target.value)}
                            rows={1}
                            style={{ height: newAspiration ? 'auto' : '60px' }} // Auto-grow feel
                        />

                        {/* Controls appear when interacting */}
                        <div className={`form-controls ${newAspiration ? 'active' : ''}`}>
                            <select
                                className="tag-select"
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                            >
                                <option>Umum</option>
                                <option>Akademik</option>
                                <option>Fasilitas</option>
                                <option>Kegiatan</option>
                            </select>

                            <button
                                className="submit-btn-minimal"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '...' : 'KIRIM'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Wall Grid */}
                <div className="wall-grid">
                    {aspirations.map((item) => (
                        <div key={item._id} className="aspiration-card">
                            <div className="quote-icon">"</div>
                            <div className="card-header">
                                <span className="card-tag">{item.tag}</span>
                                <span className="card-date">{formatDate(item.createdAt)}</span>
                            </div>
                            <p className="card-text">{item.text}</p>
                        </div>
                    ))}

                    {aspirations.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#444', marginTop: '2rem' }}>
                            <p>BELUM ADA DATA ASPIRASI</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AspirationWall;
