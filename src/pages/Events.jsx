import { useState, useEffect } from 'react';
import { apiService, API_BASE_URL } from '../services/apiService';
import { useSEO } from '../utils/seo';
import './Events.css';

/**
 * Helper: build a displayable image src from a documentation document.
 */
const getImageSrc = (doc) => {
    return `${API_BASE_URL}/documentation/${doc._id}/image`;
};

const Events = () => {
    useSEO(
        'Kegiatan & Dokumentasi | HMIF USD',
        'Galeri kegiatan dan dokumentasi acara Himpunan Mahasiswa Informatika Universitas Sanata Dharma.'
    );

    const [documentation, setDocumentation] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDocumentation();
    }, []);

    const fetchDocumentation = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.get('/documentation');
            setDocumentation(data);
        } catch (err) {
            console.error('Failed to fetch documentation:', err);
            setError('Gagal memuat data, coba lagi nanti');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="events-page">
            {/* Background Decoration */}
            <div className="event-bg"></div>

            <div className="container">
                <div className="events-header">
                    <h1 className="page-title">KEGIATAN &<br />DOKUMENTASI</h1>
                    <p className="page-subtitle">
                        Agenda terbaru dan galeri eksklusif HMIF USD.
                    </p>
                </div>

                {/* Horizontal Scroll List */}
                <div className="gallery-list">
                    {error ? (
                        <div className="error-state" style={{ color: '#ff6b6b', padding: '2rem', textAlign: 'center', width: '100%' }}>
                            <p>{error}</p>
                            <button
                                onClick={fetchDocumentation}
                                style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Coba Lagi
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="loading-state" style={{ color: '#aaa', padding: '2rem', textAlign: 'center', width: '100%' }}>
                            <p>Memuat kegiatan...</p>
                        </div>
                    ) : documentation.length > 0 ? (
                        documentation.map((doc) => (
                            <div
                                key={doc._id}
                                className="gallery-card"
                                onClick={() => setSelectedImage(doc)}
                            >
                                {/* Image as Background */}
                                <img
                                    src={getImageSrc(doc)}
                                    alt={doc.title}
                                    className="card-bg-image"
                                    width="500"
                                    height="300"
                                    loading="lazy"
                                    decoding="async"
                                />

                                <div className="card-content">
                                    <div className="card-date">
                                        {new Date(doc.uploadedAt).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: '2-digit'
                                        }).replace('/', '.')}
                                    </div>
                                    <h3 className="card-title">{doc.title}</h3>
                                    {doc.caption && (
                                        <p className="card-caption">{doc.caption}</p>
                                    )}
                                    <div className="view-btn">LIHAT DETAIL &rarr;</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state" style={{ color: '#666', padding: '2rem' }}>
                            <p>BELUM ADA DATA KEGIATAN</p>
                        </div>
                    )}
                </div>

                {/* Image Preview Modal */}
                {selectedImage && (
                    <div
                        className="modal-overlay"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="modal-close-btn"
                                onClick={() => setSelectedImage(null)}
                            >
                                X
                            </button>

                            <div className="modal-image-container">
                                <img
                                    src={getImageSrc(selectedImage)}
                                    alt={selectedImage.title}
                                    className="modal-image"
                                    width="600"
                                    height="400"
                                    loading="lazy"
                                    decoding="async"
                                />
                            </div>

                            <div className="modal-info">
                                <h2 className="modal-title">{selectedImage.title}</h2>
                                {selectedImage.caption && (
                                    <p style={{ color: '#ccc', lineHeight: '1.6' }}>{selectedImage.caption}</p>
                                )}
                                <p style={{ color: '#666', marginTop: '1rem', fontSize: '0.9rem' }}>
                                    Diunggah pada: {new Date(selectedImage.uploadedAt).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;
