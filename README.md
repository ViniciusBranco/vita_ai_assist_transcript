# Vita-AI - Plataforma SaaS Integrada de Gestão Clínica e Financeira 🦷💰🤖

> **Transforme a rotina clínica com Inteligência Artificial Multimodal: de prontuários via áudio à conciliação bancária automática.**

O **Vita-AI** é um ecossistema SaaS **Proprietário** projetado para profissionais da saúde. Originalmente focado em transcrição de prontuários (antigo *Vita-Transcript*), o sistema evoluiu para uma central de inteligência que integra atendimento clínico, chatbots whitelabel e gestão contábil, tudo processado via nuvem para máxima escalabilidade.

![Status](https://img.shields.io/badge/Status-v1.1--Transition%20Completed-success)
![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-orange)
![Infra](https://img.shields.io/badge/Infra-AWS%20EC2%20(CPU--Only)-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 📈 Evolução do Projeto (Legacy vs Cloud)

Recentemente, o projeto passou por uma refatoração arquitetural profunda para suportar o crescimento comercial:

| Recurso | v1.0 (Legacy) | v1.1 (Atual - Vita-AI) |
| :--- | :--- | :--- |
| **Identidade** | Vita-Transcript | **Vita-AI** |
| **Processamento IA** | Local (Ollama + FasterWhisper) | **Cloud (Google Gemini API)** |
| **Hardware Req.** | GPU Dedicada (NVIDIA) | **CPU-Only (Qualquer Instância Cloud)** |
| **Escalabilidade** | Limitada pela VRAM local | **Elástica (API-based)** |
| **Integração** | Monolítica | **Service-Oriented (Webhook S2S)** |

## ✨ Funcionalidades Core

* 🎙️ **Prontuário via Áudio:** Transcrição e estruturação clínica imediata (Anamnese/Evolução) enviada via WhatsApp.
* 🧠 **IA Multimodal Nativa:** Utiliza o **Gemini 2.5 Flash** para processar áudio, texto e imagens de documentos em um único gateway.
* 🆔 **Gestão de Identidade:** Unificação de registros por CPF e suporte a **Apelidos (Aliases)** para reconhecimento fonético.
* 📂 **Histórico Clínico:** Timeline visual completa por paciente com resumos inteligentes.
* 🔗 **Integração Story2Scale:** Endpoint dedicado para receber inputs de Chatbots externos.

## 🏗️ Arquitetura Consolidada

O projeto opera em containers Docker otimizados para deploy em instâncias AWS EC2 convencionais:

| Serviço | Tech Stack | Função |
| :--- | :--- | :--- |
| **Backend** | Python 3.11 / FastAPI | Orquestração de negócio e integração com Gemini. |
| **Frontend** | React / Vite / Tailwind v4 | Interface administrativa e gestão de pacientes. |
| **Database** | PostgreSQL 15 | Persistência de dados clínicos e financeiros (vita_ai_db). |
| **AI Gateway** | Gemini 2.5 Flash | Motor único para STT, LLM e OCR. |

## 🚀 Roadmap de Integração (V2)

Com a fundação v1.1 concluída, o foco agora é a unificação dos módulos:

- [ ] **💰 Módulo Financeiro:** Migração do motor *Finance Recon AI* para o diretório `/modules/finance`.
- [ ] **🤖 Chatbot Whitelabel:** Unificação dos Tenants entre o Story2Scale e o Vita-AI.
- [ ] **⚡ Task Queue:** Implementação de Celery + Redis para processamento assíncrono de grandes lotes de documentos.
- [ ] **📅 Agenda:** Sincronização automática entre o chatbot e o calendário do médico.

## 🛠️ Como Rodar (AWS / Local)

1.  **Configure o Ambiente:**
    ```bash
    cp .env.example .env
    # Adicione sua GEMINI_API_KEY no arquivo .env
    ```

2.  **Inicie o Sistema:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Migração (Opcional):**
    Execute `python backend/scripts/migrate_data_v1.py` para mover dados de instalações v1.0 legadas.

---
*© 2026 Vita-AI. Todos os direitos reservados. Uso não autorizado é proibido.*