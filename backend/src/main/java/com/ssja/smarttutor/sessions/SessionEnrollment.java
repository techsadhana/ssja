package com.ssja.smarttutor.sessions;
import jakarta.persistence.*;
@Entity public class SessionEnrollment {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
public Long getId(){return id;}
private Long sessionId;
public Long getSessionId(){return sessionId;}
public void setSessionId(Long v){sessionId=v;}
private Long studentId;
public Long getStudentId(){return studentId;}
public void setStudentId(Long v){studentId=v;}
@Column(length=2000) private String studentAddress;
public String getStudentAddress(){return studentAddress;}
public void setStudentAddress(String v){studentAddress=v;}
private String approvalStatus;
public String getApprovalStatus(){return approvalStatus;}
public void setApprovalStatus(String v){approvalStatus=v;}
private boolean cancelled;
public boolean getCancelled(){return cancelled;}
public void setCancelled(boolean v){cancelled=v;}
}
