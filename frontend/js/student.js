// ===================================================================
// Smart Tutor System — Student Portal Controller (All PPT Features)
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    initStudentProfile();
    renderStudentBookings();
    renderRoadmapGraph('springboot');
    loadMistakeQuestion(0);
    renderBarterCards();
    initGlobalCollabChat();
    switchCodingSample('python');
    renderStudentDpps();
    window.addEventListener('storage', event => {
        if (event.key === 'smart_tutor_bookings') renderStudentBookings();
        if (event.key === 'smart_tutor_tutor_availability') updateStudentAvailableSlots();
    });
});

// Switch student tab programmatically
function switchStudentTab(tabButtonId) {
    const tabTrigger = document.getElementById(tabButtonId);
    if (tabTrigger) {
        // Remove active state from all student feature bar buttons
        document.querySelectorAll('#studentTab .nav-link').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        tabTrigger.classList.add('active');
        tabTrigger.setAttribute('aria-selected', 'true');

        // Scroll the button into view in case toolbar is horizontally scrolled
        tabTrigger.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        // Manually show the pane
        const target = tabTrigger.getAttribute('data-bs-target');
        if (target) {
            document.querySelectorAll('#studentTabContent .tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            const activePane = document.querySelector(target);
            if (activePane) {
                activePane.classList.add('show', 'active');
            }
        }

        try {
            const tab = bootstrap.Tab.getOrCreateInstance(tabTrigger);
            tab.show();
        } catch(e) {}

        window.scrollTo({ top: 120, behavior: 'smooth' });
    }
}

// 1. Student Profile & Name
function initStudentProfile() {
    const user = Auth.getUser() || {};
    let savedProfile = null;
    try {
        const stored = localStorage.getItem('smart_tutor_student_profile');
        if (stored) savedProfile = JSON.parse(stored);
    } catch(e) {}

    // Use savedProfile only if it belongs to the current user email
    const profile = (savedProfile && savedProfile.email === user.email) ? savedProfile : user;

    if (profile && profile.fullName) {
        const welcomeEl = document.getElementById('studentWelcomeName');
        const displayNameEl = document.getElementById('studentDisplayName');
        const profileNameInput = document.getElementById('studentProfileName');
        const profileEmailInput = document.getElementById('studentProfileEmail');
        const profilePhoneInput = document.getElementById('studentProfilePhone');
        const profileCourseInput = document.getElementById('studentProfileCourse');
        const profileCollegeInput = document.getElementById('studentProfileCollege');
        const profileCityInput = document.getElementById('studentProfileCity');
        const profileBioInput = document.getElementById('studentProfileBio');
        const photoPreview = document.getElementById('studentProfilePhotoPreview');
        const photoPlaceholder = document.getElementById('studentProfilePhotoPlaceholder');

        if (welcomeEl) welcomeEl.textContent = profile.fullName;
        if (displayNameEl) displayNameEl.textContent = profile.fullName;
        if (profileNameInput) profileNameInput.value = profile.fullName;
        if (profileEmailInput && profile.email) profileEmailInput.value = profile.email;
        if (profilePhoneInput && profile.phone) profilePhoneInput.value = profile.phone;
        if (profileCourseInput && profile.course) profileCourseInput.value = profile.course;
        if (profileCollegeInput && profile.college) profileCollegeInput.value = profile.college;
        if (profileCityInput && profile.city) profileCityInput.value = profile.city;
        if (profileBioInput && profile.bio) profileBioInput.value = profile.bio;
        if (profile.photo && photoPreview && photoPlaceholder) {
            photoPreview.src = profile.photo;
            photoPreview.style.display = 'block';
            photoPlaceholder.style.display = 'none';
        }
        updateProfileBioWordCount(profileBioInput);

        // Update avatar initials
        const avatarEls = document.querySelectorAll('.tutor-avatar-circle');
        const initials = profile.fullName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase() || 'ST';
        avatarEls.forEach(el => {
            el.textContent = initials;
        });

        // Also update live classroom student name tag
        const liveMyName = document.getElementById('liveListStudentName');
        if (liveMyName) liveMyName.textContent = `${profile.fullName} (You)`;
    }
}

function saveStudentProfile(event) {
    event.preventDefault();
    const bioInput = document.getElementById('studentProfileBio');
    if (bioInput && !updateProfileBioWordCount(bioInput)) {
        bioInput.reportValidity();
        return;
    }
    const formData = new FormData(event.currentTarget);
    const existingProfile = JSON.parse(localStorage.getItem('smart_tutor_student_profile') || '{}');
    const profile = { ...existingProfile, ...Object.fromEntries(formData.entries()) };
    localStorage.setItem('smart_tutor_student_profile', JSON.stringify(profile));

    const currentUser = Auth.getUser() || {};
    Auth.setUser({ ...currentUser, ...profile, role: 'STUDENT' });
    const welcomeEl = document.getElementById('studentWelcomeName');
    const displayNameEl = document.getElementById('studentDisplayName');
    if (welcomeEl) welcomeEl.textContent = profile.fullName;
    if (displayNameEl) displayNameEl.textContent = profile.fullName;
    showToast('Student profile saved.', 'success');
}

function handleStudentPhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('Choose an image file for your profile photo.', 'warning');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const image = new Image();
        image.onload = () => {
            const maxSize = 512;
            const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);
            canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

            try {
                const photo = canvas.toDataURL('image/jpeg', 0.82);
                const savedProfile = JSON.parse(localStorage.getItem('smart_tutor_student_profile') || '{}');
                const form = document.getElementById('studentProfileForm');
                const formProfile = form ? Object.fromEntries(new FormData(form).entries()) : {};
                const profile = { ...savedProfile, ...formProfile, photo };
                localStorage.setItem('smart_tutor_student_profile', JSON.stringify(profile));

                const preview = document.getElementById('studentProfilePhotoPreview');
                const placeholder = document.getElementById('studentProfilePhotoPlaceholder');
                if (preview && placeholder) {
                    preview.src = photo;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                }
                showToast('Profile photo updated.', 'success');
            } catch (error) {
                showToast('Could not save this photo. Try a smaller image.', 'warning');
            }
        };
        image.onerror = () => showToast('Could not read that image file.', 'warning');
        image.src = reader.result;
    };
    reader.onerror = () => showToast('Could not read that image file.', 'warning');
    reader.readAsDataURL(file);
}

function submitStudentSupport(event) {
    event.preventDefault();
    const topic = document.getElementById('studentSupportTopic')?.value || 'General support';
    const message = document.getElementById('studentSupportMessage')?.value.trim();
    if (!message) {
        showToast('Please add a short message first.', 'info');
        return;
    }

    const tickets = JSON.parse(localStorage.getItem('smart_tutor_support_tickets') || '[]');
    tickets.unshift({ role: 'STUDENT', topic, message, createdAt: new Date().toISOString() });
    localStorage.setItem('smart_tutor_support_tickets', JSON.stringify(tickets.slice(0, 10)));
    event.currentTarget.reset();
    showToast('Your support message has been sent.', 'success');
}

// 2. Scheduled Sessions (Online & Offline)
function renderStudentBookings() {
    const tableBody = document.getElementById('studentBookingsTable');
    if (!tableBody) return;

    const stored = localStorage.getItem('smart_tutor_bookings');
    const bookings = stored ? JSON.parse(stored) : [];

    if (bookings.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No scheduled sessions found. <button class="btn btn-link btn-sm p-0 fw-bold" onclick="openStudentFindMentorModal()">Find a verified mentor</button> to get started!</td></tr>`;
        return;
    }

    tableBody.innerHTML = bookings.map(b => {
        const statusBadge = b.status === 'CONFIRMED'
            ? `<span class="badge bg-success-subtle text-success fw-bold">Confirmed</span>`
            : b.status === 'RESCHEDULE_PROPOSED'
                ? `<span class="badge bg-success-subtle text-success fw-bold">New time proposed</span>`
                : b.status === 'DECLINED'
                    ? `<span class="badge bg-danger-subtle text-danger fw-bold">Declined</span>`
                    : `<span class="badge bg-warning-subtle text-warning fw-bold">Pending tutor response</span>`;
        
        const actionBtn = b.status === 'CONFIRMED'
            ? `<div class="d-flex gap-1 flex-wrap"><button class="btn btn-sm btn-primary-custom py-1 px-3" onclick="joinLiveRoom('${b.subject}', '${b.tutorName}')"><i class="bi bi-camera-video-fill me-1"></i> Join Room</button><button class="btn btn-sm btn-outline-custom py-1 px-2" onclick="openFeedbackModal('${b.id}', '${escapeHtml(b.subject)}', '${escapeHtml(b.tutorName)}')"><i class="bi bi-star me-1"></i> Feedback</button></div>`
            : b.status === 'RESCHEDULE_PROPOSED'
                ? `<button class="btn btn-sm btn-success py-1 px-3" onclick="acceptTutorProposedTime('${b.id}')"><i class="bi bi-check2 me-1"></i>Accept new time</button>`
                : b.status === 'DECLINED'
                    ? `<span class="small text-muted">Contact your tutor to choose another time.</span>`
            : `<button class="btn btn-sm btn-outline-secondary py-1 px-3" onclick="showToast('Awaiting tutor approval. You will receive a reminder notification.', 'info')">Details</button>`;

        return `
            <tr>
                <td class="fw-bold text-dark">${escapeHtml(b.subject)}</td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-person-circle text-primary"></i>
                        <span>${escapeHtml(b.tutorName)}</span>
                    </div>
                </td>
                <td class="text-muted small">${b.status === 'RESCHEDULE_PROPOSED'
                    ? `<div class="alert alert-success py-1 px-2 mb-0">Tutor proposed: ${escapeHtml(b.proposedDate || '')}</div>`
                    : escapeHtml(b.date || '')}</td>
                <td>${statusBadge}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join('');
}

function openFeedbackModal(bookingId, subject, tutorName) {
    const idInput = document.getElementById('feedbackBookingId');
    const subjectEl = document.getElementById('feedbackSubject');
    const tutorEl = document.getElementById('feedbackTutor');
    if (!idInput || !subjectEl || !tutorEl) return;

    idInput.value = bookingId;
    subjectEl.textContent = subject;
    tutorEl.textContent = tutorName;
    document.getElementById('sessionFeedbackForm')?.reset();
    idInput.value = bookingId;
    new bootstrap.Modal(document.getElementById('sessionFeedbackModal')).show();
}

function submitSessionFeedback(event) {
    event.preventDefault();
    const bookingId = document.getElementById('feedbackBookingId')?.value;
    const rating = document.querySelector('input[name="sessionRating"]:checked')?.value;
    const comment = document.getElementById('sessionFeedbackComment')?.value.trim();
    if (!bookingId || !rating || !comment) {
        showToast('Please choose a rating and write a short comment.', 'info');
        return;
    }

    const feedback = JSON.parse(localStorage.getItem('smart_tutor_session_feedback') || '[]');
    feedback.unshift({ bookingId, rating: Number(rating), comment, student: Auth.getUser()?.fullName || 'Student', createdAt: new Date().toISOString() });
    localStorage.setItem('smart_tutor_session_feedback', JSON.stringify(feedback.slice(0, 50)));
    const modal = bootstrap.Modal.getInstance(document.getElementById('sessionFeedbackModal'));
    if (modal) modal.hide();
    showToast('Thanks for sharing your feedback.', 'success');
}

function joinLiveRoom(subject, tutorName) {
    openLiveClassroom(subject || 'AVL Trees & Rotations', tutorName || 'Prof. Rohit Verma');
}

// 3. Mentor Guidance & Study Habits
function refreshLearningTwin() {
    showToast("Reviewing your recent tutor feedback and study progress...", "info");
    setTimeout(() => {
        showToast("Mentor notes and weekly study guidance updated!", "success");
    }, 800);
}

// 4. Concept Dependency Engine (Slide 6)
const ROADMAP_DATA = {
    springboot: [
        { id: 1, title: "1. Core Java OOP & Interfaces", status: "Mastered (100%)", type: "foundation", desc: "Polymorphism, Abstraction, and Interface contracts needed before Spring Dependency Injection.", prereq: "Primitive Types, Control Flow" },
        { id: 2, title: "2. Collections Framework & Generics", status: "Mastered (95%)", type: "foundation", desc: "List, Map, Set internals and generic type parameters for data handling.", prereq: "Core Java OOP" },
        { id: 3, title: "3. Spring Core & Inversion of Control (IoC)", status: "In Progress (60%)", type: "intermediate", desc: "Spring ApplicationContext, @Component, @Autowired, and Bean lifecycle.", prereq: "Collections & Interfaces" },
        { id: 4, title: "4. Spring Boot REST APIs & JPA", status: "Target Next", type: "advanced", desc: "Building @RestController endpoints with Spring Data JPA and Hibernate ORM.", prereq: "Spring Core IoC, Relational SQL" },
        { id: 5, title: "5. Microservices & Spring Security + JWT", status: "Locked", type: "mastery", desc: "Distributed tracing, Eureka service registry, and token-based authentication.", prereq: "Spring Boot REST APIs" }
    ],
    dsa: [
        { id: 1, title: "1. Time & Space Complexity (Big O)", status: "Mastered (100%)", type: "foundation", desc: "Asymptotic analysis of algorithms and recurrence relations.", prereq: "Basic Algebra" },
        { id: 2, title: "2. Arrays, Strings & Two Pointers", status: "Mastered (90%)", type: "foundation", desc: "Sliding window technique and two-pointer traversal patterns.", prereq: "Big O Notation" },
        { id: 3, title: "3. Trees & Binary Search Trees (BST)", status: "In Progress (54%)", type: "intermediate", desc: "Pre/In/Post order traversals, BST validation, and height balancing.", prereq: "Recursion & Stacks" },
        { id: 4, title: "4. Graphs: BFS, DFS & Shortest Path", status: "Target Next", type: "advanced", desc: "Adjacency list representations, Dijkstra algorithm, and topological sort.", prereq: "Trees & Queues" },
        { id: 5, title: "5. Dynamic Programming (Tabulation & Memoization)", status: "Locked", type: "mastery", desc: "Subproblem overlap and optimal substructure problems.", prereq: "Recursion & Graphs" }
    ],
    webdev: [
        { id: 1, title: "1. Semantic HTML5 & Modern CSS3", status: "Mastered (100%)", type: "foundation", desc: "Flexbox, CSS Grid, accessibility guidelines, and responsive layouts.", prereq: "Web Basics" },
        { id: 2, title: "2. JavaScript ES6+ & Async/Await", status: "Mastered (88%)", type: "foundation", desc: "Promises, Fetch API, Closures, and DOM Event loops.", prereq: "HTML & CSS" },
        { id: 3, title: "3. Modern Component Framework (React)", status: "In Progress (70%)", type: "intermediate", desc: "Hooks (useState, useEffect), state management, and props drilling.", prereq: "JavaScript ES6+" },
        { id: 4, title: "4. Full-Stack API Integration & WebSockets", status: "Target Next", type: "advanced", desc: "Real-time bi-directional messaging and REST consumption.", prereq: "React & Node/Spring Boot" }
    ]
};

function renderRoadmapGraph(track) {
    const container = document.getElementById('roadmapNodesContainer');
    if (!container) return;

    const nodes = ROADMAP_DATA[track] || ROADMAP_DATA.springboot;

    container.innerHTML = nodes.map(node => {
        const isMastered = node.status.includes('Mastered');
        const isInProgress = node.status.includes('In Progress');
        const isTarget = node.status.includes('Target');

        const badgeColor = isMastered ? 'bg-success' : isInProgress ? 'bg-primary' : isTarget ? 'bg-warning text-dark' : 'bg-secondary';
        const dotBg = isMastered ? 'var(--success)' : isInProgress ? 'var(--primary)' : isTarget ? 'var(--warning)' : '#94a3b8';

        return `
            <div class="roadmap-step" style="cursor: pointer;" onclick="inspectRoadmapNode('${escapeHtml(node.title)}', '${escapeHtml(node.desc)}', '${escapeHtml(node.prereq)}', '${escapeHtml(node.status)}')">
                <div class="roadmap-dot" style="background: ${dotBg};">
                    ${isMastered ? '<i class="bi bi-check-lg"></i>' : node.id}
                </div>
                <div class="p-3 bg-white border rounded-3 shadow-sm hover-elevate">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <h6 class="fw-bold mb-0 text-dark">${node.title}</h6>
                        <span class="badge ${badgeColor} small">${node.status}</span>
                    </div>
                    <p class="small text-muted mb-1">${node.desc}</p>
                    <span class="small fw-semibold text-primary"><i class="bi bi-arrow-return-right me-1"></i>Prerequisites: ${node.prereq}</span>
                </div>
            </div>
        `;
    }).join('');

    // Inspect first node by default
    if (nodes.length > 0) {
        inspectRoadmapNode(nodes[0].title, nodes[0].desc, nodes[0].prereq, nodes[0].status);
    }
}

function inspectRoadmapNode(title, desc, prereq, status) {
    const titleEl = document.getElementById('inspectNodeTitle');
    const descEl = document.getElementById('inspectNodeDesc');
    if (titleEl && descEl) {
        titleEl.textContent = title;
        descEl.innerHTML = `${desc}<div class="mt-2 text-primary fw-bold">Prerequisites: ${prereq}</div><span class="badge bg-light text-dark border mt-1">${status}</span>`;
    }
}

// 5. Mistake Laboratory (Slide 6)
const MISTAKE_QUESTIONS = [
    {
        subject: "Java Memory Architecture & Objects",
        question: "What happens when an object is created inside a method in Java, and where does its reference variable live?",
        options: [
            { text: "Both the object and its reference variable are stored on the Stack memory.", isCorrect: false, explanation: "Objects in Java are NEVER stored directly on the Stack. The Stack only holds primitive local variables and references!", hook: "Think: 'Stack is for small references, Heap is the big object warehouse!'" },
            { text: "The object is created on the Heap, while the reference variable lives on the Stack frame.", isCorrect: true, explanation: "Correct! The method stack frame holds the reference pointer, while the actual object allocation occurs on the Garbage-Collected Heap.", hook: "Mastery achieved: Heap holds instances; Stack executes frames." },
            { text: "Both the object and reference variable are stored in the PermGen / Metaspace.", isCorrect: false, explanation: "Metaspace is strictly reserved for class definitions, bytecode, and method metadata, not runtime instance objects.", hook: "Metaspace = Blueprint storage; Heap = House construction!" },
            { text: "The object stays in CPU cache and disappears when the method returns.", isCorrect: false, explanation: "CPU cache is hardware-managed. Java objects remain on the Heap until reclaimed by the Garbage Collector (GC).", hook: "GC sweeps the Heap, not CPU registers!" }
        ]
    },
    {
        subject: "Data Structures & Tree Traversal",
        question: "Which tree traversal order yields node values in strictly sorted ascending order for a Binary Search Tree (BST)?",
        options: [
            { text: "Pre-order Traversal (Root &rarr; Left &rarr; Right)", isCorrect: false, explanation: "Pre-order processes the root first, which does not sort elements in ascending sequence.", hook: "Pre-order is for cloning or serialization, not sorted order!" },
            { text: "In-order Traversal (Left &rarr; Root &rarr; Right)", isCorrect: true, explanation: "Correct! Because Left < Root < Right in a BST, in-order traversal strictly visits elements from smallest to largest.", hook: "Remember: 'IN-order gives IN-creasing sorted order!'" },
            { text: "Post-order Traversal (Left &rarr; Right &rarr; Root)", isCorrect: false, explanation: "Post-order evaluates children before parent (useful for deletion or bottom-up calculations), not sorted order.", hook: "Post-order = Bottom-up cleanup!" }
        ]
    }
];

let currentMistakeIndex = 0;

function loadMistakeQuestion(index) {
    currentMistakeIndex = index % MISTAKE_QUESTIONS.length;
    const q = MISTAKE_QUESTIONS[currentMistakeIndex];

    const tagEl = document.getElementById('quizSubjectTag');
    const qTextEl = document.getElementById('quizQuestionText');
    const optionsContainer = document.getElementById('quizOptionsContainer');
    const diagnosisPanel = document.getElementById('aiDiagnosisContent');

    if (tagEl) tagEl.textContent = q.subject;
    if (qTextEl) qTextEl.innerHTML = q.question;

    if (optionsContainer) {
        optionsContainer.innerHTML = q.options.map((opt, i) => `
            <button class="quiz-option" id="quiz-opt-${i}" onclick="handleMistakeQuizClick(${i})">
                <span class="fw-bold me-2">${String.fromCharCode(65 + i)}.</span> ${opt.text}
            </button>
        `).join('');
    }

    if (diagnosisPanel) {
        diagnosisPanel.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cursor text-muted opacity-50" style="font-size: 2.5rem;"></i>
                <p class="mt-3 mb-0">Select an option on the left. The Gemini AI interceptor will instantly capture errors and diagnose root misconceptions.</p>
            </div>
        `;
    }
}

function loadNextMistakeQuestion() {
    loadMistakeQuestion(currentMistakeIndex + 1);
    showToast("Loaded next diagnostic question from Mistake Laboratory repository.");
}

function handleMistakeQuizClick(optionIndex) {
    const q = MISTAKE_QUESTIONS[currentMistakeIndex];
    const selected = q.options[optionIndex];
    const diagnosisPanel = document.getElementById('aiDiagnosisContent');

    // Reset button states
    q.options.forEach((opt, i) => {
        const btn = document.getElementById(`quiz-opt-${i}`);
        if (btn) {
            btn.classList.remove('correct', 'incorrect');
            if (i === optionIndex) {
                btn.classList.add(selected.isCorrect ? 'correct' : 'incorrect');
            }
        }
    });

    if (selected.isCorrect) {
        showToast("Correct Answer! Great conceptual mastery.", "success");
        if (diagnosisPanel) {
            diagnosisPanel.innerHTML = `
                <div class="p-3 bg-success-subtle text-success rounded-3 mb-3">
                    <h6 class="fw-bold mb-1"><i class="bi bi-check-circle-fill me-1"></i> Spot On!</h6>
                    <p class="mb-0">${selected.explanation}</p>
                </div>
                <div class="p-3 border rounded-3 bg-white">
                    <strong class="text-dark d-block mb-1">💡 Memory Anchor Trick:</strong>
                    <p class="text-muted mb-2">${selected.hook}</p>
                    <button class="btn btn-sm btn-primary-custom" onclick="loadNextMistakeQuestion()">Next Mistake Drill &rarr;</button>
                </div>
            `;
        }
    } else {
        showToast("Mistake Intercepted by Gemini AI!", "danger");
        if (diagnosisPanel) {
            diagnosisPanel.innerHTML = `
                <div class="p-3 bg-danger-subtle text-danger rounded-3 mb-3">
                    <h6 class="fw-bold mb-1"><i class="bi bi-exclamation-octagon-fill me-1"></i> Root Cause Diagnosis</h6>
                    <p class="mb-0">${selected.explanation}</p>
                </div>
                <div class="p-3 border border-warning-subtle bg-warning-subtle rounded-3 mb-3">
                    <strong class="text-dark d-block mb-1"><i class="bi bi-lightbulb-fill text-warning me-1"></i> Gemini Memory Anchor:</strong>
                    <p class="text-dark mb-0">${selected.hook}</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-custom" onclick="loadMistakeQuestion(${currentMistakeIndex})">Retry Question</button>
                    <button class="btn btn-sm btn-primary-custom" onclick="switchStudentTab('coding-tab')">Test in Coding Lab</button>
                </div>
            `;
        }
    }
}

// 6. AI Coding Lab (Slide 6)
// 6. AI Coding Lab — Python, Java & C Compiler (GCC)
const CODING_SAMPLES = {
    python: `# Python 3 - Simple Program
print("Hello, World!")

# Simple arithmetic addition
a = 15
b = 25
total = a + b
print(f"Sum of {a} and {b} is: {total}")`,
    java: `// Java - Simple Program
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Simple arithmetic addition
        int a = 15;
        int b = 25;
        int total = a + b;
        System.out.println("Sum of " + a + " and " + b + " is: " + total);
    }
}`,
    c: `/* C Compiler (GCC) - Simple Program */
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Simple arithmetic addition
    int a = 15;
    int b = 25;
    int total = a + b;
    printf("Sum of %d and %d is: %d\\n", a, b, total);
    
    return 0;
}`
};

const CODE_DESCRIPTIONS = {
    python: {
        title: "Python 3 Explanation",
        summary: "This script prints <code>'Hello, World!'</code> to stdout using <code>print()</code>, then initializes two integers (<code>a = 15</code>, <code>b = 25</code>), adds them together, and prints the result using an f-string.",
        tag: "Introductory Python 3 script"
    },
    java: {
        title: "Java Explanation",
        summary: "Declares a <code>Main</code> class with the entry method <code>public static void main(String[] args)</code>. It outputs <code>'Hello, World!'</code> using <code>System.out.println()</code> and prints the sum of two integer variables.",
        tag: "Standard university Java lab template"
    },
    c: {
        title: "C Compiler (GCC) Explanation",
        summary: "Includes standard I/O library <code>&lt;stdio.h&gt;</code>, defines the <code>main()</code> function returning 0, and uses formatted printing <code>printf()</code> with <code>%d</code> placeholders to display the sum.",
        tag: "Classic 1st-year college C programming"
    }
};

function switchCodingSample(lang) {
    const textarea = document.getElementById('codeTextarea');
    const filename = document.getElementById('codeEditorFilename');
    const targetLang = (lang === 'java' || lang === 'c') ? lang : 'python';
    if (textarea) textarea.value = CODING_SAMPLES[targetLang] || CODING_SAMPLES.python;
    if (filename) {
        if (targetLang === 'java') filename.textContent = 'Main.java';
        else if (targetLang === 'c') filename.textContent = 'main.c';
        else filename.textContent = 'main.py';
    }
    updateAiCodeExplanation(targetLang);
    showToast(`Switched editor to ${targetLang === 'c' ? 'C Compiler (GCC)' : targetLang.toUpperCase()}`);
}

function updateAiCodeExplanation(lang) {
    const titleEl = document.getElementById('aiCodeExplanationTitle');
    const textEl = document.getElementById('aiCodeExplanationText');
    const tagEl = document.getElementById('aiCodeCollegeTag');
    const info = CODE_DESCRIPTIONS[lang] || CODE_DESCRIPTIONS.python;
    
    if (titleEl) titleEl.innerHTML = `<i class="bi bi-info-circle text-primary me-1"></i> ${info.title}`;
    if (textEl) textEl.innerHTML = info.summary;
    if (tagEl) tagEl.innerHTML = `<i class="bi bi-mortarboard me-1"></i> ${info.tag}`;
}

function runCodeSandbox() {
    const terminal = document.getElementById('codeTerminalOutput');
    const runBtn = document.querySelector('button[onclick="runCodeSandbox()"]');
    const lang = document.getElementById('codingLangSelect')?.value || 'python';
    const originalBtnHtml = runBtn ? runBtn.innerHTML : '<i class="bi bi-play-fill me-1"></i> Run Code';
    
    if (runBtn) {
        runBtn.disabled = true;
        runBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Compiling...`;
    }

    if (terminal) {
        let compilerMsg = 'Python 3.11 Interpreter';
        if (lang === 'java') compilerMsg = 'OpenJDK 17 Compiler (javac)';
        if (lang === 'c') compilerMsg = 'GCC 12.2 C Compiler (gcc main.c -o main)';

        terminal.innerHTML = `<span class="text-warning">[00:00.04] ⚙️ Compiling with ${compilerMsg}...</span>\n<span class="text-muted">[00:00.12] Executing program binary...</span>`;
        
        setTimeout(() => {
            const time = new Date().toLocaleTimeString();
            terminal.innerHTML = `
<span class="text-success">[${time}] Program compiled and executed successfully!</span>
----------------------------------------------------------------------
Hello, World!
Sum of 15 and 25 is: 40
----------------------------------------------------------------------
<span class="text-info fw-bold">Process finished with exit code 0</span>  |  <span class="text-muted">Execution time: 38ms</span>`;

            if (runBtn) {
                runBtn.disabled = false;
                runBtn.innerHTML = originalBtnHtml;
            }
            showToast("Code executed successfully! Exit code 0.", "success");
        }, 600);
    }
}

function askAiCodeAssistant() {
    const input = document.getElementById('aiCodePromptInput');
    const prompt = input ? input.value.trim() : '';
    if (!prompt) {
        showToast("Please enter a question or request for the AI assistant.", "warning");
        return;
    }
    askAiCodePrompt(prompt);
    if (input) input.value = '';
}

function askAiCodePrompt(query) {
    const feedback = document.getElementById('aiCodingFeedback');
    const lang = document.getElementById('codingLangSelect')?.value || 'python';
    const qLower = (query || '').toLowerCase();
    
    showToast("AI Assistant generating response...", "info");
    
    if (feedback) {
        let responseTitle = "AI Code Explanation";
        let responseBody = "";

        if (qLower.includes('fix') || qLower.includes('error') || qLower.includes('bug')) {
            responseTitle = "AI Code Fix & Diagnosis";
            responseBody = `
                <p class="text-muted mb-2">No syntax errors detected in your current code. The program compiles cleanly with exit code 0.</p>
                <div class="p-2 bg-light rounded border mb-2">
                    <small class="text-dark fw-semibold d-block">AI Auto-Format Check:</small>
                    <small class="text-success"><i class="bi bi-check-circle me-1"></i> Indentation, braces, and output formatting are correct.</small>
                </div>
                <button class="btn btn-sm btn-primary-custom" onclick="fixCodeWithAi()"><i class="bi bi-magic me-1"></i> Auto-Format / Refresh Code</button>
            `;
        } else if (qLower.includes('loop') || qLower.includes('for') || qLower.includes('while')) {
            responseTitle = "How to add a loop";
            const loopSnippet = lang === 'c' ? 'for (int i = 0; i &lt; 5; i++) { printf("%d\\n", i); }' : (lang === 'java' ? 'for (int i = 0; i &lt; 5; i++) { System.out.println(i); }' : 'for i in range(5): print(i)');
            responseBody = `
                <p class="text-muted mb-2">To repeat instructions multiple times, you can use a <code>for</code> loop:</p>
                <pre class="p-2 bg-light rounded border mb-2 text-dark font-monospace" style="font-size:0.8rem;">${loopSnippet}</pre>
                <button class="btn btn-sm btn-outline-custom" onclick="insertLoopSample()"><i class="bi bi-plus-circle me-1"></i> Insert Loop Sample</button>
            `;
        } else {
            responseTitle = "Code Description";
            responseBody = `
                <p class="text-muted mb-2">Your current ${lang.toUpperCase()} code is a straightforward beginner script:</p>
                <ul class="text-muted ps-3 mb-2 small">
                    <li>Prints greeting message to the output console.</li>
                    <li>Declares two numeric variables and adds them together.</li>
                    <li>Prints the calculated sum with descriptive text.</li>
                </ul>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-custom" onclick="runCodeSandbox()"><i class="bi bi-play-circle me-1"></i> Run in Sandbox</button>
                    <button class="btn btn-sm btn-primary-custom" onclick="fixCodeWithAi()"><i class="bi bi-magic me-1"></i> Clean Code</button>
                </div>
            `;
        }

        feedback.innerHTML = `
            <div class="p-3 border rounded-3 bg-white shadow-xs">
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <h6 class="fw-bold text-dark mb-0"><i class="bi bi-robot text-primary me-2"></i> ${responseTitle}</h6>
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle">Ready</span>
                </div>
                ${responseBody}
            </div>
        `;
    }
}

function fixCodeWithAi() {
    const textarea = document.getElementById('codeTextarea');
    const lang = document.getElementById('codingLangSelect')?.value || 'python';
    if (textarea) {
        if (lang === 'c') {
            textarea.value = `/* C Compiler (GCC) - Cleaned & Verified by AI */
#include <stdio.h>

int main() {
    // Print friendly welcome message
    printf("Hello, World!\\n");

    // Add two numbers
    int a = 15;
    int b = 25;
    int total = a + b;

    printf("Sum of %d and %d is: %d\\n", a, b, total);
    return 0;
}`;
        } else if (lang === 'java') {
            textarea.value = `// Java - Cleaned & Verified by AI
public class Main {
    public static void main(String[] args) {
        // Print friendly welcome message
        System.out.println("Hello, World!");

        // Add two numbers
        int a = 15;
        int b = 25;
        int total = a + b;

        System.out.println("Sum of " + a + " and " + b + " is: " + total);
    }
}`;
        } else {
            textarea.value = `# Python 3 - Cleaned & Verified by AI
# Print friendly welcome message
print("Hello, World!")

# Add two numbers
a = 15
b = 25
total = a + b

print(f"Sum of {a} and {b} is: {total}")`;
        }
        showToast("Code cleaned and verified by AI Assistant!", "success");
        askAiCodePrompt("fix");
    }
}

function insertLoopSample() {
    const textarea = document.getElementById('codeTextarea');
    const lang = document.getElementById('codingLangSelect')?.value || 'python';
    if (textarea) {
        if (lang === 'c') {
            textarea.value = `/* C Compiler (GCC) - Loop Example */
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Counting loop from 1 to 5
    for (int i = 1; i <= 5; i++) {
        printf("Iteration %d\\n", i);
    }
    return 0;
}`;
        } else if (lang === 'java') {
            textarea.value = `// Java - Loop Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Counting loop from 1 to 5
        for (int i = 1; i <= 5; i++) {
            System.out.println("Iteration " + i);
        }
    }
}`;
        } else {
            textarea.value = `# Python 3 - Loop Example
print("Hello, World!")

# Counting loop from 1 to 5
for i in range(1, 6):
    print(f"Iteration {i}")`;
        }
        showToast("Loop sample inserted into editor!");
    }
}

function askAiCodingHint() {
    askAiCodePrompt("explain");
}

// 7. Student Skill Barter & Peer Compatibility Quiz (Slide 6)
const DEFAULT_BARTERS = [
    {
        id: 1,
        studentName: "Kunal Joshi",
        college: "Computer Science • 3rd Year",
        give: "Core Java & OOP Principles",
        want: "React Hooks & Modern Frontend",
        credits: "3 hrs/week",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
        pace: "step_by_step",
        time: "evening",
        teaching: "pair_coding",
        vibe: "chill_patient",
        tags: ["☕ Evening 5-8 PM", "💻 Pair Coding", "🌿 Patient"]
    },
    {
        id: 2,
        studentName: "Ananya Sharma",
        college: "Information Technology • 2nd Year",
        give: "Python Basics & Data Structures",
        want: "SQL Queries & DBMS Indexing",
        credits: "2 hrs/week",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
        pace: "hands_on",
        time: "night_owl",
        teaching: "visual",
        vibe: "chill_patient",
        tags: ["🦉 Night Owl (10PM+)", "🎨 Visual Learner", "🚀 Hands-on"]
    },
    {
        id: 3,
        studentName: "Devansh Patel",
        college: "Electronics & CS • 3rd Year",
        give: "C Programming & Pointers",
        want: "Git Collaboration & Linux Bash",
        credits: "4 hrs/week",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
        pace: "hands_on",
        time: "weekends",
        teaching: "code_review",
        vibe: "goal_driven",
        tags: ["⚡ Weekend Marathon", "🎯 Goal-Oriented", "🔍 Code Review"]
    },
    {
        id: 4,
        studentName: "Pooja Deshmukh",
        college: "Software Engineering • Final Year",
        give: "Web UI Design & CSS Flexbox",
        want: "Java Backend & RESTful APIs",
        credits: "3 hrs/week",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        pace: "step_by_step",
        time: "evening",
        teaching: "visual",
        vibe: "discussion",
        tags: ["🎨 Visual Diagrams", "☕ Evening 5-8 PM", "💡 Discussion"]
    },
    {
        id: 5,
        studentName: "Rohan Kulkarni",
        college: "Data Science • 2nd Year",
        give: "Data Analysis & Statistics",
        want: "C++ Object Oriented Design",
        credits: "2 hrs/week",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
        pace: "exam_prep",
        time: "night_owl",
        teaching: "code_review",
        vibe: "goal_driven",
        tags: ["🦉 Night Owl (10PM+)", "📊 Exam/Problem Focus", "🎯 Fast-Paced"]
    },
    {
        id: 6,
        studentName: "Meera Nair",
        college: "AI & Machine Learning • 3rd Year",
        give: "Python Scripting & Algorithms",
        want: "Docker & Cloud Basics",
        credits: "3 hrs/week",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
        pace: "hands_on",
        time: "weekends",
        teaching: "pair_coding",
        vibe: "discussion",
        tags: ["💻 Live Pair-Coding", "⚡ Weekend Marathon", "💡 Collaborative"]
    }
];

function computeBarterCompatibility(userQuiz, peer) {
    let score = 56;
    const reasons = [];

    if (userQuiz.time && peer.time && userQuiz.time === peer.time) {
        score += 15;
        if (peer.time === 'night_owl') reasons.push("Both are Late Night coders");
        else if (peer.time === 'evening') reasons.push("Both study during Evening hours");
        else reasons.push("Both prefer Weekend deep sessions");
    }

    if (userQuiz.pace && peer.pace && userQuiz.pace === peer.pace) {
        score += 12;
        if (peer.pace === 'hands_on') reasons.push("Shared hands-on building pace");
        else if (peer.pace === 'step_by_step') reasons.push("Shared step-by-step approach");
        else reasons.push("Fast-paced problem orientation");
    }

    if (userQuiz.teaching && peer.teaching && userQuiz.teaching === peer.teaching) {
        score += 10;
        if (peer.teaching === 'pair_coding') reasons.push("Mutual love for pair-coding");
        else if (peer.teaching === 'visual') reasons.push("Both enjoy visual whiteboard explanations");
        else reasons.push("Both focus on code reviews and debugging");
    }

    if (userQuiz.vibe && peer.vibe && userQuiz.vibe === peer.vibe) {
        score += 6;
        if (peer.vibe === 'chill_patient') reasons.push("Comfortable, patient study dynamic");
        else if (peer.vibe === 'goal_driven') reasons.push("Goal-driven syllabus discipline");
        else reasons.push("Collaborative debate style");
    }

    // Deterministic organic variation based on peer ID
    const jitter = ((Number(peer.id) || 1) * 7) % 5;
    score = Math.min(97, Math.max(68, score + jitter));
    const reasonText = reasons.length > 0 ? reasons.slice(0, 2).join(' & ') : "Complementary study pace and tech overlap";

    return { score, reasonText };
}

function renderBarterQuizBanner() {
    const bannerContainer = document.getElementById('barterQuizBannerContainer');
    if (!bannerContainer) return;

    const saved = localStorage.getItem('smart_tutor_barter_quiz');
    if (saved) {
        let quiz = null;
        try { quiz = JSON.parse(saved); } catch(e) {}
        if (quiz) {
            let persona = "Collaborative Tech Peer";
            if (quiz.time === 'night_owl' && quiz.pace === 'hands_on') persona = "🦉 Night Owl • 💻 Hands-on Builder";
            else if (quiz.time === 'night_owl' && quiz.pace === 'step_by_step') persona = "🦉 Night Owl • 🐢 Foundations Master";
            else if (quiz.time === 'night_owl') persona = "🦉 Night Owl • 🎯 Problem Sprinter";
            else if (quiz.time === 'evening' && quiz.teaching === 'pair_coding') persona = "☕ Evening • 👥 Pair Programmer";
            else if (quiz.time === 'evening') persona = "☕ Evening Focus • 📚 Systematic Learner";
            else if (quiz.time === 'weekends') persona = "📅 Weekend Sprinter • 🚀 Project Builder";

            bannerContainer.innerHTML = `
                <div class="card-spacious border-start border-4 shadow-sm" style="border-left-color: #5a4bda !important; background: #faf9ff;">
                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                        <div>
                            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                                <span class="badge bg-success-subtle text-success border border-success-subtle">
                                    <i class="bi bi-check-circle-fill me-1"></i> Compatibility Filter Active
                                </span>
                                <span class="badge bg-white text-dark border shadow-xs">
                                    <i class="bi bi-person-badge text-primary me-1"></i> Your Persona: <strong>${persona}</strong>
                                </span>
                            </div>
                            <h5 class="fw-bold text-dark mb-1">
                                <i class="bi bi-sort-numeric-down text-primary me-1"></i> Ranked by Peer Compatibility
                            </h5>
                            <p class="text-muted small mb-0">
                                Match percentage is calculated from your study schedule, learning pace, and preferred way of collaborating.
                            </p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-outline-custom btn-sm" type="button" onclick="openBarterQuizModal()">
                                <i class="bi bi-pencil-square me-1"></i> Retake Quiz
                            </button>
                            <button class="btn btn-light btn-sm border text-muted" type="button" onclick="resetBarterQuiz()" title="Reset quiz and sort normally">
                                <i class="bi bi-arrow-counterclockwise me-1"></i> Reset
                            </button>
                        </div>
                    </div>
                </div>
            `;
            return;
        }
    }

    // Default banner when quiz not taken yet
    bannerContainer.innerHTML = `
        <div class="card-spacious border-start border-4 shadow-sm" style="border-left-color: #8db6a3 !important;">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div>
                    <span class="badge bg-light text-dark border mb-2"><i class="bi bi-person-lines-fill text-primary me-1"></i> Better Peer Matches</span>
                    <h5 class="fw-bold text-dark mb-1">Take the 1-Minute Peer Compatibility Quiz</h5>
                    <p class="text-muted small mb-0">Discover exchange partners who match your study schedule, learning pace, and preferred way of coding together.</p>
                </div>
                <button class="btn btn-primary-custom" type="button" onclick="openBarterQuizModal()">
                    <i class="bi bi-ui-checks me-1"></i> Take Compatibility Quiz
                </button>
            </div>
            <div class="small text-muted mt-3 pt-3 border-top"><i class="bi bi-shield-check text-success me-1"></i> Practical & comfortable matching. Helps prevent mismatched study hours or conflicting expectations.</div>
        </div>
    `;
}

function renderBarterCards() {
    renderBarterQuizBanner();

    const container = document.getElementById('barterCardsContainer');
    if (!container) return;

    const stored = localStorage.getItem('smart_tutor_barters');
    let barters = stored ? JSON.parse(stored) : [];

    // Pre-populate with realistic peer cards if empty, stale, or missing trait properties
    if (!barters || barters.length < 6 || !barters[0].pace) {
        barters = JSON.parse(JSON.stringify(DEFAULT_BARTERS));
        localStorage.setItem('smart_tutor_barters', JSON.stringify(barters));
    }

    const savedQuiz = localStorage.getItem('smart_tutor_barter_quiz');
    let userQuiz = null;
    if (savedQuiz) {
        try { userQuiz = JSON.parse(savedQuiz); } catch(e) {}
    }

    // Calculate match scores if quiz completed
    if (userQuiz) {
        barters.forEach(b => {
            const comp = computeBarterCompatibility(userQuiz, b);
            b.matchScore = comp.score;
            b.matchReason = comp.reasonText;
        });
        // Sort descending by highest match
        barters.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    container.innerHTML = barters.map(b => {
        let compatibilitySection = '';
        if (userQuiz && b.matchScore) {
            const score = b.matchScore;
            const badgeColor = score >= 88 ? 'bg-success text-white' : score >= 76 ? 'bg-primary text-white' : 'bg-secondary text-white';
            const matchBorder = score >= 88 ? '#bbf7d0' : score >= 76 ? '#c7d2fe' : '#e2e8f0';
            const matchBg = score >= 88 ? '#f0fdf4' : score >= 76 ? '#eef2ff' : '#f8fafc';
            const matchLabel = score >= 88 ? '🔥 High Synergy' : score >= 76 ? '⚡ Strong Match' : '🤝 Good Fit';

            compatibilitySection = `
                <div class="p-2 rounded-2 mb-2 d-flex align-items-center justify-content-between" style="background: ${matchBg}; border: 1px solid ${matchBorder};">
                    <span class="small fw-bold text-dark"><i class="bi bi-fire text-danger me-1"></i>${score}% Compatibility</span>
                    <span class="badge ${badgeColor}" style="font-size: 0.68rem;">${matchLabel}</span>
                </div>
                <div class="small text-muted mb-2 fst-italic" style="font-size: 0.74rem;">
                    <i class="bi bi-stars text-warning me-1"></i>${b.matchReason}
                </div>
            `;
        } else {
            compatibilitySection = `
                <div class="small text-muted mb-2 fst-italic" style="font-size: 0.73rem;">
                    <i class="bi bi-info-circle text-primary me-1"></i> Take quiz to check your compatibility %
                </div>
            `;
        }

        const tagsHtml = (b.tags || []).map(t => `<span class="badge bg-light text-secondary border" style="font-size: 0.7rem;">${t}</span>`).join(' ');

        return `
            <div class="col-md-4 col-sm-6">
                <div class="barter-card h-100 d-flex flex-column justify-content-between p-3 border rounded-3 bg-white shadow-xs">
                    <div>
                        <div class="d-flex align-items-center gap-3 mb-2">
                            <img src="${b.avatar}" class="rounded-circle border" width="46" height="46" alt="${b.studentName}">
                            <div class="flex-grow-1">
                                <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.95rem;">${b.studentName}</h6>
                                <span class="text-muted small">${b.college || 'Peer Student'} • <i class="bi bi-clock me-1"></i>${b.credits}</span>
                            </div>
                        </div>

                        ${compatibilitySection}

                        <div class="d-flex flex-wrap gap-1 mb-3">
                            ${tagsHtml}
                        </div>

                        <div class="mb-2">
                            <span class="badge bg-success-subtle text-success border border-success-subtle small fw-bold mb-1">Can Teach:</span>
                            <div class="fw-semibold text-dark small ps-1">${b.give}</div>
                        </div>

                        <div class="mb-3">
                            <span class="badge bg-primary-subtle text-primary border border-primary-subtle small fw-bold mb-1">Wants to Learn:</span>
                            <div class="fw-semibold text-dark small ps-1">${b.want}</div>
                        </div>
                    </div>

                    <div class="d-grid gap-2 pt-2 border-top">
                        <button class="btn btn-light border btn-sm py-1" onclick="viewStudentBarterProfile('${escapeHtml(b.studentName)}')">
                            <i class="bi bi-person-lines-fill me-1"></i> View Profile
                        </button>
                        <button class="btn btn-outline-custom btn-sm py-1" onclick="requestBarterExchange('${escapeHtml(b.studentName)}', '${escapeHtml(b.give)}')">
                            <i class="bi bi-arrow-left-right me-1"></i> Request Barter Swap
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 7.1 Student Profile Inspection for Barter Request
function viewStudentBarterProfile(peerName) {
    const modalEl = document.getElementById('barterStudentProfileModal');
    if (!modalEl) return;

    let peers = [];
    try {
        peers = JSON.parse(localStorage.getItem('smart_tutor_barters') || '[]');
    } catch (error) {}

    const savedPeer = peers.find(peer => peer.studentName === peerName);
    const peer = savedPeer || (peerName === 'Aman Gupta' ? {
        studentName: 'Aman Gupta',
        college: '3rd Year B.Tech CSE • Delhi Technological University (DTU)',
        give: 'Figma UI/UX & Design Systems',
        want: 'Python Core & Data Analysis',
        credits: '3 hrs/week',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        bio: 'I am interested in exchanging Figma design skills for Python and data analysis practice.',
        tags: ['Evenings 5-8 PM', 'Weekends', 'Visual learner'],
        rating: '4.9 (4 peer swaps)'
    } : null);
    if (!peer) return;

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    const photo = document.getElementById('barterProfilePhoto');
    if (photo) {
        photo.src = peer.avatar || '';
        photo.alt = peer.studentName;
    }
    setText('barterProfileName', peer.studentName);
    setText('barterProfileCollege', peer.college || 'Student • Peer Barter');
    setText('barterProfileCredits', peer.credits || 'Availability not listed');
    setText('barterProfileBio', peer.bio || 'I am interested in sharing what I know and learning from another student.');
    setText('barterProfileTeach', peer.give || 'Not listed');
    setText('barterProfileLearn', peer.want || 'Not listed');
    setText('barterProfileStyle', Array.isArray(peer.tags) && peer.tags.length ? peer.tags.join(' • ') : 'Hands-on peer learning');
    setText('barterProfileRating', peer.rating || 'New peer');

    const acceptButton = document.getElementById('barterProfileAcceptButton');
    if (acceptButton) {
        acceptButton.dataset.peerName = peer.studentName;
        acceptButton.dataset.learnSkill = peer.want || '';
        acceptButton.dataset.teachSkill = peer.give || '';
    }

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

// 7.2 Accept Barter and Start the Compatibility Quiz
function acceptBarterAndStartQuiz(peerName, learnSkill, teachSkill) {
    // Hide student profile modal if open
    const profileModalEl = document.getElementById('barterStudentProfileModal');
    if (profileModalEl) {
        const modal = bootstrap.Modal.getInstance(profileModalEl);
        if (modal) modal.hide();
    }

    // Update incoming barter proposal card UI to confirmed status
    const card = document.getElementById('incomingBarterProposalCard');
    if (card) {
        card.innerHTML = `
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 bg-success-subtle rounded-2 border border-success">
                <div class="d-flex align-items-center gap-3">
                    <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80" class="rounded-circle border" width="50" height="50" alt="${escapeHtml(peerName || 'Aman Gupta')}">
                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge bg-success"><i class="bi bi-check-circle-fill me-1"></i> Swap Accepted</span>
                            <span class="badge bg-primary">96% High Synergy Match</span>
                        </div>
                        <h6 class="fw-bold text-dark mb-0 mt-1">${escapeHtml(peerName || 'Aman Gupta')} &bull; Skill Barter Unlocked</h6>
                        <small class="text-muted">Exchange: Python Core &bull; Figma UI/UX &bull; Ready to collaborate</small>
                    </div>
                </div>
                <button class="btn btn-primary-custom btn-sm px-3 fw-bold" onclick="openBarterChat('${escapeHtml(peerName || 'Aman Gupta')}', '${escapeHtml(learnSkill || 'Python Core')}', '${escapeHtml(teachSkill || 'Figma UI/UX')}')">
                    <i class="bi bi-chat-dots-fill me-1"></i> Open Collaboration Room &rarr;
                </button>
            </div>
        `;
    }

    openBarterQuizModal();
    showToast(`Swap request from ${peerName || 'Aman Gupta'} accepted! Complete the 4-question quiz to verify collaboration synergy.`);
}

function openBarterQuizModal() {
    const modalEl = document.getElementById('barterPersonalityModal');
    if (!modalEl) return;

    // Pre-populate if quiz already taken
    const saved = localStorage.getItem('smart_tutor_barter_quiz');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.pace) {
                const el = modalEl.querySelector(`input[name="barterPace"][value="${data.pace}"]`);
                if (el) el.checked = true;
            }
            if (data.time) {
                const el = modalEl.querySelector(`input[name="barterTime"][value="${data.time}"]`);
                if (el) el.checked = true;
            }
            if (data.teaching) {
                const el = modalEl.querySelector(`input[name="barterTeaching"][value="${data.teaching}"]`);
                if (el) el.checked = true;
            }
            if (data.vibe) {
                const el = modalEl.querySelector(`input[name="barterVibe"][value="${data.vibe}"]`);
                if (el) el.checked = true;
            }
        } catch(e) {}
    }

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

function submitBarterQuiz(event) {
    event.preventDefault();
    const form = event.target;
    const pace = form.elements['barterPace']?.value;
    const time = form.elements['barterTime']?.value;
    const teaching = form.elements['barterTeaching']?.value;
    const vibe = form.elements['barterVibe']?.value;

    if (!pace || !time || !teaching || !vibe) {
        showToast("Please answer all 4 questions to calculate compatibility.", "info");
        return;
    }

    const quizData = {
        pace,
        time,
        teaching,
        vibe,
        completedAt: new Date().toISOString()
    };

    localStorage.setItem('smart_tutor_barter_quiz', JSON.stringify(quizData));

    // Close modal
    const modalEl = document.getElementById('barterPersonalityModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    renderBarterCards();
    showToast("🎉 96% Compatibility with Aman Gupta! Unlocking your collaboration room...", "success");

    // Smoothly open the dedicated barter collaboration & live room modal
    setTimeout(() => {
        openBarterChat('Aman Gupta', 'Python Core', 'Figma UI/UX');
    }, 600);
}

function resetBarterQuiz() {
    localStorage.removeItem('smart_tutor_barter_quiz');
    const form = document.getElementById('barterQuizForm');
    if (form) form.reset();
    renderBarterCards();
    showToast("Quiz reset. Showing all peers in standard order.", "info");
}

function submitBarterOffer() {
    const giveInput = document.getElementById('barterGiveInput');
    const wantInput = document.getElementById('barterWantInput');
    const timeInput = document.getElementById('barterTimeInput');

    if (!giveInput.value.trim() || !wantInput.value.trim()) {
        showToast("Please enter both skills you can teach and want to learn.", "danger");
        return;
    }

    const stored = localStorage.getItem('smart_tutor_barters');
    const barters = stored ? JSON.parse(stored) : [];
    const user = Auth.getUser();

    // Check user's quiz persona if available
    const savedQuiz = localStorage.getItem('smart_tutor_barter_quiz');
    let userQuiz = null;
    if (savedQuiz) {
        try { userQuiz = JSON.parse(savedQuiz); } catch(e) {}
    }

    const pace = userQuiz?.pace || "hands_on";
    const time = userQuiz?.time || "evening";
    const teaching = userQuiz?.teaching || "pair_coding";
    const vibe = userQuiz?.vibe || "chill_patient";

    let timeTag = "☕ Evening Slot";
    if (time === 'night_owl') timeTag = "🦉 Night Owl";
    else if (time === 'weekends') timeTag = "📅 Weekend Sprinter";

    const newBarter = {
        id: Date.now(),
        studentName: (user && user.fullName) ? user.fullName : "Student Member",
        college: "Engineering Student",
        give: giveInput.value.trim(),
        want: wantInput.value.trim(),
        credits: timeInput.value.trim() || "2 hrs/week",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
        pace,
        time,
        teaching,
        vibe,
        tags: [timeTag, "💻 Peer Swapper", "🌿 Open to Learn"]
    };

    barters.unshift(newBarter);
    localStorage.setItem('smart_tutor_barters', JSON.stringify(barters));

    // Close modal
    const modalEl = document.getElementById('createBarterModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    // Reset inputs
    giveInput.value = '';
    wantInput.value = '';
    if (timeInput) timeInput.value = '';

    renderBarterCards();
    showToast("Barter offer posted! Other students can now request swaps with you.", "success");
}

function requestBarterExchange(studentName, skill) {
    showToast(`Barter request sent to ${studentName} for learning "${skill}"! They will be notified.`);
}

// -------------------------------------------------------------------
// Barter Negotiation Chat & WebRTC Live Room Scheduling Controller
// -------------------------------------------------------------------
let currentBarterPeer = "Aman Gupta";
const DEFAULT_BARTER_CHAT = [
    {
        sender: "Aman Gupta",
        isUser: false,
        time: "10:14 AM",
        text: "Hey! I saw your profile and noticed that you're strong in Python and looking to learn Figma design systems. I've built UI kits for 3 college hackathons and would love to exchange knowledge!"
    },
    {
        sender: "Aman Gupta",
        isUser: false,
        time: "10:15 AM",
        text: "Does weekend evening work for you? We can do 45 mins Python + 45 mins Figma in the live classroom!"
    }
];

function openBarterChat(peerName, learnSkill, teachSkill) {
    currentBarterPeer = peerName || "Aman Gupta";
    const titleEl = document.getElementById('barterChatPeerName');
    const topicEl = document.getElementById('barterChatTopicLine');
    if (titleEl) titleEl.textContent = currentBarterPeer;
    if (topicEl) topicEl.textContent = `Exchange: You teach ${learnSkill || 'Python Core'} • ${currentBarterPeer} teaches ${teachSkill || 'Figma UI/UX'}`;

    renderBarterChatMessages();

    const modalEl = document.getElementById('barterChatModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function renderBarterChatMessages() {
    const container = document.getElementById('barterChatMessagesContainer');
    if (!container) return;

    let chat = DEFAULT_BARTER_CHAT;
    try {
        const stored = localStorage.getItem('smart_tutor_barter_chat_' + currentBarterPeer.toLowerCase().replace(/\s+/g, '_'));
        if (stored) chat = JSON.parse(stored);
    } catch(e) {}

    container.innerHTML = chat.map(msg => {
        if (msg.isLiveRoom) {
            return `
                <div class="p-3 my-2 bg-white border border-primary rounded-1 shadow-sm">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <span class="badge bg-primary text-white"><i class="bi bi-camera-video-fill me-1"></i> Pinned Live Peer Room</span>
                        <span class="badge bg-success-subtle text-success border border-success-subtle">Saturday 6:00 PM</span>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">${escapeHtml(msg.title || 'Python & Figma Peer Swap Classroom')}</h6>
                    <p class="small text-muted mb-2">${escapeHtml(msg.text)}</p>
                    <div class="d-flex gap-2">
                        <a href="${msg.roomUrl}" class="btn btn-primary-custom btn-sm py-1 px-3 fw-bold">
                            <i class="bi bi-box-arrow-in-up-right me-1"></i> Join Live WebRTC Room
                        </a>
                        <button class="btn btn-outline-custom btn-sm py-1" onclick="showToast('Classroom link copied!')">
                            <i class="bi bi-link-45deg me-1"></i> Copy Link
                        </button>
                    </div>
                </div>
            `;
        }

        const align = msg.isUser ? 'justify-content-end' : 'justify-content-start';
        return `
            <div class="d-flex ${align} mb-2">
                <div class="p-2 px-3 rounded-2 shadow-xs" style="max-width: 78%; ${msg.isUser ? 'background: #1e3a8a; color: #fff;' : 'background: #fff; border: 1px solid #e2e8f0;'}">
                    <div class="small ${msg.isUser ? 'text-light' : 'text-dark'}">${escapeHtml(msg.text)}</div>
                    <div class="text-end" style="font-size: 0.65rem; opacity: 0.8; margin-top: 2px;">${msg.time || 'Just now'}</div>
                </div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function sendBarterChatMessage(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('barterChatInput');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';

    let chat = DEFAULT_BARTER_CHAT;
    const key = 'smart_tutor_barter_chat_' + currentBarterPeer.toLowerCase().replace(/\s+/g, '_');
    try {
        const stored = localStorage.getItem(key);
        if (stored) chat = JSON.parse(stored);
    } catch(e) {}

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    chat.push({
        sender: "You",
        isUser: true,
        time: timeStr,
        text: text
    });

    localStorage.setItem(key, JSON.stringify(chat));
    renderBarterChatMessages();

    // Auto-reply simulation from peer after 1.2s
    setTimeout(() => {
        let reply = "Sounds like a solid plan! Let's lock this in using the Schedule button above.";
        if (text.toLowerCase().includes('saturday') || text.toLowerCase().includes('time') || text.toLowerCase().includes('pm')) {
            reply = "Saturday evening is perfect for me! I'll prep the Figma component exercise.";
        }
        chat.push({
            sender: currentBarterPeer,
            isUser: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: reply
        });
        localStorage.setItem(key, JSON.stringify(chat));
        renderBarterChatMessages();
    }, 1200);
}

function sendQuickBarterPrompt(text) {
    const input = document.getElementById('barterChatInput');
    if (input) {
        input.value = text;
        sendBarterChatMessage();
    }
}

function scheduleBarterLiveMeeting() {
    const roomCode = 'barter-python-figma-aman';
    const roomUrl = `student.html?joinLive=1&room=${roomCode}&subject=Python+and+Figma+Skill+Swap&tutor=Aman+Gupta`;

    let chat = DEFAULT_BARTER_CHAT;
    const key = 'smart_tutor_barter_chat_' + currentBarterPeer.toLowerCase().replace(/\s+/g, '_');
    try {
        const stored = localStorage.getItem(key);
        if (stored) chat = JSON.parse(stored);
    } catch(e) {}

    chat.push({
        isLiveRoom: true,
        title: "Python Core & Figma UI/UX Skill Swap Classroom",
        text: "Mutual slot confirmed: Saturday 6:00 PM – 7:30 PM (90 mins total). Both audio/video & screen share enabled.",
        roomUrl: roomUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    localStorage.setItem(key, JSON.stringify(chat));
    renderBarterChatMessages();

    // Also push to student bookings so it displays on student portal dashboard
    try {
        const storedBookings = localStorage.getItem('smart_tutor_bookings');
        const bookings = storedBookings ? JSON.parse(storedBookings) : [];
        bookings.unshift({
            id: Date.now(),
            subject: "Python & Figma Peer Barter (with Aman)",
            tutorName: "Aman Gupta (Peer Mentor)",
            date: "Saturday, 6:00 PM – 7:30 PM",
            status: "CONFIRMED",
            mode: "Online 1-on-1",
            link: roomUrl
        });
        localStorage.setItem('smart_tutor_bookings', JSON.stringify(bookings));
        renderStudentBookings();
    } catch(e) {}

    showToast("🎉 Barter Live Room Scheduled! Pinned in chat and added to your schedule.", "success");
}

function openBarterCounterModal(peerName) {
    const modalEl = document.getElementById('barterCounterModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function submitBarterCounter(event) {
    event.preventDefault();
    const modalEl = document.getElementById('barterCounterModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }
    showToast("Counter offer dispatched to Aman Gupta! He will review your proposal.", "success");
}

function declineBarterProposal() {
    const card = document.getElementById('incomingBarterProposalCard');
    if (card) {
        card.style.display = 'none';
    }
    showToast("Barter proposal declined.", "info");
}

// 8. Global Collaboration Hub (Slide 6)
const GLOBAL_CHAT_MESSAGES = [
    {
        sender: "Mateo Silva (Madrid, Spain)",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
        translations: {
            en: "Hey everyone! Who is working on optimizing search algorithms using Java Collections?",
            es: "¡Hola a todos! ¿Quién está trabajando en optimizar algoritmos de búsqueda con Java Collections?",
            hi: "नमस्ते सब लोग! जावा कलेक्शंस में सर्च एल्गोरिदम को ऑप्टिमाइज़ करने पर कौन काम कर रहा है?",
            fr: "Salut tout le monde ! Qui travaille sur l'optimisation des algorithmes avec Java Collections ?",
            ja: "皆さんこんにちは！Java Collections を使用した検索アルゴリズムの最適化に取り組んでいる人はいますか？"
        }
    },
    {
        sender: "Yuki Tanaka (Tokyo, Japan)",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=80&q=80",
        translations: {
            en: "I am! Remember that HashMap gives O(1) average lookup time, while TreeMap keeps keys sorted in O(log N).",
            es: "¡Yo sí! Recuerda que HashMap da O(1) de tiempo promedio, mientras TreeMap mantiene las claves ordenadas en O(log N).",
            hi: "मैं कर रहा हूँ! याद रखें कि HashMap O(1) एवरेज लुकअप टाइम देता है, जबकि TreeMap O(log N) में सॉर्टेड कीज़ देता है।",
            fr: "C'est mon cas ! N'oubliez pas que HashMap offre un temps moyen de O(1), tandis que TreeMap trie en O(log N).",
            ja: "私です！HashMap は平均 O(1) の検索時間を提供し、TreeMap は O(log N) でキーをソートします。"
        }
    }
];

let currentCollabLang = 'en';

function initGlobalCollabChat() {
    translateCollabChat('en');
}

function translateCollabChat(lang) {
    currentCollabLang = lang;
    const chatContainer = document.getElementById('globalChatContainer');
    const subtitleEl = document.getElementById('liveSubtitleText');

    if (chatContainer) {
        chatContainer.innerHTML = GLOBAL_CHAT_MESSAGES.map(msg => `
            <div class="d-flex align-items-start gap-2 mb-3">
                <img src="${msg.avatar}" class="rounded-circle" width="32" height="32" alt="${msg.sender}">
                <div class="chat-bubble chat-bubble-ai mb-0 p-2 px-3">
                    <div class="fw-bold text-primary small mb-1">${msg.sender}</div>
                    <div class="text-dark small">${msg.translations[lang] || msg.translations.en}</div>
                </div>
            </div>
        `).join('');
    }

    if (subtitleEl) {
        const subtitles = {
            en: `"In our Madrid lab, we use HashMaps for O(1) lookups to optimize element searching in memory."`,
            es: `"En nuestro laboratorio de Madrid, usamos HashMaps para búsquedas O(1) rápidas en memoria."`,
            hi: `"हमारे मैड्रिड लैब में, हम मेमोरी में तेज़ एलिमेंट सर्च के लिए O(1) लुकअप वाले HashMaps का उपयोग करते हैं।"`,
            fr: `"Dans notre laboratoire de Madrid, nous utilisons des HashMaps pour des recherches rapides en O(1)."`,
            ja: `"マドリードの研究室では、メモリ内の高速検索のために O(1) の HashMap を使用しています。"`
        };
        subtitleEl.textContent = subtitles[lang] || subtitles.en;
    }
}

function sendGlobalChatMessage() {
    const input = document.getElementById('globalChatInput');
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    const chatContainer = document.getElementById('globalChatContainer');

    const currentUserName = Auth.getUser()?.fullName || 'Student (You)';
    const newMsgHtml = `
        <div class="d-flex align-items-start gap-2 mb-3 justify-content-end">
            <div class="chat-bubble chat-bubble-user mb-0 p-2 px-3">
                <div class="fw-bold text-white small mb-1">${escapeHtml(currentUserName)}</div>
                <div class="text-white small">${escapeHtml(userText)}</div>
                <span class="badge bg-white text-dark small mt-1" style="font-size: 0.68rem;"><i class="bi bi-check-all"></i> Translated to 5 languages</span>
            </div>
        </div>
    `;

    if (chatContainer) {
        chatContainer.insertAdjacentHTML('beforeend', newMsgHtml);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    input.value = '';
    showToast("Message broadcasted to international peers with real-time translation.");
}

// 9. Automated Study Notes Generator (Slide 4 & 5)
function generateAiStudyNotes() {
    const input = document.getElementById('notesInputArea');
    const output = document.getElementById('notesOutputContainer');

    if (!input || !input.value.trim()) {
        showToast("Please input some lecture notes or transcript.", "danger");
        return;
    }

    showToast("Gemini AI synthesizing lecture transcript into structured notes...", "info");

    setTimeout(() => {
        if (output) {
            output.innerHTML = `
                <div class="p-3 bg-white border rounded-3 mb-3">
                    <h6 class="fw-bold text-primary mb-2"><i class="bi bi-card-checklist me-1"></i> Key Takeaway Bullet Points</h6>
                    <ul class="mb-0 ps-3">
                        <li><strong>Spring Boot:</strong> Opinionated framework removing boilerplate XML/Java config.</li>
                        <li><strong>Dependency Injection:</strong> Uses <code>@Autowired</code> to invert object creation control.</li>
                        <li><strong>DispatcherServlet:</strong> Central Front Controller delegating incoming HTTP to controllers.</li>
                        <li><strong>Spring Data JPA:</strong> Auto-implements CRUD operations via interface declarations.</li>
                    </ul>
                </div>

                <div class="p-3 bg-white border rounded-3">
                    <h6 class="fw-bold text-success mb-2"><i class="bi bi-patch-question me-1"></i> Exam Flashcards</h6>
                    <div class="p-2 bg-light rounded-2 mb-2">
                        <strong class="text-dark d-block">Q: What is the purpose of @RestController?</strong>
                        <span class="text-muted">A: Combines @Controller and @ResponseBody, automatically serializing return values directly to JSON/XML.</span>
                    </div>
                    <div class="p-2 bg-light rounded-2">
                        <strong class="text-dark d-block">Q: How does Spring Data JPA eliminate SQL?</strong>
                        <span class="text-muted">A: Parses method naming conventions (e.g. <code>findByEmail</code>) into runtime JPQL queries dynamically.</span>
                    </div>
                </div>
            `;
            showToast("Structured notes & flashcards generated successfully!");
        }
    }, 900);
}

// Helper escape
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const DEFAULT_MENTOR_AVAILABILITY = { days: [1, 2, 3, 4, 5], startTime: '10:00', endTime: '18:00' };

function getLocalDateValue(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
}

function formatSlotTime(totalMinutes) {
    const date = new Date(2000, 0, 1, Math.floor(totalMinutes / 60), totalMinutes % 60);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getMentorAvailability(mentorName) {
    const tutorProfile = JSON.parse(localStorage.getItem('smart_tutor_tutor_profile') || '{}');
    const tutorName = tutorProfile.fullName || 'Dr. Rajesh Sharma';
    const savedAvailability = localStorage.getItem('smart_tutor_tutor_availability');
    if (mentorName === tutorName && savedAvailability) {
        try { return JSON.parse(savedAvailability); } catch (error) {}
    }
    return DEFAULT_MENTOR_AVAILABILITY;
}

function initStudentBooking() {
    const dateInput = document.getElementById('studentModalDate');
    const mentorSelect = document.getElementById('studentModalMentorSelect');
    if (!dateInput || !mentorSelect) return;

    const today = getLocalDateValue(new Date());
    dateInput.min = today;
    if (!dateInput.value || dateInput.value < today) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = getLocalDateValue(tomorrow);
    }
    mentorSelect.addEventListener('change', updateStudentAvailableSlots);
    updateStudentAvailableSlots();
}

function updateStudentAvailableSlots() {
    const dateInput = document.getElementById('studentModalDate');
    const mentorSelect = document.getElementById('studentModalMentorSelect');
    const slotSelect = document.getElementById('studentModalSlot');
    const message = document.getElementById('studentAvailabilityMessage');
    if (!dateInput || !mentorSelect || !slotSelect || !message) return;

    const date = dateInput.value;
    const mentorName = mentorSelect.value;
    const availability = getMentorAvailability(mentorName);
    const weekday = date ? new Date(`${date}T00:00:00`).getDay() : -1;
    const startMinutes = Number((availability.startTime || '10:00').slice(0, 2)) * 60 + Number((availability.startTime || '10:00').slice(3, 5));
    const endMinutes = Number((availability.endTime || '18:00').slice(0, 2)) * 60 + Number((availability.endTime || '18:00').slice(3, 5));
    const activeBookings = JSON.parse(localStorage.getItem('smart_tutor_bookings') || '[]');
    const bookedSlots = activeBookings
        .filter(booking => booking.tutorName === mentorName && ['PENDING', 'CONFIRMED', 'RESCHEDULE_PROPOSED'].includes(booking.status))
        .flatMap(booking => [
            booking.sessionDate === date ? booking.timeSlot : null,
            booking.proposedSessionDate === date ? booking.proposedTimeSlot : null
        ])
        .filter(Boolean);
    const slots = [];

    if ((availability.days || []).map(Number).includes(weekday)) {
        for (let time = startMinutes; time + 60 <= endMinutes; time += 60) {
            const slot = `${formatSlotTime(time)} - ${formatSlotTime(time + 60)}`;
            if (!bookedSlots.includes(slot)) slots.push(slot);
        }
    }

    const selectedSlot = slotSelect.value;
    slotSelect.innerHTML = slots.length
        ? `<option value="">Select an available time</option>${slots.map(slot => `<option value="${slot}">${slot}</option>`).join('')}`
        : '<option value="">No available times for this date</option>';
    if (slots.includes(selectedSlot)) slotSelect.value = selectedSlot;
    slotSelect.disabled = slots.length === 0;

    message.classList.remove('d-none', 'alert-success', 'alert-warning');
    if (slots.length) {
        message.classList.add('alert-success');
        const displayDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        message.textContent = `${mentorName} is available on ${displayDate}. Open times are shown in the list.`;
    } else {
        message.classList.add('alert-warning');
        message.textContent = 'This tutor has no open times on that date. Choose another date.';
    }
}

function updateStudentAvailabilityMessage() {
    const message = document.getElementById('studentAvailabilityMessage');
    const slot = document.getElementById('studentModalSlot')?.value;
    const date = document.getElementById('studentModalDate')?.value;
    const mode = document.getElementById('studentModalMode')?.value;
    const mentor = document.getElementById('studentModalMentorSelect')?.value;
    if (!message || !slot || !date) return;
    const displayDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    message.classList.remove('d-none', 'alert-warning');
    message.classList.add('alert-success');
    message.textContent = `Available: ${mentor}, ${displayDate}, ${slot} (${mode}).`;
}

function acceptTutorProposedTime(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('smart_tutor_bookings') || '[]');
    const booking = bookings.find(item => String(item.id) === String(bookingId));
    if (!booking || !booking.proposedDate) return;

    booking.date = booking.proposedDate;
    booking.sessionDate = booking.proposedSessionDate;
    booking.timeSlot = booking.proposedTimeSlot;
    booking.status = 'CONFIRMED';
    delete booking.proposedDate;
    delete booking.proposedSessionDate;
    delete booking.proposedTimeSlot;
    localStorage.setItem('smart_tutor_bookings', JSON.stringify(bookings));

    const inquiries = JSON.parse(localStorage.getItem('smart_tutor_inquiries') || '[]');
    const request = inquiries.find(item => String(item.id) === String(bookingId));
    if (request) {
        request.date = booking.date;
        request.sessionDate = booking.sessionDate;
        request.timeSlot = booking.timeSlot;
        request.status = 'ACCEPTED';
        delete request.proposedDate;
        delete request.proposedSessionDate;
        delete request.proposedTimeSlot;
        localStorage.setItem('smart_tutor_inquiries', JSON.stringify(inquiries));
    }
    renderStudentBookings();
    showToast('The updated session time is confirmed.', 'success');
}

// 10. Student Coaching & Test Series Analytics Actions
function openDoubtModal() {
    showToast("Opening 24x7 AI & Faculty Doubt Solver. Ask any question with photo or text!", "info");
}

function openTestSolution(testName) {
    showToast(`Loading comprehensive solutions & question-wise time analysis for ${testName}...`, "info");
}

// 11. Concise DPP & Lecture PPT Handouts Controller
function filterDppItems(category, btnElement) {
    // Update active button state
    if (btnElement) {
        const parent = btnElement.parentElement;
        parent.querySelectorAll('button').forEach(b => {
            b.className = 'btn btn-sm btn-outline-custom';
        });
        btnElement.className = 'btn btn-sm btn-primary-custom';
    }

    const items = document.querySelectorAll('.dpp-item');
    items.forEach(item => {
        if (category === 'all') {
            item.style.display = 'block';
        } else {
            const hasCat = item.classList.contains(`dpp-${category}`) || item.classList.contains('dpp-all');
            item.style.display = hasCat ? 'block' : 'none';
        }
    });

    const categoryNames = {
        all: 'All Materials',
        dsa: 'Data Structures',
        webdev: 'Web Development'
    };
    showToast(`Filtered curriculum materials: ${categoryNames[category] || category}`);
}

function renderStudentDpps() {
    const container = document.getElementById('studentDppListContainer');
    if (!container) return;

    let tutorDpps = [];
    try {
        const stored = localStorage.getItem('smart_tutor_dpps') || localStorage.getItem('smart_tutor_tpps');
        if (stored) tutorDpps = JSON.parse(stored);
    } catch(e) {}

    if (tutorDpps && tutorDpps.length > 0) {
        const dynamicCards = tutorDpps.map(dpp => {
            const firstQuestion = Array.isArray(dpp.milestones) ? dpp.milestones[0] : (String(dpp.milestones).split('\n')[0] || '1-on-1 Practice Problem Set');
            return `
                <div class="card-spacious p-3 dpp-item dpp-dsa" style="border-left: 4px solid #1e3a8a; background: #fafcff;">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="badge bg-primary text-white me-1">${escapeHtml(dpp.duration || 'Computer Science')}</span>
                            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold"><i class="bi bi-clock-history me-1"></i> Due Soon</span>
                        </div>
                        <small class="badge bg-light text-dark border">Tutor Assignment</small>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">${escapeHtml(dpp.title)}</h6>
                    <p class="text-muted small mb-2">${escapeHtml(firstQuestion)}</p>
                    <div class="small text-secondary mb-3"><i class="bi bi-info-circle me-1"></i>${escapeHtml(dpp.deliverable || 'Submit before next lecture')}</div>
                    <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                        <span class="text-muted small"><i class="bi bi-person me-1"></i> Dr. Rajesh Sharma (Tutor)</span>
                        <button class="btn btn-sm btn-primary-custom py-1 px-3" onclick="openCustomDppModal('${escapeHtml(dpp.title)}')">
                            <i class="bi bi-play-circle-fill me-1"></i> View &amp; Solve
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const staticDpps = `
            <!-- DPP 1: Active Pending -->
            <div class="card-spacious p-3 dpp-item dpp-dsa" style="border-left: 4px solid #1e3a8a;">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <span class="badge bg-light text-dark border me-1">Data Structures</span>
                        <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-bold"><i class="bi bi-clock-history me-1"></i> Due today</span>
                    </div>
                    <small class="text-muted">Lec 12 Drill</small>
                </div>
                <h6 class="fw-bold text-dark mb-1">DPP #24: Graph Traversal — BFS &amp; DFS Applications</h6>
                <p class="text-muted small mb-3">10 questions on traversal queues and common edge cases. 4 completed.</p>
                <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                    <span class="text-muted small"><i class="bi bi-person me-1"></i> Prof. Rohit Verma</span>
                    <button class="btn btn-sm btn-primary-custom py-1 px-3" onclick="openDppQuizModal('DPP-24')">
                        <i class="bi bi-play-circle-fill me-1"></i> Start practice
                    </button>
                </div>
            </div>

            <!-- DPP 2: Completed -->
            <div class="card-spacious p-3 dpp-item dpp-webdev">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <span class="badge bg-light text-dark border me-1">Web Development</span>
                        <span class="badge bg-success-subtle text-success border border-success-subtle fw-bold"><i class="bi bi-check-circle-fill me-1"></i> Completed</span>
                    </div>
                    <small class="text-muted">Yesterday</small>
                </div>
                <h6 class="fw-bold text-dark mb-1">DPP #23: React State &amp; Context API Patterns</h6>
                <p class="text-muted small mb-3">10 questions on state and context patterns. You scored 9/10.</p>
                <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                    <span class="text-muted small"><i class="bi bi-person me-1"></i> Rahul Patil (Tutor)</span>
                    <button class="btn btn-sm btn-outline-custom py-1" onclick="openDppSolutionModal('DPP-23')">
                        <i class="bi bi-eye-fill me-1"></i> View solution
                    </button>
                </div>
            </div>
        `;
        container.innerHTML = dynamicCards + staticDpps;
    }
}

function openCustomDppModal(title) {
    showToast(`Loading practice questions for ${title}...`, "info");
    openDppQuizModal('CUSTOM-DPP');
}

function openDppQuizModal(dppId) {
    const feedback = document.getElementById('dppFeedbackAlert');
    if (feedback) feedback.classList.add('d-none');

    const modalEl = document.getElementById('dppQuizModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function checkDppAnswer() {
    const selected = document.querySelector('input[name="dppAnswer"]:checked')?.value;
    const feedback = document.getElementById('dppFeedbackAlert');
    if (!feedback) return;

    if (selected === 'A') {
        feedback.className = 'alert alert-success mt-3 mb-0';
        feedback.innerHTML = `
            <div class="d-flex align-items-center gap-2 mb-1">
                <i class="bi bi-check-circle-fill text-success fs-5"></i>
                <strong>Correct! Option (A) O(V + E) is the right answer (+4 Marks).</strong>
            </div>
            <p class="small mb-0 text-dark">
                <strong>Faculty Solution:</strong> With an adjacency list representation, BFS visits each vertex once (O(V)) and inspects each edge once (O(E)), giving total time complexity <strong>O(V + E)</strong>.
            </p>
        `;
    } else {
        feedback.className = 'alert alert-danger mt-3 mb-0';
        feedback.innerHTML = `
            <div class="d-flex align-items-center gap-2 mb-1">
                <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
                <strong>Incorrect choice (-1 Mark). Correct answer is Option (A) O(V + E).</strong>
            </div>
            <p class="small mb-0 text-dark">
                <strong>Teacher's Hint:</strong> Remember: when using an adjacency list, you only visit incident edges rather than checking a V x V matrix.
            </p>
        `;
    }
    feedback.classList.remove('d-none');
}

function submitDppAndNext() {
    checkDppAnswer();
    showToast("Answer recorded! Question 1 completed.", "success");
    setTimeout(() => {
        const modalEl = document.getElementById('dppQuizModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        showToast("DPP #24 Progress saved: 5 of 10 questions solved (+4 marks added)!", "success");
    }, 1200);
}

function openDppSolutionModal(dppId) {
    showToast(`Opening tutor step-by-step video solution & handwritten key for ${dppId}...`, "info");
}

function openPptModal(pptId) {
    const titles = {
        'DSA-Lec12': "Lec 12 PPT: Graph Traversal Algorithms (BFS & DFS)",
        'WebDev-Lec09': "Lec 09 PPT: React State & Context API Patterns",
        'InterviewSheet': "High-Yield Technical Interview & Big-O Cheat-Sheet"
    };

    const titleEl = document.getElementById('pptModalTitle');
    if (titleEl) {
        titleEl.textContent = titles[pptId] || "Lecture Slides & Handout";
    }

    const modalEl = document.getElementById('pptPreviewModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

// ===================================================================
// 10. LIVE INTERACTIVE CLASSROOM CONTROLLER (Audio/Video/Whiteboard)
// ===================================================================
let liveMediaStream = null;
let liveAudioContext = null;
let liveAnalyserNode = null;
let liveAudioAnimId = null;
let liveClassTimerInterval = null;
let liveClassElapsedSeconds = 0;
let liveIsMicMuted = false;
let liveIsCameraOff = false;
let liveIsHandRaised = false;
let liveWhiteboardCtx = null;
let liveIsDrawing = false;
let liveCurrentPenColor = '#0f172a';
let liveCurrentPenWidth = 3;
let liveIsEraser = false;

// Preloaded doubts conversation for realistic human classroom feeling
const LIVE_DOUBTS_DATA = [
    { sender: "Prof. Rohit Verma", role: "TUTOR", text: "Welcome class! Today we are looking at AVL Tree rotations. Feel free to ask questions anytime." },
    { sender: "Priya Sharma (You)", role: "STUDENT", text: "Sir, in case of double rotation (LR), which pivot node do we rotate first?" },
    { sender: "Prof. Rohit Verma", role: "TUTOR", text: "Great question Priya! We first rotate the grandchild with the child, then rotate with the root." },
    { sender: "Rohan Kulkarni", role: "STUDENT", text: "Got it! So LR becomes an RR case after the first rotation?" },
    { sender: "Prof. Rohit Verma", role: "TUTOR", text: "Exactly right Rohan. It reduces to a single rotation." }
];

function openLiveClassroom(subject, tutorName) {
    const subjectClean = subject || 'Data Structures: AVL Trees & Rotations';
    const tutorClean = tutorName || 'Prof. Rohit Verma';

    // Set Header & Labels
    const subjEl = document.getElementById('liveClassSubject');
    const tutorEl = document.getElementById('liveClassTutorName');
    const listTutorEl = document.getElementById('liveListTutorName');
    const topicEl = document.getElementById('liveScreenTopic');

    if (subjEl) subjEl.textContent = subjectClean;
    if (tutorEl) tutorEl.textContent = tutorClean;
    if (listTutorEl) listTutorEl.textContent = tutorClean;
    if (topicEl) topicEl.textContent = `${subjectClean} • Live Interactive Session`;

    // Render Initial Doubts
    renderLiveDoubtsList();

    // Reset Class Timer
    liveClassElapsedSeconds = 0;
    if (liveClassTimerInterval) clearInterval(liveClassTimerInterval);
    updateLiveTimerDisplay();
    liveClassTimerInterval = setInterval(() => {
        liveClassElapsedSeconds++;
        updateLiveTimerDisplay();
    }, 1000);

    // Show Modal
    const modalEl = document.getElementById('liveClassroomModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }

    // Initialize Real Media Devices (Camera & Microphone)
    initLiveUserMedia();

    // Initialize Interactive Whiteboard Canvas
    setTimeout(() => {
        initWhiteboardCanvas();
    }, 350);

    showToast(`Connected to Live Classroom with ${tutorClean}!`, "success");
}

function updateLiveTimerDisplay() {
    const timerEl = document.getElementById('liveClassTimer');
    if (!timerEl) return;
    const hrs = String(Math.floor(liveClassElapsedSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((liveClassElapsedSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(liveClassElapsedSeconds % 60).padStart(2, '0');
    timerEl.innerHTML = `<i class="bi bi-stopwatch me-1"></i> ${hrs}:${mins}:${secs}`;
}

async function initLiveUserMedia() {
    const videoEl = document.getElementById('liveStudentVideo');
    const fallbackEl = document.getElementById('liveStudentAvatarFallback');
    const micStatusTag = document.getElementById('liveAudioStatusTag');

    try {
        // Request access to real user camera & mic
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            liveMediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 320 }, height: { ideal: 240 } },
                audio: true
            });

            // Connect video stream to PiP element
            if (videoEl && liveMediaStream.getVideoTracks().length > 0) {
                videoEl.srcObject = liveMediaStream;
                videoEl.classList.remove('d-none');
                if (fallbackEl) fallbackEl.classList.add('d-none');
            }

            // Connect audio stream to Web Audio Analyser
            setupAudioAnalyser(liveMediaStream);

            if (micStatusTag) {
                micStatusTag.innerHTML = `<i class="bi bi-mic-fill text-success me-1"></i> Mic: Active`;
            }
        } else {
            throw new Error("getUserMedia not supported");
        }
    } catch (err) {
        console.warn("Camera/Mic access note:", err);
        // Graceful fallback: show avatar fallback without error
        if (videoEl) videoEl.classList.add('d-none');
        if (fallbackEl) fallbackEl.classList.remove('d-none');
        if (micStatusTag) {
            micStatusTag.innerHTML = `<i class="bi bi-mic-mute text-warning me-1"></i> Mic: Ready (Click to test)`;
        }
    }
}

function setupAudioAnalyser(stream) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        liveAudioContext = new AudioCtx();
        const source = liveAudioContext.createMediaStreamSource(stream);
        liveAnalyserNode = liveAudioContext.createAnalyser();
        liveAnalyserNode.fftSize = 64;
        source.connect(liveAnalyserNode);

        const dataArray = new Uint8Array(liveAnalyserNode.frequencyBinCount);
        const meterFill = document.getElementById('liveMicLevelFill');
        const micTag = document.getElementById('liveAudioStatusTag');
        const myMicBadge = document.getElementById('liveListMyMicBadge');

        function detectVolume() {
            if (!liveAnalyserNode || liveIsMicMuted) {
                if (meterFill) meterFill.style.width = '0%';
                return;
            }

            liveAnalyserNode.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length; // 0 to 255

            // Update visual meter fill
            if (meterFill) {
                const percent = Math.min(100, Math.round((average / 120) * 100));
                meterFill.style.width = `${percent}%`;
            }

            // Real-time speaking detection
            if (average > 14) {
                if (micTag) micTag.innerHTML = `<i class="bi bi-soundwave text-success me-1"></i> <strong>Speaking...</strong>`;
                if (myMicBadge) myMicBadge.className = 'badge bg-success text-white small';
            } else {
                if (micTag && !liveIsMicMuted) micTag.innerHTML = `<i class="bi bi-mic-fill text-success me-1"></i> Mic: Active`;
                if (myMicBadge) myMicBadge.className = 'badge bg-light text-success border small';
            }

            liveAudioAnimId = requestAnimationFrame(detectVolume);
        }

        detectVolume();
    } catch (e) {
        console.warn("AudioContext setup warning:", e);
    }
}

function toggleLiveMic() {
    liveIsMicMuted = !liveIsMicMuted;
    const btn = document.getElementById('btnLiveMic');
    const icon = document.getElementById('liveMicIcon');
    const label = document.getElementById('liveMicLabel');
    const meterFill = document.getElementById('liveMicLevelFill');
    const micTag = document.getElementById('liveAudioStatusTag');
    const myMicBadge = document.getElementById('liveListMyMicBadge');

    if (liveMediaStream) {
        liveMediaStream.getAudioTracks().forEach(track => {
            track.enabled = !liveIsMicMuted;
        });
    }

    if (liveIsMicMuted) {
        if (icon) icon.className = 'bi bi-mic-mute-fill text-danger';
        if (label) label.textContent = 'Unmute';
        if (btn) btn.classList.add('active-danger');
        if (meterFill) meterFill.style.width = '0%';
        if (micTag) micTag.innerHTML = `<i class="bi bi-mic-mute text-danger me-1"></i> Mic: Muted`;
        if (myMicBadge) myMicBadge.className = 'badge bg-light text-danger border small';
        showToast("Microphone muted.", "info");
    } else {
        if (icon) icon.className = 'bi bi-mic-fill text-success';
        if (label) label.textContent = 'Mute';
        if (btn) btn.classList.remove('active-danger');
        if (micTag) micTag.innerHTML = `<i class="bi bi-mic-fill text-success me-1"></i> Mic: Active`;
        if (myMicBadge) myMicBadge.className = 'badge bg-light text-success border small';
        showToast("Microphone unmuted and listening!", "success");
    }
}

function toggleLiveCamera() {
    liveIsCameraOff = !liveIsCameraOff;
    const btn = document.getElementById('btnLiveCamera');
    const icon = document.getElementById('liveCamIcon');
    const label = document.getElementById('liveCamLabel');
    const videoEl = document.getElementById('liveStudentVideo');
    const fallbackEl = document.getElementById('liveStudentAvatarFallback');

    if (liveMediaStream) {
        liveMediaStream.getVideoTracks().forEach(track => {
            track.enabled = !liveIsCameraOff;
        });
    }

    if (liveIsCameraOff) {
        if (icon) icon.className = 'bi bi-camera-video-off-fill text-secondary';
        if (label) label.textContent = 'Start Video';
        if (videoEl) videoEl.classList.add('d-none');
        if (fallbackEl) fallbackEl.classList.remove('d-none');
        if (btn) btn.classList.add('active-danger');
        showToast("Camera disabled. Avatar displayed.", "info");
    } else {
        if (icon) icon.className = 'bi bi-camera-video-fill text-primary';
        if (label) label.textContent = 'Stop Video';
        if (videoEl) videoEl.classList.remove('d-none');
        if (fallbackEl) fallbackEl.classList.add('d-none');
        if (btn) btn.classList.remove('active-danger');
        showToast("Camera enabled.", "success");
    }
}

function toggleLiveScreenShare() {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true })
            .then(screenStream => {
                showToast("Screen sharing started! Classmates can see your screen.", "success");
                screenStream.getVideoTracks()[0].onended = () => {
                    showToast("Screen sharing stopped.", "info");
                };
            })
            .catch(() => {
                showToast("Screen share preview active.", "info");
            });
    } else {
        showToast("Screen share toggle active.", "info");
    }
}

function toggleLiveRaiseHand() {
    liveIsHandRaised = !liveIsHandRaised;
    const tag = document.getElementById('liveHandRaisedTag');
    const btn = document.getElementById('btnLiveRaiseHand');
    const icon = document.getElementById('liveHandIcon');
    const label = document.getElementById('liveHandLabel');

    if (liveIsHandRaised) {
        if (tag) tag.style.display = 'inline-block';
        if (btn) btn.classList.add('active-primary');
        if (icon) icon.className = 'bi bi-hand-index-fill text-primary';
        if (label) label.textContent = 'Hand Raised';
        showToast("✋ Hand raised! Tutor has been notified.", "success");

        // Tutor acknowledges hand
        setTimeout(() => {
            showToast("Prof. Rohit: 'Yes Priya, go ahead with your question!'", "info");
        }, 2200);
    } else {
        if (tag) tag.style.display = 'none';
        if (btn) btn.classList.remove('active-primary');
        if (icon) icon.className = 'bi bi-hand-index text-warning';
        if (label) label.textContent = 'Raise Hand';
    }
}

function switchLiveStageMode(mode) {
    const lectureStage = document.getElementById('liveStageLecture');
    const whiteboardStage = document.getElementById('liveStageWhiteboard');
    const btnLecture = document.getElementById('btnStageModeLecture');
    const btnWhiteboard = document.getElementById('btnStageModeWhiteboard');

    if (mode === 'whiteboard') {
        if (lectureStage) lectureStage.classList.add('d-none');
        if (whiteboardStage) whiteboardStage.classList.remove('d-none');
        if (btnWhiteboard) {
            btnWhiteboard.className = 'btn btn-primary-custom';
        }
        if (btnLecture) {
            btnLecture.className = 'btn btn-outline-custom';
        }
        initWhiteboardCanvas();
    } else {
        if (whiteboardStage) whiteboardStage.classList.add('d-none');
        if (lectureStage) lectureStage.classList.remove('d-none');
        if (btnLecture) {
            btnLecture.className = 'btn btn-primary-custom';
        }
        if (btnWhiteboard) {
            btnWhiteboard.className = 'btn btn-outline-custom';
        }
    }
}

function quickToggleWhiteboard() {
    const whiteboardStage = document.getElementById('liveStageWhiteboard');
    if (whiteboardStage && whiteboardStage.classList.contains('d-none')) {
        switchLiveStageMode('whiteboard');
    } else {
        switchLiveStageMode('lecture');
    }
}

// ----------------- Whiteboard Drawing -----------------
function initWhiteboardCanvas() {
    const canvas = document.getElementById('liveClassWhiteboardCanvas');
    if (!canvas) return;

    // Resize canvas to match box
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width > 0 && canvas.width !== Math.floor(rect.width)) {
        canvas.width = Math.floor(rect.width);
        canvas.height = 380;
    }

    liveWhiteboardCtx = canvas.getContext('2d');
    liveWhiteboardCtx.lineCap = 'round';
    liveWhiteboardCtx.lineJoin = 'round';

    // Clear background to white
    liveWhiteboardCtx.fillStyle = '#ffffff';
    liveWhiteboardCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw initial sample lecture diagram on whiteboard
    drawSampleWhiteboardNotes(canvas, liveWhiteboardCtx);

    // Mouse events
    canvas.onmousedown = (e) => startDrawing(e, canvas);
    canvas.onmousemove = (e) => draw(e, canvas);
    canvas.onmouseup = stopDrawing;
    canvas.onmouseleave = stopDrawing;

    // Touch events for mobile/tablet
    canvas.ontouchstart = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startDrawing({ clientX: touch.clientX, clientY: touch.clientY }, canvas);
    };
    canvas.ontouchmove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        draw({ clientX: touch.clientX, clientY: touch.clientY }, canvas);
    };
    canvas.ontouchend = stopDrawing;
}

function drawSampleWhiteboardNotes(canvas, ctx) {
    ctx.save();
    ctx.font = 'bold 16px Outfit, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText('AVL Tree: Right Rotation (RR) Formula', 30, 40);

    ctx.font = '14px Plus Jakarta Sans, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('Root Node: z  |  Left Child: y  |  y.right = z', 30, 68);

    // Draw simple tree sketch
    ctx.strokeStyle = '#5a4bda';
    ctx.lineWidth = 2.5;

    // Circle 1 (Root 30)
    ctx.beginPath();
    ctx.arc(150, 130, 22, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.font = 'bold 14px Outfit';
    ctx.fillStyle = '#0f172a';
    ctx.fillText('30', 142, 135);

    // Line to left child
    ctx.beginPath();
    ctx.moveTo(134, 144);
    ctx.lineTo(86, 186);
    ctx.stroke();

    // Circle 2 (Child 20)
    ctx.beginPath();
    ctx.arc(70, 200, 20, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillText('20', 62, 205);

    // Note
    ctx.font = 'italic 13px Plus Jakarta Sans';
    ctx.fillStyle = '#16a34a';
    ctx.fillText('✓ Draw math equations, logic gates, or pseudocode here', 30, 320);
    ctx.restore();
}

function startDrawing(e, canvas) {
    liveIsDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    liveWhiteboardCtx.beginPath();
    liveWhiteboardCtx.moveTo(x, y);
}

function draw(e, canvas) {
    if (!liveIsDrawing || !liveWhiteboardCtx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    liveWhiteboardCtx.strokeStyle = liveIsEraser ? '#ffffff' : liveCurrentPenColor;
    liveWhiteboardCtx.lineWidth = liveIsEraser ? 24 : liveCurrentPenWidth;

    liveWhiteboardCtx.lineTo(x, y);
    liveWhiteboardCtx.stroke();
}

function stopDrawing() {
    liveIsDrawing = false;
    if (liveWhiteboardCtx) liveWhiteboardCtx.closePath();
}

function setWhiteboardColor(color, btnEl) {
    liveIsEraser = false;
    liveCurrentPenColor = color;
    document.querySelectorAll('.color-dot-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    const eraserBtn = document.getElementById('btnWhiteboardEraser');
    if (eraserBtn) eraserBtn.classList.remove('btn-secondary');
}

function setWhiteboardEraser() {
    liveIsEraser = true;
    document.querySelectorAll('.color-dot-btn').forEach(b => b.classList.remove('active'));
    const eraserBtn = document.getElementById('btnWhiteboardEraser');
    if (eraserBtn) eraserBtn.classList.add('btn-secondary');
}

function clearWhiteboardCanvas() {
    const canvas = document.getElementById('liveClassWhiteboardCanvas');
    if (canvas && liveWhiteboardCtx) {
        liveWhiteboardCtx.fillStyle = '#ffffff';
        liveWhiteboardCtx.fillRect(0, 0, canvas.width, canvas.height);
        showToast("Whiteboard cleared.");
    }
}

function downloadWhiteboardNotes() {
    const canvas = document.getElementById('liveClassWhiteboardCanvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `smart-tutor-notes-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast("Classroom whiteboard notes saved to downloads!", "success");
}

// ----------------- Live Classroom Doubts -----------------
function renderLiveDoubtsList() {
    const container = document.getElementById('liveClassDoubtsContainer');
    if (!container) return;

    container.innerHTML = LIVE_DOUBTS_DATA.map(d => {
        const isTutor = d.role === 'TUTOR';
        return `
            <div class="live-doubt-msg ${isTutor ? 'live-doubt-tutor' : 'live-doubt-student'} shadow-xs">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <strong class="${isTutor ? 'text-primary' : 'text-dark'}" style="font-size: 0.8rem;">
                        ${isTutor ? '<i class="bi bi-mortarboard-fill me-1"></i>' : '<i class="bi bi-person me-1"></i>'}
                        ${escapeHtml(d.sender)}
                    </strong>
                    <span class="text-muted" style="font-size: 0.68rem;">Just now</span>
                </div>
                <div class="text-dark">${escapeHtml(d.text)}</div>
            </div>
        `;
    }).join('');

    container.scrollTop = container.scrollHeight;
}

function handleSendLiveDoubt(e) {
    e.preventDefault();
    const input = document.getElementById('liveDoubtInput');
    const container = document.getElementById('liveClassDoubtsContainer');
    if (!input || !input.value.trim() || !container) return;

    const doubtText = input.value.trim();
    const currentUserName = Auth.getUser()?.fullName || 'Priya Sharma (You)';

    LIVE_DOUBTS_DATA.push({
        sender: `${currentUserName}`,
        role: "STUDENT",
        text: doubtText
    });

    renderLiveDoubtsList();
    input.value = '';

    // Tutor contextual answer after 1.4 seconds
    setTimeout(() => {
        let tutorReply = "Good thought! Let me write down the step on the whiteboard so you can clearly see the node adjustments.";
        const lower = doubtText.toLowerCase();

        if (lower.includes('time') || lower.includes('complexity') || lower.includes('big o')) {
            tutorReply = "AVL search, insertion, and deletion all take strictly O(log n) time because height is bounded by 1.44 * log2(n).";
        } else if (lower.includes('rotation') || lower.includes('rotate') || lower.includes('pivot')) {
            tutorReply = "Every rotation is done in O(1) constant time with just 3 pointer assignments!";
        } else if (lower.includes('balance') || lower.includes('factor')) {
            tutorReply = "Balance factor must strictly remain between -1 and +1. If it becomes +2 or -2, that's our cue to rotate.";
        }

        LIVE_DOUBTS_DATA.push({
            sender: "Prof. Rohit Verma",
            role: "TUTOR",
            text: tutorReply
        });

        renderLiveDoubtsList();
    }, 1400);
}

function leaveLiveClassroom() {
    // Stop all media tracks
    if (liveMediaStream) {
        liveMediaStream.getTracks().forEach(track => track.stop());
        liveMediaStream = null;
    }

    if (liveAudioContext) {
        try { liveAudioContext.close(); } catch(e) {}
        liveAudioContext = null;
    }

    if (liveAudioAnimId) {
        cancelAnimationFrame(liveAudioAnimId);
        liveAudioAnimId = null;
    }

    if (liveClassTimerInterval) {
        clearInterval(liveClassTimerInterval);
        liveClassTimerInterval = null;
    }

    // Hide Modal
    const modalEl = document.getElementById('liveClassroomModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    showToast("Class ended. Your study time and notes have been saved.", "info");
}

// ===================================================================
// 11. GLOBAL COLLABORATION HUB INTERACTIVE CONTROLLER
// ===================================================================
let collabVoiceActive = false;
let collabVoiceStream = null;
let collabVoiceAnimId = null;

const COLLAB_ROOMS = {
    cloud: {
        topic: "Topic: Java Collections & Hash Table Optimization",
        speaker: "Mateo speaking",
        transcript: `"In our Madrid lab, we use HashMaps for O(1) lookups to optimize element searching in memory."`,
        peers: [
            { name: "You (India)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80", status: "Listening", isUser: true },
            { name: "Mateo (Spain)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80", status: "Speaking", isUser: false },
            { name: "Yuki (Japan)", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80", status: "Active", isUser: false }
        ]
    },
    dsa: {
        topic: "Topic: Graph Algorithms, Shortest Path & BFS Traversal",
        speaker: "Alex speaking",
        transcript: `"When implementing Dijkstra, remember that negative edge weights cause infinite loops without Johnson's reweighting."`,
        peers: [
            { name: "You (India)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80", status: "Listening", isUser: true },
            { name: "Alex (USA)", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80", status: "Speaking", isUser: false },
            { name: "Fatima (Egypt)", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80", status: "Active", isUser: false }
        ]
    },
    web: {
        topic: "Topic: Full-Stack React Architecture & WebSockets",
        speaker: "Chloe speaking",
        transcript: `"We use React Context combined with useReducer to keep WebSocket connection states synchronized across pages."`,
        peers: [
            { name: "You (India)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80", status: "Listening", isUser: true },
            { name: "Chloe (France)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80", status: "Speaking", isUser: false },
            { name: "Liam (UK)", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80", status: "Active", isUser: false }
        ]
    }
};

function switchCollabRoom(roomKey) {
    const room = COLLAB_ROOMS[roomKey] || COLLAB_ROOMS.cloud;
    const topicEl = document.getElementById('collabRoomTopic');
    const speakerEl = document.getElementById('currentSubtitleSpeaker');
    const transcriptEl = document.getElementById('liveSubtitleText');
    const gridEl = document.getElementById('collabPeersGrid');

    if (topicEl) topicEl.textContent = room.topic;
    if (speakerEl) speakerEl.textContent = room.speaker;
    if (transcriptEl) transcriptEl.textContent = room.transcript;

    if (gridEl) {
        gridEl.innerHTML = room.peers.map((peer, idx) => `
            <div class="col-4">
                <div class="p-3 bg-dark rounded-3 border border-secondary text-center position-relative ${peer.isUser ? 'peer-user-tile' : ''}" id="${peer.isUser ? 'peerTileUser' : 'peerTile' + idx}">
                    <img src="${peer.avatar}" class="rounded-circle mb-2" width="54" height="54" alt="${peer.name}">
                    <div class="small fw-bold text-white">${peer.name}</div>
                    <span class="badge ${peer.status === 'Speaking' ? 'bg-secondary' : 'bg-primary-subtle text-primary'}" style="font-size: 0.7rem;">${peer.status}</span>
                </div>
            </div>
        `).join('');
    }

    showToast(`Switched study room to: ${room.topic.replace('Topic: ', '')}`);
}

async function toggleCollabVoice() {
    collabVoiceActive = !collabVoiceActive;
    const btn = document.getElementById('btnJoinCollabVoice');
    const icon = document.getElementById('collabVoiceIcon');
    const label = document.getElementById('collabVoiceLabel');
    const statusText = document.getElementById('collabVoiceStatusText');
    const userBadge = document.getElementById('collabUserStatusBadge');
    const userTile = document.getElementById('peerTileUser');

    if (collabVoiceActive) {
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                collabVoiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Audio analyser for glowing user avatar when speaking
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    const ctx = new AudioCtx();
                    const src = ctx.createMediaStreamSource(collabVoiceStream);
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 64;
                    src.connect(analyser);
                    const data = new Uint8Array(analyser.frequencyBinCount);

                    function checkCollabVolume() {
                        if (!collabVoiceActive) return;
                        analyser.getByteFrequencyData(data);
                        let sum = 0;
                        for (let i = 0; i < data.length; i++) sum += data[i];
                        const avg = sum / data.length;

                        if (avg > 15) {
                            if (userTile) userTile.classList.add('speaking-glow');
                            if (userBadge) {
                                userBadge.className = 'badge bg-success text-white';
                                userBadge.textContent = 'Speaking';
                            }
                        } else {
                            if (userTile) userTile.classList.remove('speaking-glow');
                            if (userBadge) {
                                userBadge.className = 'badge bg-primary-subtle text-primary';
                                userBadge.textContent = 'Voice Connected';
                            }
                        }
                        collabVoiceAnimId = requestAnimationFrame(checkCollabVolume);
                    }
                    checkCollabVolume();
                }
            }
        } catch (err) {
            console.warn("Collab mic access:", err);
        }

        if (btn) btn.className = 'btn btn-sm btn-danger fw-bold px-3';
        if (icon) icon.className = 'bi bi-mic-mute-fill me-1';
        if (label) label.textContent = 'Disconnect Voice';
        if (statusText) statusText.textContent = 'Microphone live in room. International peers can hear you speak.';
        showToast("Connected to Global Voice Room! Speak anytime to collaborate.", "success");

    } else {
        if (collabVoiceStream) {
            collabVoiceStream.getTracks().forEach(t => t.stop());
            collabVoiceStream = null;
        }
        if (collabVoiceAnimId) {
            cancelAnimationFrame(collabVoiceAnimId);
            collabVoiceAnimId = null;
        }

        if (btn) btn.className = 'btn btn-sm btn-success fw-bold px-3';
        if (icon) icon.className = 'bi bi-mic-fill me-1';
        if (label) label.textContent = 'Connect Voice';
        if (statusText) statusText.textContent = 'Click to unmute your microphone in this global study room';
        if (userTile) userTile.classList.remove('speaking-glow');
        if (userBadge) {
            userBadge.className = 'badge bg-primary-subtle text-primary';
            userBadge.textContent = 'Listening';
        }
        showToast("Disconnected from voice room.", "info");
    }
}

function raiseCollabHand() {
    showToast("✋ You raised your hand! The study room host will pass you the floor.", "info");
}

// ----------------- URL Param Auto-Launch -----------------
document.addEventListener('DOMContentLoaded', () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('joinLive') === '1') {
            const subject = urlParams.get('subject') || 'Data Structures: AVL Trees';
            const tutor = urlParams.get('tutor') || 'Prof. Rohit Verma';
            setTimeout(() => {
                openLiveClassroom(subject, tutor);
            }, 500);
        }
    } catch (e) {
        console.warn("URL params check:", e);
    }
});



