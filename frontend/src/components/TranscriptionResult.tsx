import { FileText, Sparkles } from 'lucide-react';

interface TranscriptionResultProps {
    transcription: string;
    analysis: string;
}

export function TranscriptionResult({ transcription, analysis }: TranscriptionResultProps) {
    return (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Transcription Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Transcrição</h2>
                </div>
                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{transcription}</p>
                </div>
            </div>

            {/* Analysis Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-slate-900">Análise IA</h2>
                </div>
                <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{analysis}</p>
                </div>
            </div>
        </div>
    );
}
