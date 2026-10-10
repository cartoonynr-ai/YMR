import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Flashlight, FlashlightOff, RefreshCcw } from 'lucide-react';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

declare global {
  class BarcodeDetector {
    constructor(options?: { formats: string[] });
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
    getSupportedFormats(): Promise<string[]>;
  }
  interface DetectedBarcode {
    rawValue: string;
    format: string;
  }
}

const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.1);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore error if audio context is restricted
  }
};

export default function BarcodeScannerModal({ isOpen, onClose, onScan }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isTorchSupported, setIsTorchSupported] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  
  const streamRef = useRef<MediaStream | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const animationRef = useRef<number>(0);
  const lastScanRef = useRef<{ code: string; time: number }>({ code: '', time: 0 });
  const scanningRef = useRef<boolean>(false);

  const handleDetected = useCallback((code: string) => {
    const now = Date.now();
    const last = lastScanRef.current;
    
    // Cooldown 1.5s for the same barcode
    if (last.code === code && now - last.time < 1500) {
      return;
    }
    
    lastScanRef.current = { code, time: now };
    
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    playBeep();
    
    onScan(code);
    
    if (!isContinuous) {
      handleClose();
    }
  }, [isContinuous, onScan]);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (readerRef.current) {
      readerRef.current.reset();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    trackRef.current = null;
    setIsTorchSupported(false);
    setIsTorchOn(false);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    
    setError('');
    let mounted = true;
    
    const startCamera = async () => {
      try {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          throw new Error('NOT_HTTPS');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        
        const track = stream.getVideoTracks()[0];
        trackRef.current = track;
        
        // Check torch support
        if (track && track.getCapabilities) {
          const caps = track.getCapabilities() as any;
          if (caps.torch) {
            setIsTorchSupported(true);
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Important for iOS
          videoRef.current.setAttribute('playsinline', 'true');
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play();
              startScanning();
            }
          };
        }
      } catch (err: any) {
        if (err.message === 'NOT_HTTPS') {
          setError('ฟังก์ชันกล้องต้องใช้งานผ่าน HTTPS เท่านั้น');
        } else if (err.name === 'NotAllowedError') {
          setError('ไม่อนุญาตให้ใช้งานกล้อง กรุณาตั้งค่าอนุญาตในเบราว์เซอร์');
        } else if (err.name === 'NotFoundError') {
          setError('ไม่พบกล้องบนอุปกรณ์นี้');
        } else {
          setError(`ไม่สามารถเปิดกล้องได้: ${err.message}`);
        }
      }
    };

    const startScanning = async () => {
      scanningRef.current = true;
      const video = videoRef.current;
      if (!video) return;

      // Try BarcodeDetector first
      if ('BarcodeDetector' in window) {
        try {
          const detector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'upc_a', 'code_128']
          });
          
          const detectLoop = async () => {
            if (!scanningRef.current) return;
            try {
              if (video.readyState === video.HAVE_ENOUGH_DATA) {
                const barcodes = await detector.detect(video);
                if (barcodes.length > 0) {
                  handleDetected(barcodes[0].rawValue);
                }
              }
            } catch (e) {
              // ignore
            }
            if (scanningRef.current) {
              animationRef.current = requestAnimationFrame(detectLoop);
            }
          };
          detectLoop();
          return; // Successfully started BarcodeDetector
        } catch (e) {
          console.warn('BarcodeDetector initialization failed, falling back to ZXing', e);
        }
      }

      // Fallback to ZXing
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.CODE_128
      ]);
      
      const reader = new BrowserMultiFormatReader(hints);
      readerRef.current = reader;
      
      try {
        reader.decodeFromVideoElement(video).then((result: any) => {
          if (!scanningRef.current) return;
          if (result) {
            handleDetected(result.getText());
          }
        }).catch((_err: any) => {
          // Continuous scanning throws errors on no barcode, just ignore
        });
      } catch (e) {
        console.error('ZXing error', e);
      }
    };

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, [isOpen, handleDetected, stopCamera]);

  const toggleTorch = async () => {
    const track = trackRef.current;
    if (track) {
      try {
        const nextState = !isTorchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState } as any]
        });
        setIsTorchOn(nextState);
      } catch (e) {
        console.error('Failed to toggle torch', e);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-gray-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-900/80 absolute top-0 left-0 right-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsContinuous(!isContinuous)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isContinuous 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              <RefreshCcw className={`w-3 h-3 ${isContinuous ? 'animate-spin-slow' : ''}`} />
              {isContinuous ? 'สแกนต่อเนื่อง (เปิด)' : 'สแกนชิ้นเดียว'}
            </button>
            {isTorchSupported && (
              <button
                onClick={toggleTorch}
                className={`p-1.5 rounded-full transition-colors ${
                  isTorchOn ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {isTorchOn ? <Flashlight className="w-4 h-4" /> : <FlashlightOff className="w-4 h-4" />}
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Camera Area */}
        <div className="relative aspect-[3/4] sm:aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
          {error ? (
            <div className="text-center p-6 text-rose-400">
              <p className="font-bold mb-2">เกิดข้อผิดพลาด</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
              />
              {/* Scanner Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col">
                <div className="flex-1 bg-black/40"></div>
                <div className="flex">
                  <div className="w-8 sm:w-16 bg-black/40"></div>
                  <div className="flex-1 relative aspect-[2/1] border-2 border-[#00b6d5]/50">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#00b6d5] -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#00b6d5] -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#00b6d5] -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#00b6d5] -mb-1 -mr-1"></div>
                    {/* Scanning line animation */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_2px_rgba(244,63,94,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                  <div className="w-8 sm:w-16 bg-black/40"></div>
                </div>
                <div className="flex-1 bg-black/40"></div>
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 bg-gray-900 text-center">
          <p className="text-gray-400 text-sm font-medium">
            จัดบาร์โค้ดให้อยู่ในกรอบเพื่อสแกน
          </p>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
