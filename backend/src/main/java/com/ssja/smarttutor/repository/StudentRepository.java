package com.ssja.smarttutor.repository;

import com.ssja.smarttutor.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
 @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 @org.springframework.data.jpa.repository.Query("select s from Student s where s.id=:id")
 java.util.Optional<Student> lockForSession(@org.springframework.data.repository.query.Param("id") Long id);

    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Student> findByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);

    Optional<Student> findByRollNumber(String rollNumber);

    boolean existsByRollNumber(String rollNumber);

    List<Student> findByCity(String city);

    List<Student> findByState(String state);

    List<Student> findByCurrentEducationStage(String currentEducationStage);

    List<Student> findByPrimaryLearningGoal(String primaryLearningGoal);
}