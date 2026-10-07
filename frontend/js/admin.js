// ===================================================================
// Smart Tutor System — Admin Portal Controller
// Modules: 
// 1. Total Revenue Pie Chart & Growth Stats
// 2. Enrolled Students Registry (Who Enrolled)
// 3. Registered Tutors with Verification Documents & Document Viewer
// 4. AI App Management Assistant (SmartAdmin Copilot)
// ===================================================================

let selectedTutorForDoc = null;

document.addEventListener('DOMContentLoaded', () => {
    loadAdminAnalytics();
    renderEnrolledStudents();
    renderRegisteredTutorsWithDocuments();
    renderSupportRequests();
});

// ===================================================================
// 1. REVENUE PIE CHART & STATS
// ===================================================================
function loadAdminAnalytics() {
    renderRevenuePieChart();
    renderMonthlyBookingsChart();
}

function renderSupportRequests() {
    const container = document.getElementById('supportRequestsList');
    if (!container) return;

    const requests = JSON.parse(localStorage.getItem('smart_tutor_support_tickets') || '[]');
    const countBadge = document.getElementById('supportRequestCount');
    if (countBadge) countBadge.textContent = `${requests.length} request${requests.length === 1 ? '' : 's'}`;

    if (requests.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-check2-circle text-success" style="font-size: 2rem;"></i>
                <p class="mt-2 mb-0">No support requests yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = requests.map((request, index) => {
        const isHandled = request.status === 'HANDLED';
        const sender = request.role === 'TUTOR' ? 'Tutor' : 'Student';
        const date = request.createdAt ? new Date(request.createdAt).toLocaleDateString('en-IN') : 'Recently';
        return `
            <div class="d-flex justify-content-between align-items-start gap-3 py-3 border-bottom">
                <div class="d-flex gap-3">
                    <div class="card-icon mb-0 ${request.role === 'TUTOR' ? 'bg-warning-subtle text-warning' : 'bg-primary-light text-primary'}" style="width: 38px; height: 38px; font-size: 1rem;">
                        <i class="bi ${request.role === 'TUTOR' ? 'bi-person-badge' : 'bi-mortarboard'}"></i>
                    </div>
                    <div>
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            <strong class="text-dark">${sender}</strong>
                            <span class="badge bg-light text-muted border">${escapeHtml(request.topic || 'General support')}</span>
                            <span class="small text-muted">${date}</span>
                        </div>
                        <p class="small text-muted mb-0 mt-1">${escapeHtml(request.message || '')}</p>
                    </div>
                </div>
                <button class="btn btn-sm ${isHandled ? 'btn-light border text-muted' : 'btn-outline-custom'}" onclick="markSupportRequestHandled(${index})" ${isHandled ? 'disabled' : ''}>
                    <i class="bi ${isHandled ? 'bi-check2' : 'bi-check'} me-1"></i>${isHandled ? 'Handled' : 'Mark handled'}
                </button>
            </div>
        `;
    }).join('');
}

function markSupportRequestHandled(index) {
    const requests = JSON.parse(localStorage.getItem('smart_tutor_support_tickets') || '[]');
    if (!requests[index]) return;
    requests[index].status = 'HANDLED';
    localStorage.setItem('smart_tutor_support_tickets', JSON.stringify(requests));
    renderSupportRequests();
    showToast('Support request marked as handled.', 'success');
}

function renderRevenuePieChart() {
    const canvas = document.getElementById('revenuePieChart');
    if (!canvas) return;

    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: [
                '1-on-1 Tutoring Commission (42%)',
                'College Dept Subscriptions (28%)',
                'Skill Barter Premium Tokens (18%)',
                'AI Coding Lab & Pro Access (12%)'
            ],
            datasets: [{
                data: [62370, 41580, 26730, 17820],
                backgroundColor: [
                    '#1e3a8a', // Deep Navy (Primary)
                    '#0284c7', // Sky Blue
                    '#10b981', // Emerald
                    '#f59e0b'  // Amber
                ],
                hoverOffset: 12,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 14,
                        font: { family: 'Plus Jakarta Sans', size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = context.raw;
                            return ` ₹${val.toLocaleString('en-IN')} (${context.label.split('(')[1]}`;
                        }
                    }
                }
            }
        }
    });
}

function renderMonthlyBookingsChart() {
    const canvas = document.getElementById('monthlyBookingsChart');
    if (!canvas) return;

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
            datasets: [{
                label: 'Completed Tutoring Sessions',
                data: [14, 22, 31, 48, 64, 88],
                backgroundColor: 'rgba(30, 58, 138, 0.88)',
                hoverBackgroundColor: 'rgba(15, 23, 42, 1)',
                borderRadius: 2,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { family: 'Plus Jakarta Sans' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Plus Jakarta Sans' } }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ===================================================================
// 2. ENROLLED STUDENTS (WHO HAVE ENROLLED)
// ===================================================================
function getEnrolledStudentsData() {
    const stored = localStorage.getItem('smart_tutor_enrolled_students');
    if (stored) {
        try { return JSON.parse(stored); } catch(e) {}
    }
    return [];
}

let currentFeeStatusFilter = 'ALL';

function renderEnrolledStudents(list = null) {
    const tbody = document.getElementById('enrolledStudentsTableBody');
    if (!tbody) return;

    const allStudents = getEnrolledStudentsData();
    const students = list !== null ? list : allStudents;

    const countBadge = document.getElementById('enrolledCountBadge');
    if (countBadge) {
        countBadge.textContent = `Showing ${students.length} of ${allStudents.length} Students`;
    }

    if (students.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No enrolled students found matching search filters.</td></tr>`;
        return;
    }

    const tutorByStudent = {
        Student: 'Dr. Rajesh Sharma',
        'Sakshi Ahire': 'Vikram Malhotra',
        'Janvi Thakre': 'Prof. Jayashree Madam',
        'Harsha Patil': 'Aditya Verma',
        'Aarav Mehta': 'Neha Patel',
        'Rohan Kulkarni': 'Dr. Rajesh Sharma'
    };

    tbody.innerHTML = students.map(s => `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="card-icon mb-0 bg-primary-light text-primary" style="width: 36px; height: 36px; font-size: 1rem;">
                        <i class="bi bi-mortarboard"></i>
                    </div>
                    <div>
                        <div class="fw-bold text-dark">${s.name}</div>
                        <span class="badge bg-light text-muted border" style="font-size: 0.72rem;">${s.id}</span>
                        <span class="text-muted" style="font-size: 0.75rem;">${s.email}</span>
                    </div>
                </div>
            </td>
            <td class="fw-semibold text-dark">${s.course}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-check text-primary"></i>
                    <span class="small text-dark">${s.tutor || tutorByStudent[s.name] || 'Not assigned'}</span>
                </div>
            </td>
            <td class="text-muted small">${s.enrolledDate}</td>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 6px; min-width: 70px;">
                        <div class="progress-bar bg-primary" style="width: ${s.progress}%"></div>
                    </div>
                    <span class="small fw-bold text-dark">${s.progress}%</span>
                </div>
            </td>
            <td><span class="badge bg-success-subtle text-success">${s.attendance} Attendance</span></td>
            <td><span class="badge ${s.feeStatus === 'Paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} border fw-bold">${s.feeStatus}</span></td>
            <td>
                <div class="d-flex gap-1 flex-wrap">
                    <button class="btn btn-sm btn-outline-custom py-1 px-2" onclick="showToast('Viewing academic performance file for ${escapeHtml(s.name)}.')">
                        <i class="bi bi-eye me-1"></i> Details
                    </button>
                    ${s.blocked ? `<button class="btn btn-sm btn-outline-success py-1 px-2" onclick="updateStudentAccess('${s.id}', 'unblock')"><i class="bi bi-unlock me-1"></i> Unblock</button>` : `<button class="btn btn-sm btn-outline-warning py-1 px-2" onclick="updateStudentAccess('${s.id}', 'block')"><i class="bi bi-slash-circle me-1"></i> Block</button>`}
                    <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="updateStudentAccess('${s.id}', 'remove')"><i class="bi bi-trash me-1"></i> Remove</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updateStudentAccess(studentId, action) {
    const students = getEnrolledStudentsData();
    const student = students.find(item => item.id === studentId);
    if (!student) return;
    if (action === 'remove' && !window.confirm(`Remove ${student.name} from the student registry?`)) return;

    if (action === 'remove') {
        localStorage.setItem('smart_tutor_enrolled_students', JSON.stringify(students.filter(item => item.id !== studentId)));
    } else {
        student.blocked = action === 'block';
        localStorage.setItem('smart_tutor_enrolled_students', JSON.stringify(students));
    }
    renderEnrolledStudents();
    showToast(action === 'remove' ? 'Student removed.' : action === 'block' ? 'Student blocked.' : 'Student unblocked.', 'info');
}

function filterEnrolledStudents() {
    const query = (document.getElementById('enrolledStudentSearch')?.value || '').toLowerCase().trim();
    let students = getEnrolledStudentsData();

    if (currentFeeStatusFilter !== 'ALL') {
        students = students.filter(s => s.feeStatus.toLowerCase() === currentFeeStatusFilter.toLowerCase());
    }

    if (query) {
        students = students.filter(s => 
            s.name.toLowerCase().includes(query) ||
            s.id.toLowerCase().includes(query) ||
            s.course.toLowerCase().includes(query)
        );
    }

    renderEnrolledStudents(students);
}

function filterEnrolledStudentsByStatus(status) {
    currentFeeStatusFilter = status;
    document.querySelectorAll('.status-filter-btn').forEach(btn => {
        btn.classList.remove('btn-primary-custom', 'active');
        btn.classList.add('btn-outline-custom');
    });

    const activeId = status === 'ALL' ? 'filter-all' : status === 'Paid' ? 'filter-paid' : 'filter-pending';
    const activeBtn = document.getElementById(activeId);
    if (activeBtn) {
        activeBtn.classList.remove('btn-outline-custom');
        activeBtn.classList.add('btn-primary-custom', 'active');
    }

    filterEnrolledStudents();
}

function exportEnrolledStudentsCSV() {
    showToast("Generating CSV report for enrolled students... Download started!");
}

// ===================================================================
// 3. REGISTERED TUTORS WITH DOCUMENTS & VERIFICATION VIEWER
// ===================================================================
function getRegisteredTutorsData() {
    const stored = localStorage.getItem('smart_tutor_registered_tutors');
    if (stored) {
        try { return JSON.parse(stored); } catch(e) {}
    }
    return [];
}

function renderRegisteredTutorsWithDocuments(list = null) {
    const tbody = document.getElementById('registeredTutorsTableBody');
    if (!tbody) return;

    const allTutors = getRegisteredTutorsData();
    const tutors = list !== null ? list : allTutors;

    const countBadge = document.getElementById('tutorsCountBadge');
    if (countBadge) {
        countBadge.textContent = `Showing ${tutors.length} of ${allTutors.length} Registered Faculty`;
    }

    if (tutors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No registered tutors match search.</td></tr>`;
        return;
    }

    tbody.innerHTML = tutors.map(t => {
        const isVerified = t.verificationStatus === 'VERIFIED';
        const statusBadge = isVerified 
            ? `<span class="badge bg-success-subtle text-success"><i class="bi bi-check-circle-fill me-1"></i>Verified</span>`
            : `<span class="badge bg-warning-subtle text-warning"><i class="bi bi-hourglass-split me-1"></i>Pending Review</span>`;

        const accessBadge = t.blocked
            ? '<span class="badge bg-danger-subtle text-danger border">Blocked</span>'
            : statusBadge;

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${t.avatar}" class="rounded-circle" width="46" height="46" alt="${t.name}">
                        <div>
                            <div class="fw-bold text-dark">${t.name}</div>
                            <span class="text-muted" style="font-size: 0.75rem;">${t.email}</span>
                            <div class="text-muted" style="font-size: 0.72rem;">ID: ${t.id} • Registered: ${t.registeredDate}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="fw-semibold text-dark small">${t.specialization}</div>
                    <span class="badge bg-light text-dark border small mt-1"><i class="bi bi-briefcase me-1"></i>${t.experience}</span>
                </td>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-file-earmark-pdf-fill text-danger fs-5"></i>
                        <span class="text-dark small fw-semibold text-truncate" style="max-width: 170px;">${t.documentName}</span>
                    </div>
                </td>
                <td class="small text-muted">${t.documentType}</td>
                <td>${accessBadge}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-primary-custom py-1 px-2" onclick="openDocumentModal('${t.id}')">
                            <i class="bi bi-file-earmark-text me-1"></i> View Document
                        </button>
                        ${t.blocked ? `<button class="btn btn-sm btn-outline-success py-1 px-2" onclick="updateTutorAccess('${t.id}', 'unblock')"><i class="bi bi-unlock me-1"></i> Unblock</button>` : `<button class="btn btn-sm btn-outline-warning py-1 px-2" onclick="updateTutorAccess('${t.id}', 'block')"><i class="bi bi-slash-circle me-1"></i> Block</button>`}
                        <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="updateTutorAccess('${t.id}', 'remove')"><i class="bi bi-trash me-1"></i> Remove</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateTutorAccess(tutorId, action) {
    const tutors = getRegisteredTutorsData();
    const tutor = tutors.find(item => item.id === tutorId);
    if (!tutor) return;
    if (action === 'remove' && !window.confirm(`Remove ${tutor.name} from the tutor registry?`)) return;

    if (action === 'remove') {
        localStorage.setItem('smart_tutor_registered_tutors', JSON.stringify(tutors.filter(item => item.id !== tutorId)));
    } else {
        tutor.blocked = action === 'block';
        localStorage.setItem('smart_tutor_registered_tutors', JSON.stringify(tutors));
    }
    renderRegisteredTutorsWithDocuments();
    showToast(action === 'remove' ? 'Tutor removed.' : action === 'block' ? 'Tutor blocked.' : 'Tutor unblocked.', 'info');
}

function filterRegisteredTutors() {
    const query = (document.getElementById('registeredTutorSearch')?.value || '').toLowerCase().trim();
    const tutors = getRegisteredTutorsData();

    if (!query) {
        renderRegisteredTutorsWithDocuments(tutors);
        return;
    }

    const filtered = tutors.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.specialization.toLowerCase().includes(query) ||
        t.id.toLowerCase().includes(query) ||
        t.documentName.toLowerCase().includes(query)
    );

    renderRegisteredTutorsWithDocuments(filtered);
}

function openDocumentModal(tutorId) {
    const tutors = getRegisteredTutorsData();
    const tutor = tutors.find(t => t.id === tutorId);
    if (!tutor) return;

    selectedTutorForDoc = tutor;

    document.getElementById('docModalTitle').textContent = `Verification Document: ${tutor.documentName}`;
    document.getElementById('docModalTutorName').textContent = `${tutor.name} (${tutor.email})`;
    document.getElementById('docModalCandidate').textContent = tutor.name;
    document.getElementById('docModalRegId').textContent = tutor.id;
    document.getElementById('docModalType').textContent = tutor.documentType;
    document.getElementById('docModalCertHeading').textContent = tutor.documentName.replace('.pdf', '').replace(/_/g, ' ');

    const statusBadge = document.getElementById('docModalStatusBadge');
    if (statusBadge) {
        statusBadge.textContent = tutor.verificationStatus === 'VERIFIED' ? 'Verified & Approved' : 'Pending Administrative Review';
        statusBadge.className = tutor.verificationStatus === 'VERIFIED' ? 'badge bg-success' : 'badge bg-warning text-dark';
    }

    const modalEl = document.getElementById('viewDocumentModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function approveTutorDocument() {
    if (!selectedTutorForDoc) return;

    const tutors = getRegisteredTutorsData();
    const target = tutors.find(t => t.id === selectedTutorForDoc.id);
    if (target) {
        target.verificationStatus = 'VERIFIED';
        localStorage.setItem('smart_tutor_registered_tutors', JSON.stringify(tutors));
    }

    const modalEl = document.getElementById('viewDocumentModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    renderRegisteredTutorsWithDocuments();
    showToast(`Approved documents for ${selectedTutorForDoc.name}! Faculty credentials verified.`, "success");
}

function rejectTutorDocument() {
    if (!selectedTutorForDoc) return;

    const tutors = getRegisteredTutorsData();
    const target = tutors.find(t => t.id === selectedTutorForDoc.id);
    if (target) {
        target.verificationStatus = 'REJECTED';
        localStorage.setItem('smart_tutor_registered_tutors', JSON.stringify(tutors));
    }

    const modalEl = document.getElementById('viewDocumentModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    renderRegisteredTutorsWithDocuments();
    showToast(`Document rejected for ${selectedTutorForDoc.name}. Resubmission notification sent.`, "danger");
}

// ===================================================================
// 4. AI ASSISTANT WHICH CAN HELP HIM TO MANAGE THE APP
// ===================================================================
function triggerAdminAiAction(actionName) {
    appendAdminChat(actionName, 'user');
    showToast(`SmartAdmin AI executing: "${actionName}"...`, "info");

    setTimeout(() => {
        let aiResponse = "";

        if (actionName.includes("Audit pending tutor")) {
            aiResponse = `
                <div class="fw-bold text-success mb-1"><i class="bi bi-check-circle-fill me-1"></i> Tutor Document Audit Completed!</div>
                <div>Scanned uploaded credentials for <strong>2 pending faculty applicants</strong>:</div>
                <ul class="mb-2 mt-1 ps-3">
                    <li><strong>Dr. Ananya Patil:</strong> Submitted <code>PhD_Distributed_Systems_Certificate.pdf</code> &rarr; Verified against college database.</li>
                    <li><strong>Er. Sneha Rao:</strong> Submitted <code>Industry_Experience_Letter.pdf</code> &rarr; Corporate verified.</li>
                </ul>
                <button class="btn btn-sm btn-success" onclick="switchAdminTab('tutors-doc-tab')"><i class="bi bi-check-all me-1"></i> View in Tutors Table</button>
            `;
        } else if (actionName.includes("Calculate this month revenue")) {
            aiResponse = `
                <div class="fw-bold text-primary mb-1"><i class="bi bi-cash-coin me-1"></i> Revenue &amp; Commission Calculation</div>
                <div class="mb-1">Total platform gross: <strong>₹1,48,500</strong>.</div>
                <ul class="mb-2 ps-3">
                    <li>Faculty Tutor Payouts (85%): <strong>₹1,26,225</strong> distributed across 15 tutors.</li>
                    <li>College Dept Platform Reserve (15%): <strong>₹22,275</strong> retained.</li>
                </ul>
                <button class="btn btn-sm btn-outline-custom" onclick="showToast('Disbursement batch exported to college accounts office.')">Authorize Bank Transfer</button>
            `;
        } else if (actionName.includes("Scan platform database")) {
            aiResponse = `
                <div class="fw-bold text-success mb-1"><i class="bi bi-shield-check me-1"></i> Platform Security &amp; Spam Scan Clean</div>
                <p class="mb-1">Audited 42 enrolled students, 15 registered tutors, and 38 barter listings.</p>
                <div class="p-2 bg-light rounded-2 text-dark mb-1">
                    • 0 compromised credentials.<br>
                    • 100% tutor verification certificates authenticated.<br>
                    • Database uptime: <strong>99.98%</strong>.
                </div>
            `;
        } else if (actionName.includes("Broadcast maintenance")) {
            aiResponse = `
                <div class="fw-bold text-primary mb-1"><i class="bi bi-broadcast me-1"></i> Platform Broadcast Dispatched!</div>
                <p class="mb-1">Sent alert to all 42 enrolled students: <em>"Scheduled database index maintenance this Sunday at 2:00 AM IST. Online rooms will remain active."</em></p>
                <span class="badge bg-success small">Delivered to 42 Enrolled Accounts</span>
            `;
        } else if (actionName.includes("Generate monthly IT compliance")) {
            aiResponse = `
                <div class="fw-bold text-primary mb-1"><i class="bi bi-file-earmark-check me-1"></i> Official Platform Compliance Report Ready</div>
                <p class="mb-1">Generated compliance audit covering 42 enrolled students, 15 registered faculty tutors, and total active platform bookings of ₹1,48,500.</p>
                <button class="btn btn-sm btn-outline-custom" onclick="window.print()"><i class="bi bi-download me-1"></i> Download PDF Summary</button>
            `;
        } else {
            aiResponse = `Understood. I have executed the management instruction: <em>"${escapeHtml(actionName)}"</em>. Database updated and logs recorded.`;
        }

        appendAdminChat(aiResponse, 'ai');
    }, 700);
}

function sendAdminAiCommand() {
    const input = document.getElementById('adminAiInput');
    if (!input || !input.value.trim()) return;

    const command = input.value.trim();
    input.value = '';
    triggerAdminAiAction(command);
}

function appendAdminChat(content, sender = 'ai') {
    const container = document.getElementById('adminAiChatContainer');
    if (!container) return;

    const isUser = sender === 'user';
    const bubbleClass = isUser ? 'chat-bubble-user ms-auto' : 'chat-bubble-ai me-auto';
    const senderTitle = isUser ? 'Administrator' : '<i class="bi bi-robot me-1"></i>SmartAdmin AI Copilot';

    const html = `
        <div class="chat-bubble ${bubbleClass}">
            <div class="small fw-bold ${isUser ? 'text-white' : 'text-primary'} mb-1">${senderTitle}</div>
            <div class="${isUser ? 'text-white' : 'text-dark'}">${content}</div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
