# SmartTutor updated project — run and test before deployment

This copy combines the actual Gradle backend with the frontend. The extra older Maven backend inside the frontend was excluded to avoid running the wrong backend. Original uploaded files and original database connection settings were not changed.

## What changed

1. Existing course timeslot implementation is retained: dated bookings, duplicate checks, cancellation and rescheduling. Use `student final.html` for its course booking UI.
2. New `sessions.html` page: tutor publishes scheduled course sessions or personal one-to-one slots. Date, start/end time and online/offline mode are saved in the database.
3. One-to-one slots accept one active student booking. Concurrent bookings lock the slot. Tutor overlaps and student overlaps between new sessions are rejected.
4. Tutor can send a message or cancel a scheduled session with a reason. One-to-one notifications go to its booked student. Group notifications go to every active student enrolled in that course, plus explicit session attendees, without duplicate recipients.
5. Student inbox saves notifications in the backend, shows unread count and refreshes every 15 seconds while the Sessions page is open. It is an in-app inbox, not email/SMS or browser push.
6. New endpoints check a server-issued login token, user role and session ownership. Log in again after a server restart or after 12 hours.
7. Active login page now saves real student/tutor account information. The backend serves frontend pages too, so both can run at one address.

## Beginner run steps (Windows)

1. Extract the ZIP into a NEW folder. Do not replace the team's current folder.
2. Open the `backend` folder as a Gradle project in your IDE. Keep the project's configured JDK 25 available.
3. For a separate practice database, double-click `START_LOCAL_WINDOWS.bat`. This enables the `local` profile and creates `backend/data/smarttutor.mv.db`. It starts empty; register test users and courses.
4. Wait for the backend's started message. Open `http://localhost:8081/login.html` in your browser. Do not use Live Server for this combined run.
5. Register/log in using real accounts. Tutor verification still follows the original project's process. Demo login buttons are not a replacement for real accounts.
6. In the portal, click the green **Sessions & Notifications** link.
7. To use the team's existing H2 database instead, use its normal H2 server and run `gradlew.bat bootRun` without the local profile. Back up that database before allowing schema updates. The database account needs DDL permissions for the new tables.

## Test the three features

- Course timeslot: student opens `http://localhost:8081/student%20final.html`, selects a course, future date and start time, and books. Repeat the exact course/date/time with another student; it should reject the duplicate. Different date should work. Original course-only bookings are supported too.
- One-to-one online: tutor publishes a future ONE_TO_ONE / ONLINE slot with a meeting link. Student books it. A second student cannot book it. The booked student sees the meeting details.
- Offline: publish another ONE_TO_ONE / OFFLINE slot with a venue address. Student books it and sees the address. Cancelling the student booking frees the slot.
- Notification: tutor opens their session, clicks Notify students / cancel, writes a reason and sends it. Student refreshes Sessions and sees it in the inbox. Cancellation removes booking availability.
- All course students: create a GROUP session linked to the tutor's own course. Enroll two test students in that course through the course booking page. Send a tutor notification; both students should receive it even without separately reserving the group session.
- Test student accounts in separate browser profiles or incognito windows. Logging in with another account in the same browser changes the shared login storage.

## Validation and limitations

Passed here: new session JS syntax; active login inline JS syntax; automated frontend rendering checks covering available/booked/cancelled states, notification escaping, unread count and authorization header.

Backend Gradle test command was attempted but could not download the Gradle distribution because this environment cannot reach it. This environment has Java 17 runtime and no Java compiler; the supplied project requires Java 25. Full backend compilation, database initialization, backend tests, concurrent database behavior and full browser integration are NOT verified. Four focused new backend tests are included along with the existing timeslot tests. On your machine run `gradlew.bat test` from backend.

Original declared versions (Spring Boot 4.1.1, Gradle 9.7.1, Hibernate 7.4.9.Final) were preserved; their availability/compatibility has not been verified. If a dependency version fails to resolve locally, send that exact error before changing versions.

Existing localStorage-only mentor demos are still present. Use the new Sessions page for the real backend booking and notification features. Meeting links use an external meeting service; built-in video calling and payments were not added. The legacy course booking endpoints and the wider project's original security model were not fully redesigned; this is a test candidate, not a verified production deployment.

No Docker image or online deployment has been performed yet. Run these checks first.


Offline personal home visits: students enter their full address at booking. The slot stays reserved while the tutor reviews the request. Tutor Accept confirms the visit; Reject releases the slot and notifies the student. Offline group sessions continue at the tutor venue. Restart the backend and log in again after updating. Existing offline personal bookings created before this update do not have a student address; cancel and book a new slot to test the new flow.
