package com.ssja.smarttutor.repository;

import com.ssja.smarttutor.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select c from Course c where c.id = :id")
    java.util.Optional<Course> findForBooking(@org.springframework.data.repository.query.Param("id") Long id);

    List<Course> findByNameIgnoreCaseContaining(String name);

    List<Course> findByTutorId(Long tutorId);
}
