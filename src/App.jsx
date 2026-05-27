import React, { useState, useRef } from 'react';
import { UploadCloud, Layers, ShieldCheck, Zap } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [modelStatus, setModelStatus] = useState('Loading AI Model (approx. 30MB)...');
  const [isModelReady, setIsModelReady] = useState(false);
  
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    const initModel = async () => {
      try {
        setModelStatus('Loading AI Model (approx. 30MB)...');
        // Preload by running on a 1x1 transparent canvas
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        
        await removeBackground(blob, { model: 'small' });
        
        setIsModelReady(true);
        setModelStatus('Model Loaded! Ready to process.');
      } catch (err) {
        setModelStatus('Failed to load model.');
        console.error(err);
      }
    };
    initModel();
  }, []);


  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.type.match('image.*')) {
      setError("Please select an image file (JPG, PNG, WEBP).");
      return;
    }
    
    // Check file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      setError("Image size shouldn't exceed 25MB.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setOriginalUrl(objectUrl);
    setResultUrl(null);
    // Auto-process is removed as requested by user.
  };

  const processImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (!isModelReady) {
        throw new Error("Model is not loaded yet. Please wait.");
      }

      // Run the AI model using imgly
      const blob = await removeBackground(selectedFile, { model: 'small' });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
    } catch (err) {
      console.error(err);
      setError("Failed to process the image. Please try again or use another image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetProcess = () => {
    setSelectedFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setError(null);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <Layers className="logo-icon" />
          <span>BG Remove GH</span>
        </div>
        <div className="nav-links">
          <span className="nav-item">Tools</span>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#374151' }}></div>
        </div>
      </nav>

      <main className="app-container">
        {/* Left Sidebar Ad / Gallery */}
        <div className="sidebar">
          <div className="gallery-grid">
            <a href="https://example.com/sidebar-ad-1" target="_blank" rel="noreferrer" className="sidebar-ad-placeholder">Side Banner Ad 1</a>
            <a href="https://example.com/sidebar-ad-2" target="_blank" rel="noreferrer" className="sidebar-ad-placeholder">Side Banner Ad 2</a>
            <a href="https://example.com/sidebar-ad-3" target="_blank" rel="noreferrer" className="sidebar-ad-placeholder">Side Banner Ad 3</a>
          </div>
        </div>

        {/* Center Content */}
        <div className="main-content">
          <h1 className="hero-title">Free AI Background Remover</h1>
          <p className="hero-subtitle">
            Free AI background remover. Get 4K transparent PNGs instantly—no sign-up, no
            watermarks, unlimited use.
          </p>
          <div className="status" style={{ marginBottom: '1rem', fontStyle: 'italic', color: '#6b7280' }}>
            {modelStatus}
          </div>

          <a href="https://example.com/your-ad-link-here" target="_blank" rel="noreferrer" className="ad-banner-placeholder">
            <span>BANNER ADVERTISEMENT</span>
          </a>

          {!originalUrl && (
            <div 
              className="dropzone-container"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="drop-icon" />
              <h3 className="drop-text">Drag and drop your image here</h3>
              <p className="drop-subtext">or click to browse</p>
              
              <input 
                type="file" 
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileInput}
              />
              
              <button className="upload-button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                Upload Image
              </button>

              <div className="drop-footer">
                Supports JPG, JPEG, PNG, WEBP, GIF, JFIF · Max 25MB
              </div>
            </div>
          )}

          {originalUrl && !resultUrl && (
            <div className="result-container" style={{maxWidth: '600px'}}>
              <h3 style={{marginBottom: '1rem'}}>Selected Image</h3>
              <img src={originalUrl} alt="Preview" className="image-preview" style={{maxHeight:'350px'}} />
              
              {isProcessing ? (
                 <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                   <div className="loading-spinner"></div>
                   <h3 className="loading-text">Removing background...</h3>
                   <p className="loading-subtext">This might take a few seconds...</p>
                 </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem'}}>
                  {error && <div style={{ color: 'red', fontWeight: 500, alignSelf: 'center', marginRight: 'auto' }}>{error}</div>}
                  <button 
                    className="upload-button" 
                    style={{ backgroundColor: '#e5e7eb', color: '#1f2937', boxShadow: 'none' }}
                    onClick={resetProcess}
                  >
                    Cancel
                  </button>
                  <button className="upload-button" onClick={processImage} disabled={!isModelReady}>
                    Remove Background
                  </button>
                </div>
              )}
            </div>
          )}

          {resultUrl && (
            <div className="result-container">
               <div className="image-comparison">
                 <div className="image-box">
                   <h4>Original</h4>
                   <img src={originalUrl} alt="Original" className="image-preview" />
                   <button 
                     className="upload-button" 
                     style={{ backgroundColor: '#e5e7eb', color: '#1f2937', boxShadow: 'none', marginTop: 'auto' }}
                     onClick={resetProcess}
                   >
                     Upload Another
                   </button>
                 </div>
                 <div className="image-box">
                   <h4>Result (Transparent)</h4>
                   <img src={resultUrl} alt="Result" className="image-preview checkerboard" />
                   <a 
                     href={resultUrl} 
                     download={`bg-removed-${selectedFile?.name || 'hq-image'}.png`}
                     className="download-link"
                     style={{ marginTop: 'auto' }}
                   >
                     <button className="upload-button">
                       Download High Quality PNG
                     </button>
                   </a>
                 </div>
               </div>
            </div>
          )}

          <div style={{marginTop: '4rem', display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280'}}>
               <ShieldCheck size={20} color="var(--primary-green)"/> 100% Secure & Private
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280'}}>
               <Zap size={20} color="var(--primary-green)"/> Instant 4K Output
            </div>
          </div>
        </div>

        {/* Right Sidebar Ad / Gallery */}
        <div className="sidebar">
          <div className="gallery-grid">
            <a href="https://example.com/sidebar-ad-4" target="_blank" rel="noreferrer" className="sidebar-ad-placeholder">Side Banner Ad 4</a>
            <a href="https://example.com/sidebar-ad-5" target="_blank" rel="noreferrer" className="sidebar-ad-placeholder">Side Banner Ad 5</a>
            <a href="https://example.com/sidebar-ad-6" target="_blank" rel="noreferrer" className="sidebar-ad-placeholder">Side Banner Ad 6</a>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
