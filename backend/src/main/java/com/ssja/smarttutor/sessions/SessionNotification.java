package com.ssja.smarttutor.sessions;
import jakarta.persistence.*;
@Entity public class SessionNotification {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
public Long getId(){return id;}
private Long studentId;
public Long getStudentId(){return studentId;}
public void setStudentId(Long v){studentId=v;}
private Long sessionId;
public Long getSessionId(){return sessionId;}
public void setSessionId(Long v){sessionId=v;}
@Column(length=2000) private String message;
public String getMessage(){return message;}
public void setMessage(String v){message=v;}
private String createdAt;
public String getCreatedAt(){return createdAt;}
public void setCreatedAt(String v){createdAt=v;}
@Column(name="is_read") private boolean read;
public boolean getRead(){return read;}
public void setRead(boolean v){read=v;}
}
