import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerModal = ({ onClose }) => {
  const [scanResult, setScanResult] = useState('');
  const qrCodeReaderRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false); // Track scanning state

  useEffect(() => {
    qrCodeReaderRef.current = new Html5Qrcode('qr-reader', {
      qrbox: { width: 250, height: 250 },
      fps: 30, // Increased FPS
      preferFrontCamera: false, // Force rear camera
      useBarCodeDetectorIfSupported: true,
    });

    const html5QrCode = qrCodeReaderRef.current;

    const startScan = async () => {
      setIsScanning(true); // Set scanning to true
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          (decodedText, decodedResult) => {
            setScanResult(decodedText);
            console.log('Scanned Data:', decodedText);

            try {
              const url = new URL(decodedText);
              window.location.href = decodedText;
            } catch (_) {
              alert(
                'Invalid QR Code: The scanned data is not a valid URL.'
              );
            }
            onClose();
          },
          (errorMessage) => console.warn('QR code scan failed:', errorMessage)
        );
      } catch (error) {
        console.error('Failed to start QR code scanner:', error);
        alert(
          'Failed to start QR code scanner. Please ensure your camera is enabled and the site has permission to use it.'
        );
        onClose();
      }
    };

    startScan();

    return () => {
      try {
        if (html5QrCode) {
          html5QrCode.stop();
        }
      } catch (error) {
        console.error('Error stopping QR code scanner:', error);
      }
      setIsScanning(false); // Set scanning to false on unmount
    };
  }, [onClose]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Stop the camera scanner before processing the file
    if (qrCodeReaderRef.current && isScanning) {
      try {
        qrCodeReaderRef.current.stop();
      } catch (e) {
        console.error("Error stopping camera scanner", e);
      }
    }

    const html5QrCode = new Html5Qrcode();
    html5QrCode.scanFile(
      file,
      (decodedText, decodedResult) => {
        setScanResult(decodedText);
        console.log('Scanned Data from File:', decodedText);
        try {
          const url = new URL(decodedText);
          window.location.href = decodedText;
        } catch (e) {
          alert('Invalid QR Code: The scanned data is not a valid URL.');
        }
        onClose();
      },
      (errorMessage) => {
        console.error('File scan failed:', errorMessage); // Log detailed error
        alert(
          'Failed to scan QR code from file. Please upload a valid QR code image.'
        );
      }
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal-content">
        <button className="close-btn" onClick={onClose}>
          X
        </button>
        <h2>Scan QR Code</h2>
        <div id="qr-reader" style={{ width: '100%', maxWidth: '500px' }} />
        <button onClick={triggerFileInput}>Upload QR Code</button>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          ref={fileInputRef}
        />
        {scanResult && <p>Result: {scanResult}</p>}
      </div>
    </div>
  );
};

export default QRScannerModal;
