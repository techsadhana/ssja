package com.ssja.smarttutor.sessions;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface SessionEnrollmentRepository extends JpaRepository<SessionEnrollment,Long>{
 List<SessionEnrollment> findBySessionIdAndCancelledFalse(Long id);List<SessionEnrollment> findByStudentIdAndCancelledFalse(Long id);
 boolean existsBySessionIdAndStudentIdAndCancelledFalse(Long sessionId,Long studentId);
}
