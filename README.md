# [Vita.AI](http://vita.ai/) - Assistente de Prontuário Inteligente

O [**Vita.AI**](http://vita.ai/) é uma solução de Inteligência Artificial Generativa local projetada para clínicas médicas e odontológicas. O sistema atua como um assistente virtual no WhatsApp, recebendo áudios de consultas, transcrevendo-os e estruturando automaticamente os dados em prontuários clínicos (Anamnese e Evolução) para revisão posterior via Interface Web.

![Status](https://img.shields.io/badge/Status-MVP%20Completed-success)

![Stack](https://img.shields.io/badge/AI-Local%20LLM%20(Qwen)-blue)
![Stack](https://img.shields.io/badge/LangChain-ffffff?logo=langchain&logoColor=green)

[![Google Assistant](https://img.shields.io/badge/Google%20Assistant-4285F4?logo=googleassistant&logoColor=fff)](#)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-886FBF?logo=googlegemini&logoColor=fff)](#)
[![Ollama](https://img.shields.io/badge/Ollama-fff?logo=ollama&logoColor=000)](#)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-FFD21E?logo=huggingface&logoColor=000)](#)
[![LangChain](https://img.shields.io/badge/LangChain-1c3c3c.svg?logo=langchain&logoColor=white)](#)

[![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?logo=postgresql&logoColor=white)](#)
[![ReadMe](https://img.shields.io/badge/ReadMe-018EF5?logo=readme&logoColor=fff)](#)
[![CUDA](https://img.shields.io/badge/CUDA-76B900?logo=nvidia&logoColor=fff)](#)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-009485.svg?logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
[![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](#)

[![CSS](https://img.shields.io/badge/CSS-639?logo=css&logoColor=fff)](#)
[![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)](#)
[![JSON](https://img.shields.io/badge/JSON-000?logo=json&logoColor=fff)](#)
[![Markdown](https://img.shields.io/badge/Markdown-%23000000.svg?logo=markdown&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=fff)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](#)
[![YAML](https://img.shields.io/badge/YAML-CB171E?logo=yaml&logoColor=fff)](#)
[![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=fff)](#)


## 🚀 Funcionalidades Principais

- **Transcrição de Voz (ASR):** Utiliza *Faster-Whisper* rodando localmente (CPU/GPU) para converter áudios do WhatsApp em texto.
- **Inteligência Clínica (Agentic AI):** Utiliza *LangGraph* e *Qwen 2.5 7B* para analisar o texto, separar "Anamnese" de "Evolução" e extrair procedimentos técnicos estruturados.
- **Fluxo WhatsApp:** Integração via *WAHA (WhatsApp HTTP API)* para receber áudios e notificar o profissional.
- **Persistência:** Armazenamento relacional com *PostgreSQL* (dados JSONB para flexibilidade de schema).
- **Interface de Revisão:** Frontend *React + Tailwind v4* para que o médico valide e edite o prontuário gerado pela IA.

## 🏗️ Arquitetura Técnica

O projeto segue uma arquitetura de microsserviços via Docker Compose:

1. **Backend (FastAPI):** Orquestrador, API REST e Webhooks.
2. **Frontend (Vite/React):** UI para upload manual e revisão de prontuários (`/record/:id`).
3. **AI Engine (Ollama):** Servidor de inferência rodando Qwen 2.5 7B (GPU Passthrough).
4. **Database (PostgreSQL):** Persistência de dados.
5. **Gateway (WAHA):** Conexão com a rede do WhatsApp.

## 🛠️ Requisitos de Hardware (Local)

- **GPU:** NVIDIA com no mínimo 6GB VRAM (Recomendado: GTX 1060 ou superior/T4 em Cloud).
- **RAM:** 16GB+ (Recomendado 32GB+ para rodar Docker + Ollama confortavelmente).
- **Disk:** SSD com ~20GB livres para imagens Docker e Modelos LLM.

## 📦 Instalação e Execução

### 1. Configuração Inicial

Clone o repositório e crie o arquivo de variáveis de ambiente:

```bash
cp .env.example .env
# Edite o .env com suas configurações (WAHA_API_KEY, etc)
```

### 2. Preparar Modelos de IA

É necessário ter o **Ollama** instalado no host ou usar o container dedicado. Baixe os modelos necessários:

```bash
# No host ou dentro do container Ollama
ollama pull qwen2.5:7b
```

**3. Executar com Docker Compose**

```bash
# Build e Start (Modo Detached)
docker-compose up --build -d
```

O sistema estará disponível em:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/docs
- **WAHA Dashboard:** http://localhost:3000/dashboard

## 🧪 Como Testar (Simulação)

Para validar o fluxo sem conectar um WhatsApp real imediatamente:

1. Inicie um servidor de arquivos na raiz para servir o áudio de teste:

```bash
python -m http.server 9000
```

1. Execute o script de simulação de Webhook

```bash
python test_webhook_simulation.py
```

1. Acesse o link gerado nos logs para visualizar o prontuário no Frontend.

## 🛡️ Segurança e Privacidade

- **100% Local:** Nenhum áudio ou texto é enviado para APIs externas (OpenAI/Anthropic). Tudo roda na sua infraestrutura.
- **Isolamento:** Containers Docker em rede interna.

## 📜 Licença

Proprietário.