package com.ssja.smarttutor.repository;

import com.ssja.smarttutor.entity.Booking;
import com.ssja.smarttutor.enumarates.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking> findByStudentId(Long studentId);

    boolean existsByCourseIdAndBookingDateAndTimeSlotAndStatusAndIdNot(
            Long courseId, String bookingDate, String timeSlot, BookingStatus status, Long id);

    @Query("SELECT b.timeSlot FROM Booking b WHERE b.course.id = :courseId AND b.bookingDate = :date AND b.status = :status AND b.timeSlot IS NOT NULL")
    List<String> findDatedSlots(@Param("courseId") Long courseId, @Param("date") String date,
                               @Param("status") BookingStatus status);

    List<Booking> findByCourseId(Long courseId);

    List<Booking> findByStudentIdAndStatus(
            Long studentId,
            BookingStatus status
    );

    List<Booking> findByCourseIdAndStatus(
            Long courseId,
            BookingStatus status
    );

    boolean existsByStudentIdAndCourseIdAndStatus(
            Long studentId,
            Long courseId,
            BookingStatus status
    );

    List<Booking> findByTimeSlot(String timeSlot);

    List<Booking> findByCourseIdAndTimeSlot(Long courseId, String timeSlot);

    List<Booking> findByStudentIdAndTimeSlot(Long studentId, String timeSlot);

    boolean existsByCourseIdAndTimeSlotAndStatus(
            Long courseId,
            String timeSlot,
            BookingStatus status
    );

    boolean existsByStudentIdAndCourseIdAndTimeSlotAndStatus(
            Long studentId,
            Long courseId,
            String timeSlot,
            BookingStatus status
    );

    @Query("SELECT b.timeSlot FROM Booking b WHERE b.course.id = :courseId AND b.status = :status AND b.timeSlot IS NOT NULL")
    List<String> findBookedTimeSlotsByCourseId(
            @Param("courseId") Long courseId,
            @Param("status") BookingStatus status
    );

    @Query("SELECT b FROM Booking b WHERE b.course.tutor.id = :tutorId")
    List<Booking> findByTutorId(@Param("tutorId") Long tutorId);
}