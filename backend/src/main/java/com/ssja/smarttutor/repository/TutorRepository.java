package com.ssja.smarttutor.repository;

import com.ssja.smarttutor.entity.Tutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TutorRepository extends JpaRepository<Tutor, Long> {
 @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
 @org.springframework.data.jpa.repository.Query("select t from Tutor t where t.id=:id")
 java.util.Optional<Tutor> lockForSession(@org.springframework.data.repository.query.Param("id") Long id);


    Optional<Tutor> findByEmail(String email);

    Optional<Tutor> findByPhoneNumber(String phoneNumber);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    List<Tutor> findByCity(String city);

    List<Tutor> findByState(String state);

    List<Tutor> findByHighestQualification(String highestQualification);

    List<Tutor> findByVerificationStatus(String verificationStatus);

    @Query("SELECT t FROM Tutor t WHERE LOWER(t.subjectsOrSkills) LIKE LOWER(CONCAT('%', :subject, '%'))")
    List<Tutor> searchBySubject(@Param("subject") String subject);
}