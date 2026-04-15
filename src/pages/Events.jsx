import { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import './Events.css';

const Events = () => {
    const [documentation, setDocumentation] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchDocumentation();
    }, []);

    const fetchDocumentation = async () => {
        try {
            const data = await apiService.get('/documentation');
            setDocumentation(data);
        } catch (error) {
            console.error('Failed to fetch documentation:', error);
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
                    {documentation.map((doc) => (
                        <div
                            key={doc._id}
                            className="gallery-card"
                            onClick={() => setSelectedImage(doc)}
                        >
                            {/* Image as Background */}
                            <img
                                src={`http://localhost:5000${doc.imageUrl}`}
                                alt={doc.title}
                                className="card-bg-image"
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
                    ))}

                    {documentation.length === 0 && (
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
                                    src={`http://localhost:5000${selectedImage.imageUrl}`}
                                    alt={selectedImage.title}
                                    className="modal-image"
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

