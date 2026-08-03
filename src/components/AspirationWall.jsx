import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import '../pages/Aspirations.css';

const AspirationWall = () => {
    const [aspirations, setAspirations] = useState([]);
    const [newAspiration, setNewAspiration] = useState('');
    const [selectedTag, setSelectedTag] = useState('Umum');
    const [honeypot, setHoneypot] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    useEffect(() => {
        fetchAspirations();
    }, []);

    const fetchAspirations = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get('/aspirations?limit=500');
            setAspirations(response.data || response);
        } catch (err) {
            console.error('Failed to fetch aspirations:', err);
            setError('Gagal memuat data, coba lagi nanti');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!newAspiration.trim()) {
            alert('Tolong tulis aspirasimu!');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        try {
            const savedAspiration = await apiService.post('/aspirations', {
                tag: selectedTag,
                text: newAspiration.trim(),
                website: honeypot // Anti-spam honeypot
            });
            // If honeypot wasn't triggered and array returned
            if (savedAspiration && savedAspiration._id) {
                setAspirations(prev => [savedAspiration, ...prev]);
            }
            setNewAspiration('');
            setHoneypot('');
            setSelectedTag('Umum');
            alert('Aspirasi berhasil dikirim!');
        } catch (err) {
            console.error('Failed to submit aspiration:', err);
            setSubmitError('Gagal mengirim aspirasi, coba lagi nanti.');
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
                        {/* Hidden Honeypot Input */}
                        <input
                            type="text"
                            name="website"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            style={{ display: 'none' }}
                            tabIndex="-1"
                            autoComplete="off"
                        />

                        <textarea
                            className="main-input"
                            placeholder="Ketik di sini..."
                            value={newAspiration}
                            onChange={(e) => setNewAspiration(e.target.value)}
                            rows={1}
                            style={{ height: newAspiration ? 'auto' : '60px' }}
                        />

                        {submitError && (
                            <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem' }}>{submitError}</p>
                        )}

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
                    {error ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#ff6b6b', marginTop: '2rem' }}>
                            <p>{error}</p>
                            <button
                                onClick={fetchAspirations}
                                style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Coba Lagi
                            </button>
                        </div>
                    ) : loading ? (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#aaa', marginTop: '2rem' }}>
                            <p>Memuat aspirasi...</p>
                        </div>
                    ) : aspirations.length > 0 ? (
                        aspirations.map((item) => (
                            <div key={item._id} className="aspiration-card">
                                <div className="quote-icon">"</div>
                                <div className="card-header">
                                    <span className="card-tag">{item.tag}</span>
                                    <span className="card-date">{formatDate(item.createdAt)}</span>
                                </div>
                                <p className="card-text">{item.text}</p>
                            </div>
                        ))
                    ) : (
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
