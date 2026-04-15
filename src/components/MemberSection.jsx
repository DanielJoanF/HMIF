import { useState } from 'react';
import styles from './MemberSection.module.css';
import { hmifMembers } from '../data/members';

const MemberCard = ({ jabatan, nama, foto, caption, isCoordinator, isLeader, onPhotoClick }) => (
    <div className={`${styles.card} ${isCoordinator ? styles.coordinator : ''} ${isLeader ? styles.leader : ''} glass-panel`}>
        <div
            className={`${styles.avatar} ${foto ? styles.clickable : ''}`}
            onClick={() => foto && onPhotoClick(foto, nama, caption)}
        >
            {foto ? (
                <img src={foto} alt={nama} className={styles.avatarImg} />
            ) : (
                <span className={styles.avatarPlaceholder}>{nama.charAt(0)}</span>
            )}
        </div>
        {jabatan && <span className={styles.jabatan}>{jabatan}</span>}
        <h4 className={styles.nama}>{nama}</h4>
    </div>
);

const MemberSection = () => {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewData, setPreviewData] = useState({ foto: '', nama: '', caption: '' });

    const openPreview = (foto, nama, caption) => {
        setPreviewData({ foto, nama, caption: caption || '' });
        setPreviewOpen(true);
    };

    const closePreview = () => {
        setPreviewOpen(false);
    };

    return (
        <section className={styles.section}>
            <h2 className={styles.title}>{hmifMembers.title}</h2>

            {/* BPH Section - Org Chart Style */}
            <div className={styles.bphSection}>
                <h3 className={styles.sectionTitle}>Badan Pengurus Harian</h3>

                {/* Top Row - Ketua & Wakil */}
                <div className={styles.orgLevel}>
                    <MemberCard {...hmifMembers.bph[0]} onPhotoClick={openPreview} />
                    <MemberCard {...hmifMembers.bph[1]} onPhotoClick={openPreview} />
                </div>

                {/* Connector Line */}
                <div className={styles.connector}></div>

                {/* Second Row - Sekretaris, Bendahara */}
                <div className={styles.orgLevel}>
                    {hmifMembers.bph.slice(2).map((member, idx) => (
                        <MemberCard key={idx} {...member} onPhotoClick={openPreview} />
                    ))}
                </div>
            </div>

            {/* Divisions Grid - Organized */}
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h3 className={styles.sectionTitle}>Divisi-Divisi</h3>
            </div>
            <div className={styles.divisionsContainer}>
                {hmifMembers.divisions.map((division, idx) => (
                    <div key={idx} className={styles.divisionBox}>
                        <h4 className={styles.divisionName}>{division.name}</h4>

                        {/* Coordinator at top */}
                        <div className={styles.divisionCoordinator}>
                            <MemberCard
                                nama={division.coordinator.nama}
                                foto={division.coordinator.foto}
                                caption={division.coordinator.caption}
                                jabatan="Koordinator"
                                isCoordinator
                                onPhotoClick={openPreview}
                            />
                        </div>

                        {/* Members below */}
                        <div className={styles.divisionMembers}>
                            {division.members.map((member, mIdx) => (
                                <MemberCard
                                    key={mIdx}
                                    nama={member.nama}
                                    foto={member.foto}
                                    caption={member.caption}
                                    onPhotoClick={openPreview}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Photo Preview Modal */}
            {previewOpen && (
                <div className={styles.modalOverlay} onClick={closePreview}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.modalClose} onClick={closePreview}>✕</button>
                        <img src={previewData.foto} alt={previewData.nama} className={styles.modalImage} />
                        <p className={styles.modalName}>{previewData.nama}</p>
                        {previewData.caption && (
                            <p className={styles.modalCaption}>"{previewData.caption}"</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default MemberSection;
