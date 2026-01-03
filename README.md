# Vita-AI - Plataforma SaaS Integrada de Gestão Clínica e Financeira 🦷💰🤖

> Inteligência Artificial Multimodal para Saúde: de prontuários via áudio à auditoria fiscal automatizada.

O **Vita-AI** é um ecossistema SaaS **Proprietário** projetado para profissionais da saúde. O sistema integra atendimento clínico, chatbots whitelabel e gestão contábil, operando via **Google Gemini 2.5 Flash** para máxima escalabilidade em ambientes cloud sem GPU.

![Status](https://img.shields.io/badge/Status-v1.1--Transition%20Completed-success)
![AI Engine](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-orange)
![Infra](https://img.shields.io/badge/Infra-AWS%20EC2%20(CPU--Only)-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 📈 Evolução do Projeto (Legacy vs Cloud)

| **Recurso** | **v1.0 (Legacy)** | **v1.1.0-final (Atual - Vita-AI)** |
| --- | --- | --- |
| **Identidade** | Vita-Transcript | **Vita-AI** |
| **Processamento IA** | Local (Ollama + FasterWhisper) | **Cloud (Gemini API / OpenAI)** |
| **Arquitetura** | Monolítica | **Multi-Tenant (Isolated by `tenant_id`)** |
| **Endpoint Integração** | N/A | **POST `/api/v1/integrations/chatbot-webhook`** |

## ✨ Funcionalidades Consolidadas

- 🎙️ **Prontuário via Áudio:** Transcrição e estruturação clínica imediata enviada via integração Story2Scale.
- 🧠 **Soberana Engine (Finance):** Conciliação bancária N:1 com janela de 45 dias e match hierárquico (Valor, ID Numérico e Tokens).
- 🆔 **Multi-Tenancy Global:** Isolamento estrito de dados entre clínicas através de `tenant_id` em todos os modelos de dados.
- 📂 **Auditoria Fiscal:** Classificação automática para Carnê-Leão baseada no Plano de Contas Saúde (P10.01.x).
- 🔗 **Service-Oriented:** Pronto para operar sob o domínio `api-vita.story2scale.me`.

## 🏗️ Estrutura do Projeto (Flattened)

```bash
backend/
├── api/             # Endpoints de integração (Chatbot-Webhook)
├── core/            # AI Gateway (Gemini/OpenAI) e Telemetria
├── models/          # Schemas consolidados (Clinical + Finance)
├── modules/
│   └── finance/     # Soberana Engine, Tax Agent e Reconciliation
├── schemas/         # Pydantic AIUnifiedResponse e Metadata
└── main.py          # Entrypoint único (Container: vita-ai-backend)
```

## 🚀 Roadmap & Novas Ideias (V2)

### 🔹 Backlog Técnico (Prioridade Alta)

- [ ]  **⚡ Arquitetura de Filas:** Implementação de Celery + Redis para processamento de lotes financeiros de 1000+ transações.
- [ ]  **🔐 Autenticação JWT:** Integração direta com o sistema de autenticação do Story2Scale.

### 💡 Ideias para Implementação (Novos Diferenciais)

- [ ]  **🎙️ VoiceID Verification:** Identificação biométrica do profissional no áudio para prevenir fraudes em prontuários.
- [ ]  **📉 Predictive Cashflow:** IA para prever meses de alta carga tributária baseada no histórico de prontuários (procedimentos agendados vs. realizados).
- [ ]  **🔎 Anomaly Detection:** Identificação automática de despesas financeiras incoerentes com o perfil da clínica (ex: gastos pessoais em conta PJ).
- [ ]  **📱 Offline-First Sync:** Cache local para que o médico possa ditar prontuários mesmo em salas com blindagem de sinal celular, sincronizando via Service Workers.