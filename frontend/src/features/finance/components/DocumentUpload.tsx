
import React, { useState, useCallback } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface DocumentUploadProps {
    onFilesSelect: (files: File[]) => void;
}

export function DocumentUpload({ onFilesSelect }: DocumentUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
                const newFiles = [...selectedFiles, ...files];
                setSelectedFiles(newFiles);
                onFilesSelect(newFiles);
            }
        },
        [selectedFiles, onFilesSelect]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                const files = Array.from(e.target.files);
                const newFiles = [...selectedFiles, ...files];
                setSelectedFiles(newFiles);
                onFilesSelect(newFiles);
            }
        },
        [selectedFiles, onFilesSelect]
    );

    const removeFile = useCallback(
        (index: number) => {
            const newFiles = selectedFiles.filter((_, i) => i !== index);
            setSelectedFiles(newFiles);
            onFilesSelect(newFiles);
        },
        [selectedFiles, onFilesSelect]
    );

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    'relative group cursor-pointer flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out',
                    isDragging
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-white',
                    selectedFiles.length > 0 ? 'border-blue-200' : ''
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('finance-upload')?.click()}
            >
                <input
                    id="finance-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInput}
                />

                <div className="flex flex-col items-center text-center p-6">
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-300",
                        isDragging ? "bg-blue-100 text-blue-600" : "bg-white text-slate-400 shadow-sm"
                    )}>
                        <UploadCloud className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">Upload de Documentos</h3>
                    <p className="text-slate-500 mt-1 text-sm">
                        Arraste ou clique para selecionar PDF, CSV ou OFX.
                    </p>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div className="grid grid-cols-1 gap-2">
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm animate-in fade-in slide-in-from-left-2 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
