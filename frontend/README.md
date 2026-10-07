# SmartTutor System — Complete Project & Viva Package

A complete, production-ready, academic-first educational web platform built for 1-on-1 personalized mentorship, peer-to-peer Skill Barter, safe doorstep home tuition, and Daily Practice Problems (DPP).

---

## 📁 Package Contents

| File / Folder | Description |
| :--- | :--- |
| **`index.html`** | Main Landing Page — 1-on-1 private lecture search, tutor directory, and Unauthenticated Booking Gate. |
| **`student.html`** | Student Portal — Skill Barter, 4-Question Compatibility Quiz, WebRTC Live Video Classroom, Canvas Whiteboard, DPPs, and Learning Roadmaps. |
| **`tutor.html`** | Tutor Portal — DPP Manager, Lesson Planning Helper, Booking requests, 85/15 Payout Ledger, Hindi Safety Voice Check, and Emergency SOS. |
| **`login.html`** | Authentication Gateway — Role switcher (Student, Tutor, Admin) and booking intent redirect preservation. |
| **`admin.html`** | Admin Console — Student enrollments, KYC document verification, and platform audit logs. |
| **`js/`** | Core JavaScript logic: `app.js` (Auth & state), `student.js` (Quiz, WebRTC, Whiteboard, DPPs), `tutor.js` (DPP creator, SpeechSynthesis, SOS). |
| **`css/`** | Stylesheets and layout formatting. |
| **`SmartTutor_Project_Viva_Guide.pdf`** | Native 14-page PDF document containing project summary, architecture, full database schema, line-by-line code explanations, and 25 viva questions & answers! |
| **`SmartTutor_Project_Viva_Guide.html`** | Standalone interactive printable HTML version of the guide. |

---

## 🚀 How to Run the Project
1. Install Java 17+ and Maven 3.8+.
2. Start the H2 API from the `backend` folder with `mvn spring-boot:run` and leave it running.
3. Open **`index.html`** or **`login.html`** in a browser. Tutor registration and course creation require the API at `http://localhost:8080`.
4. Tutor records and courses are stored in the file-backed H2 database under `backend/data/`. See [backend/README.md](backend/README.md) for connection details.

---

## 🎓 2-Minute Viva Presentation Script
> *"Good morning/afternoon Professors. Our project is **SmartTutor** — an academic mentoring platform that eliminates crowded 100+ student batches by focusing strictly on **1-on-1 personalized lectures**, **verified doorstep home tuition with emergency safety checks**, and a **zero-money Peer Skill Barter system**.*  
>  
> *Built using clean semantic HTML5, Bootstrap 5.3, and Vanilla JavaScript (ES6+), SmartTutor allows students to learn directly through real-time video via native **WebRTC** and shared **HTML5 Canvas** whiteboards, while empowering tutors with transparent 85/15 payouts and Daily Practice Problem (DPP) publishing tools."*

---

## 📑 Complete Viva & Technical Guide
Please open **`SmartTutor_Project_Viva_Guide.pdf`** inside this folder for the full 25 Viva Q&A, line-by-line code explanations, and system architecture diagrams.
