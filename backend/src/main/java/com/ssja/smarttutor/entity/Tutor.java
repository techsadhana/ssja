package com.ssja.smarttutor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tutors")
public class Tutor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 01 PERSONAL & CONTACT DETAILS
    private String title;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "name")
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", unique = true)
    private String phoneNumber;

    @Column(columnDefinition = "TEXT")
    private String bio;

    // 02 LOCATION
    private String state;

    @Column(name = "fc")
    private String city;

    private String pincode;

    // 03 EDUCATION & TEACHING DOMAIN
    @Column(name = "highest_qualification")
    private String highestQualification;

    @Column(name = "teaching_experience")
    private String teachingExperience;

    // Retained for backward compatibility
    @Column(name = "yoe")
    private Integer yearsOfExperience;

    @Column(name = "speciality", columnDefinition = "TEXT")
    private String subjectsOrSkills;

    // 04 VERIFICATION DOCUMENT
    @Column(name = "verification_document_url")
    private String verificationDocumentUrl;

    // 05 PREFERENCES & RATES
    @Column(name = "instruction_mode")
    private String instructionMode;

    @Column(name = "hourly_rate")
    private Double hourlyRate;

    @Column(name = "is_volunteer")
    private Boolean isVolunteer;

    // 06 ACCOUNT PASSWORD & STATUS
    @Column(nullable = false)
    private String password;

    @Column(name = "verification_status")
    private String verificationStatus;

    @Column(name = "is_verified")
    private Boolean isVerified;

    // Constructors
    public Tutor() {
    }

    public Tutor(String title, String fullName, String email, String phoneNumber, String bio,
                 String state, String city, String pincode, String highestQualification,
                 String teachingExperience, Integer yearsOfExperience, String subjectsOrSkills,
                 String verificationDocumentUrl, String instructionMode, Double hourlyRate,
                 Boolean isVolunteer, String password, String verificationStatus, Boolean isVerified) {
        this.title = title;
        this.fullName = fullName;
        this.name = fullName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.bio = bio;
        this.state = state;
        this.city = city;
        this.pincode = pincode;
        this.highestQualification = highestQualification;
        this.teachingExperience = teachingExperience;
        this.yearsOfExperience = yearsOfExperience;
        this.subjectsOrSkills = subjectsOrSkills;
        this.verificationDocumentUrl = verificationDocumentUrl;
        this.instructionMode = instructionMode;
        this.hourlyRate = hourlyRate;
        this.isVolunteer = isVolunteer;
        this.password = password;
        this.verificationStatus = verificationStatus != null ? verificationStatus : "PENDING";
        this.isVerified = isVerified != null ? isVerified : false;
    }

    // Legacy constructor
    public Tutor(
            String email,
            String password,
            String name,
            Integer yearsOfExperience,
            String fromCity,
            String phoneNumber,
            String speciality
    ) {
        this.email = email;
        this.password = password;
        this.fullName = name;
        this.name = name;
        this.yearsOfExperience = yearsOfExperience;
        this.teachingExperience = yearsOfExperience != null ? yearsOfExperience + " Years" : null;
        this.city = fromCity;
        this.phoneNumber = phoneNumber;
        this.subjectsOrSkills = speciality;
        this.verificationStatus = "PENDING";
        this.isVerified = false;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFullName() {
        return fullName != null ? fullName : name;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.name = fullName;
    }

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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfessionalSummary() {
        return bio;
    }

    public void setProfessionalSummary(String professionalSummary) {
        this.bio = professionalSummary;
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

    public String getFromCity() {
        return city;
    }

    public void setFromCity(String fromCity) {
        this.city = fromCity;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getHighestQualification() {
        return highestQualification;
    }

    public void setHighestQualification(String highestQualification) {
        this.highestQualification = highestQualification;
    }

    public String getTeachingExperience() {
        return teachingExperience;
    }

    public void setTeachingExperience(String teachingExperience) {
        this.teachingExperience = teachingExperience;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getSubjectsOrSkills() {
        return subjectsOrSkills;
    }

    public void setSubjectsOrSkills(String subjectsOrSkills) {
        this.subjectsOrSkills = subjectsOrSkills;
    }

    public String getSpeciality() {
        return subjectsOrSkills;
    }

    public void setSpeciality(String speciality) {
        this.subjectsOrSkills = speciality;
    }

    public String getVerificationDocumentUrl() {
        return verificationDocumentUrl;
    }

    public void setVerificationDocumentUrl(String verificationDocumentUrl) {
        this.verificationDocumentUrl = verificationDocumentUrl;
    }

    public String getInstructionMode() {
        return instructionMode;
    }

    public void setInstructionMode(String instructionMode) {
        this.instructionMode = instructionMode;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public Boolean getIsVolunteer() {
        return isVolunteer;
    }

    public void setIsVolunteer(Boolean isVolunteer) {
        this.isVolunteer = isVolunteer;
    }

    public Boolean getVolunteer() {
        return isVolunteer;
    }

    public void setVolunteer(Boolean volunteer) {
        this.isVolunteer = volunteer;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
}
