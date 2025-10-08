import React, { useState } from 'react';

export const EventImageGallery = ({ images = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px 8px 0 0',
                color: '#999',
                fontSize: '14px'
            }}>
                📷 Aucune image disponible
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const goToImage = (index) => {
        setCurrentIndex(index);
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '200px',
            borderRadius: '8px 8px 0 0',
            overflow: 'hidden',
            backgroundColor: '#000'
        }}>
            {/* Image principale */}
            <img
                src={images[currentIndex].url}
                alt={`Image ${currentIndex + 1}`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />

            {/* Boutons de navigation (si plusieurs images) */}
            {images.length > 1 && (
                <>
                    {/* Bouton Précédent */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToPrevious();
                        }}
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: 'none',
                            color: 'white',
                            padding: '10px 15px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            zIndex: 2,
                            transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.6)'}
                    >
                        ‹
                    </button>

                    {/* Bouton Suivant */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: 'none',
                            color: 'white',
                            padding: '10px 15px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            zIndex: 2,
                            transition: 'background 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.8)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.6)'}
                    >
                        ›
                    </button>

                    {/* Indicateurs de position */}
                    <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '8px',
                        zIndex: 2
                    }}>
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    goToImage(index);
                                }}
                                style={{
                                    width: index === currentIndex ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: index === currentIndex 
                                        ? 'white' 
                                        : 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    padding: 0
                                }}
                            />
                        ))}
                    </div>

                    {/* Compteur */}
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 2
                    }}>
                        {currentIndex + 1} / {images.length}
                    </div>
                </>
            )}
        </div>
    );
};

// Version simplifiée pour les miniatures dans les listes
export const EventImageThumbnail = ({ images = [] }) => {
    if (!images || images.length === 0) {
        return (
            <div style={{
                width: '100%',
                height: '180px',
                backgroundColor: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px 8px 0 0',
                color: '#999',
                fontSize: '12px'
            }}>
                📷
            </div>
        );
    }

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '180px',
            borderRadius: '8px 8px 0 0',
            overflow: 'hidden'
        }}>
            <img
                src={images[0].url}
                alt="Miniature événement"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
            {images.length > 1 && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                }}>
                    📸 +{images.length - 1}
                </div>
            )}
        </div>
    );
};