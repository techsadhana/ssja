// ===================================================================
// Smart Tutor System — Tutor Page Controller
// Modules: 1. Tutor Portal, 2. Browse Mentor, 3. AI Recommendation
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
    initTutorPortal();
    initTutorProfile();
    initTutorAvailability();
    initTutorDemoSettings();
    renderTutorDocuments();
    initTutorAccount();
    renderTutorEarnings();
    renderTutorRequests();
    renderTutorSchedule();
    renderTutorTppList();
    renderMentorsDirectory();
    setDefaultBookingDate();
    window.addEventListener('storage', event => {
        if (event.key === 'smart_tutor_inquiries') renderTutorRequests();
        if (event.key === 'smart_tutor_bookings') renderTutorSchedule();
    });
});

// Seed Mentors Data
const MENTORS_LIST = [
    {
        id: 1,
        name: "Dr. Rajesh Sharma",
        title: "Associate Professor (IT)",
        rating: 4.9,
        reviewsCount: 48,
        hourlyRate: 450,
        subjects: ["Java", "Spring Boot", "Microservices", "Design Patterns"],
        category: "Java",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        bio: "Over 12 years of enterprise Java & Spring Boot architecture experience. Passionate about helping students crack technical interviews.",
        style: "Hands-on Code Pair",
        level: "All Levels"
    },
    {
        id: 2,
        name: "Prof. Jayashree Madam",
        title: "Senior Faculty & Database Architect",
        rating: 4.95,
        reviewsCount: 62,
        hourlyRate: 500,
        subjects: ["Database", "MySQL", "PostgreSQL", "Query Tuning"],
        category: "Database",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
        bio: "Specializes in relational schema normalization, B-Tree index optimization, and distributed database transactions.",
        style: "Concept Deep-Dive",
        level: "Intermediate"
    },
    {
        id: 3,
        name: "Vikram Malhotra",
        title: "Competitive Programmer & Senior Peer Mentor",
        rating: 4.85,
        reviewsCount: 39,
        hourlyRate: 350,
        subjects: ["DSA", "C++", "Dynamic Programming", "Graph Theory"],
        category: "DSA",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        bio: "Candidate Master on Codeforces. Mentored 80+ students to master tricky Graph BFS/DFS and tree recursion.",
        style: "Exam Prep Drill",
        level: "Intermediate"
    },
    {
        id: 4,
        name: "Neha Patel",
        title: "Full-Stack Engineer & React Specialist",
        rating: 4.88,
        reviewsCount: 44,
        hourlyRate: 400,
        subjects: ["Web", "React", "Node.js", "REST APIs", "Tailwind"],
        category: "Web",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        bio: "Frontend lead building responsive web apps. Loves teaching hooks, modern CSS layout, and asynchronous JavaScript.",
        style: "Hands-on Code Pair",
        level: "Beginner"
    },
    {
        id: 5,
        name: "Aditya Verma",
        title: "AI Research Scholar",
        rating: 4.92,
        reviewsCount: 31,
        hourlyRate: 550,
        subjects: ["AI", "Python", "Machine Learning", "PyTorch", "NLP"],
        category: "AI",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
        bio: "Published researcher focusing on LLM fine-tuning and computer vision models. Clear, methodical explanations.",
        style: "Concept Deep-Dive",
        level: "Advanced"
    }
];

// 1. Tutor Portal State & Inquiries
function initTutorPortal() {
    const user = Auth.getUser();
    if (user && user.role === 'TUTOR') {
        const welcomeEl = document.getElementById('tutorWelcomeName');
        if (welcomeEl) welcomeEl.textContent = user.fullName;
    }
}

function initTutorProfile() {
    const savedProfile = localStorage.getItem('smart_tutor_tutor_profile');
    const profile = savedProfile ? JSON.parse(savedProfile) : {};
    const user = Auth.getUser();
    const fullName = profile.fullName || (user?.role === 'TUTOR' ? user.fullName : 'Dr. Rajesh Sharma');

    const welcomeEl = document.getElementById('tutorWelcomeName');
    const nameInput = document.getElementById('tutorProfileName');
    const emailInput = document.getElementById('tutorProfileEmail');
    const departmentInput = document.getElementById('tutorProfileDepartment');
    const titleInput = document.getElementById('tutorProfileTitle');
    const subjectsInput = document.getElementById('tutorProfileSubjects');
    const bioInput = document.getElementById('tutorProfileBio');
    const photoInput = document.getElementById('tutorProfilePhotoPreview');
    const photoPlaceholder = document.getElementById('tutorProfilePhotoPlaceholder');
    const navPhoto = document.getElementById('tutorNavPhoto');
    const navPhotoPlaceholder = document.getElementById('tutorNavPhotoPlaceholder');

    if (welcomeEl) welcomeEl.textContent = fullName;
    if (nameInput && profile.fullName) nameInput.value = profile.fullName;
    if (emailInput && profile.email) emailInput.value = profile.email;
    if (departmentInput && profile.department) departmentInput.value = profile.department;
    if (titleInput && profile.title) titleInput.value = profile.title;
    if (subjectsInput && profile.subjects) subjectsInput.value = profile.subjects;
    if (bioInput && profile.bio) bioInput.value = profile.bio;
    if (profile.photo && photoInput && photoPlaceholder) {
        photoInput.src = profile.photo;
        photoInput.style.display = 'block';
        photoPlaceholder.style.display = 'none';
    }
    if (profile.photo && navPhoto && navPhotoPlaceholder) {
        navPhoto.src = profile.photo;
        navPhoto.style.display = 'block';
        navPhotoPlaceholder.style.display = 'none';
    }
    if (bioInput) updateProfileBioWordCount(bioInput);
}

const DEFAULT_TUTOR_AVAILABILITY = { days: [1, 2, 3, 4, 5], startTime: '10:00', endTime: '18:00' };

function getTutorAvailability() {
    try {
        return JSON.parse(localStorage.getItem('smart_tutor_tutor_availability') || 'null') || DEFAULT_TUTOR_AVAILABILITY;
    } catch (error) {
        return DEFAULT_TUTOR_AVAILABILITY;
    }
}

function formatTutorTime(totalMinutes) {
    const date = new Date(2000, 0, 1, Math.floor(totalMinutes / 60), totalMinutes % 60);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function renderTutorAvailabilitySummary(availability) {
    const summary = document.getElementById('tutorAvailabilitySummary');
    if (!summary) return;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = (availability.days || []).map(Number).sort((first, second) => first - second).map(day => dayNames[day]);
    if (!days.length) {
        summary.className = 'alert alert-warning py-2 small mt-3 mb-0';
        summary.textContent = 'No available days selected. Students cannot book until you add availability.';
        return;
    }

    const start = Number(availability.startTime.slice(0, 2)) * 60 + Number(availability.startTime.slice(3, 5));
    const end = Number(availability.endTime.slice(0, 2)) * 60 + Number(availability.endTime.slice(3, 5));
    summary.className = 'alert alert-success py-2 small mt-3 mb-0';
    summary.textContent = `Available ${days.join(', ')} · ${formatTutorTime(start)} to ${formatTutorTime(end)}. Students can request one-hour sessions in this window.`;
}

function initTutorAvailability() {
    const availability = getTutorAvailability();
    document.querySelectorAll('.tutor-availability-day').forEach(input => {
        input.checked = availability.days.map(Number).includes(Number(input.value));
    });
    const startInput = document.getElementById('tutorAvailabilityStart');
    const endInput = document.getElementById('tutorAvailabilityEnd');
    if (startInput) startInput.value = availability.startTime;
    if (endInput) endInput.value = availability.endTime;
    renderTutorAvailabilitySummary(availability);
}

function saveTutorAvailability() {
    const days = Array.from(document.querySelectorAll('.tutor-availability-day:checked')).map(input => Number(input.value));
    const startTime = document.getElementById('tutorAvailabilityStart')?.value;
    const endTime = document.getElementById('tutorAvailabilityEnd')?.value;
    if (!days.length || !startTime || !endTime || startTime >= endTime) {
        showToast('Choose at least one day and a valid availability time range.', 'warning');
        return;
    }

    const availability = { days, startTime, endTime };
    localStorage.setItem('smart_tutor_tutor_availability', JSON.stringify(availability));
    renderTutorAvailabilitySummary(availability);
    showToast('Weekly availability updated for student bookings.', 'success');
}

function isTutorAvailableAt(dateValue, timeValue, excludedRequestId = '') {
    const availability = getTutorAvailability();
    const weekday = new Date(`${dateValue}T00:00:00`).getDay();
    const requestedStart = Number(timeValue.slice(0, 2)) * 60 + Number(timeValue.slice(3, 5));
    const availableStart = Number(availability.startTime.slice(0, 2)) * 60 + Number(availability.startTime.slice(3, 5));
    const availableEnd = Number(availability.endTime.slice(0, 2)) * 60 + Number(availability.endTime.slice(3, 5));
    if (!availability.days.map(Number).includes(weekday) || requestedStart < availableStart || requestedStart + 60 > availableEnd) return false;

    const bookings = JSON.parse(localStorage.getItem('smart_tutor_bookings') || '[]');
    const startLabel = formatTutorTime(requestedStart);
    const endLabel = formatTutorTime(requestedStart + 60);
    const requestedSlot = `${startLabel} - ${endLabel}`;
    return !bookings.some(booking =>
        String(booking.id) !== String(excludedRequestId) &&
        ['PENDING', 'CONFIRMED', 'RESCHEDULE_PROPOSED'].includes(booking.status) &&
        ((booking.sessionDate === dateValue && booking.timeSlot === requestedSlot) ||
            (booking.proposedSessionDate === dateValue && booking.proposedTimeSlot === requestedSlot))
    );
}

function openTutorRescheduleModal(requestId) {
    const requests = JSON.parse(localStorage.getItem('smart_tutor_inquiries') || '[]');
    const request = requests.find(item => String(item.id) === String(requestId));
    if (!request) return;

    const today = new Date();
    const dateInput = document.getElementById('tutorRescheduleDate');
    const timeInput = document.getElementById('tutorRescheduleTime');
    const idInput = document.getElementById('tutorRescheduleRequestId');
    const availability = getTutorAvailability();
    if (dateInput) {
        dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        dateInput.value = request.sessionDate && request.sessionDate >= dateInput.min ? request.sessionDate : dateInput.min;
    }
    if (timeInput) timeInput.value = availability.startTime;
    if (idInput) idInput.value = request.id;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('tutorRescheduleModal')).show();
}

function submitTutorReschedule(event) {
    event.preventDefault();
    const requestId = document.getElementById('tutorRescheduleRequestId')?.value;
    const date = document.getElementById('tutorRescheduleDate')?.value;
    const time = document.getElementById('tutorRescheduleTime')?.value;
    const message = document.getElementById('tutorRescheduleAvailabilityMessage');
    if (!requestId || !date || !time || !isTutorAvailableAt(date, time, requestId)) {
        if (message) {
            message.className = 'small text-danger mt-2';
            message.textContent = 'Choose a day and one-hour start time within your published availability.';
        }
        showToast('The proposed time must fit your published weekly availability.', 'warning');
        return;
    }

    const requests = JSON.parse(localStorage.getItem('smart_tutor_inquiries') || '[]');
    const request = requests.find(item => String(item.id) === String(requestId));
    if (!request) return;

    const startMinutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
    const timeSlot = `${formatTutorTime(startMinutes)} - ${formatTutorTime(startMinutes + 60)}`;
    const displayDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    request.status = 'RESCHEDULE_PROPOSED';
    request.proposedDate = `${displayDate}, ${timeSlot}`;
    request.proposedSessionDate = date;
    request.proposedTimeSlot = timeSlot;
    localStorage.setItem('smart_tutor_inquiries', JSON.stringify(requests));

    const bookings = JSON.parse(localStorage.getItem('smart_tutor_bookings') || '[]');
    const booking = bookings.find(item => String(item.id) === String(requestId));
    if (booking) {
        booking.status = 'RESCHEDULE_PROPOSED';
        booking.proposedDate = request.proposedDate;
        booking.proposedSessionDate = date;
        booking.proposedTimeSlot = timeSlot;
        localStorage.setItem('smart_tutor_bookings', JSON.stringify(bookings));
    }

    renderTutorRequests();
    bootstrap.Modal.getInstance(document.getElementById('tutorRescheduleModal'))?.hide();
    showToast('New session time sent to the student.', 'success');
}

function saveTutorProfile(event) {
    event.preventDefault();
    const bioInput = document.getElementById('tutorProfileBio');
    if (bioInput && !updateProfileBioWordCount(bioInput)) {
        bioInput.reportValidity();
        return;
    }
    const form = event.currentTarget;
    const formData = new FormData(form);
    const existingProfile = JSON.parse(localStorage.getItem('smart_tutor_tutor_profile') || '{}');
    const profile = { ...existingProfile, ...Object.fromEntries(formData.entries()) };
    localStorage.setItem('smart_tutor_tutor_profile', JSON.stringify(profile));

    const currentUser = Auth.getUser() || {};
    Auth.setUser({ ...currentUser, ...profile, role: 'TUTOR' });
    const welcomeEl = document.getElementById('tutorWelcomeName');
    if (welcomeEl) welcomeEl.textContent = profile.fullName;
    showToast('Tutor profile saved.', 'success');
}

function handleTutorPhotoChange(event) {
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
                const profile = JSON.parse(localStorage.getItem('smart_tutor_tutor_profile') || '{}');
                profile.photo = photo;
                localStorage.setItem('smart_tutor_tutor_profile', JSON.stringify(profile));

                const preview = document.getElementById('tutorProfilePhotoPreview');
                const placeholder = document.getElementById('tutorProfilePhotoPlaceholder');
                if (preview && placeholder) {
                    preview.src = photo;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                }
                const navPhoto = document.getElementById('tutorNavPhoto');
                const navPhotoPlaceholder = document.getElementById('tutorNavPhotoPlaceholder');
                if (navPhoto && navPhotoPlaceholder) {
                    navPhoto.src = photo;
                    navPhoto.style.display = 'block';
                    navPhotoPlaceholder.style.display = 'none';
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

function initTutorDemoSettings() {
    const saved = localStorage.getItem('smart_tutor_tutor_demo_settings');
    const settings = saved ? JSON.parse(saved) : { offerDemo: true, maxDemosWeek: 2 };
    const toggle = document.getElementById('tutorDemoOptInToggle');
    const select = document.getElementById('tutorMaxDemosSelect');
    if (toggle) toggle.checked = !!settings.offerDemo;
    if (select) select.value = String(settings.maxDemosWeek || 2);
}

function toggleTutorDemoOptIn(checked) {
    const saved = localStorage.getItem('smart_tutor_tutor_demo_settings');
    const settings = saved ? JSON.parse(saved) : { offerDemo: true, maxDemosWeek: 2 };
    settings.offerDemo = checked;
    localStorage.setItem('smart_tutor_tutor_demo_settings', JSON.stringify(settings));
    showToast(checked ? 'Free 20-min demo sessions enabled for new students.' : 'Free demo sessions disabled.', checked ? 'success' : 'info');
}

function updateTutorMaxDemos(val) {
    const saved = localStorage.getItem('smart_tutor_tutor_demo_settings');
    const settings = saved ? JSON.parse(saved) : { offerDemo: true, maxDemosWeek: 2 };
    settings.maxDemosWeek = parseInt(val, 10) || 2;
    localStorage.setItem('smart_tutor_tutor_demo_settings', JSON.stringify(settings));
    showToast(`Weekly free demo quota set to max ${val} demos/week.`, 'success');
}

function initTutorAccount() {
    const balance = Number(localStorage.getItem('smart_tutor_tutor_balance') || 8400);
    const balanceEl = document.getElementById('tutorAvailableBalance');
    if (balanceEl) balanceEl.textContent = `₹${balance.toLocaleString('en-IN')}`;
}

function renderTutorDocuments() {
    const container = document.getElementById('tutorDocumentsList');
    if (!container) return;

    const documents = JSON.parse(localStorage.getItem('smart_tutor_tutor_documents') || '[]');
    documents.forEach(document => {
        const icon = document.name.toLowerCase().endsWith('.pdf') ? 'bi-file-earmark-pdf text-danger' : 'bi-file-earmark-text text-primary';
        container.insertAdjacentHTML('afterbegin', `
            <div class="d-flex align-items-center justify-content-between gap-3 p-3 bg-light rounded-3 border">
                <div class="d-flex align-items-center gap-2"><i class="bi ${icon} fs-5"></i><div><strong class="small text-dark d-block">${escapeTutorHtml(document.name)}</strong><span class="text-muted" style="font-size: 0.75rem;">Added from tutor profile</span></div></div>
                <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">Review pending</span>
            </div>
        `);
    });
}

function addTutorDocument(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const documents = JSON.parse(localStorage.getItem('smart_tutor_tutor_documents') || '[]');
    documents.unshift({ name: file.name, type: file.type, size: file.size });
    localStorage.setItem('smart_tutor_tutor_documents', JSON.stringify(documents.slice(0, 10)));
    renderTutorDocuments();
    event.target.value = '';
    showToast('Document added to your profile.', 'success');
}

function renderTutorEarnings() {
    const container = document.getElementById('tutorEarningsList');
    if (!container) return;

    const earnings = JSON.parse(localStorage.getItem('smart_tutor_tutor_earnings') || '[]');
    const rows = earnings.length ? earnings : [
        { topic: 'Core Java Multithreading & Executors', studentName: 'Rohan Kulkarni', isDemo: false, grossFee: 500, platformCut: 75, amount: 425 },
        { topic: 'Spring Boot Architecture Orientation', studentName: 'Priya Sharma', isDemo: true, grossFee: 0, platformCut: 0, amount: 0 },
        { topic: 'Hibernate ORM Query Optimization', studentName: 'Aarav Mehta', isDemo: false, grossFee: 600, platformCut: 90, amount: 510 }
    ];

    container.innerHTML = rows.slice(0, 8).map(earning => `
        <tr>
            <td>
                <div class="fw-bold text-dark small">${escapeTutorHtml(earning.topic)}</div>
                <div class="text-muted" style="font-size: 0.72rem;"><i class="bi bi-person me-1"></i>${escapeTutorHtml(earning.studentName || 'Student Member')}</div>
            </td>
            <td>
                ${earning.isDemo ? '<span class="badge bg-warning text-dark border">FREE DEMO</span>' : '<span class="badge bg-primary-subtle text-primary border border-primary-subtle">PAID 1-ON-1</span>'}
            </td>
            <td class="small fw-semibold text-dark">₹${(earning.grossFee !== undefined ? earning.grossFee : (earning.isDemo ? 0 : 500)).toLocaleString('en-IN')}</td>
            <td class="small text-danger fw-semibold">-₹${(earning.platformCut !== undefined ? earning.platformCut : (earning.isDemo ? 0 : 75)).toLocaleString('en-IN')}</td>
            <td class="small fw-bold text-end ${earning.amount > 0 ? 'text-success' : 'text-muted'}">+₹${Number(earning.amount).toLocaleString('en-IN')}</td>
        </tr>
    `).join('');
}

function escapeTutorHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[character]));
}

function addTutorEarnings(amount, request) {
    const currentBalance = Number(localStorage.getItem('smart_tutor_tutor_balance') || 8400);
    localStorage.setItem('smart_tutor_tutor_balance', String(currentBalance + amount));

    const earnings = JSON.parse(localStorage.getItem('smart_tutor_tutor_earnings') || '[]');
    const isDemo = !!request.isDemo;
    const grossFee = request.grossFee !== undefined ? request.grossFee : (isDemo ? 0 : 500);
    const platformCut = request.platformCut !== undefined ? request.platformCut : (isDemo ? 0 : Math.round(grossFee * 0.15));
    earnings.unshift({ 
        amount, 
        topic: request.topic, 
        studentName: request.studentName,
        isDemo,
        grossFee,
        platformCut,
        date: new Date().toLocaleDateString('en-IN')
    });
    localStorage.setItem('smart_tutor_tutor_earnings', JSON.stringify(earnings.slice(0, 15)));
    initTutorAccount();
    renderTutorEarnings();
}

function calculateCustomPayout(val) {
    const hourly = parseFloat(val) || 0;
    const adminCut = Math.round(hourly * 0.15);
    const tutorNet = Math.round(hourly * 0.85);
    const cutEl = document.getElementById('calcAdminCut');
    const netEl = document.getElementById('calcTutorNet');
    if (cutEl) cutEl.textContent = `-₹${adminCut}`;
    if (netEl) netEl.textContent = `+₹${tutorNet}`;
}

function submitTutorSupport(event) {
    event.preventDefault();
    const topic = document.getElementById('tutorSupportTopic')?.value || 'General support';
    const message = document.getElementById('tutorSupportMessage')?.value.trim();
    if (!message) {
        showToast('Please add a short message first.', 'info');
        return;
    }

    const tickets = JSON.parse(localStorage.getItem('smart_tutor_support_tickets') || '[]');
    tickets.unshift({ role: 'TUTOR', topic, message, createdAt: new Date().toISOString() });
    localStorage.setItem('smart_tutor_support_tickets', JSON.stringify(tickets.slice(0, 10)));
    event.currentTarget.reset();
    showToast('Your support message has been sent.', 'success');
}

function prepareTutorLesson() {
    const topic = document.getElementById('tutorHelpTopic')?.value.trim();
    const level = document.getElementById('tutorHelpLevel')?.value || 'College student';
    const style = document.getElementById('tutorHelpStyle')?.value || 'analogy';
    const result = document.getElementById('tutorLessonSuggestion');
    if (!result) return;

    if (!topic) {
        showToast('Add a topic first.', 'info');
        return;
    }

    const ideas = {
        analogy: {
            title: 'Start with a familiar comparison',
            body: `Compare ${topic} with something the student already knows, then connect each part of the comparison to the real idea.`,
            activity: 'Ask the student to explain the comparison back to you in their own words.'
        },
        example: {
            title: 'Work through one small example',
            body: `Use a small ${topic} example and pause after each step. Let the student predict the next step before you continue.`,
            activity: 'Change one value in the example and ask what will happen now.'
        },
        activity: {
            title: 'Give the student a short task',
            body: `Give the student a simple ${topic} problem they can finish in five minutes without help.`,
            activity: 'Review the answer together and ask which part felt confusing.'
        }
    };
    const idea = ideas[style];

    result.innerHTML = `
        <span class="badge bg-light text-dark border mb-2"><i class="bi bi-journal-text text-primary me-1"></i> ${escapeTutorHtml(level)}</span>
        <h5 class="fw-bold text-dark mb-2">${escapeTutorHtml(idea.title)}</h5>
        <p class="text-muted mb-3">${escapeTutorHtml(idea.body)}</p>
        <div class="p-3 bg-light rounded-3 border">
            <strong class="small text-dark d-block mb-1"><i class="bi bi-check2-circle text-success me-1"></i>Quick activity</strong>
            <span class="small text-muted">${escapeTutorHtml(idea.activity)}</span>
        </div>
    `;
}

function renderTutorRequests() {
    const tableBody = document.getElementById('tutorRequestsTable');
    if (!tableBody) return;

    // Retrieve or default requests
    let requests = [
        { 
            id: 201, 
            studentName: "Priya Sharma", 
            topic: "Spring Boot Security JWT Filter Chain", 
            date: "Today, 4:00 PM", 
            mode: "Home Tuition", 
            status: "PENDING",
            isDemo: true,
            fee: 0,
            kycVerified: true,
            address: "Mayur Vihar Ph-1, Delhi",
            phoneMasked: "+91 98XXX-XX210",
            phoneReal: "+91 98765-43210"
        },
        { 
            id: 202, 
            studentName: "Rohan Verma", 
            topic: "MySQL Execution Plans & Index Tuning", 
            date: "Tomorrow, 2:00 PM", 
            mode: "Online 1-on-1", 
            status: "PENDING",
            isDemo: false,
            fee: 500,
            kycVerified: true,
            address: "Koramangala, Bengaluru",
            phoneMasked: "+91 99XXX-XX482",
            phoneReal: "+91 99876-54321"
        },
        { 
            id: 203, 
            studentName: "Janvi Thakre", 
            topic: "Graph BFS/DFS & Dynamic Programming", 
            date: "Sep 28, 5:00 PM", 
            mode: "Online 1-on-1", 
            status: "ACCEPTED",
            isDemo: false,
            fee: 500,
            kycVerified: true,
            address: "Pune University Campus",
            phoneMasked: "+91 97XXX-XX911",
            phoneReal: "+91 97654-32100"
        }
    ];

    const storedRequests = localStorage.getItem('smart_tutor_inquiries');
    if (storedRequests) {
        try { requests = JSON.parse(storedRequests); } catch(e) {}
    } else {
        localStorage.setItem('smart_tutor_inquiries', JSON.stringify(requests));
    }

    const pending = requests.filter(r => r.status === 'PENDING');
    const pendingStat = document.getElementById('statPendingCount');
    if (pendingStat) pendingStat.textContent = pending.length;

    if (requests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No active booking requests at the moment.</td></tr>`;
        return;
    }

    tableBody.innerHTML = requests.map(r => {
        let actionButtons = r.status === 'PENDING' ? `
            <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-sm btn-success py-1 px-3" onclick="handleRequestDecision(${r.id}, 'ACCEPTED')">
                    <i class="bi bi-check-lg me-1"></i> Accept
                </button>
                <button class="btn btn-sm btn-outline-primary py-1 px-2" onclick="openTutorRescheduleModal('${r.id}')">
                    <i class="bi bi-calendar2-week me-1"></i> Suggest time
                </button>
                <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="handleRequestDecision(${r.id}, 'DECLINED')">
                    <i class="bi bi-x-lg me-1"></i> Decline
                </button>
            </div>
        ` : r.status === 'RESCHEDULE_PROPOSED'
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Waiting for student</span>`
            : r.status === 'ACCEPTED'
                ? `<span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1"><i class="bi bi-check2-circle me-1"></i>Confirmed</span>`
                : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">Declined</span>`;

        const demoBadge = r.isDemo 
            ? `<span class="badge bg-warning text-dark fw-bold border"><i class="bi bi-gift-fill me-1"></i>FREE 20-MIN DEMO - ₹0</span>`
            : `<span class="badge bg-success-subtle text-success fw-bold border border-success-subtle"><i class="bi bi-cash-stack me-1"></i>PAID SESSION - ₹${r.fee || 500}</span>`;

        const kycBadge = r.kycVerified
            ? `<span class="badge bg-success-subtle text-success border border-success-subtle ms-1" style="font-size: 0.68rem;"><i class="bi bi-shield-fill-check me-1"></i>College ID &amp; Roll No. Verified</span>`
            : `<span class="badge bg-light text-muted border ms-1" style="font-size: 0.68rem;">Verification pending</span>`;
        const dateDisplay = r.status === 'RESCHEDULE_PROPOSED' && r.proposedDate
            ? `<div class="alert alert-success py-1 px-2 small mb-1">Proposed: ${escapeTutorHtml(r.proposedDate)}</div><span class="text-muted small">Requested: ${escapeTutorHtml(r.date)}</span>`
            : `<span class="text-muted small"><i class="bi bi-clock me-1"></i>${escapeTutorHtml(r.date)}</span>`;

        return `
            <tr>
                <td class="fw-bold text-dark">
                    <div class="d-flex align-items-center gap-2 mb-1">
                        <i class="bi bi-person-circle text-primary fs-5"></i>
                        <span>${escapeTutorHtml(r.studentName)}</span>
                    </div>
                    ${kycBadge}
                </td>
                <td>
                    <div class="fw-bold text-dark small mb-1">${escapeTutorHtml(r.topic)}</div>
                    ${dateDisplay}
                </td>
                <td>
                    ${demoBadge}
                    ${r.isDemo ? '<div class="text-muted" style="font-size: 0.72rem; margin-top: 2px;">Tutor Payout: ₹0 (Orientation)</div>' : '<div class="text-success" style="font-size: 0.72rem; margin-top: 2px;">Net Payout (85%): ₹' + Math.round((r.fee || 500) * 0.85) + '</div>'}
                </td>
                <td>
                    <span class="badge bg-light text-dark border small mb-1">${escapeTutorHtml(r.mode)}</span>
                    <div class="small text-muted mb-1"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${escapeTutorHtml(r.address || 'Mayur Vihar Ph-1, Delhi')}</div>
                    <div class="small text-muted font-monospace">
                        <i class="bi bi-telephone-fill me-1"></i>${r.phoneMasked || '+91 98XXX-XX210'}
                        <button class="btn btn-link btn-sm p-0 text-decoration-none ms-1" style="font-size: 0.75rem;" onclick="unlockEmergencyContact('${escapeTutorHtml(r.studentName)}', '${r.phoneReal || '+91 98765-43210'}')">
                            <i class="bi bi-unlock-fill text-primary"></i> Unlock
                        </button>
                    </div>
                </td>
                <td>${actionButtons}</td>
            </tr>
        `;
    }).join('');
}

function unlockEmergencyContact(studentName, phone) {
    const nameEl = document.getElementById('unlockStudentName');
    const phoneEl = document.getElementById('unlockDirectPhone');
    if (nameEl) nameEl.textContent = studentName;
    if (phoneEl) phoneEl.textContent = phone;

    const modalEl = document.getElementById('unlockContactModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function triggerHindiSafetyCall() {
    const modalEl = document.getElementById('hindiSafetyCallModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
    if ('speechSynthesis' in window) {
        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance("नमस्ते, यह स्मार्टट्यूटर सुरक्षा केंद्र से ऑटोमेटेड सुरक्षा जांच है। अगर आप सुरक्षित हैं तो 1 दबाएं, सहायता के लिए 2 दबाएं।");
            utterance.lang = 'hi-IN';
            window.speechSynthesis.speak(utterance);
        } catch(e) {}
    }
}

function respondHindiSafetyCall(option) {
    if ('speechSynthesis' in window) {
        try { window.speechSynthesis.cancel(); } catch(e) {}
    }
    const modalEl = document.getElementById('hindiSafetyCallModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    if (option === 1) {
        showToast("Suraksha Verified: [1] Pressed. Session marked Safe & Monitored.", "success");
    } else if (option === 2) {
        triggerEmergencySOS();
    }
}

function triggerEmergencySOS() {
    const modalEl = document.getElementById('emergencySosModal');
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
    showToast("EMERGENCY ALERT: Registered Guardian (+91 98110-54321) & Campus Proctor notified via SMS!", "danger");
}

function renderTutorTppList() {
    const container = document.getElementById('tutorTppContainer');
    if (!container) return;

    const defaultDpps = [
        {
            id: 1,
            title: "DPP-04: Balanced AVL Trees & Rotations",
            studentName: "Priya Sharma",
            duration: "Data Structures & Algorithms",
            frequency: "Level 2: Standard University Exam",
            pedagogy: "1-on-1 Practice Sheet",
            milestones: [
                "Q1. Explain the Balance Factor calculation for an AVL tree and write the exact condition for a Right (LL) rotation.",
                "Q2. Given the insertion sequence [30, 20, 10], draw the unbalanced tree and trace the pivot rotation step.",
                "Q3. Implement a short recursive function in Java or Python to verify if a Binary Search Tree is height-balanced.",
                "Q4. Compare the worst-case search complexity of an unbalanced BST vs an AVL Tree with N elements."
            ],
            deliverable: "Submit handwritten code or digital trace before tomorrow's live class (8:00 PM)"
        },
        {
            id: 2,
            title: "DPP-05: Spring Security & JWT Filter Verification",
            studentName: "Rohan Verma",
            duration: "Spring Boot & Microservices",
            frequency: "Level 2: Standard University Exam",
            pedagogy: "1-on-1 Practice Sheet",
            milestones: [
                "Q1. Diagram the OncePerRequestFilter chain execution flow in Spring Security 6.",
                "Q2. Write code for validating HMAC-SHA256 signature from Bearer token in the Authorization header.",
                "Q3. How does SecurityContextHolder store authenticated user credentials in ThreadLocal memory?",
                "Q4. Handle expired token exception and return HTTP 401 Unauthorized JSON error response."
            ],
            deliverable: "Test endpoints via Postman and share exported collection before Friday lecture"
        }
    ];

    let dpps = defaultDpps;
    const stored = localStorage.getItem('smart_tutor_dpps') || localStorage.getItem('smart_tutor_tpps');
    if (stored) {
        try { dpps = JSON.parse(stored); } catch(e) {}
    } else {
        localStorage.setItem('smart_tutor_dpps', JSON.stringify(dpps));
        localStorage.setItem('smart_tutor_tpps', JSON.stringify(dpps));
    }

    container.innerHTML = dpps.map(dpp => `
        <div class="col-lg-6">
            <div class="card-spacious h-100 d-flex flex-column justify-content-between border rounded-1">
                <div>
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <span class="badge bg-primary text-white">${escapeTutorHtml(dpp.duration || 'Computer Science')}</span>
                        <span class="badge bg-light text-dark border"><i class="bi bi-bar-chart-steps me-1"></i>${escapeTutorHtml(dpp.frequency || 'Standard')}</span>
                    </div>
                    <h5 class="fw-bold text-dark mb-1">${escapeTutorHtml(dpp.title)}</h5>
                    <p class="small text-muted mb-3">
                        <i class="bi bi-person-fill text-primary me-1"></i>Assigned Student: <strong>${escapeTutorHtml(dpp.studentName)}</strong>
                    </p>

                    <h6 class="small fw-bold text-dark mb-2"><i class="bi bi-list-check text-success me-1"></i>Practice Questions:</h6>
                    <div class="bg-light p-3 border rounded-1 mb-3 small" style="max-height: 180px; overflow-y: auto;">
                        <ol class="mb-0 ps-3">
                            ${(Array.isArray(dpp.milestones) ? dpp.milestones : String(dpp.milestones).split('\n')).map(m => `<li class="mb-1">${escapeTutorHtml(m)}</li>`).join('')}
                        </ol>
                    </div>

                    <div class="p-2 px-3 bg-white border rounded-1 mb-3">
                        <span class="small text-muted d-block fw-semibold" style="font-size: 0.72rem;">DUE DATE / INSTRUCTIONS:</span>
                        <strong class="small text-dark"><i class="bi bi-calendar-check text-warning me-1"></i>${escapeTutorHtml(dpp.deliverable || 'Submit before next lecture')}</strong>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                    <span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-circle-fill me-1"></i>Active DPP Sheet</span>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-custom" onclick="showToast('Practice DPP sheet PDF downloaded for ${escapeTutorHtml(dpp.studentName)}!', 'success')">
                            <i class="bi bi-file-earmark-pdf me-1"></i> Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function handleCreateTpp(event) {
    event.preventDefault();
    const title = document.getElementById('tppPlanTitle')?.value.trim();
    const studentName = document.getElementById('tppStudentName')?.value.trim();
    const duration = document.getElementById('tppDuration')?.value || 'Computer Science';
    const frequency = document.getElementById('tppFrequency')?.value || 'Level 2: Standard';
    const milestonesText = document.getElementById('tppMilestones')?.value.trim() || '';
    const deliverable = document.getElementById('tppDeliverable')?.value.trim() || 'Submit before next lecture';

    if (!title || !studentName) {
        showToast('Please fill in DPP title and student name.', 'warning');
        return;
    }

    const milestones = milestonesText.split('\n').filter(line => line.trim().length > 0);

    const stored = localStorage.getItem('smart_tutor_dpps') || localStorage.getItem('smart_tutor_tpps');
    const dpps = stored ? JSON.parse(stored) : [];

    const newDpp = {
        id: Date.now(),
        title,
        studentName,
        duration,
        frequency,
        pedagogy: '1-on-1 Practice Sheet',
        milestones,
        deliverable
    };

    dpps.unshift(newDpp);
    localStorage.setItem('smart_tutor_dpps', JSON.stringify(dpps));
    localStorage.setItem('smart_tutor_tpps', JSON.stringify(dpps));

    const modalEl = document.getElementById('createTppModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    }

    renderTutorTppList();
    showToast(`Daily Practice Problem (DPP) published successfully for ${studentName}!`, 'success');
}

function handleRequestDecision(requestId, decision) {
    const storedRequests = localStorage.getItem('smart_tutor_inquiries');
    if (!storedRequests) return;

    let requests = JSON.parse(storedRequests);
    requests = requests.map(r => {
        if (r.id === requestId) {
            r.status = decision;
        }
        return r;
    });

    localStorage.setItem('smart_tutor_inquiries', JSON.stringify(requests));

    const bookings = JSON.parse(localStorage.getItem('smart_tutor_bookings') || '[]');
    const booking = bookings.find(item => String(item.id) === String(requestId));
    if (booking) {
        booking.status = decision === 'ACCEPTED' ? 'CONFIRMED' : 'DECLINED';
        localStorage.setItem('smart_tutor_bookings', JSON.stringify(bookings));
    }
    renderTutorRequests();

    if (decision === 'ACCEPTED') {
        const acceptedRequest = requests.find(request => request.id === requestId);
        if (acceptedRequest) {
            if (acceptedRequest.isDemo) {
                addTutorEarnings(0, { ...acceptedRequest, isDemo: true, grossFee: 0, platformCut: 0 });
                showToast("Free 20-min Demo accepted! Session logged at ₹0 payout.", "success");
            } else {
                const gross = acceptedRequest.fee || 500;
                const platformCut = Math.round(gross * 0.15);
                const netPayout = Math.round(gross * 0.85);
                addTutorEarnings(netPayout, { ...acceptedRequest, isDemo: false, grossFee: gross, platformCut: platformCut });
                showToast(`Booking approved! Net payout of +₹${netPayout} (85%) credited to ledger upon completion.`, "success");
            }
        }
        // Update tutor stats
        const confirmedStat = document.getElementById('statConfirmedCount');
        if (confirmedStat) confirmedStat.textContent = parseInt(confirmedStat.textContent || 4) + 1;
    } else {
        showToast("Booking request declined.", "info");
    }
}

function renderTutorSchedule() {
    const container = document.getElementById('tutorScheduleContainer');
    if (!container) return;

    const storedBookings = JSON.parse(localStorage.getItem('smart_tutor_bookings') || '[]');
    const savedProfile = JSON.parse(localStorage.getItem('smart_tutor_tutor_profile') || '{}');
    const tutorName = savedProfile.fullName || 'Dr. Rajesh Sharma';
    const bookedSchedules = storedBookings
        .filter(booking => booking.status === 'CONFIRMED' && booking.tutorName === tutorName)
        .map(booking => ({
            time: booking.date,
            student: booking.studentName || 'Student',
            subject: booking.subject,
            mode: booking.mode,
            status: 'Confirmed booking',
            isBooked: true
        }));

    const schedules = [...bookedSchedules, ...[
        { time: "Today, 4:00 PM – 5:00 PM", student: "Rohan Kulkarni", subject: "Java Collections & Custom Comparators", mode: "Online Room (WebRTC)", status: "In 2 Hours" },
        { time: "Tomorrow, 11:30 AM – 12:30 PM", student: "Janvi Thakre", subject: "Spring Boot Microservices Gateway", mode: "Campus Lab Hub 304", status: "Tomorrow" },
        { time: "Friday, 3:00 PM – 4:00 PM", student: "Aarav Mehta", subject: "Hibernate First & Second Level Cache", mode: "Online Room (WebRTC)", status: "Upcoming" }
    ]];

    container.innerHTML = schedules.map(s => `
        <div class="col-md-4">
            <div class="p-3 ${s.isBooked ? 'bg-success-subtle border-success' : 'bg-light'} rounded-3 border h-100 d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge ${s.isBooked ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'} small">${s.status}</span>
                        <span class="small text-muted"><i class="bi bi-clock me-1"></i>${s.time}</span>
                    </div>
                    <h6 class="fw-bold text-dark mb-1">${s.subject}</h6>
                    <p class="small text-muted mb-2"><i class="bi bi-person me-1"></i>Student: <strong>${s.student}</strong></p>
                </div>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span class="small text-secondary">${s.mode}</span>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-custom py-1" onclick="showToast('Classroom link copied!')"><i class="bi bi-link-45deg"></i></button>
                        <a href="student.html?joinLive=1&subject=${encodeURIComponent(s.subject)}&tutor=Dr.+Rajesh+Sharma" class="btn btn-sm btn-primary-custom py-1 px-2">
                            <i class="bi bi-camera-video-fill me-1"></i> Start
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 2. Browse Mentors Module
function renderMentorsDirectory(list = MENTORS_LIST) {
    const container = document.getElementById('mentorsDirectoryContainer');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = `<div class="col-12 text-center py-5 text-muted"><i class="bi bi-search" style="font-size: 2rem;"></i><p class="mt-2">No mentors found matching your filters. Try clearing search.</p></div>`;
        return;
    }

    container.innerHTML = list.map(m => `
        <div class="col-lg-4 col-md-6">
            <div class="tutor-card d-flex flex-column justify-content-between">
                <div>
                    <div class="d-flex align-items-start gap-3 mb-3">
                        <img src="${m.avatar}" class="tutor-avatar" alt="${m.name}">
                        <div>
                            <h6 class="fw-bold text-dark mb-1">${m.name}</h6>
                            <p class="text-muted small mb-1">${m.title}</p>
                            <span class="rating-badge"><i class="bi bi-star-fill text-warning"></i> ${m.rating} (${m.reviewsCount})</span>
                        </div>
                    </div>

                    <p class="small text-muted mb-3">${m.bio}</p>

                    <div class="mb-3">
                        ${m.subjects.map(s => `<span class="subject-badge">${s}</span>`).join('')}
                    </div>
                </div>

                <div class="pt-3 border-top d-flex align-items-center justify-content-between">
                    <div>
                        <span class="fs-5 fw-bold text-dark">₹${m.hourlyRate}</span>
                        <span class="text-muted small">/hour</span>
                    </div>
                    <button class="btn btn-primary-custom btn-sm" onclick="openBookingModal(${m.id})">
                        <i class="bi bi-calendar-plus me-1"></i> Book Session
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterMentors() {
    const searchVal = (document.getElementById('mentorSearchInput')?.value || '').toLowerCase().trim();
    const categoryVal = document.getElementById('mentorSubjectFilter')?.value || 'ALL';
    const sortVal = document.getElementById('mentorSortFilter')?.value || 'rating';

    let filtered = MENTORS_LIST.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(searchVal) || 
                              m.title.toLowerCase().includes(searchVal) ||
                              m.subjects.some(s => s.toLowerCase().includes(searchVal));
        const matchesCat = categoryVal === 'ALL' || m.category === categoryVal || m.subjects.includes(categoryVal);
        return matchesSearch && matchesCat;
    });

    if (sortVal === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortVal === 'price-low') {
        filtered.sort((a, b) => a.hourlyRate - b.hourlyRate);
    } else if (sortVal === 'price-high') {
        filtered.sort((a, b) => b.hourlyRate - a.hourlyRate);
    }

    renderMentorsDirectory(filtered);
}

// Booking Modal Action
let selectedMentorForBooking = null;

function openBookingModal(mentorId) {
    const mentor = MENTORS_LIST.find(m => m.id === mentorId);
    if (!mentor) return;

    if (Auth.getUser()?.role !== 'STUDENT') {
        window.location.href = `signup-student.html?redirect=tutor-book&tutorId=${encodeURIComponent(mentorId)}`;
        return;
    }

    selectedMentorForBooking = mentor;
    document.getElementById('bookModalName').textContent = mentor.name;
    document.getElementById('bookModalRate').textContent = `₹${mentor.hourlyRate} / hour • ${mentor.title}`;
    document.getElementById('bookModalAvatar').src = mentor.avatar;
    document.getElementById('bookSessionTopic').value = `Guidance in ${mentor.subjects[0]}`;

    const modalEl = document.getElementById('bookSessionModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
    const mentorId = Number(new URLSearchParams(window.location.search).get('bookMentor'));
    if (mentorId) openBookingModal(mentorId);
});

function setDefaultBookingDate() {
    const dateInput = document.getElementById('bookSessionDate');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
    }
}

function confirmBookingSubmission() {
    if (!selectedMentorForBooking) return;

    const topic = document.getElementById('bookSessionTopic').value.trim() || 'General Mentorship';
    const date = document.getElementById('bookSessionDate').value;
    const slot = document.getElementById('bookSessionSlot').value;
    const mode = document.getElementById('bookSessionMode').value;

    const stored = localStorage.getItem('smart_tutor_bookings');
    const bookings = stored ? JSON.parse(stored) : [];

    const newBooking = {
        id: Date.now(),
        subject: topic,
        tutorName: selectedMentorForBooking.name,
        date: `${date}, ${slot}`,
        status: "PENDING",
        mode: mode,
        link: mode.includes('Online') ? 'meet.google.com/xyz-smart' : 'Campus Lab 304'
    };

    bookings.unshift(newBooking);
    localStorage.setItem('smart_tutor_bookings', JSON.stringify(bookings));

    // Also send to tutor inquiries
    const storedInquiries = localStorage.getItem('smart_tutor_inquiries');
    const inquiries = storedInquiries ? JSON.parse(storedInquiries) : [];
    inquiries.unshift({
        id: newBooking.id,
        studentName: Auth.getUser()?.fullName || "Student Member",
        topic: topic,
        date: `${date}, ${slot}`,
        mode: mode,
        status: "PENDING"
    });
    localStorage.setItem('smart_tutor_inquiries', JSON.stringify(inquiries));

    // Close modal
    const modalEl = document.getElementById('bookSessionModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    renderTutorRequests();
    showToast(`Booking request sent to ${selectedMentorForBooking.name}! Status: Pending Approval.`, "success");
}

// 3. AI Assistance for Recommendation
function generateAiMentorRecommendations() {
    const subject = document.getElementById('aiRecomSubject').value;
    const level = document.getElementById('aiRecomLevel').value;
    const style = document.getElementById('aiRecomStyle').value;
    const statusEl = document.getElementById('aiRecomStatus');
    const resultsContainer = document.getElementById('aiRecomResultsContainer');

    if (statusEl) statusEl.textContent = "AI computing compatibility matrix...";
    showToast("Gemini AI matching your learning profile against verified mentors...", "info");

    setTimeout(() => {
        if (statusEl) statusEl.textContent = "Top 2 Ranked Matches Found";

        // Filter or rank mentors based on selection
        let matched = [...MENTORS_LIST].sort((a, b) => {
            let scoreA = a.style === style ? 30 : 10;
            if (a.subjects.some(s => subject.includes(s))) scoreA += 50;
            scoreA += a.rating * 10;

            let scoreB = b.style === style ? 30 : 10;
            if (b.subjects.some(s => subject.includes(s))) scoreB += 50;
            scoreB += b.rating * 10;

            return scoreB - scoreA;
        }).slice(0, 2);

        resultsContainer.innerHTML = matched.map((m, idx) => {
            const matchScore = idx === 0 ? "98% Compatibility" : "92% Compatibility";
            const badgeClass = idx === 0 ? "bg-success" : "bg-primary";
            const reasoning = idx === 0
                ? `Top match for <strong>${subject}</strong>. Aligns with your <em>${style}</em> preference and has high student retention scores.`
                : `Alternative specialist with high conceptual clarity in <strong>${m.subjects.slice(0,2).join(', ')}</strong>.`;

            return `
                <div class="p-3 border rounded-3 bg-white mb-3 shadow-sm">
                    <div class="d-flex align-items-start justify-content-between mb-2">
                        <div class="d-flex align-items-center gap-3">
                            <img src="${m.avatar}" class="rounded-circle" width="56" height="56" alt="${m.name}">
                            <div>
                                <h6 class="fw-bold text-dark mb-0">${m.name}</h6>
                                <span class="small text-muted">${m.title}</span>
                                <div class="rating-badge mt-1"><i class="bi bi-star-fill text-warning"></i> ${m.rating} Rating</div>
                            </div>
                        </div>
                        <span class="badge ${badgeClass} p-2">${matchScore}</span>
                    </div>

                    <div class="p-2 bg-light rounded-2 small text-dark mb-3">
                        <span class="fw-semibold">Suggested match:</span> ${reasoning}
                    </div>

                    <div class="d-flex align-items-center justify-content-between">
                        <div>
                            <span class="fw-bold text-dark fs-6">₹${m.hourlyRate}</span>
                            <span class="small text-muted">/hr</span>
                        </div>
                        <button class="btn btn-sm btn-primary-custom" onclick="openBookingModal(${m.id})">
                            View &amp; Book
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        showToast("Tutor recommendations are ready.");
    }, 850);
}
