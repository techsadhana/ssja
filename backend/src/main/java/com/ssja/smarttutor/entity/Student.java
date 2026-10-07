package com.ssja.smarttutor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 01 PERSONAL & CONTACT DETAILS
    @Column(name = "full_name")
    private String fullName;

    @Column(name = "name")
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "current_education_stage")
    private String currentEducationStage;

    // 02 LOCATION
    private String state;

    private String city;

    private String pincode;

    // 03 ACADEMIC FOCUS & INTERESTS
    @Column(name = "course_or_subject")
    private String courseOrSubject;

    @Column(name = "hobbies_or_skills")
    private String hobbiesOrSkills;

    @Column(name = "primary_learning_goal")
    private String primaryLearningGoal;

    // 04 SECURITY
    @Column(nullable = false)
    private String password;

    @Column(name = "agree_to_guidelines")
    private Boolean agreeToGuidelines;

    // Legacy fields preserved for backward compatibility
    private String department;

    private String academicYear;

    private String rollNumber;

    // Constructors
    public Student() {
    }

    public Student(String fullName, String email, String phoneNumber, String currentEducationStage,
                   String state, String city, String pincode, String courseOrSubject,
                   String hobbiesOrSkills, String primaryLearningGoal, String password,
                   Boolean agreeToGuidelines) {
        this.fullName = fullName;
        this.name = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.currentEducationStage = currentEducationStage;
        this.state = state;
        this.city = city;
        this.pincode = pincode;
        this.courseOrSubject = courseOrSubject;
        this.hobbiesOrSkills = hobbiesOrSkills;
        this.primaryLearningGoal = primaryLearningGoal;
        this.password = password;
        this.agreeToGuidelines = agreeToGuidelines;
    }

    // Legacy constructor
    public Student(String name, String email, String department,
                   String academicYear, String rollNumber, String password) {
        this.fullName = name;
        this.name = name;
        this.email = email;
        this.department = department;
        this.academicYear = academicYear;
        this.rollNumber = rollNumber;
        this.password = password;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName != null ? fullName : name;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.name = fullName;
    }

    // Alias for fullName to support legacy/alternate name key
    public String getName() {
        return fullName != null ? fullName : name;
    }

    public void setName(String name) {
        this.fullName = name;
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getCurrentEducationStage() {
        return currentEducationStage;
    }

    public void setCurrentEducationStage(String currentEducationStage) {
        this.currentEducationStage = currentEducationStage;
    }

    // Alias for currentEducationStage
    public String getEducationStage() {
        return currentEducationStage;
    }

    public void setEducationStage(String educationStage) {
        this.currentEducationStage = educationStage;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getCourseOrSubject() {
        return courseOrSubject;
    }

    public void setCourseOrSubject(String courseOrSubject) {
        this.courseOrSubject = courseOrSubject;
    }

    public String getHobbiesOrSkills() {
        return hobbiesOrSkills;
    }

    public void setHobbiesOrSkills(String hobbiesOrSkills) {
        this.hobbiesOrSkills = hobbiesOrSkills;
    }

    public String getPrimaryLearningGoal() {
        return primaryLearningGoal;
    }

    public void setPrimaryLearningGoal(String primaryLearningGoal) {
        this.primaryLearningGoal = primaryLearningGoal;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getAgreeToGuidelines() {
        return agreeToGuidelines;
    }

    public void setAgreeToGuidelines(Boolean agreeToGuidelines) {
        this.agreeToGuidelines = agreeToGuidelines;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }
}
