# Vita.AI - Assistente de Prontuário Inteligente

O **Vita.AI** é uma plataforma de Inteligência Artificial Generativa para clínicas médicas e odontológicas. O sistema atua como um assistente virtual no WhatsApp, recebendo áudios de consultas, transcrevendo-os e estruturando automaticamente os dados em prontuários clínicos (Anamnese e Evolução) para revisão posterior via Interface Web.


![Status](https://img.shields.io/badge/Status-MVP%20Completed-success)
![Stack](https://img.shields.io/badge/AI%20Agent-Local%20LLM%20(Qwen%202.5:7B)-blue)
![Stack](https://img.shields.io/badge/AI-Local%20TTS%20(FasterWhisper:small)-blue)

[![LangChain](https://img.shields.io/badge/LangChain-1c3c3c.svg?logo=langchain&logoColor=white)](#)
[![Ollama](https://img.shields.io/badge/Ollama-fff?logo=ollama&logoColor=000)](#)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?logo=huggingface&logoColor=000)](#)

[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)](#)
[![CUDA](https://img.shields.io/badge/CUDA-76B900?logo=nvidia&logoColor=fff)](#)
[![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](#)
[![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)

![License](https://img.shields.io/badge/License-Proprietary-red)

## 🚀 Funcionalidades (MVP)

- **Transcrição de Voz (ASR):** Motor *Faster-Whisper* rodando localmente (CPU/GPU) para alta fidelidade em português.
- **Inteligência Clínica (Agentic AI):** Agente *LangGraph* com modelo *Qwen 2.5 7B* que analisa o texto, separa intenções ("Anamnese" vs "Evolução") e extrai dados estruturados.
- **Integração WhatsApp:** Gateway *WAHA (WhatsApp HTTP API)* para receber áudios e enviar confirmações diretamente no chat.
- **Persistência:** Banco de dados *PostgreSQL* com suporte a JSONB para schemas flexíveis.
- **Web Interface:** Frontend *React + Tailwind v4* para revisão humana e edição dos prontuários gerados.

## 🏗️ Arquitetura Técnica

O projeto opera em microsserviços via Docker Compose:

| Serviço | Tecnologia | Função |
|---------|------------|--------|
| **Backend** | FastAPI / Python 3.11 | Orquestração, API REST e Agentes LangChain. |
| **Frontend** | React / Vite | Interface de usuário para médicos. |
| **AI Engine** | Ollama | Servidor de inferência para o LLM (Qwen 2.5). |
| **Database** | PostgreSQL 15 | Armazenamento de dados relacionais e documentos. |
| **Gateway** | WAHA (Core) | Conexão via socket com a rede do WhatsApp. |

## 🛠️ Requisitos de Hardware

- **GPU:** NVIDIA (Sugerido: GTX 1060 6GB ou superior / T4 em Cloud).
- **RAM:** Mínimo 16GB (Recomendado 32GB para rodar Ollama + Docker confortavelmente).
- **Docker:** Docker Desktop ou Engine com suporte a NVIDIA Container Toolkit.

## 📦 Instalação e Execução

### 1. Configuração Inicial

Clone o repositório e configure as variáveis de ambiente:

```bash
# Crie o arquivo .env na raiz
WAHA_API_KEY=sua_chave_segura
OLLAMA_MODEL=qwen2.5:7b
OLLAMA_HOST=[http://host.docker.internal:11434](http://host.docker.internal:11434)