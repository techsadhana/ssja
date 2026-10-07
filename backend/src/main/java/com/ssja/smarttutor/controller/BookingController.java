package com.ssja.smarttutor.controller;

import com.ssja.smarttutor.entity.Booking;
import com.ssja.smarttutor.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping({"/api/booking", "/api/bookings"})
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // CREATE BOOKING (supports timeSlot, bookingDate, studentId, courseId)
    @PostMapping("/new")
    public ResponseEntity<?> createBooking(
            @RequestBody Map<String, String> body
    ) {
        try {
            Booking booking = bookingService.createBooking(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", e.getMessage(), "status", "false")
            );
        }
    }

    // Root POST alias for createBooking
    @PostMapping
    public ResponseEntity<?> createBookingAlias(
            @RequestBody Map<String, String> body
    ) {
        return createBooking(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBooking(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    bookingService.getBooking(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Booking>> getStudentBookings(
            @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(
                bookingService.getStudentBookings(studentId)
        );
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Booking>> getCourseBookings(
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(
                bookingService.getCourseBookings(courseId)
        );
    }

    // Get bookings for a tutor
    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Booking>> getTutorBookings(
            @PathVariable Long tutorId
    ) {
        return ResponseEntity.ok(
                bookingService.getTutorBookings(tutorId)
        );
    }

    // Get booked timeslots for a specific course
    @GetMapping("/course/{courseId}/booked-slots")
    public ResponseEntity<List<String>> getBookedSlots(
            @PathVariable Long courseId,
            @RequestParam(required = false) String bookingDate
    ) {
        return ResponseEntity.ok(bookingDate == null
                ? bookingService.getBookedTimeSlots(courseId)
                : bookingService.getBookedTimeSlots(courseId, bookingDate));
    }

    // Update / reschedule timeslot
    @PatchMapping("/{id}/timeslot")
    public ResponseEntity<?> updateTimeSlot(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        try {
            String newSlot = body.get("timeSlot") != null ? body.get("timeSlot") : body.get("slot");
            if (newSlot == null || newSlot.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "timeSlot is required"));
            }
            return ResponseEntity.ok(bookingService.updateTimeSlot(id, newSlot, body.get("bookingDate")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    bookingService.cancelBooking(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}