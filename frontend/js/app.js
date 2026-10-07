// ===================================================================
// Smart Tutor System — Pure Frontend State Store (Zero Backend)
// Strict Separation: Student, Tutor, and Admin portals are decoupled
// ===================================================================

// Current session user helper
const Auth = {
    getUser() {
        const stored = localStorage.getItem('smart_tutor_user');
        if (stored) {
            try { return JSON.parse(stored); } catch (e) { return null; }
        }
        return null;
    },

    isLoggedIn() {
        return !!localStorage.getItem('smart_tutor_user');
    },

    setUser(user) {
        localStorage.setItem('smart_tutor_user', JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem('smart_tutor_user');
        window.location.href = 'login.html';
    }
};

function updateProfileBioWordCount(textarea) {
    const wordCount = textarea.value.trim().match(/\S+/g)?.length || 0;
    const counter = document.getElementById(`${textarea.id}Count`);
    const exceedsLimit = wordCount > 1000;

    if (counter) {
        counter.textContent = `${wordCount.toLocaleString()} / 1,000 words`;
        counter.classList.toggle('text-danger', exceedsLimit);
    }
    textarea.setCustomValidity(exceedsLimit ? 'Bio must be 1,000 words or fewer.' : '');
    return !exceedsLimit;
}

// Global Seed Data for Student, Tutor, and Admin
const MockData = {
    init() {
        if (!localStorage.getItem('smart_tutor_initialized')) {
            // Student bookings
            const initialBookings = [
                { id: 101, subject: "Java Collections & Streams API", tutorName: "Dr. Rajesh Sharma", date: "Tomorrow, 4:00 PM", status: "CONFIRMED", mode: "Online 1-on-1", link: "meet.google.com/xyz-smart" },
                { id: 102, subject: "Spring Boot Microservices & JPA", tutorName: "Prof. Jayashree Madam", date: "Sep 24, 2:30 PM", status: "PENDING", mode: "Online 1-on-1", link: "" },
                { id: 103, subject: "Data Structures: Graph BFS/DFS", tutorName: "Vikram Malhotra", date: "Sep 28, 11:00 AM", status: "CONFIRMED", mode: "Campus Lab Hub", link: "Room IT-304" }
            ];
            localStorage.setItem('smart_tutor_bookings', JSON.stringify(initialBookings));

            // Skill barter
            const initialBarters = [
                { id: 1, studentName: "Aarav Mehta", give: "Python & Pandas", want: "Figma UI/UX Design", credits: "1 hr/week", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" },
                { id: 2, studentName: "Janvi Thakre", give: "SQL Database Tuning", want: "React & Tailwind CSS", credits: "2 hrs/week", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80" },
                { id: 3, studentName: "Rohan Kulkarni", give: "Data Structures & Java", want: "Spring Cloud & Docker", credits: "1.5 hrs/week", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" }
            ];
            localStorage.setItem('smart_tutor_barters', JSON.stringify(initialBarters));

            // Enrolled Students list for Admin
            const enrolledStudents = [
                { id: "STU-101", name: "Student", email: "student@smarttutor.edu", course: "Java & Spring Boot Full-Stack", enrolledDate: "Aug 12, 2026", progress: 78, attendance: "94%", feeStatus: "Paid" },
                { id: "STU-102", name: "Sakshi Ahire", email: "sakshi@smarttutor.edu", course: "DSA & Algorithmic Problem Solving", enrolledDate: "Aug 15, 2026", progress: 85, attendance: "96%", feeStatus: "Paid" },
                { id: "STU-103", name: "Janvi Thakre", email: "janvi@smarttutor.edu", course: "Database Architecture & Optimization", enrolledDate: "Aug 18, 2026", progress: 62, attendance: "88%", feeStatus: "Paid" },
                { id: "STU-104", name: "Harsha Patil", email: "harsha@smarttutor.edu", course: "AI & Machine Learning Foundations", enrolledDate: "Aug 20, 2026", progress: 70, attendance: "91%", feeStatus: "Paid" },
                { id: "STU-105", name: "Aarav Mehta", email: "aarav@smarttutor.edu", course: "Modern Web Development (React & Node)", enrolledDate: "Sep 01, 2026", progress: 45, attendance: "82%", feeStatus: "Paid" },
                { id: "STU-106", name: "Rohan Kulkarni", email: "rohan@smarttutor.edu", course: "Cloud Microservices & Spring Cloud", enrolledDate: "Sep 05, 2026", progress: 40, attendance: "85%", feeStatus: "Paid" }
            ];
            localStorage.setItem('smart_tutor_enrolled_students', JSON.stringify(enrolledStudents));

            // Registered Tutors with Documents for Admin
            const registeredTutors = [
                {
                    id: "TUT-201",
                    name: "Dr. Rajesh Sharma",
                    email: "rajesh.tutor@smarttutor.edu",
                    specialization: "Java & Spring Boot Microservices",
                    experience: "12 Years",
                    registeredDate: "July 10, 2026",
                    documentName: "PhD_Computer_Science_Degree.pdf",
                    documentType: "Doctoral Degree & Dept Verification",
                    verificationStatus: "VERIFIED",
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                },
                {
                    id: "TUT-202",
                    name: "Prof. Jayashree Madam",
                    email: "jayashree@smarttutor.edu",
                    specialization: "Relational Databases & MySQL Architecture",
                    experience: "15 Years",
                    registeredDate: "July 14, 2026",
                    documentName: "MTech_Degree_&_Faculty_ID.pdf",
                    documentType: "Master of Technology Degree & ID",
                    verificationStatus: "VERIFIED",
                    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80"
                },
                {
                    id: "TUT-203",
                    name: "Vikram Malhotra",
                    email: "vikram.mentor@smarttutor.edu",
                    specialization: "Data Structures & Competitive Algorithms",
                    experience: "4 Years",
                    registeredDate: "Aug 02, 2026",
                    documentName: "Codeforces_Candidate_Master_Certificate.pdf",
                    documentType: "Competitive Coding Credentials",
                    verificationStatus: "VERIFIED",
                    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                },
                {
                    id: "TUT-204",
                    name: "Dr. Ananya Patil",
                    email: "ananya.patil@smarttutor.edu",
                    specialization: "Distributed Systems & Cloud Architecture",
                    experience: "8 Years",
                    registeredDate: "Sep 18, 2026",
                    documentName: "PhD_Distributed_Systems_Certificate.pdf",
                    documentType: "Ph.D Degree Certificate",
                    verificationStatus: "PENDING_REVIEW",
                    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80"
                },
                {
                    id: "TUT-205",
                    name: "Er. Sneha Rao",
                    email: "sneha.rao@smarttutor.edu",
                    specialization: "Full Stack React & Cloud Native APIs",
                    experience: "5 Years",
                    registeredDate: "Sep 19, 2026",
                    documentName: "Industry_Senior_Engineer_Experience_Letter.pdf",
                    documentType: "Corporate Tech Lead Experience Letter",
                    verificationStatus: "PENDING_REVIEW",
                    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=120&q=80"
                }
            ];
            localStorage.setItem('smart_tutor_registered_tutors', JSON.stringify(registeredTutors));

            localStorage.setItem('smart_tutor_initialized', 'true');
        }
    },

    reset() {
        localStorage.removeItem('smart_tutor_initialized');
        localStorage.removeItem('smart_tutor_bookings');
        localStorage.removeItem('smart_tutor_barters');
        localStorage.removeItem('smart_tutor_enrolled_students');
        localStorage.removeItem('smart_tutor_registered_tutors');
        localStorage.removeItem('smart_tutor_user');
        MockData.init();
        showToast("Demo data successfully restored to fresh default state!", "info");
        setTimeout(() => location.reload(), 600);
    }
};

// Global Image Error Fallback (Prevents broken images if offline in college lab)
window.addEventListener('error', function (e) {
    if (e.target && e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
        const altText = e.target.alt || 'User';
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(altText)}&background=7c3aed&color=fff&size=120`;
    }
}, true);

// Animated Counter Function (Enterprise Count-Up Effect)
function animateCounters() {
    const counterEls = document.querySelectorAll('[data-counter]');
    counterEls.forEach(el => {
        const rawTarget = el.getAttribute('data-counter');
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = rawTarget.includes('.');
        const targetValue = parseFloat(rawTarget);
        
        if (isNaN(targetValue)) return;
        
        const duration = 1200;
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic curve
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = targetValue * easeProgress;

            let formatted;
            if (isDecimal) {
                formatted = current.toFixed(1);
            } else {
                formatted = Math.round(current).toLocaleString('en-IN');
            }

            el.textContent = `${prefix}${formatted}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                let finalFormatted = isDecimal ? targetValue.toFixed(1) : Math.round(targetValue).toLocaleString('en-IN');
                el.textContent = `${prefix}${finalFormatted}${suffix}`;
            }
        }

        requestAnimationFrame(updateNumber);
    });
}

// Enterprise Glassmorphism Toast Notification
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const icon = type === 'success' ? 'bi-check-circle-fill text-success' :
                 type === 'danger' ? 'bi-exclamation-octagon-fill text-danger' :
                 type === 'info' ? 'bi-info-circle-fill text-info' : 'bi-stars text-warning';

    const toastHtml = `
        <div id="${toastId}" class="toast toast-glass align-items-center border-0 shadow-lg mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex align-items-center p-3">
                <i class="bi ${icon} fs-5 me-2"></i>
                <div class="toast-body p-0 fw-semibold text-white flex-grow-1" style="font-size: 0.92rem;">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white ms-3 my-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    if (typeof bootstrap !== 'undefined' && bootstrap.Toast) {
        try {
            const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
            bsToast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        } catch (e) {
            toastEl.style.display = 'block';
            setTimeout(() => toastEl.remove(), 2500);
        }
    } else {
        toastEl.style.display = 'block';
        toastEl.style.opacity = '1';
        setTimeout(() => toastEl.remove(), 2500);
    }
}

// Execute on page load
document.addEventListener('DOMContentLoaded', () => {
    MockData.init();
    setTimeout(animateCounters, 150);
});
