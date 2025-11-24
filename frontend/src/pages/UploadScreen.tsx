import { useState } from 'react';
import { FileDropzone } from '../components/FileDropzone';
import { Button } from '../components/ui/Button';
import { TranscriptionResult } from '../components/TranscriptionResult';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { uploadAudioFile, type UploadResponse } from '../api/upload';

export default function UploadScreen() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<UploadResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTranscribe = async () => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await uploadAudioFile(file);
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao processar o arquivo');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-2xl mb-4">
                        <span className="px-3 py-1 bg-white rounded-xl text-xs font-semibold text-blue-700 shadow-sm border border-blue-100">
                            Vita.AI Transcription
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-3">
                        Transforme suas consultas em texto
                    </h1>
                    <p className="text-lg text-slate-600 max-w-lg mx-auto">
                        Upload rápido, transcrição precisa e organização inteligente para sua clínica odontológica.
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-white p-8">
                    {!result ? (
                        <>
                            <FileDropzone onFileSelect={setFile} selectedFile={file} />

                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-red-900">Erro no processamento</h3>
                                        <p className="text-sm text-red-700 mt-1">{error}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex justify-end items-center gap-4 border-t border-slate-100 pt-6">
                                <div className="text-sm text-slate-500">
                                    {isLoading ? 'Processando...' : file ? 'Pronto para processar' : 'Aguardando arquivo...'}
                                </div>
                                <Button
                                    size="lg"
                                    disabled={!file || isLoading}
                                    onClick={handleTranscribe}
                                    className="gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5" />
                                            Transcrever Agora
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div>
                            <TranscriptionResult
                                transcription={result.transcription}
                                analysis={result.llm_analysis}
                            />
                            <div className="mt-8 flex justify-center">
                                <Button onClick={handleReset} variant="secondary" size="lg">
                                    Nova Transcrição
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        Segurança garantida • Processamento local • Suporte 24/7
                    </p>
                </div>
            </div>
        </div>
    );
}
