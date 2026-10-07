    const STUDENT_COURSES_ALL_ENDPOINT =
      (window.SMART_TUTOR_API_URL || 'http://localhost:8081') + '/api/courses/all';

    const STUDENT_BOOKING_ENDPOINT =
      (window.SMART_TUTOR_API_URL || 'http://localhost:8081') + '/api/bookings/new';

    function getCurrentStudentId() {
      // First use the application's Auth object when available.
      try {
        if (typeof Auth !== 'undefined' && typeof Auth.getUser === 'function') {
          const user = Auth.getUser();
          const id = user?.id ?? user?.studentId;
          if (id !== undefined && id !== null && String(id).trim() !== '') {
            return id;
          }
        }
      } catch (error) {
        console.warn('Could not read student from Auth:', error);
      }

      // The signup flow stores the active student here.
      const storageKeys = [
        'smart_tutor_active_user',
        'smart_tutor_student_profile',
        'smartTutorActiveUser',
        'student',
        'user'
      ];

      for (const key of storageKeys) {
        for (const storage of [localStorage, sessionStorage]) {
          try {
            const raw = storage.getItem(key);
            if (!raw) continue;

            const user = JSON.parse(raw);
            const id = user?.id ?? user?.studentId;

            if (id !== undefined && id !== null && String(id).trim() !== '') {
              return id;
            }
          } catch (error) {
            // Ignore invalid/non-JSON storage values and continue.
          }
        }
      }

      // Also support a direct stored ID if the login flow uses one.
      for (const key of [
        'studentId',
        'student_id',
        'smart_tutor_student_id'
      ]) {
        const id = localStorage.getItem(key) || sessionStorage.getItem(key);
        if (id !== null && String(id).trim() !== '') {
          return id;
        }
      }

      return null;
    }

    function getCourseListFromResponse(data) {
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.courses)) return data.courses;
      if (Array.isArray(data?.content)) return data.content;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    }

    function getCourseId(course) {
      return course?.id ??
             course?.courseId ??
             course?.course?.id ??
             course?.course?.courseId ??
             null;
    }

    function getCourseName(course) {
      return course?.name ??
             course?.courseName ??
             course?.title ??
             course?.course?.name ??
             course?.course?.courseName ??
             'Course';
    }

    function getCoursePrice(course) {
      return course?.price ??
             course?.coursePrice ??
             course?.course?.price ??
             null;
    }

    function getCourseDuration(course) {
      return course?.duration ??
             course?.courseDuration ??
             course?.course?.duration ??
             null;
    }

    function getCourseTutor(course) {
      return course?.tutor ?? course?.teacher ?? course?.instructor ?? null;
    }

    function getCourseTutorName(course) {
      const tutor = getCourseTutor(course);

      return course?.tutorName ??
             course?.teacherName ??
             tutor?.fullName ??
             tutor?.name ??
             tutor?.tutorName ??
             'Tutor';
    }

    function formatCoursePrice(price) {
      if (price === null || price === undefined || price === '') {
        return 'Price not specified';
      }

      const numericPrice = Number(price);

      if (Number.isFinite(numericPrice)) {
        return `₹${numericPrice.toLocaleString('en-IN')}`;
      }

      return String(price);
    }

    function escapeStudentBookingHtml(value) {
      return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function showStudentBookingStatus(message, type = 'info') {
      const element = document.getElementById('studentBookingStatus');
      if (!element) return;

      element.className = `alert alert-${type} py-2 small mb-3`;
      element.textContent = message;
      element.classList.remove('d-none');
    }

    function hideStudentBookingStatus() {
      const element = document.getElementById('studentBookingStatus');
      if (!element) return;
      element.classList.add('d-none');
    }

    function openStudentFindMentorModal() {
      const modalElement = document.getElementById('studentBookMentorModal');

      if (!modalElement) {
        console.error('Student booking modal was not found.');
        return;
      }

      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
      modal.show();

      hideStudentBookingStatus();
      loadStudentBookingCourses();
    }

    async function loadStudentBookingCourses() {
      const list = document.getElementById('studentBookingCourseList');
      const refreshButton = document.getElementById('studentBookingRefreshButton');
      const studentInfo = document.getElementById('studentBookingStudentInfo');

      if (!list) return;

      const studentId = getCurrentStudentId();

      if (studentInfo) {
        studentInfo.textContent = studentId !== null
          ? `Student ID: ${studentId}`
          : 'Student ID not found';
      }

      if (refreshButton) {
        refreshButton.disabled = true;
        refreshButton.innerHTML =
          '<span class="spinner-border spinner-border-sm me-1"></span>Loading';
      }

      list.innerHTML = `
        <div class="text-center py-4 text-muted">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Loading available courses...
        </div>
      `;

      try {
        const response = await fetch(STUDENT_COURSES_ALL_ENDPOINT, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          const message = typeof data === 'object'
            ? (data?.message || data?.error)
            : data;

          throw new Error(
            message || `Could not load courses. HTTP ${response.status}`
          );
        }

        const courses = getCourseListFromResponse(data);
        renderStudentBookingCourses(courses);

      } catch (error) {
        console.error('Course loading error:', error);

        list.innerHTML = `
          <div class="text-center py-4 border rounded-3 bg-light">
            <i class="bi bi-exclamation-circle fs-3 text-danger"></i>
            <div class="fw-bold text-dark mt-2">Could not load courses</div>
            <div class="text-muted small mb-3">${escapeStudentBookingHtml(error.message || 'Please try again.')}</div>
            <button type="button" class="btn btn-sm btn-outline-custom" onclick="loadStudentBookingCourses()">
              <i class="bi bi-arrow-clockwise me-1"></i>Try again
            </button>
          </div>
        `;
      } finally {
        if (refreshButton) {
          refreshButton.disabled = false;
          refreshButton.innerHTML =
            '<i class="bi bi-arrow-clockwise me-1"></i>Refresh';
        }
      }
    }

    function renderStudentBookingCourses(courses) {
      const list = document.getElementById('studentBookingCourseList');
      if (!list) return;

      if (!courses.length) {
        list.innerHTML = `
          <div class="text-center py-4 border rounded-3 bg-light">
            <i class="bi bi-journal-x fs-3 text-muted"></i>
            <div class="fw-bold text-dark mt-2">No courses available</div>
            <div class="text-muted small">Tutors have not added any courses yet.</div>
          </div>
        `;
        return;
      }

      list.innerHTML = courses.map(course => {
        const id = getCourseId(course);
        const name = getCourseName(course);
        const tutorName = getCourseTutorName(course);
        const price = getCoursePrice(course);
        const duration = getCourseDuration(course);

        if (id === null || id === undefined) {
          return `
            <div class="border rounded-3 p-3 bg-light">
              <div class="fw-bold text-dark">${escapeStudentBookingHtml(name)}</div>
              <div class="small text-muted">${escapeStudentBookingHtml(tutorName)}</div>
              <div class="small text-danger mt-1">Course ID unavailable</div>
            </div>
          `;
        }

        const durationText = duration !== null && duration !== undefined && duration !== ''
          ? ` • ${escapeStudentBookingHtml(duration)} hours`
          : '';

        return `
          <div class="border rounded-3 p-3 bg-white shadow-sm">
            <div class="d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div class="flex-grow-1 min-w-0">
                <div class="fw-bold text-dark">${escapeStudentBookingHtml(name)}</div>
                <div class="small text-muted mt-1">
                  <i class="bi bi-person-circle me-1"></i>
                  ${escapeStudentBookingHtml(tutorName)}
                  ${durationText}
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2">
                  ${escapeStudentBookingHtml(formatCoursePrice(price))}
                </span>
                <label class="small">Session date
                  <input type="date" class="form-control form-control-sm" id="courseDate${Number(id)}" required>
                </label>
                <label class="small">Start time
                  <input type="time" class="form-control form-control-sm" id="courseSlot${Number(id)}" required>
                </label>
                <button
                  type="button"
                  class="btn btn-sm btn-primary-custom"
                  onclick="bookStudentCourse(${Number(id)})"
                >
                  <i class="bi bi-calendar-check me-1"></i>Book
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    async function bookStudentCourse(courseId) {
      if (courseId === null || courseId === undefined || String(courseId).trim() === '') {
        showStudentBookingStatus('Course ID is missing.', 'danger');
        return;
      }

      const rawStudentId = getCurrentStudentId();

      if (rawStudentId === null || rawStudentId === undefined || String(rawStudentId).trim() === '') {
        showStudentBookingStatus(
          'Student ID could not be found. Please sign in again before booking.',
          'danger'
        );
        return;
      }

      /*
       * Spring Boot commonly maps these IDs to Long/Integer.
       * Convert both values before JSON.stringify so the request contains
       * numbers instead of strings.
       *
       * Example:
       * {
       *   "studentId": 12,
       *   "courseId": 7
       * }
       */
      const numericCourseId = Number(courseId);
      const numericStudentId = Number(rawStudentId);

      if (!Number.isInteger(numericCourseId) || numericCourseId <= 0) {
        showStudentBookingStatus('Invalid course ID.', 'danger');
        return;
      }

      if (!Number.isInteger(numericStudentId) || numericStudentId <= 0) {
        showStudentBookingStatus('Invalid student ID. Please sign in again.', 'danger');
        return;
      }

      const bookingDate = document.getElementById(`courseDate${numericCourseId}`)?.value;
      const timeSlot = document.getElementById(`courseSlot${numericCourseId}`)?.value;
      if (!bookingDate || !timeSlot) {
        showStudentBookingStatus('Choose a session date and start time.', 'danger');
        return;
      }

      const buttons = document.querySelectorAll('#studentBookingCourseList button');
      buttons.forEach(button => button.disabled = true);

      showStudentBookingStatus('Creating your booking...', 'info');

      try {
        const bookingData = {
          studentId: numericStudentId,
          courseId: numericCourseId,
          bookingDate,
          timeSlot
        };

        console.log('Creating booking:', bookingData);

        const response = await fetch(STUDENT_BOOKING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });

        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json')
          ? await response.json()
          : await response.text();

        if (!response.ok) {
          const message = typeof data === 'object'
            ? (data?.message || data?.error)
            : data;

          throw new Error(
            message || `Booking failed. HTTP ${response.status}`
          );
        }

        console.log('Booking created:', data);

        showStudentBookingStatus(
          'Course booked successfully.',
          'success'
        );

        // Reload the course list so the UI reflects the current state.
        await loadStudentBookingCourses();

      } catch (error) {
        console.error('Course booking error:', error);

        showStudentBookingStatus(
          error.message || 'Could not create booking.',
          'danger'
        );

        buttons.forEach(button => button.disabled = false);
      }
    }

    // Keep the old button name working if any other part of the page calls it.
    function submitStudentBookingRequest() {
      showStudentBookingStatus(
        'Please select a course and click Book.',
        'info'
      );
    }

