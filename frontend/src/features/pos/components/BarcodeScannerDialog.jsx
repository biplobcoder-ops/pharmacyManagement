/* eslint-disable no-unused-vars */
// src/features/pos/components/BarcodeScannerDialog.jsx
// Webcam barcode scanner — html5-qrcode
// ✅ FIXED: Cleanup race condition + no camera error + "cause" error swallowed

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera, X, Loader2, CheckCircle2, Zap, ZapOff, CameraOff
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function BarcodeScannerDialog({
  open,
  onOpenChange,
  onScanSuccess
}) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState(null);
  const [error, setError] = useState(null);
  const [torchOn, setTorchOn] = useState(false);

  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const startTimeoutRef = useRef(null);

  // ✅ Start scanner when dialog opens
  useEffect(() => {
    if (!open) return;

    isMountedRef.current = true;
    isProcessingRef.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastScanned(null);
    setError(null);
    setIsScanning(false);
    setTorchOn(false);

    const elementId = 'barcode-scanner-view';

    const startScanner = async () => {
      try {
        // Wait for DOM element to render
        await new Promise((r) => {
          startTimeoutRef.current = setTimeout(r, 300);
        });

        if (!isMountedRef.current) return;

        const element = document.getElementById(elementId);
        if (!element) {
          console.warn('Scanner element not found');
          return;
        }

        // ✅ Check if camera is available
        let devices = [];
        try {
          devices = await Html5Qrcode.getCameras();
        } catch (camErr) {
          if (
            camErr?.name === 'NotAllowedError' ||
            camErr?.message?.includes('Permission')
          ) {
            throw new Error(
              'Camera permission denied. Please allow camera access in browser settings.', { cause: camErr }
            );
          }
          if (
            camErr?.name === 'NotFoundError' ||
            camErr?.message?.includes('Requested device not found')
          ) {
            throw new Error('No camera detected on this device.', { cause: camErr });
          }
          // For other errors, proceed anyway
          devices = [];
        }

        if (!devices || devices.length === 0) {
          throw new Error(
            'No camera detected. Please connect a webcam or use manual barcode entry.'
          );
        }

        if (!isMountedRef.current) return;

        // ✅ Create scanner instance
        const html5QrCode = new Html5Qrcode(elementId, {
          verbose: false
        });
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777,
          formatsToSupport: [0, 1, 2, 3, 4, 5, 6, 7],
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          }
        };

        // ✅ Start scanner — wrap in try-catch
        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isProcessingRef.current) return;
            isProcessingRef.current = true;

            setLastScanned(decodedText);

            if (navigator.vibrate) {
              try {
                navigator.vibrate(100);
              } catch (e) {
                // ignore
              }
            }

            setTimeout(() => {
              if (isMountedRef.current) {
                onScanSuccess?.(decodedText);
                onOpenChange(false);
              }
            }, 400);
          },
          () => {
            // Scan fail (normal)
          }
        );

        if (isMountedRef.current) {
          setIsScanning(true);
        }
      } catch (err) {
        // ✅ Silent error — no console spam
        let errorMsg = 'Failed to start camera.';

        const msg = err?.message || '';

        if (msg.includes('No camera detected') || msg.includes('NotFoundError')) {
          errorMsg =
            'No camera detected. Please connect a webcam or use manual barcode entry.';
        } else if (msg.includes('Permission') || msg.includes('NotAllowed')) {
          errorMsg = 'Camera permission denied. Please allow camera access.';
        } else if (msg.includes('NotReadableError')) {
          errorMsg = 'Camera is already in use by another application.';
        } else if (msg.includes('OverconstrainedError')) {
          errorMsg = 'Camera does not support required settings.';
        } else if (msg) {
          errorMsg = msg;
        }

        if (isMountedRef.current) {
          setError(errorMsg);
          setIsScanning(false);
        }
      }
    };

    startScanner();

    // ✅ CLEANUP — swallow ALL errors
    return () => {
      isMountedRef.current = false;
      isProcessingRef.current = false;

      // Clear pending timeout
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
        startTimeoutRef.current = null;
      }

      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (!scanner) return;

      // ✅ Wrap everything in try-catch to prevent crashes
      try {
        let state = null;
        try {
          state = scanner.getState?.();
        } catch (e) {
          // ignore
        }

        // State: 1 = NOT_STARTED, 2 = SCANNING, 3 = PAUSED
        if (state === 2 || state === 3) {
          scanner
            .stop()
            .then(() => {
              try {
                scanner.clear();
              } catch (e) {
                // ignore
              }
            })
            .catch(() => {
              // ✅ Silently ignore — "cause" error ata theke
            });
        } else {
          try {
            scanner.clear();
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // ✅ Silently ignore ALL cleanup errors
      }
    };
  }, [open, onOpenChange, onScanSuccess]);

  const handleClose = () => {
    if (isProcessingRef.current && lastScanned) {
      return;
    }
    onOpenChange(false);
  };

  const toggleTorch = async () => {
    try {
      if (!scannerRef.current) return;
      const capabilities = scannerRef.current.getRunningTrackCapabilities?.();
      if (capabilities?.torch) {
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      // Silent
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Camera className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base">Scan Barcode</DialogTitle>
              <DialogDescription className="text-xs">
                Point your camera at the barcode
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scanner view */}
        <div className="relative bg-black">
          <div
            id="barcode-scanner-view"
            className="w-full aspect-video bg-black"
          />

          {/* Scanning frame */}
          {isScanning && !lastScanned && !error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-64 h-32">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br" />
                <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
              </div>
            </div>
          )}

          {/* Success */}
          {lastScanned && (
            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-sm">Scanned!</p>
                <p className="text-white/80 text-xs font-mono mt-1">
                  {lastScanned}
                </p>
              </div>
            </div>
          )}

          {/* Loading */}
          {!isScanning && !error && !lastScanned && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                <p className="text-white/80 text-xs">Starting camera...</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
              <div className="text-center max-w-sm">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/20 mb-3">
                  <CameraOff className="h-7 w-7 text-destructive" />
                </div>
                <p className="text-white font-semibold text-sm mb-1">
                  Camera Unavailable
                </p>
                <p className="text-white/70 text-xs leading-relaxed">{error}</p>
                <p className="text-white/50 text-[10px] mt-3">
                  💡 Tip: Use manual barcode entry in the search box instead
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            Supports: EAN-13, UPC, Code 128, QR
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTorch}
              disabled={!isScanning || !!error}
              className="h-8"
            >
              {torchOn ? (
                <ZapOff className="h-3.5 w-3.5" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="h-8"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}