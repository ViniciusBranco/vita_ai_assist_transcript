
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export interface FinanceDocument {
    id: string;
    filename: string;
    uploadDate: string;
    status: 'pending' | 'processed' | 'error';
    type: 'statement' | 'tax_document' | 'other';
    workspaceId: string;
    competence: string;
    amount?: number;
}

export interface GetDocumentsParams {
    workspaceId?: string;
    competence?: string;
}

export const financeApi = {
    getDocuments: async (params: GetDocumentsParams): Promise<FinanceDocument[]> => {
        const response = await api.get<FinanceDocument[]>('/finance/documents', { params });
        return response.data;
    },

    analyzeBatch: async (documentIds: string[]): Promise<void> => {
        await api.post('/finance/analyze-batch', { documentIds });
    },
};
