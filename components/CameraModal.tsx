import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import CloseIcon from './icons/CloseIcon';
import CameraIcon from './icons/CameraIcon';
import { useI18n } from '../hooks/useI18n';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPhotoTaken: (dataUri: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onPhotoTaken }) => {
    const { t } = useI18n();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        if (stream) return;
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access the camera. Please check permissions.");
        }
    }, [stream]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isOpen, startCamera, stopCamera]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const dataUri = canvas.toDataURL('image/jpeg');
            onPhotoTaken(dataUri);
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-900/60 flex flex-col overflow-hidden max-w-lg w-full m-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
                    <h3 className="text-xl font-bold text-white">{t('cameraModalTitle')}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4">
                    {error ? (
                        <p className="text-red-400 text-center">{error}</p>
                    ) : (
                        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        </div>
                    )}
                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
                <div className="p-4 border-t border-purple-500/30 flex justify-center items-center gap-4">
                     <button
                        onClick={handleCapture}
                        disabled={!stream || !!error}
                        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CameraIcon className="w-5 h-5"/>
                        {t('captureButton')}
                    </button>
                    <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        {t('cancelButton')}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CameraModal;
