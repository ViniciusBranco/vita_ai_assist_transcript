import React, { useState, useCallback } from 'react';
import { UploadCloud, FileAudio, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FileDropzoneProps {
    onFileSelect: (file: File | null) => void;
    selectedFile: File | null;
}

export function FileDropzone({ onFileSelect, selectedFile }: FileDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                const file = files[0];
                const fileName = file.name.toLowerCase();
                const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.mp4', '.webm'];
                const isValid = validExtensions.some(ext => fileName.endsWith(ext));

                if (isValid) {
                    onFileSelect(file);
                } else {
                    alert('Por favor, envie um arquivo de áudio válido (MP3, WAV, M4A, OGG, MP4, WEBM).');
                }
            }
        },
        [onFileSelect]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                onFileSelect(e.target.files[0]);
            }
        },
        [onFileSelect]
    );

    const removeFile = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onFileSelect(null);
        },
        [onFileSelect]
    );

    return (
        <div
            className={cn(
                'relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out',
                isDragging
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                    : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-slate-50',
                selectedFile ? 'border-solid border-blue-200 bg-blue-50/30' : ''
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
        >
            <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="audio/*,video/*,.ogg"
                onChange={handleFileInput}
            />

            {selectedFile ? (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                        <FileAudio className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-semibold text-slate-900">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500 mt-1">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                        onClick={removeFile}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center p-6">
                    <div
                        className={cn(
                            'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300',
                            isDragging ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 shadow-sm'
                        )}
                    >
                        <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                        Arraste e solte seu áudio aqui
                    </h3>
                    <p className="text-slate-500 mt-2 text-sm max-w-xs">
                        Suporta MP3, WAV, M4A, OGG, MP4, WEBM (max. 500MB)
                    </p>
                    <div className="mt-6">
                        <span className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 shadow-sm group-hover:border-blue-300 group-hover:text-blue-600 transition-all">
                            Ou clique para selecionar
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
