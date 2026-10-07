package com.ssja.smarttutor.sessions;
import org.springframework.data.jpa.repository.*;import org.springframework.data.repository.query.Param;import jakarta.persistence.LockModeType;import java.util.*;
public interface ScheduledSessionRepository extends JpaRepository<ScheduledSession,Long>{
 List<ScheduledSession> findByTutorIdOrderByDateAscStartTimeAsc(Long id);
 @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select s from ScheduledSession s where s.id=:id") Optional<ScheduledSession> lock(@Param("id") Long id);
}
