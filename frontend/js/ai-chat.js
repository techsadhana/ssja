// ===================================================================
// Smart Tutor System — AI Doubt Solver & Concept Dependency Engine
// Pure Client-Side Interactive AI Simulation (Zero Backend)
// ===================================================================

// AI Doubt Chat
function sendDoubt() {
    const input = document.getElementById('aiChatInput');
    const container = document.getElementById('aiChatContainer');
    if (!input || !container) return;

    const query = input.value.trim();
    if (!query) return;

    // Append User Bubble
    appendBubble(query, 'user');
    input.value = '';

    // Append Loading Indicator
    const loadingId = 'loading-' + Date.now();
    const loadingHtml = `
        <div id="${loadingId}" class="chat-bubble chat-bubble-ai d-flex align-items-center gap-2">
            <div class="spinner-grow spinner-grow-sm text-primary" role="status"></div>
            <span class="text-muted small fw-semibold">Smart Tutor AI is thinking...</span>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', loadingHtml);
    container.scrollTop = container.scrollHeight;

    // Simulated intelligent answer with brief realistic delay
    setTimeout(() => {
        document.getElementById(loadingId)?.remove();
        
        let answer = `### Smart Tutor AI Explanation\n\nHere is the pedagogical breakdown for **"${query}"**:\n\n• **Core Concept:** In computer science, this foundational mechanism coordinates data access, control flow, and system lifecycle management.\n• **Practical Application:** Modern frameworks use this pattern to keep modules loosely coupled, testable, and maintainable.\n• **Viva Tip:** Be ready to explain the trade-offs between memory overhead and execution speed when discussing this with examiners!`;
        
        const qLower = query.toLowerCase();
        if (qLower.includes('java') || qLower.includes('spring') || qLower.includes('oop')) {
            answer = `### ☕ Java & OOP Deep Dive: "${query}"\n\n1. **Core Concept:** In Java, memory is organized into **Stack** (primitive variables, method calls) and **Heap** (objects, arrays).\n2. **Best Practice:** Always favor Composition over Inheritance and leverage Interfaces to decouple architecture.\n3. **Quick Example:** When comparing objects, always override both \`equals()\` and \`hashCode()\` to maintain contract integrity in HashMaps.`;
        } else if (qLower.includes('db') || qLower.includes('sql') || qLower.includes('database')) {
            answer = `### 🗄️ Database Architecture: "${query}"\n\n1. **ACID Properties:** Atomicity, Consistency, Isolation, and Durability ensure reliable transaction processing.\n2. **Indexing:** B-Tree indexes speed up lookups from O(N) to O(log N) at the cost of slight write overhead.\n3. **Normalization:** 3NF eliminates transitive dependencies, keeping your schemas anomaly-free.`;
        } else if (qLower.includes('dsa') || qLower.includes('algorithm') || qLower.includes('tree') || qLower.includes('graph')) {
            answer = `### ⚡ Algorithmic Breakdown: "${query}"\n\n1. **Time Complexity:** Balanced BST operations run in **O(log N)** time; worst-case skewed trees degrade to **O(N)** without balancing (e.g., AVL or Red-Black).\n2. **Traversal:** In-order traversal of a BST yields elements in strictly sorted ascending order.\n3. **Pattern Tip:** For graph connectivity, use BFS for shortest paths and DFS for cycle detection or topological sorting.`;
        }
        
        appendBubble(answer, 'ai');
    }, 600);
}

function appendBubble(content, sender) {
    const container = document.getElementById('aiChatContainer');
    if (!container) return;

    const formatted = formatMarkdown(content);
    const bubbleClass = sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai';

    const bubbleHtml = `
        <div class="chat-bubble ${bubbleClass}">
            ${sender === 'ai' ? '<div class="small fw-bold text-primary mb-1"><i class="bi bi-robot me-1"></i>Smart Tutor AI</div>' : ''}
            <div>${formatted}</div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', bubbleHtml);
    container.scrollTop = container.scrollHeight;
}

// Concept Dependency Engine
function loadRoadmap(topic = 'Java Full-Stack') {
    const container = document.getElementById('conceptRoadmapContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted fw-semibold">Generating prerequisite learning graph for ${topic}...</p>
        </div>
    `;

    setTimeout(() => {
        renderRoadmap(topic, [
            { stage: "1. Core Fundamentals", description: "Variables, Data Types, Control Structures, Loops, and Functions.", status: "COMPLETED" },
            { stage: "2. Object-Oriented Programming", description: "Encapsulation, Inheritance, Polymorphism, Abstraction, and Interfaces.", status: "IN_PROGRESS" },
            { stage: "3. Collections & Exception Handling", description: "List, Set, Map, Try-Catch blocks, Generics, and Streams.", status: "UPCOMING" },
            { stage: "4. Database & SQL Architecture", description: "Relational modeling, Indexing, Transactions, and ORM abstractions.", status: "UPCOMING" },
            { stage: "5. Production REST APIs & Microservices", description: "RESTful principles, Token authentication, and Scalable architecture.", status: "GOAL" }
        ]);
    }, 400);
}

function renderRoadmap(topic, steps) {
    const container = document.getElementById('conceptRoadmapContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="mb-4">
            <h5 class="fw-bold text-dark mb-1">
                <i class="bi bi-diagram-3-fill text-primary me-2"></i>Learning Dependency Graph: <span class="text-primary">${topic}</span>
            </h5>
            <p class="text-muted small">Our AI Concept Engine determines what you must master first before attempting advanced topics.</p>
        </div>

        <div class="roadmap-timeline">
            ${steps.map((s, idx) => {
                const statusBadge = s.status === 'COMPLETED' ? '<span class="badge bg-success ms-2">Mastered</span>' :
                                    s.status === 'IN_PROGRESS' ? '<span class="badge bg-primary ms-2">Current Focus</span>' :
                                    s.status === 'GOAL' ? '<span class="badge bg-warning text-dark ms-2">Ultimate Goal</span>' :
                                    '<span class="badge bg-secondary ms-2">Locked</span>';
                const circleClass = s.status === 'COMPLETED' ? 'bg-success text-white' :
                                    s.status === 'IN_PROGRESS' ? 'bg-primary text-white shadow-sm' :
                                    'bg-light text-muted border';

                return `
                    <div class="roadmap-step d-flex gap-3 mb-4">
                        <div class="roadmap-circle rounded-circle d-flex align-items-center justify-content-center fw-bold ${circleClass}" style="width: 38px; height: 38px; min-width: 38px;">
                            ${idx + 1}
                        </div>
                        <div class="p-3 bg-light rounded-3 border flex-grow-1">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <h6 class="fw-bold mb-0 text-dark">${s.stage}</h6>
                                ${statusBadge}
                            </div>
                            <p class="text-muted small mb-0">${s.description}</p>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Simple Markdown formatting helper
function formatMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/### (.*)/g, '<h6 class="fw-bold text-dark mt-2 mb-1">$1</h6>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-light px-1 py-0.5 rounded text-danger">$1</code>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('conceptRoadmapContainer')) {
        loadRoadmap('Java Full-Stack');
    }
});
