import React, { useState, useRef } from 'react';

export const EventImageUploader = ({ 
    existingImages = [], 
    onImagesChange, 
    maxImages = 5 
}) => {
    const [images, setImages] = useState(existingImages);
    const [newFiles, setNewFiles] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const fileInputRef = useRef(null);

    const totalImages = images.length + newFiles.length;

    // Gestion de la sélection de nouveaux fichiers
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        
        if (totalImages + files.length > maxImages) {
            alert(`Maximum ${maxImages} images autorisées`);
            return;
        }

        // Validation des fichiers
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} n'est pas une image`);
                return false;
            }
            if (file.size > 2048 * 1024) {
                alert(`${file.name} dépasse 2MB`);
                return false;
            }
            return true;
        });

        // Créer des previews
        const newPreviews = [];
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result);
                if (newPreviews.length === validFiles.length) {
                    setPreviewUrls([...previewUrls, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        const updatedNewFiles = [...newFiles, ...validFiles];
        setNewFiles(updatedNewFiles);

        // Notifier le parent
        if (onImagesChange) {
            onImagesChange({
                existingImages: images,
                newFiles: updatedNewFiles,
                imagesToDelete
            });
        }
    };

    // Supprimer une image existante
    const handleDeleteExisting = (imageId) => {
        const updatedImages = images.filter(img => img.id !== imageId);
        const updatedToDelete = [...imagesToDelete, imageId];
        
        setImages(updatedImages);
        setImagesToDelete(updatedToDelete);

        if (onImagesChange) {
            onImagesChange({
                existingImages: updatedImages,
                newFiles,
                imagesToDelete: updatedToDelete
            });
        }
    };

    // Supprimer une nouvelle image (avant upload)
    const handleDeleteNew = (index) => {
        const updatedNewFiles = newFiles.filter((_, i) => i !== index);
        const updatedPreviews = previewUrls.filter((_, i) => i !== index);
        
        setNewFiles(updatedNewFiles);
        setPreviewUrls(updatedPreviews);

        if (onImagesChange) {
            onImagesChange({
                existingImages: images,
                newFiles: updatedNewFiles,
                imagesToDelete
            });
        }
    };

    // Réorganiser les images existantes
    const handleReorder = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= images.length) return;

        const reordered = [...images];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, moved);
        
        setImages(reordered);

        if (onImagesChange) {
            onImagesChange({
                existingImages: reordered,
                newFiles,
                imagesToDelete
            });
        }
    };

    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                📸 Images de l'événement ({totalImages}/{maxImages})
            </label>

            {/* Images existantes */}
            {images.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', marginBottom: '10px', color: '#666' }}>
                        Images actuelles :
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                        {images.map((img, index) => (
                            <div key={img.id} style={{
                                position: 'relative',
                                border: '2px solid #ddd',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                aspectRatio: '1/1'
                            }}>
                                <img 
                                    src={img.url} 
                                    alt={`Image ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    left: '5px',
                                    background: 'rgba(0,0,0,0.7)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    #{index + 1}
                                </div>
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '5px'
                                }}>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => handleReorder(index, index - 1)}
                                            style={{
                                                background: '#3498db',
                                                border: 'none',
                                                color: 'white',
                                                padding: '6px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                            title="Déplacer vers le haut"
                                        >
                                            ⬆️
                                        </button>
                                    )}
                                    {index < images.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleReorder(index, index + 1)}
                                            style={{
                                                background: '#3498db',
                                                border: 'none',
                                                color: 'white',
                                                padding: '6px 10px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '14px'
                                            }}
                                            title="Déplacer vers le bas"
                                        >
                                            ⬇️
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteExisting(img.id)}
                                        style={{
                                            background: '#e74c3c',
                                            border: 'none',
                                            color: 'white',
                                            padding: '6px 10px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                        title="Supprimer"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Nouvelles images à ajouter */}
            {newFiles.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', marginBottom: '10px', color: '#27ae60' }}>
                        Nouvelles images à ajouter :
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                        {newFiles.map((file, index) => (
                            <div key={index} style={{
                                position: 'relative',
                                border: '2px dashed #27ae60',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                aspectRatio: '1/1'
                            }}>
                                {previewUrls[index] && (
                                    <img 
                                        src={previewUrls[index]} 
                                        alt={`Nouveau ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: '5px',
                                    left: '5px',
                                    background: 'rgba(39, 174, 96, 0.9)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    NOUVEAU
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteNew(index)}
                                    style={{
                                        position: 'absolute',
                                        top: '5px',
                                        right: '5px',
                                        background: '#e74c3c',
                                        border: 'none',
                                        color: 'white',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    ✖️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bouton d'upload */}
            {totalImages < maxImages && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp,image/avif"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            padding: '12px 24px',
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            width: '100%'
                        }}
                    >
                        ➕ Ajouter des images ({maxImages - totalImages} restantes)
                    </button>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        Formats acceptés : JPEG, PNG, GIF, WebP, AVIF • Max 2MB par image
                    </div>
                </div>
            )}

            {/* Résumé des modifications */}
            {(imagesToDelete.length > 0 || newFiles.length > 0) && (
                <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '6px',
                    fontSize: '13px'
                }}>
                    <strong>Modifications en attente :</strong>
                    <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                        {imagesToDelete.length > 0 && (
                            <li>{imagesToDelete.length} image(s) à supprimer</li>
                        )}
                        {newFiles.length > 0 && (
                            <li>{newFiles.length} nouvelle(s) image(s) à ajouter</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};