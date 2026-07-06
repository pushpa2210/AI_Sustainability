# **Municipal Waste Management RAG Assistant**

**EcoGov Intelligence**

### AI-Powered Municipal Waste Management Knowledge Engine

EcoGov Intelligence is a Retrieval-Augmented Generation (RAG) powered sustainability platform designed to improve municipal waste awareness, regulatory compliance, and eco-friendly citizen engagement.

The platform combines an intelligent waste management assistant with an eco-habit tracking system to help users understand and follow India's waste management regulations while promoting sustainable practices.

---

## 🚀 Features

### ♻️ AI-Powered RAG Chat Assistant

* Ask questions about waste management regulations.
* Retrieves relevant clauses from official government guidelines.
* Generates contextual responses using AI.
* Displays source citations for transparency.
* Supports:

  * Solid Waste Management Rules, 2016
  * Plastic Waste Management Rules, 2016
  * E-Waste Management Rules, 2022
  * Biomedical Waste Management Rules, 2016
  * Construction & Demolition Waste Rules, 2016
  * Hazardous Waste Rules, 2016
  * Swachh Bharat Mission (Urban) 2.0 Guidelines

---

### 📊 Impact Analytics Dashboard

* Waste diversion metrics
* E-waste tracking
* Compost generation statistics
* Query usage analytics
* Sustainability insights

---

### 🌿 Eco Habit Planner

* Create sustainability goals
* Track eco-friendly habits
* Maintain streaks
* Earn environmental impact points
* Monitor progress

---

### 📚 Rules & Reference Library

* Centralized waste management knowledge base
* Environmental regulation summaries
* Compliance guidelines
* Policy references

---

## 🏗️ System Architecture

```text
                    ┌─────────────────┐
                    │ React Frontend  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Express Backend │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼

  Gemini AI           RAG Retrieval         Local Storage
  API Engine         Knowledge Base        Habit Tracking

        ▼
Government Waste Management Documents
```

---

# 🛠 Tech Stack

## Frontend

### Framework

* React 19
* Vite 6

### Language

* TypeScript

### Styling

* Tailwind CSS v4

### UI Components

* Lucide React Icons
* Motion (Framer Motion)

### Typography

* Manrope
* Hanken Grotesk

---

## Backend

### Runtime

* Node.js

### Framework

* Express.js

### Language

* TypeScript

### AI SDK

* Google GenAI SDK

```bash
@google/genai
```

### Model

```bash
Gemini 3.5 Flash
```

---

## Knowledge Sources

The system retrieves information from:

1. Solid Waste Management Rules, 2016
2. Plastic Waste Management Rules, 2016
3. E-Waste Management Rules, 2022
4. Biomedical Waste Management Rules, 2016
5. Construction & Demolition Waste Rules, 2016
6. Hazardous Waste Rules, 2016
7. Swachh Bharat Mission (Urban) 2.0 Guidelines

---

# 📂 Project Structure

```text
EcoGov-Intelligence/

│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── assets/
│   │   └── App.tsx
│   │
│   └── index.html
│
├── server/
│   ├── routes/
│   ├── services/
│   ├── rag/
│   ├── utils/
│   └── server.ts
│
├── public/
│
├── docs/
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/ecogov-intelligence.git

cd ecogov-intelligence
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

---

## Start Development Server

```bash
npm run dev
```

Application:

```text
http://localhost:3000
```

---

# 🔍 Example Queries

```text
How should plastic waste be managed?

What is the minimum thickness for plastic carry bags?

How should biomedical waste be segregated?

What are SBM 2.0 objectives?

Is battery fluid hazardous waste?

How can e-waste be disposed safely?
```

---

# 🎯 Sustainable Development Goals (SDGs)

This project contributes to:

### SDG 11

Sustainable Cities and Communities

### SDG 12

Responsible Consumption and Production

### SDG 13

Climate Action

---

# 🤖 Responsible AI Considerations

* Transparent citation-based responses
* Government-source-backed knowledge retrieval
* No personal data collection
* Explainable AI outputs
* Bias minimization through official regulatory sources
* Human-in-the-loop sustainability awareness

---

# 📈 Expected Impact

* Increased public awareness of waste regulations
* Improved waste segregation practices
* Better environmental compliance
* Promotion of sustainable habits
* Support for smart city initiatives

---

# 👩‍💻 Author

**Pushpa**
B.Tech AIML Student

### AI for Sustainability Virtual Internship

(IBM SkillsBuild × AICTE × 1M1B)

---

# 📜 License

MIT License

