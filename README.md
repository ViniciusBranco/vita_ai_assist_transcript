# Vita.AI - Assistente de Prontuário Inteligente 🦷🤖

> **Transforme áudios de consulta em prontuários estruturados automaticamente via WhatsApp.**

O **Vita.AI** é uma plataforma SaaS *Open Source* que utiliza Inteligência Artificial Generativa Local para revolucionar a rotina de dentistas e médicos. O sistema escuta, transcreve, entende e organiza o atendimento clínico em segundos, garantindo segurança de dados e agilidade.

![Status](https://img.shields.io/badge/Status-MVP%20Completed-success)
![Stack](https://img.shields.io/badge/AI%20Agent-Local%20LLM%20(Qwen%202.5:7B)-violet)
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

## ✨ Funcionalidades Principais

* 🎙️ **Transcrição de Alta Fidelidade:** Motor *Faster-Whisper* otimizado para português brasileiro e termos técnicos odontológicos.
* 🧠 **Inteligência Clínica:** Agente *LangGraph* que classifica o atendimento (Anamnese/Evolução), extrai sintomas, procedimentos e medicamentos.
* 🆔 **Gestão de Identidade:** Detecção automática de CPF e Nome para criação ou atualização de pacientes.
* 📱 **Integração WhatsApp:** Envie o áudio no app e receba a confirmação instantânea.
* 💻 **Dashboard Profissional:** Interface React para revisão, edição e gestão de histórico clínico (Timeline).

## 🏗️ Arquitetura (Microsserviços)

O projeto roda inteiramente em containers Docker, garantindo portabilidade e fácil deploy.

1.  **Backend (FastAPI):** API REST, SQLAlchemy (Postgres), Alembic (Migrações) e LangChain (Lógica de Agente).
2.  **Frontend (React + Vite):** SPA moderna com TailwindCSS v4, Axios e Lucide Icons.
3.  **AI Engine (Ollama):** Servidor de inferência local rodando Qwen 2.5 7B (GPU recommended).
4.  **Database (PostgreSQL):** Persistência relacional robusta com JSONB para flexibilidade de schema.
5.  **WhatsApp Gateway (WAHA):** Conexão via socket com a API do WhatsApp.

## 🚀 Como Rodar (Local)

### Pré-requisitos
* Docker & Docker Compose
* NVIDIA GPU (Recomendado para performance de transcrição/LLM)
* 16GB+ RAM

### Passo a Passo

1.  **Clone e Configure:**
    ```bash
    git clone [https://github.com/seu-usuario/vita-ai.git](https://github.com/seu-usuario/vita-ai.git)
    cp .env.example .env
    # Ajuste WAHA_API_KEY e configurações de banco no .env
    ```

2.  **Inicie a Infraestrutura:**
    ```bash
    docker compose up -d --build
    ```

3.  **Conecte o WhatsApp:**
    * Acesse `http://localhost:3000/dashboard`
    * Escaneie o QR Code com seu WhatsApp.

4.  **Acesse o Sistema:**
    * Frontend: `http://localhost:5173`
    * Backend Docs: `http://localhost:8000/docs`

## 🧪 Como Testar (Simulação)

Para validar sem conectar um celular real:

1.  Coloque um arquivo de áudio (`teste.ogg`) na pasta raiz.
2.  Inicie o servidor de arquivos local: `python -m http.server 9000`.
3.  Execute o script de teste:
    ```bash
    python test_webhook_simulation.py teste.ogg
    ```
4.  Verifique o resultado no Dashboard.

## 🛡️ Segurança e Privacidade

* **100% Local:** Nenhum dado de áudio ou texto sai do seu servidor para APIs de terceiros (OpenAI/Google).
* **Dados Estruturados:** CPF e dados sensíveis são tratados com rigor no banco de dados.

---
*Desenvolvido com 💙 e IA.*