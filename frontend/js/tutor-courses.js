let activeCourseTutorId = '';

document.addEventListener('DOMContentLoaded', () => {
    activeCourseTutorId = getActiveCourseTutorId();
    document.getElementById('courseTutorId').value = activeCourseTutorId;
    document.getElementById('tutorIdSummary').textContent = activeCourseTutorId;
    document.getElementById('addCourseForm').addEventListener('submit', saveTutorCourse);
    renderTutorCourses();
});

function getActiveCourseTutorId() {
    const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
    if (user?.role === 'TUTOR' && user.id !== undefined && user.id !== null) {
        return String(user.id);
    }

    try {
        const profile = JSON.parse(localStorage.getItem('smart_tutor_tutor_profile') || '{}');
        return String(profile.id || profile.tutorId || '');
    } catch (error) {
        return '';
    }
}

async function saveTutorCourse(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const name = document.getElementById('courseName').value.trim();
    const description = document.getElementById('courseDescription').value.trim();
    const price = Number(document.getElementById('coursePrice').value);
    let durationValue = Number(document.getElementById('courseDuration').value);

    if (!name || !description || !Number.isFinite(price) || price < 0 || !Number.isFinite(durationValue) || durationValue < 1) {
        showCourseFormMessage('Enter a valid name, description, price, and duration.', 'danger');
        return;
    }

    durationValue = parseInt(durationValue,10);

    const tutorId = Number(activeCourseTutorId);
    if (!Number.isSafeInteger(tutorId) || tutorId < 1) {
        showCourseFormMessage('Register through the tutor registration page before adding courses.', 'danger');
        return;
    }

    const submitButton = event.currentTarget.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    try {
        const response = await fetch(`${window.SMART_TUTOR_API_URL}/api/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tutorId,
                name,
                description,
                price,
                duration: `${durationValue}`
            })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Course could not be saved.');

        await renderTutorCourses();
        form.reset();
        document.getElementById('courseTutorId').value = activeCourseTutorId;
        showCourseFormMessage('Course added successfully.', 'success');
    } catch (error) {
        showCourseFormMessage(error.message.includes('Failed to fetch')
            ? 'Could not connect to the H2 service. Start the backend and try again.'
            : error.message, 'danger');
    } finally {
        submitButton.disabled = false;
    }
}

async function renderTutorCourses() {
    const list = document.getElementById('tutorCoursesList');
    const tutorId = Number(activeCourseTutorId);
    if (!Number.isSafeInteger(tutorId) || tutorId < 1) {
        document.getElementById('courseCount').textContent = '0';
        list.innerHTML = '<p class="text-muted small mb-0">Register a tutor account to load its courses.</p>';
        return;
    }

    list.innerHTML = '<p class="text-muted small mb-0">Loading courses...</p>';
    try {
        const response = await fetch(`${window.SMART_TUTOR_API_URL}/api/courses/tutor/${encodeURIComponent(tutorId)}`);
        const courses = await response.json();
        if (!response.ok) throw new Error(courses.message || 'Courses could not be loaded.');
        document.getElementById('courseCount').textContent = String(courses.length);

        if (!courses.length) {
            list.innerHTML = '<p class="text-muted small mb-0">No courses added yet.</p>';
            return;
        }

        list.innerHTML = courses.map(course => `
            <article class="course-list-item">
              <div class="d-flex flex-wrap align-items-start justify-content-between gap-2">
                <div class="flex-grow-1">
                  <h3 class="h6 fw-bold text-dark mb-1">${escapeCourseHtml(course.name)}</h3>
                  <p class="course-description small text-muted mb-2">${escapeCourseHtml(course.description)}</p>
                  <span class="small text-muted">Tutor ID: ${escapeCourseHtml(course.tutorId || course.tutor?.id)}</span>
                </div>
                <div class="text-sm-end">
                  <strong class="text-success d-block">${formatCoursePrice(course.price)}</strong>
                  <span class="small text-muted">${escapeCourseHtml(course.duration)}</span>
                </div>
              </div>
            </article>
        `).join('');
    } catch (error) {
        document.getElementById('courseCount').textContent = '—';
        list.innerHTML = `<p class="text-danger small mb-0">${escapeCourseHtml(error.message.includes('Failed to fetch')
            ? 'Could not connect to the H2 service. Start the backend to load courses.'
            : error.message)}</p>`;
    }
}

function formatCoursePrice(price) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    }).format(Number(price) || 0);
}

function escapeCourseHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);
}

function showCourseFormMessage(message, type) {
    const messageElement = document.getElementById('courseFormMessage');
    messageElement.className = `alert alert-${type}`;
    messageElement.textContent = message;
    messageElement.focus();
}


