package com.ssja.smarttutor.service;

import com.ssja.smarttutor.entity.Booking;
import com.ssja.smarttutor.entity.Course;
import com.ssja.smarttutor.entity.Student;
import com.ssja.smarttutor.enumarates.BookingStatus;
import com.ssja.smarttutor.repository.BookingRepository;
import com.ssja.smarttutor.repository.CourseRepository;
import com.ssja.smarttutor.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public BookingService(
            BookingRepository bookingRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    private String value(Map<String, String> body, String... keys) {
        for (String key : keys) {
            String value = body.get(key);
            if (value != null && !value.isBlank()) return value.trim();
        }
        return null;
    }

    private void validateDate(String date) {
        if (date == null) throw new IllegalArgumentException("bookingDate is required with timeSlot");
        try {
            if (java.time.LocalDate.parse(date).isBefore(java.time.LocalDate.now()))
                throw new IllegalArgumentException("Booking date cannot be in the past");
        } catch (java.time.format.DateTimeParseException e) {
            throw new IllegalArgumentException("bookingDate must be YYYY-MM-DD");
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public Booking createBooking(Map<String, String> body) {
        String studentValue = value(body, "studentId");
        String courseValue = value(body, "courseId");
        if (studentValue == null || courseValue == null)
            throw new IllegalArgumentException("studentId and courseId are required");
        Long studentId = Long.parseLong(studentValue);
        Long courseId = Long.parseLong(courseValue);
        String slot = value(body, "timeSlot", "timeslot", "time_slot", "slot");
        String date = value(body, "bookingDate", "date");
        if (slot != null || date != null) {
            if (slot == null) throw new IllegalArgumentException("timeSlot is required with bookingDate");
            validateDate(date);
        }
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        Course course = courseRepository.findForBooking(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        if (slot != null) {
            if (bookingRepository.existsByCourseIdAndBookingDateAndTimeSlotAndStatusAndIdNot(
                    courseId, date, slot, BookingStatus.BOOKED, -1L))
                throw new IllegalArgumentException("Selected timeslot is already booked on this date");
        } else if (bookingRepository.existsByStudentIdAndCourseIdAndStatus(studentId, courseId, BookingStatus.BOOKED)) {
            throw new IllegalArgumentException("Student has already booked this course");
        }
        Booking booking = new Booking(student, course);
        booking.setTimeSlot(slot);
        booking.setBookingDate(date);
        return bookingRepository.save(booking);
    }

    public Booking getBooking(Long id) {

        return bookingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Booking not found with id: " + id
                        )
                );
    }

    public List<Booking> getStudentBookings(Long studentId) {

        return bookingRepository.findByStudentId(studentId);
    }

    public List<Booking> getCourseBookings(Long courseId) {

        return bookingRepository.findByCourseId(courseId);
    }

    public List<Booking> getTutorBookings(Long tutorId) {

        return bookingRepository.findByTutorId(tutorId);
    }

    public List<String> getBookedTimeSlots(Long courseId) {

        return bookingRepository.findBookedTimeSlotsByCourseId(courseId, BookingStatus.BOOKED);
    }

    public List<String> getBookedTimeSlots(Long courseId, String date) {
        java.time.LocalDate.parse(date);
        return bookingRepository.findDatedSlots(courseId, date, BookingStatus.BOOKED);
    }

    @org.springframework.transaction.annotation.Transactional
    public Booking updateTimeSlot(Long bookingId, String newTimeSlot, String newDate) {
        Booking booking = getBooking(bookingId);
        courseRepository.findForBooking(booking.getCourse().getId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        if (booking.getStatus() != BookingStatus.BOOKED)
            throw new IllegalArgumentException("Only active bookings can be rescheduled");
        if (newTimeSlot == null || newTimeSlot.isBlank())
            throw new IllegalArgumentException("timeSlot is required");
        String date = newDate == null || newDate.isBlank() ? booking.getBookingDate() : newDate.trim();
        validateDate(date);
        String slot = newTimeSlot.trim();
        if (bookingRepository.existsByCourseIdAndBookingDateAndTimeSlotAndStatusAndIdNot(
                booking.getCourse().getId(), date, slot, BookingStatus.BOOKED, bookingId))
            throw new IllegalArgumentException("Selected timeslot is already booked on this date");
        booking.setTimeSlot(slot);
        booking.setBookingDate(date);
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long id) {

        Booking booking = getBooking(id);

        booking.setStatus(BookingStatus.CANCELLED);

        return bookingRepository.save(booking);
    }
}