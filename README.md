[![he](https://img.shields.io/badge/lang-he-blue.svg)](README-he.md)

# 🚀 SimuTech - NextGen AI-Driven Training Platform

**SimuTech** is a revolutionary end-to-end platform for agent training, simulation, and management. The system breaks the mold of static learning modules, introducing a tri-layered architecture consisting of a **Robust Back-End (Java)**, a **Real-Time Dual Front-End (React)**, and an **Autonomous AI Engine (Python)** that dynamically generates scenarios.

This is a living, breathing environment: The AI simulates real clients, the agent practices in real-time (via text and voice), and the manager oversees everything from a central "Control Tower" with live chat intervention capabilities via WebSockets.

---

## 🔥 The Core Innovation: Dynamic AI & Live Intervention

What sets SimuTech apart is the seamless integration between the AI engine and the real-time communication system:

* **No Static Scripts** - No more pre-defined Q&As. The Python engine utilizes complex Prompt Engineering to generate a client "persona". The virtual client responds, objects, and asks questions dynamically based on the agent's input.
* **The Invisible Coach** - While the agent is in a simulation with the AI, the training manager monitors the live conversation on their dashboard. Through WebSocket connections, the manager can send "push messages" directly to the agent's screen, providing precise feedback in real-time without the virtual client "knowing".

---

## 🏗️ System Architecture (Microservices Approach)

The system consists of 4 isolated services fully synchronized with each other:

### 1. The Brain 🧠 (AI Engine - Python)
The service responsible for generating the experience and behavioral logic (located in the `python` directory).
* **Dynamic Scenario Generation** - Utilizing Large Language Models (LLMs) to create unique conversational scenarios for each agent.
* **Voice Simulator** - Text-to-Speech (TTS) and Speech-to-Text (STT) integration allowing agents to practice natural voice calls.
* **Analysis & Scoring** - Automated post-call analysis of the agent's performance (empathy, professionalism, problem-solving) with grade calculation.

### 2. The Core ⚙️ (Back-End - Java Spring Boot)
The engine powering the system, managing access control, real-time communication, and data persistence (located in the `hackathon-java` directory).
* **Real-Time WebSockets** - Managing open chat channels between managers and agents for zero-latency data transfer.
* **Relational Database Management** - Strict DB schema featuring complex entity models using JPA/Hibernate.
* **Cascade & Hard Delete** - Advanced business logic for data integrity. Deleting an agent completely wipes their entire history from the server with no redundant errors.
* **RESTful API** - Controller and Service-based architecture serving multiple distinct clients.

### 3. The Control Tower 📡 (Manager Dashboard)
Advanced React-based interface designed for managers and supervisors (located in the `dashboard` directory).
* **Live Monitoring** - Interactive data grid displaying live statuses of all connected agents.
* **Dynamic Chat Window** - Dynamic popup fetching chat history and enabling direct messaging to individual agents.
* **Task Assignment** - Assigning specific AI simulation scenarios to agents and tracking completion.
* **Analytics & Ranks** - Visual dashboards displaying success rates, ranks, and progress charts.

<img width="3504" height="2305" alt="manager" src="https://github.com/user-attachments/assets/c205f789-90e7-4d88-a674-8d19c84b88ff" />


### 4. The Agent Arena 🎧 (Agent Simulator)
The end-user application built to be smooth, distraction-free, and advanced (located in the `front-simulator` directory).
* **Simulation Room** - A training environment divided into AI chat, voice simulation, and a hidden guidance box for manager messages.
* **Personal Workspace** - Dedicated area for open tasks, performance reports, and personal notes.
* **Responsive UI/UX** - Clean, professional design simulating real-world CRM systems.

<img width="3465" height="2493" alt="Untitled-1" src="https://github.com/user-attachments/assets/73183ef0-02f7-4394-8fbf-03fc05bcfd44" />

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Artificial Intelligence** | Python, Large Language Models (LLMs), Prompt Engineering, Voice Processing |
| **Backend Architecture** | Java, Spring Boot, Spring Web, WebSockets, Spring Data JPA, Hibernate, REST API |
| **Frontend Applications** | React, TypeScript, Vite, Material UI (MUI), React Router, Axios, Redux/Context |
| **DevOps & Tools** | Maven, Node.js (npm), Git, GitHub |

---

## 🛠️ Getting Started (Local Development)

The project uses a microservices architecture. To run the full End-to-End development environment, start each service separately.

**1. Clone the Repository:**
```bash
git clone [https://github.com/yk6749841-ai/Hackathon-Project.git](https://github.com/yk6749841-ai/Hackathon-Project.git)
```

**2. Start the AI Engine (Python):**
```bash
cd python
python -m venv venv
pip install -r requirements.txt
python main.py
```

**3. Start the Backend Core (Java):**
```bash
cd hackathon-java
./mvnw clean install
./mvnw spring-boot:run
```

**4. Start the Manager Control Tower (Dashboard):**
```bash
cd dashboard
npm install
npm run dev
```

**5. Start the Agent Workspace (Front Simulator):**
```bash
cd front-simulator
npm install
npm run dev
```

---

© **All Rights Reserved**

👨‍💻 **Developed and Architected by:** 
**Yehudit Kraus** - Full Stack & AI Developer | Building intelligent, real-time, scalable solutions.
