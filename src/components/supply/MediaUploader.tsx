"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { compressImage, needsCompression } from "@/utils/imageCompression";

interface MediaUploaderProps {
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
  photoPreview: string | null;
  className?: string;
}

export default function MediaUploader({
  onPhotoChange,
  photoPreview,
  className = "",
}: MediaUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Open camera using Media Devices API
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Use back camera on mobile
        audio: false,
      });
      
      setCameraStream(stream);
      setShowModal(false);
      setShowCameraModal(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Tidak dapat mengakses kamera. Pastikan Anda memberikan izin akses kamera.");
    }
  };

  // Capture photo from camera
  const capturePhoto = async () => {
    if (!cameraVideoRef.current || !canvasRef.current) return;

    setIsCompressing(true);
    try {
      const video = cameraVideoRef.current;
      const canvas = canvasRef.current;

      // Set canvas size (resize if too large)
      let width = video.videoWidth;
      let height = video.videoHeight;
      const maxDimension = 1920;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height / width) * maxDimension;
          width = maxDimension;
        } else {
          width = (width / height) * maxDimension;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw video frame to canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);

        // Convert canvas to blob with compression
        canvas.toBlob(async (blob) => {
          if (blob) {
            let file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
            
            // Compress if needed
            if (needsCompression(file)) {
              console.log("Compressing camera photo...");
              file = await compressImage(file);
            }
            
            const previewUrl = URL.createObjectURL(file);
            onPhotoChange(file, previewUrl);
            closeCamera();
          }
          setIsCompressing(false);
        }, "image/jpeg", 0.8);
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      alert("Gagal mengambil foto. Silakan coba lagi.");
      setIsCompressing(false);
    }
  };

  // Close camera and stop stream
  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  // Handle photo upload from gallery
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Ukuran foto maksimal 10MB");
        return;
      }

      setIsCompressing(true);
      try {
        // Compress image using utility
        let processedFile = file;
        if (needsCompression(file)) {
          console.log("Compressing uploaded photo...");
          processedFile = await compressImage(file);
        }

        const reader = new FileReader();
        reader.onload = () => {
          onPhotoChange(processedFile, reader.result as string);
          setShowModal(false);
          setIsCompressing(false);
        };
        reader.readAsDataURL(processedFile);
      } catch (error) {
        console.error("Error processing photo:", error);
        alert("Gagal memproses foto. Silakan coba lagi.");
        setIsCompressing(false);
      }
    }
  };

  // Remove photo
  const removePhoto = () => {
    onPhotoChange(null, null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  return (
    <div className={className}>
      {/* Preview Section */}
      {photoPreview && (
        <div className="mb-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#A3AF87]/30 shadow-lg bg-black">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-3 right-3 p-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-[#A3AF87]/90 backdrop-blur-sm text-white rounded-full text-xs font-medium flex items-center gap-1.5 z-10">
              <Check className="h-3.5 w-3.5" />
              Foto Tersimpan
            </div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      {!photoPreview && (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="w-full mb-4 relative overflow-hidden p-8 bg-gradient-to-br from-[#A3AF87] to-[#8a9b73] text-white rounded-2xl hover:shadow-xl transition-all group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <ImageIcon className="h-12 w-12 mx-auto mb-3 group-hover:scale-110 transition-transform relative z-10" />
          <p className="font-bold text-lg relative z-10">Upload Foto Sampah</p>
          <p className="text-sm text-white/80 mt-1 relative z-10">
            Ambil foto atau pilih dari galeri
          </p>
        </button>
      )}

      {/* Modern Info Box */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 rounded-2xl p-4 shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Camera className="h-4 w-4 text-amber-700" />
                <h4 className="font-bold text-amber-900 text-sm">
                  Wajib Upload Foto!
                </h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed mb-3">
                Tolong foto sampah di lokasi yang akan di-pickup. Ini membantu kurir menemukan sampah Anda dengan mudah.
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
                <span className="px-2.5 py-1.5 bg-white/70 text-amber-800 rounded-lg font-medium flex items-center gap-1.5 shadow-sm">
                  <ImageIcon className="h-3 w-3" />
                  Foto max 5MB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Input */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Hidden Canvas for Camera Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Modal for Photo/Video Selection */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl p-6 w-full sm:max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Pilih Sumber Foto
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Camera Option */}
                <button
                  type="button"
                  onClick={openCamera}
                  className="w-full p-5 bg-gradient-to-br from-[#A3AF87] to-[#8a9b73] text-white rounded-2xl hover:shadow-lg transition-all group flex items-center gap-4"
                >
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Camera className="h-7 w-7" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-base">Buka Kamera</p>
                    <p className="text-xs text-white/80 mt-0.5">
                      Ambil foto langsung
                    </p>
                  </div>
                </button>

                {/* Gallery Option */}
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full p-5 bg-white border-2 border-[#A3AF87]/30 rounded-2xl hover:border-[#A3AF87] hover:bg-[#A3AF87]/5 transition-all group flex items-center gap-4"
                >
                  <div className="p-3 bg-[#A3AF87]/10 rounded-xl">
                    <Upload className="h-7 w-7 text-[#A3AF87]" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-base text-gray-900">
                      Upload dari Galeri
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Pilih foto yang sudah ada
                    </p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-4 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors"
              >
                Batal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            {/* Camera View */}
            <div className="flex-1 relative">
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Close Button */}
              <button
                onClick={closeCamera}
                className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Info Text */}
              <div className="absolute top-4 left-4 right-16 bg-black/50 backdrop-blur-sm text-white px-4 py-3 rounded-2xl">
                <p className="text-sm font-medium">Posisikan sampah di dalam frame</p>
              </div>
            </div>

            {/* Capture Button */}
            <div className="p-6 bg-black/90 backdrop-blur-sm">
              <button
                onClick={capturePhoto}
                disabled={isCompressing}
                className="w-full py-4 bg-gradient-to-r from-[#A3AF87] to-[#8a9b73] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Camera className="h-6 w-6" />
                    Ambil Foto
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
