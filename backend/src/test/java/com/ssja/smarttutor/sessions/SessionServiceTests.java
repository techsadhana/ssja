package com.ssja.smarttutor.sessions;
import com.ssja.smarttutor.entity.*;
import com.ssja.smarttutor.repository.*;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class SessionServiceTests {
 final ScheduledSessionRepository sessions=mock(ScheduledSessionRepository.class);
 final SessionEnrollmentRepository enrollments=mock(SessionEnrollmentRepository.class);
 final SessionNotificationRepository notifications=mock(SessionNotificationRepository.class);
 final CourseRepository courses=mock(CourseRepository.class);
 final TutorRepository tutors=mock(TutorRepository.class);
 final BookingRepository bookings=mock(BookingRepository.class);
 final StudentRepository students=mock(StudentRepository.class);
 final SessionService service=new SessionService(sessions,enrollments,notifications,courses,tutors,bookings,students);
 ScheduledSession slot(){var s=new ScheduledSession();s.setId(1L);s.setTutorId(9L);s.setTitle("Java");s.setDate(LocalDate.now().plusDays(2).toString());s.setStartTime("10:00");s.setEndTime("11:00");s.setMode("ONLINE");s.setKind("ONE_TO_ONE");s.setDetails("https://example.org/meeting");when(sessions.lock(1L)).thenReturn(Optional.of(s));return s;}
 @Test void cannotBookOccupiedPersonalSlot(){slot();when(students.lockForSession(2L)).thenReturn(Optional.of(new Student()));var e=new SessionEnrollment();e.setStudentId(3L);when(enrollments.findBySessionIdAndCancelledFalse(1L)).thenReturn(List.of(e));assertThrows(IllegalArgumentException.class,()->service.enroll(1L,2L));verify(enrollments,never()).save(any());}
 @Test void tutorCannotCancelSomeoneElsesSession(){slot();assertThrows(IllegalArgumentException.class,()->service.announce(1L,8L,"Unwell",true));verify(notifications,never()).save(any());}
 @Test void cancellingNotifiesBookedStudent(){var s=slot();var e=new SessionEnrollment();e.setStudentId(2L);when(enrollments.findBySessionIdAndCancelledFalse(1L)).thenReturn(List.of(e));assertEquals(1,service.announce(1L,9L,"Unwell",true));assertTrue(s.getCancelled());verify(notifications).save(argThat(n->n.getStudentId().equals(2L)&&n.getMessage().contains("Unwell")));}
 @Test void pastSlotCannotBeBooked(){var s=slot();s.setDate(LocalDate.now().minusDays(1).toString());when(students.lockForSession(2L)).thenReturn(Optional.of(new Student()));assertThrows(IllegalArgumentException.class,()->service.enroll(1L,2L));verify(enrollments,never()).save(any());}
}
