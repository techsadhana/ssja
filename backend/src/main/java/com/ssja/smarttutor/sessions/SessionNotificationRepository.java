package com.ssja.smarttutor.sessions;
import org.springframework.data.jpa.repository.JpaRepository;import java.util.*;
public interface SessionNotificationRepository extends JpaRepository<SessionNotification,Long>{List<SessionNotification> findByStudentIdOrderByIdDesc(Long id);}
