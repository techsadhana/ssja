package com.ssja.smarttutor.service;

import com.ssja.smarttutor.entity.*;
import com.ssja.smarttutor.enumarates.BookingStatus;
import com.ssja.smarttutor.repository.*;
import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BookingServiceTests {
    private final BookingRepository bookings = mock(BookingRepository.class);
    private final StudentRepository students = mock(StudentRepository.class);
    private final CourseRepository courses = mock(CourseRepository.class);
    private final BookingService service = new BookingService(bookings, students, courses);
    private final String date = LocalDate.now().plusDays(1).toString();

    private void prepare() {
        when(students.findById(1L)).thenReturn(Optional.of(new Student()));
        when(courses.findForBooking(2L)).thenReturn(Optional.of(new Course()));
        when(bookings.save(any(Booking.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test void savesDateAndSlot() {
        prepare();
        Booking result = service.createBooking(Map.of("studentId", "1", "courseId", "2",
                "bookingDate", date, "timeSlot", "10:00"));
        assertEquals(date, result.getBookingDate());
        assertEquals("10:00", result.getTimeSlot());
    }

    @Test void rejectsOccupiedSlotOnSameDate() {
        prepare();
        when(bookings.existsByCourseIdAndBookingDateAndTimeSlotAndStatusAndIdNot(
                2L, date, "10:00", BookingStatus.BOOKED, -1L)).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.createBooking(Map.of(
                "studentId", "1", "courseId", "2", "bookingDate", date, "timeSlot", "10:00")));
        verify(bookings, never()).save(any());
    }

    @Test void requiresDateWithSlot() {
        assertThrows(IllegalArgumentException.class, () -> service.createBooking(Map.of(
                "studentId", "1", "courseId", "2", "slot", "10:00")));
    }

    @Test void preservesCourseBookingWithoutSlot() {
        prepare();
        Booking result = service.createBooking(Map.of("studentId", "1", "courseId", "2"));
        assertNull(result.getTimeSlot());
        assertNull(result.getBookingDate());
    }
}
