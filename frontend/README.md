# Vita.AI - Assistente de Prontuário Inteligente 🦷🤖

> **Transforme áudios de consulta em prontuários estruturados automaticamente via WhatsApp.**

O **Vita.AI** é uma plataforma SaaS **Proprietária** de gestão clínica impulsionada por Inteligência Artificial Generativa Local (Privacy-first). O sistema escuta, transcreve, entende e organiza o atendimento clínico em segundos, garantindo segurança de dados e agilidade para dentistas e médicos.

![Status](https://img.shields.io/badge/Status-Production%20Ready%20(v1.0)-success)
![Stack](https://img.shields.io/badge/AI-Local%20LLM%20(Qwen%202.5)-blueviolet)
![License](https://img.shields.io/badge/License-Proprietary-red)

## ✨ Funcionalidades (Versão 1.0)

* 🎙️ **Transcrição de Alta Fidelidade:** Motor *Faster-Whisper* otimizado para português brasileiro e termos técnicos.
* 🧠 **Inteligência Clínica (Agentic AI):** Agente *LangGraph* que classifica o atendimento, extrai CPF, procedimentos e histórico médico.
* 🆔 **Gestão de Identidade:** Detecção automática de CPF e Nome para criação ou unificação de cadastros de pacientes.
* 📂 **Prontuário Unificado:** Consolida Anamnese e Evolução em um único registro de atendimento coerente.
* 📱 **Integração WhatsApp:** Envie o áudio no app e receba a confirmação instantânea.
* 💻 **Dashboard Profissional:** Timeline completa do paciente, edição de transcrição e revisão de dados.

## 🚀 Roadmap (Visão de Futuro)

O Vita.AI está evoluindo para um ERP Clínico completo. Módulos já previstos na interface:

- [ ] **📅 Agenda Inteligente:** Agendamento integrado com lembretes via WhatsApp.
- [ ] **💰 Gestão Financeira:** Controle de fluxo de caixa e integração com convênios.
- [ ] **📦 Estoque Preditivo:** Baixa automática de materiais baseada nos procedimentos extraídos pela IA.
- [ ] **⚡ Processamento Assíncrono:** Arquitetura de filas (Celery/Redis) para alta escalabilidade.

## 🏗️ Arquitetura (Microsserviços)

O projeto roda inteiramente em containers Docker:

| Serviço | Tecnologia | Função |
|---------|------------|--------|
| **Backend** | FastAPI / Python 3.11 | API REST, SQLAlchemy (Postgres), Alembic e LangChain. |
| **Frontend** | React / Vite / Tailwind | Interface moderna (SPA) para gestão clínica. |
| **AI Engine** | Ollama (Qwen 2.5) | Servidor de inferência local (LLM). |
| **Database** | PostgreSQL 15 | Persistência relacional com suporte a JSONB. |
| **Gateway** | WAHA | Conexão via socket com a API do WhatsApp. |

## 🛠️ Como Rodar (Ambiente de Desenvolvimento)

### Pré-requisitos
* Docker & Docker Compose
* NVIDIA GPU (Recomendado para performance de transcrição)
* 16GB+ RAM

### Instalação

1.  **Configure o Ambiente:**
    ```bash
    cp .env.example .env
    # Configure as credenciais de produção
    ```

2.  **Inicie o Sistema:**
    ```bash
    docker compose up -d --build
    ```

3.  **Acesse:**
    * Frontend: `http://localhost:5173`
    * Conecte o WhatsApp em `http://localhost:3000/dashboard`

---
*© 2025 Vita.AI. Todos os direitos reservados. Uso não autorizado é proibido.*