# Vita.AI - Transcription App

Este projeto visa o desenvolvimento de uma aplicação de transcrição de áudio para clínicas odontológicas, auxiliando na criação de prontuários médicos.

## Stack Tecnológica

- **Frontend**: React (Vite) + Tailwind CSS v4
- **Backend**: FastAPI + Poetry + LangChain/LangGraph
- **IA**: Local Whisper (ASR) + Local Ollama (Llama 3.1 8B)
- **Infraestrutura**: Docker Compose
- **Banco de Dados**: PostgreSQL

## Como Executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Ollama instalado localmente (para LLM)

### Iniciar o Ambiente

```bash
# Primeira vez ou quando dependências mudam
docker-compose up --build

# Desenvolvimento (mais rápido, usa cache)
docker-compose up
```

**Nota**: O Dockerfile foi otimizado para cache. Use `--build` apenas quando:
- Alterar `pyproject.toml` ou `package.json`
- Adicionar novas dependências

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Backlog de Atividades

### 24/11/2025
- **Inicialização do Projeto**: Estrutura base criada.
- **Stack Definida**:
    - **Frontend**: React (Vite) + Tailwind CSS v4.
    - **Backend**: FastAPI + Poetry + LangChain/LangGraph.
    - **IA**: Local Whisper (ASR) + Local Ollama (Llama 3.1 8B).
    - **Infra**: Docker Compose.
- **Implementação Inicial**:
    - ✅ **Backend**: API de upload, integração Whisper + Ollama + LangChain completa.
    - ✅ **Frontend**: Tela de upload com Drag & Drop implementada.
    - ✅ **Docker**: Ambiente completo configurado (Frontend + Backend + PostgreSQL).
- **Integração Frontend-Backend**:
    - ✅ **API Integration**: Frontend conectado ao endpoint `/api/upload`.
    - ✅ **CORS**: Configurado para permitir requisições do frontend.
    - ✅ **Suporte .ogg**: Arquivos do WhatsApp totalmente suportados.
    - ✅ **Testes**: Transcrição verificada com arquivo real do WhatsApp.
- **Otimizações**:
    - ✅ **Docker Layer Caching**: Builds 40x mais rápidas (427s → ~10s).
    - ✅ **Documentação**: Implementation Plan e Task.md finalizados.
- **Status**: ✅ **PoC Completa e Operacional**.
- **Updated**: 2025-11-24
