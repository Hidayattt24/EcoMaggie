"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  Film,
  ImageIcon,
  MapPin,
  Info,
  Clock,
} from "lucide-react";

interface MediaUploaderProps {
  onPhotoChange: (file: File | null, previewUrl: string | null) => void;
  onVideoChange: (file: File | null, previewUrl: string | null, duration: number) => void;
  photoPreview: string | null;
  videoPreview: string | null;
  className?: string;
}

export default function MediaUploader({
  onPhotoChange,
  onVideoChange,
  photoPreview,
  videoPreview,
  className = "",
}: MediaUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"photo" | "video">("photo");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
  const capturePhoto = () => {
    if (!cameraVideoRef.current || !canvasRef.current) return;

    const video = cameraVideoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
          const previewUrl = URL.createObjectURL(blob);
          onPhotoChange(file, previewUrl);
          closeCamera();
        }
      }, "image/jpeg", 0.9);
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
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        onPhotoChange(file, reader.result as string);
        setShowModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError(null);

    // Check file size (max 5MB for consistency)
    if (file.size > 5 * 1024 * 1024) {
      setVideoError("Ukuran video maksimal 5MB");
      return;
    }

    // Create video element to check duration
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      
      // Check duration (max 60 seconds)
      if (video.duration > 60) {
        setVideoError("Durasi video maksimal 60 detik");
        return;
      }

      // All checks passed
      const previewUrl = URL.createObjectURL(file);
      onVideoChange(file, previewUrl, Math.floor(video.duration));
      setShowModal(false);
    };

    video.src = URL.createObjectURL(file);
  };

  // Remove photo
  const removePhoto = () => {
    onPhotoChange(null, null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  // Remove video
  const removeVideo = () => {
    onVideoChange(null, null, 0);
    if (videoInputRef.current) videoInputRef.current.value = "";
    setVideoError(null);
  };

  // Open modal for photo
  const openPhotoModal = () => {
    setModalType("photo");
    setShowModal(true);
  };

  // Open modal for video
  const openVideoModal = () => {
    setModalType("video");
    setShowModal(true);
  };

  return (
    <div className={className}>
      {/* Preview Section */}
      {(photoPreview || videoPreview) && (
        <div className="mb-4">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-[#A3AF87]/30 shadow-lg bg-black">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            {videoPreview && (
              <video
                ref={videoRef}
                src={videoPreview}
                controls
                className="w-full h-full object-contain"
              />
            )}
            <button
              type="button"
              onClick={() => {
                if (photoPreview) removePhoto();
                if (videoPreview) removeVideo();
              }}
              className="absolute top-3 right-3 p-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-[#A3AF87]/90 backdrop-blur-sm text-white rounded-full text-xs font-medium flex items-center gap-1.5 z-10">
              <Check className="h-3.5 w-3.5" />
              {photoPreview ? "Foto" : "Video"} Tersimpan
            </div>
          </div>
        </div>
      )}

      {/* Upload Buttons Grid */}
      {!photoPreview && !videoPreview && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Photo Button */}
          <button
            type="button"
            onClick={openPhotoModal}
            className="relative overflow-hidden p-6 bg-gradient-to-br from-[#A3AF87] to-[#8a9b73] text-white rounded-2xl hover:shadow-xl transition-all group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <ImageIcon className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform relative z-10" />
            <p className="font-bold text-base relative z-10">Foto</p>
            <p className="text-xs text-white/80 mt-1 relative z-10">
              Ambil atau upload
            </p>
          </button>

          {/* Video Button */}
          <button
            type="button"
            onClick={openVideoModal}
            className="relative overflow-hidden p-6 bg-gradient-to-br from-[#A3AF87] to-[#8a9b73] text-white rounded-2xl hover:shadow-xl transition-all group"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Film className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform relative z-10" />
            <p className="font-bold text-base relative z-10">Video</p>
            <p className="text-xs text-white/80 mt-1 relative z-10">
              Max 60 detik
            </p>
          </button>
        </div>
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
                  Wajib Upload Foto atau Video!
                </h4>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed mb-3">
                Tolong foto/video sampah di lokasi yang akan di-pickup. Ini membantu kurir menemukan sampah Anda dengan mudah.
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
                <span className="px-2.5 py-1.5 bg-white/70 text-amber-800 rounded-lg font-medium flex items-center gap-1.5 shadow-sm">
                  <ImageIcon className="h-3 w-3" />
                  Foto max 5MB
                </span>
                <span className="px-2.5 py-1.5 bg-white/70 text-amber-800 rounded-lg font-medium flex items-center gap-1.5 shadow-sm">
                  <Clock className="h-3 w-3" />
                  Video max 60 detik
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Error */}
      {videoError && (
        <div className="mt-3 p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-800 font-medium">{videoError}</p>
        </div>
      )}

      {/* Hidden Inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
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
                  {modalType === "photo" ? "Pilih Sumber Foto" : "Upload Video"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {modalType === "photo" ? (
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
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full p-6 bg-gradient-to-br from-[#A3AF87] to-[#8a9b73] text-white rounded-2xl hover:shadow-lg transition-all group"
                  >
                    <Film className="h-12 w-12 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-lg">Pilih Video</p>
                    <p className="text-sm text-white/80 mt-2">
                      MP4, MOV • Max 5MB • Max 60 detik
                    </p>
                  </button>
                </div>
              )}

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
                className="w-full py-4 bg-gradient-to-r from-[#A3AF87] to-[#8a9b73] text-white rounded-2xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Camera className="h-6 w-6" />
                Ambil Foto
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
