// ===================================================================
// Smart Tutor System — Mistake Laboratory
// Pure Client-Side Active Recall Simulator (Zero Backend)
// ===================================================================

let currentQuiz = [
    {
        id: 1,
        topic: "Java Memory & Types",
        question: "What is the difference between String == and String.equals() in Java?",
        options: [
            "== checks content value, while .equals() checks memory address",
            "== checks reference/memory address, while .equals() checks actual character content",
            "Both do the exact same thing",
            "== works only on numbers, .equals() works on Strings"
        ],
        correctIndex: 1,
        correctText: "== checks reference/memory address, while .equals() checks actual character content"
    },
    {
        id: 2,
        topic: "Object-Oriented Programming",
        question: "Which OOP principle focuses on restricting direct access to object components and hiding internal state?",
        options: [
            "Inheritance",
            "Polymorphism",
            "Encapsulation",
            "Method Overloading"
        ],
        correctIndex: 2,
        correctText: "Encapsulation"
    },
    {
        id: 3,
        topic: "Data Structures & Algorithms",
        question: "What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?",
        options: [
            "O(1)",
            "O(N)",
            "O(log N)",
            "O(N log N)"
        ],
        correctIndex: 2,
        correctText: "O(log N)"
    },
    {
        id: 4,
        topic: "Web & REST APIs",
        question: "Which HTTP method should be used for idempotent updates that replace the entire resource?",
        options: [
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ],
        correctIndex: 1,
        correctText: "PUT"
    }
];

let currentQuestionIndex = 0;
let score = 0;
let totalAnswered = 0;
let studentMistakes = [
    {
        id: 1,
        topic: "Java Memory & Types",
        questionText: "What is the difference between String == and String.equals() in Java?",
        studentWrongAnswer: "== checks content value, while .equals() checks memory address",
        aiRemediation: "Confused reference equality with value equality. `==` checks heap memory address, `.equals()` checks character content.",
        isMastered: false
    }
];

function loadQuiz(topic = 'Java') {
    currentQuestionIndex = 0;
    score = 0;
    totalAnswered = 0;
    renderCurrentQuestion();
    loadMistakeHistory();
}

function renderCurrentQuestion() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    if (currentQuestionIndex >= currentQuiz.length) {
        renderQuizCompleted();
        return;
    }

    const q = currentQuiz[currentQuestionIndex];
    container.innerHTML = `
        <div class="p-4 bg-white rounded-4 border shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-primary-subtle text-primary px-3 py-1">Question ${currentQuestionIndex + 1} of ${currentQuiz.length}</span>
                <span class="badge bg-light text-muted border">${q.topic}</span>
            </div>
            <h5 class="fw-bold text-dark mb-4">${q.question}</h5>
            
            <div class="d-grid gap-3" id="quizOptions">
                ${q.options.map((opt, idx) => `
                    <button class="btn btn-outline-secondary text-start p-3 rounded-3 d-flex align-items-center gap-3 option-btn" onclick="submitAnswer(${idx})">
                        <span class="badge bg-light text-dark border px-2 py-1">${String.fromCharCode(65 + idx)}</span>
                        <span class="flex-grow-1">${opt}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function submitAnswer(selectedIndex) {
    const q = currentQuiz[currentQuestionIndex];
    const isCorrect = (selectedIndex === q.correctIndex);
    totalAnswered++;

    if (isCorrect) {
        score++;
        showToast("Correct! Excellent understanding.", "success");
        currentQuestionIndex++;
        setTimeout(renderCurrentQuestion, 500);
    } else {
        triggerMistakeLab(q.topic, q.question, q.options[selectedIndex], q.correctText);
    }
}

function triggerMistakeLab(topic, question, wrongAnswer, correctAnswer) {
    const modalEl = document.getElementById('mistakeLabModal');
    if (!modalEl) {
        alert(`Mistake Detected!\n\nCorrect Answer: ${correctAnswer}\nAI Remediation: Active recall logged.`);
        currentQuestionIndex++;
        renderCurrentQuestion();
        return;
    }

    const bsModal = new bootstrap.Modal(modalEl);
    const analysisContainer = document.getElementById('modalMistakeAiExplanation');
    document.getElementById('modalMistakeQuestion').textContent = question;
    document.getElementById('modalMistakeStudentAnswer').textContent = wrongAnswer;
    document.getElementById('modalMistakeCorrectAnswer').textContent = correctAnswer;

    analysisContainer.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-grow text-primary" role="status"></div>
            <p class="mt-2 text-muted fw-semibold">AI is diagnosing your specific misconception...</p>
        </div>
    `;
    bsModal.show();

    setTimeout(() => {
        analysisContainer.innerHTML = `
            <div class="p-3 bg-danger-subtle rounded-3 border border-danger-subtle mb-3">
                <h6 class="fw-bold text-danger mb-1"><i class="bi bi-exclamation-octagon-fill me-1"></i> Root Misconception Diagnosed</h6>
                <p class="small text-danger mb-0">You selected: <em>"${wrongAnswer}"</em>. This confuses memory address pointers with payload equality.</p>
            </div>
            <div class="p-3 bg-success-subtle rounded-3 border border-success-subtle mb-3">
                <h6 class="fw-bold text-success mb-1"><i class="bi bi-check-circle-fill me-1"></i> Correct Principle to Master</h6>
                <p class="small text-success mb-0"><strong>${correctAnswer}</strong></p>
            </div>
            <div class="p-3 bg-light rounded-3 border">
                <h6 class="fw-bold text-dark mb-1"><i class="bi bi-lightbulb-fill text-warning me-1"></i> Examiner Viva Tip</h6>
                <p class="small text-muted mb-0">When asked this in oral viva exams, clearly mention: <em>"In memory architecture, primitive comparisons use values whereas object handles evaluate references unless overridden."</em></p>
            </div>
        `;

        studentMistakes.unshift({
            id: Date.now(),
            topic: topic,
            questionText: question,
            studentWrongAnswer: wrongAnswer,
            aiRemediation: `Interpreted "${wrongAnswer}" instead of "${correctAnswer}". Root-cause diagnosed and logged.`,
            isMastered: false
        });
        loadMistakeHistory();
    }, 700);
}

function continueAfterMistake() {
    const modalEl = document.getElementById('mistakeLabModal');
    if (modalEl) {
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
    }
    currentQuestionIndex++;
    renderCurrentQuestion();
}

function renderQuizCompleted() {
    const container = document.getElementById('quizContainer');
    if (!container) return;

    const percentage = Math.round((score / currentQuiz.length) * 100);
    container.innerHTML = `
        <div class="text-center py-5 bg-white rounded-4 border shadow-sm p-4">
            <div class="display-3 mb-3">${percentage >= 70 ? '🎉' : '📚'}</div>
            <h3 class="fw-bold text-dark mb-2">Quiz Completed!</h3>
            <p class="text-muted mb-4">You scored <strong class="text-primary">${score} out of ${currentQuiz.length}</strong> (${percentage}%)</p>

            <div class="p-3 bg-primary-light rounded-3 text-start mb-4 mx-auto" style="max-width: 500px;">
                <h6 class="fw-bold text-primary mb-1"><i class="bi bi-mortarboard-fill me-1"></i> Mistake Lab Benefit:</h6>
                <p class="mb-0 small text-muted">All incorrect answers have been captured in your personal Mistake Laboratory for targeted revision before your college exams!</p>
            </div>

            <div>
                <button class="btn btn-primary-custom px-4 py-2 me-2" onclick="loadQuiz()">
                    <i class="bi bi-arrow-repeat me-1"></i> Retake Quiz
                </button>
            </div>
        </div>
    `;
}

function loadMistakeHistory() {
    const table = document.getElementById('mistakeHistoryTable');
    if (!table) return;

    table.innerHTML = studentMistakes.map((r, i) => `
        <tr>
            <td class="fw-bold text-muted">${i + 1}</td>
            <td><span class="badge bg-primary-subtle text-primary border">${r.topic}</span></td>
            <td class="small fw-semibold text-dark" style="max-width: 250px;">${r.questionText}</td>
            <td class="small text-danger" style="max-width: 200px;">${r.studentWrongAnswer}</td>
            <td><span class="badge bg-warning text-dark"><i class="bi bi-hourglass-split me-1"></i>Remediation Logged</span></td>
        </tr>
    `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    loadQuiz();
});
