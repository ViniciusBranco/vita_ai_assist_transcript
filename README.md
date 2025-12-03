# [Vita.AI](http://vita.ai/) - Assistente de Prontuário Inteligente

O [**Vita.AI**](http://vita.ai/) é uma solução de Inteligência Artificial Generativa local projetada para clínicas médicas e odontológicas. O sistema atua como um assistente virtual no WhatsApp, recebendo áudios de consultas, transcrevendo-os e estruturando automaticamente os dados em prontuários clínicos (Anamnese e Evolução) para revisão posterior via Interface Web.

![Status](https://img.shields.io/badge/Status-MVP%20Completed-success)

![Stack](https://img.shields.io/badge/AI-Local%20LLM%20(Qwen)-blue)
![Stack](https://img.shields.io/badge/LangChain-ffffff?logo=langchain&logoColor=green)


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