package com.ssja.smarttutor.sessions;
import jakarta.persistence.*;
@Entity public class ScheduledSession {
@Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
public Long getId(){return id;}
public void setId(Long v){id=v;}
private Long tutorId;
public Long getTutorId(){return tutorId;}
public void setTutorId(Long v){tutorId=v;}
private Long courseId;
public Long getCourseId(){return courseId;}
public void setCourseId(Long v){courseId=v;}
private String title;
public String getTitle(){return title;}
public void setTitle(String v){title=v;}
@Column(name="session_date") private String date;
public String getDate(){return date;}
public void setDate(String v){date=v;}
@Column(name="start_time") private String startTime;
public String getStartTime(){return startTime;}
public void setStartTime(String v){startTime=v;}
@Column(name="end_time") private String endTime;
public String getEndTime(){return endTime;}
public void setEndTime(String v){endTime=v;}
private String mode;
public String getMode(){return mode;}
public void setMode(String v){mode=v;}
private String kind;
public String getKind(){return kind;}
public void setKind(String v){kind=v;}
@Column(length=2000) private String details;
public String getDetails(){return details;}
public void setDetails(String v){details=v;}
private boolean cancelled;
public boolean getCancelled(){return cancelled;}
public void setCancelled(boolean v){cancelled=v;}
}
