export const getRecordSummary = (record: any): string => {
    if (!record || !record.structured_content) {
        return "Atendimento Registrado";
    }

    const sc = record.structured_content;
    // Helper to safely access nested or flat properties
    const get = (obj: any, key: string) => obj?.[key];

    // Priority 1: Queixa Principal (Anamnese)
    // Check nested under 'anamnese' or 'data.anamnese' or flat
    const anamnese = sc.anamnese || sc;
    const queixa = get(anamnese, 'queixa_principal') || get(anamnese, 'queixaPrincipal');
    if (queixa) return queixa;

    // Priority 2: Procedimentos (Evolução)
    const evolucao = sc.evolucao || sc;
    const procRaw = get(evolucao, 'procedimentos') || get(evolucao, 'procedimentos_realizados') || get(evolucao, 'procedimentosRealizados');

    if (procRaw) {
        const procList = Array.isArray(procRaw) ? procRaw : [procRaw];
        const procText = procList.join(', ');
        if (procText) return `Proc: ${procText}`;
    }

    // Priority 3: Observações (Evolução)
    const observacoes = get(evolucao, 'observacoes') || get(evolucao, 'clinical_notes');
    if (observacoes) {
        return observacoes.length > 60
            ? `${observacoes.substring(0, 60)}...`
            : observacoes;
    }

    // Fallback
    return "Atendimento Registrado";
};
