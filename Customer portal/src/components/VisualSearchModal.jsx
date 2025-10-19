import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AWSVisualSearchService from '../services/AWSVisualSearchService';
import MockVisualSearchService from '../services/MockVisualSearchService';

const VisualSearchModal = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();
  
  // Use AWS service instance (already instantiated as singleton)
  const visualSearchService = AWSVisualSearchService;

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  // Close modal on Escape key
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleSearchByImage = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    
    try {
      console.log('Starting AWS Rekognition visual search...');
      
      // Use AWS Rekognition service
      const analysisResults = await visualSearchService.analyzeImage(selectedFile);
      
      console.log('Analysis results:', analysisResults);
      
      // Check if we have matched products directly from Rekognition
      if (analysisResults.products && analysisResults.products.length > 0) {
        // Store products in session storage for the search results page
        sessionStorage.setItem('visualSearchProducts', JSON.stringify(analysisResults.products));
        sessionStorage.setItem('visualSearchLabels', JSON.stringify(analysisResults.detectedLabels || []));
        
        // Navigate with products indicator
        navigate(`/search?visual=true&category=${analysisResults.primaryCategory}&confidence=${Math.round(analysisResults.confidence)}&hasProducts=true`);
      } else {
        // Fallback: Create search query from detected labels
        const searchQuery = analysisResults.tags && analysisResults.tags.length > 0
          ? analysisResults.tags.slice(0, 3).join(' ')
          : analysisResults.primaryCategory;
        
        navigate(`/search?q=${encodeURIComponent(searchQuery)}&visual=true&category=${analysisResults.primaryCategory}&confidence=${Math.round(analysisResults.confidence)}`);
      }
      
      // Close modal
      onClose();
      resetModal();
    } catch (error) {
      console.error('Visual search failed:', error);
      setError(error.message || 'Failed to analyze image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetModal = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploading(false);
    setIsDragOver(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  return (
    <div className="visual-search-overlay" role="dialog" aria-modal="true" aria-label="Visual search dialog">
      <div className="visual-search-modal" ref={modalRef}>
        <div className="modal-header">
          <h2>Visual Search</h2>
          <button className="close-button" onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="modal-content">
          <p className="search-description">
            Upload an image to find similar products. Our AI will analyze your image and show you matching items.
          </p>

          {error && (
            <div style={{
              padding: '1rem',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c33',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div 
            className={`upload-area ${isDragOver ? 'drag-over' : ''} ${selectedFile ? 'has-file' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={(e) => {
              if (!selectedFile) {
                e.stopPropagation();
                fileInputRef.current?.click();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Upload image for visual search"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Preview" className="preview-image" />
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <button 
                    className="change-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetModal();
                      fileInputRef.current?.click();
                    }}
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="upload-icon">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Drop your image here</h3>
                <p>or click to browse files</p>
                <p className="file-types">Supports JPG, PNG, GIF up to 10MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            aria-label="Choose image file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />

          <div className="modal-actions">
            <button className="cancel-button" onClick={handleClose} aria-label="Cancel visual search">
              Cancel
            </button>
            <button 
              className="search-button"
              onClick={handleSearchByImage}
              disabled={!selectedFile || isUploading}
              aria-disabled={!selectedFile || isUploading}
              aria-label="Search by image"
            >
              {isUploading ? (
                <>
                  <div className="loading-spinner" aria-hidden="true"></div>
                  Analyzing Image...
                </>
              ) : (
                'Search by Image'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualSearchModal;