package com.ssja.smarttutor.service;

import com.ssja.smarttutor.entity.Tutor;
import com.ssja.smarttutor.repository.TutorRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TutorService {

    private final TutorRepository tutorRepository;

    public TutorService(TutorRepository tutorRepository) {
        this.tutorRepository = tutorRepository;
    }

    // CREATE / SIGNUP
    public Tutor createTutor(Map<String, Object> tutor) {

        // Email validation
        Object emailObj = tutor.get("email");
        if (emailObj == null || emailObj.toString().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        String email = emailObj.toString().trim();
        if (tutorRepository.existsByEmail(email)) {
            throw new RuntimeException("Tutor with this email already exists");
        }

        // Phone Number validation
        String phoneNumber = null;
        if (tutor.get("phoneNumber") != null) {
            phoneNumber = tutor.get("phoneNumber").toString().trim();
        } else if (tutor.get("phone") != null) {
            phoneNumber = tutor.get("phone").toString().trim();
        } else if (tutor.get("phone_number") != null) {
            phoneNumber = tutor.get("phone_number").toString().trim();
        } else if (tutor.get("number") != null) {
            phoneNumber = tutor.get("number").toString().trim();
        }
        if (phoneNumber != null && !phoneNumber.isEmpty() && tutorRepository.existsByPhoneNumber(phoneNumber)) {
            throw new RuntimeException("Tutor with this phone number already exists");
        }

        // Password validation
        Object passwordObj = tutor.get("password");
        if (passwordObj == null || passwordObj.toString().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        String password = passwordObj.toString().trim();
        if (password.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        // Confirm Password validation
        Object confirmPasswordObj = tutor.get("confirmPassword") != null ? tutor.get("confirmPassword") : tutor.get("confirm_password");
        if (confirmPasswordObj != null && !confirmPasswordObj.toString().trim().isEmpty()) {
            String confirmPassword = confirmPasswordObj.toString().trim();
            if (!password.equals(confirmPassword)) {
                throw new RuntimeException("Passwords do not match");
            }
        }

        // Personal & Contact Details
        String title = tutor.get("title") != null ? tutor.get("title").toString().trim() : null;

        String fullName = null;
        if (tutor.get("fullName") != null) {
            fullName = tutor.get("fullName").toString().trim();
        } else if (tutor.get("name") != null) {
            fullName = tutor.get("name").toString().trim();
        } else if (tutor.get("full_name") != null) {
            fullName = tutor.get("full_name").toString().trim();
        } else if (tutor.get("firstName") != null) {
            fullName = tutor.get("firstName").toString().trim() + (tutor.get("lastName") != null ? " " + tutor.get("lastName").toString().trim() : "");
        }
        if (fullName == null || fullName.isBlank()) {
            throw new RuntimeException("Full name is required");
        }

        String bio = null;
        if (tutor.get("bio") != null) {
            bio = tutor.get("bio").toString().trim();
        } else if (tutor.get("professionalSummary") != null) {
            bio = tutor.get("professionalSummary").toString().trim();
        } else if (tutor.get("professional_summary") != null) {
            bio = tutor.get("professional_summary").toString().trim();
        } else if (tutor.get("summary") != null) {
            bio = tutor.get("summary").toString().trim();
        }

        // Location
        String state = tutor.get("state") != null ? tutor.get("state").toString().trim() : null;
        String city = null;
        if (tutor.get("city") != null) {
            city = tutor.get("city").toString().trim();
        } else if (tutor.get("fromCity") != null) {
            city = tutor.get("fromCity").toString().trim();
        } else if (tutor.get("from_city") != null) {
            city = tutor.get("from_city").toString().trim();
        }
        String pincode = null;
        if (tutor.get("pincode") != null) {
            pincode = tutor.get("pincode").toString().trim();
        } else if (tutor.get("pinCode") != null) {
            pincode = tutor.get("pinCode").toString().trim();
        } else if (tutor.get("zip") != null) {
            pincode = tutor.get("zip").toString().trim();
        }

        // Education & Teaching Domain
        String highestQualification = null;
        if (tutor.get("highestQualification") != null) {
            highestQualification = tutor.get("highestQualification").toString().trim();
        } else if (tutor.get("academicQualification") != null) {
            highestQualification = tutor.get("academicQualification").toString().trim();
        } else if (tutor.get("qualification") != null) {
            highestQualification = tutor.get("qualification").toString().trim();
        } else if (tutor.get("education") != null) {
            highestQualification = tutor.get("education").toString().trim();
        } else if (tutor.get("edu") != null) {
            highestQualification = tutor.get("edu").toString().trim();
        }

        String teachingExperience = null;
        if (tutor.get("teachingExperience") != null) {
            teachingExperience = tutor.get("teachingExperience").toString().trim();
        } else if (tutor.get("experience") != null) {
            teachingExperience = tutor.get("experience").toString().trim();
        } else if (tutor.get("teaching_experience") != null) {
            teachingExperience = tutor.get("teaching_experience").toString().trim();
        } else if (tutor.get("exp") != null) {
            teachingExperience = tutor.get("exp").toString().trim();
        }

        // Parse years of experience for legacy integer field
        Integer yearsOfExperience = null;
        if (tutor.get("yearsOfExperience") != null) {
            try {
                yearsOfExperience = Integer.parseInt(tutor.get("yearsOfExperience").toString().trim());
            } catch (NumberFormatException ignored) {}
        }
        if (yearsOfExperience == null && teachingExperience != null) {
            Matcher matcher = Pattern.compile("\\d+").matcher(teachingExperience);
            if (matcher.find()) {
                yearsOfExperience = Integer.parseInt(matcher.group());
            }
        }
        if (yearsOfExperience == null) {
            yearsOfExperience = 0;
        }

        String subjectsOrSkills = null;
        if (tutor.get("subjectsOrSkills") != null) {
            subjectsOrSkills = tutor.get("subjectsOrSkills").toString().trim();
        } else if (tutor.get("specialization") != null) {
            subjectsOrSkills = tutor.get("specialization").toString().trim();
        } else if (tutor.get("speciality") != null) {
            subjectsOrSkills = tutor.get("speciality").toString().trim();
        } else if (tutor.get("skills") != null) {
            subjectsOrSkills = tutor.get("skills").toString().trim();
        } else if (tutor.get("subjects") != null) {
            subjectsOrSkills = tutor.get("subjects").toString().trim();
        } else if (tutor.get("spec") != null) {
            subjectsOrSkills = tutor.get("spec").toString().trim();
        }
        if (subjectsOrSkills == null || subjectsOrSkills.isBlank()) {
            subjectsOrSkills = "General Mentorship";
        }

        // Verification Document
        String verificationDocumentUrl = null;
        if (tutor.get("verificationDocumentUrl") != null) {
            verificationDocumentUrl = tutor.get("verificationDocumentUrl").toString().trim();
        } else if (tutor.get("documentUrl") != null) {
            verificationDocumentUrl = tutor.get("documentUrl").toString().trim();
        } else if (tutor.get("verificationDocument") != null) {
            verificationDocumentUrl = tutor.get("verificationDocument").toString().trim();
        } else if (tutor.get("document") != null) {
            verificationDocumentUrl = tutor.get("document").toString().trim();
        } else if (tutor.get("documentName") != null) {
            verificationDocumentUrl = tutor.get("documentName").toString().trim();
        }

        // Preferences & Rates
        String instructionMode = "Online (Video)";
        Object modeObj = tutor.get("instructionMode") != null ? tutor.get("instructionMode") : tutor.get("mode");
        if (modeObj instanceof List) {
            instructionMode = String.join(", ", ((List<?>) modeObj).stream().map(Object::toString).toList());
        } else if (modeObj != null && !modeObj.toString().isBlank()) {
            instructionMode = modeObj.toString().trim();
        } else {
            boolean isOnline = Boolean.parseBoolean(String.valueOf(tutor.get("online")));
            boolean isInPerson = Boolean.parseBoolean(String.valueOf(tutor.get("inPerson")));
            if (isOnline && isInPerson) {
                instructionMode = "Online (Video), In-Person / Local";
            } else if (isInPerson) {
                instructionMode = "In-Person / Local";
            } else if (isOnline) {
                instructionMode = "Online (Video)";
            }
        }

        Double hourlyRate = 0.0;
        Object rateObj = tutor.get("hourlyRate") != null ? tutor.get("hourlyRate") : tutor.get("rate");
        if (rateObj != null && !rateObj.toString().isBlank()) {
            try {
                hourlyRate = Double.parseDouble(rateObj.toString().replaceAll("[^0-9.]", "").trim());
            } catch (NumberFormatException ignored) {}
        }

        Boolean isVolunteer = false;
        Object volObj = tutor.get("isVolunteer") != null ? tutor.get("isVolunteer") : tutor.get("volunteer");
        if (volObj != null) {
            String s = volObj.toString().trim().toLowerCase();
            isVolunteer = s.equals("true") || s.equals("on") || s.equals("1") || s.equals("yes");
        }

        Tutor newTutor = new Tutor();
        newTutor.setTitle(title);
        newTutor.setFullName(fullName);
        newTutor.setEmail(email);
        newTutor.setPhoneNumber(phoneNumber);
        newTutor.setBio(bio);
        newTutor.setState(state);
        newTutor.setCity(city);
        newTutor.setPincode(pincode);
        newTutor.setHighestQualification(highestQualification);
        newTutor.setTeachingExperience(teachingExperience);
        newTutor.setYearsOfExperience(yearsOfExperience);
        newTutor.setSubjectsOrSkills(subjectsOrSkills);
        newTutor.setVerificationDocumentUrl(verificationDocumentUrl);
        newTutor.setInstructionMode(instructionMode);
        newTutor.setHourlyRate(hourlyRate);
        newTutor.setIsVolunteer(isVolunteer);
        newTutor.setPassword(password);
        newTutor.setVerificationStatus("PENDING");
        newTutor.setIsVerified(false);

        return tutorRepository.save(newTutor);
    }

    public Tutor getTutorById(Long id) {
        return tutorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Tutor not found with id: " + id)
                );
    }

    public Tutor getTutorByEmail(String email) {
        return tutorRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Tutor not found with email: " + email)
                );
    }

    public List<Tutor> getAllTutors() {
        return tutorRepository.findAll();
    }

    public Tutor updateTutor(Long id, Tutor updatedTutor) {

        Tutor tutor = getTutorById(id);

        if (updatedTutor.getTitle() != null) {
            tutor.setTitle(updatedTutor.getTitle());
        }
        if (updatedTutor.getFullName() != null) {
            tutor.setFullName(updatedTutor.getFullName());
        } else if (updatedTutor.getName() != null) {
            tutor.setFullName(updatedTutor.getName());
        }
        if (updatedTutor.getEmail() != null) {
            tutor.setEmail(updatedTutor.getEmail());
        }
        if (updatedTutor.getPhoneNumber() != null) {
            tutor.setPhoneNumber(updatedTutor.getPhoneNumber());
        }
        if (updatedTutor.getBio() != null) {
            tutor.setBio(updatedTutor.getBio());
        }
        if (updatedTutor.getState() != null) {
            tutor.setState(updatedTutor.getState());
        }
        if (updatedTutor.getCity() != null) {
            tutor.setCity(updatedTutor.getCity());
        } else if (updatedTutor.getFromCity() != null) {
            tutor.setCity(updatedTutor.getFromCity());
        }
        if (updatedTutor.getPincode() != null) {
            tutor.setPincode(updatedTutor.getPincode());
        }
        if (updatedTutor.getHighestQualification() != null) {
            tutor.setHighestQualification(updatedTutor.getHighestQualification());
        }
        if (updatedTutor.getTeachingExperience() != null) {
            tutor.setTeachingExperience(updatedTutor.getTeachingExperience());
        }
        if (updatedTutor.getYearsOfExperience() != null) {
            tutor.setYearsOfExperience(updatedTutor.getYearsOfExperience());
        }
        if (updatedTutor.getSubjectsOrSkills() != null) {
            tutor.setSubjectsOrSkills(updatedTutor.getSubjectsOrSkills());
        } else if (updatedTutor.getSpeciality() != null) {
            tutor.setSubjectsOrSkills(updatedTutor.getSpeciality());
        }
        if (updatedTutor.getVerificationDocumentUrl() != null) {
            tutor.setVerificationDocumentUrl(updatedTutor.getVerificationDocumentUrl());
        }
        if (updatedTutor.getInstructionMode() != null) {
            tutor.setInstructionMode(updatedTutor.getInstructionMode());
        }
        if (updatedTutor.getHourlyRate() != null) {
            tutor.setHourlyRate(updatedTutor.getHourlyRate());
        }
        if (updatedTutor.getIsVolunteer() != null) {
            tutor.setIsVolunteer(updatedTutor.getIsVolunteer());
        }
        if (updatedTutor.getPassword() != null && !updatedTutor.getPassword().isBlank()) {
            tutor.setPassword(updatedTutor.getPassword());
        }
        if (updatedTutor.getVerificationStatus() != null) {
            tutor.setVerificationStatus(updatedTutor.getVerificationStatus());
        }
        if (updatedTutor.getIsVerified() != null) {
            tutor.setIsVerified(updatedTutor.getIsVerified());
        }

        return tutorRepository.save(tutor);
    }

    public void deleteTutor(Long id) {
        if (!tutorRepository.existsById(id)) {
            throw new RuntimeException("Tutor not found with id: " + id);
        }

        tutorRepository.deleteById(id);
    }

    public Map<String, Object> loginTutor(Map<String, String> loginData) {

        String email = loginData.get("email");
        String password = loginData.get("password");

        if (email == null || email.isBlank()) {
            return Map.of("can", false, "message", "Email is required");
        }

        Optional<Tutor> loginExist = tutorRepository.findByEmail(email);

        if (loginExist.isEmpty()) {
            return Map.of("can", false, "message", "You may need to signup");
        }

        Tutor tutor = loginExist.get();

        if (password != null && !password.isEmpty() && !password.equals(tutor.getPassword())) {
            return Map.of("can", false, "message", "Invalid email or password");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("can", true);
        response.put("message", "Login successful");
        response.put("id", tutor.getId());
        response.put("tutorId", tutor.getId());
        response.put("email", tutor.getEmail());
        response.put("phoneNumber", tutor.getPhoneNumber() != null ? tutor.getPhoneNumber() : "");
        response.put("title", tutor.getTitle() != null ? tutor.getTitle() : "");
        response.put("fullName", tutor.getFullName() != null ? tutor.getFullName() : "");
        response.put("bio", tutor.getBio() != null ? tutor.getBio() : "");
        response.put("city", tutor.getCity() != null ? tutor.getCity() : "");
        response.put("state", tutor.getState() != null ? tutor.getState() : "");
        response.put("pincode", tutor.getPincode() != null ? tutor.getPincode() : "");
        response.put("highestQualification", tutor.getHighestQualification() != null ? tutor.getHighestQualification() : "");
        response.put("education", tutor.getHighestQualification() != null ? tutor.getHighestQualification() : "");
        response.put("teachingExperience", tutor.getTeachingExperience() != null ? tutor.getTeachingExperience() : "");
        response.put("experience", tutor.getTeachingExperience() != null ? tutor.getTeachingExperience() : "");
        response.put("subjectsOrSkills", tutor.getSubjectsOrSkills() != null ? tutor.getSubjectsOrSkills() : "");
        response.put("specialization", tutor.getSubjectsOrSkills() != null ? tutor.getSubjectsOrSkills() : "");
        response.put("hourlyRate", tutor.getHourlyRate() != null ? tutor.getHourlyRate() : 0.0);
        response.put("instructionMode", tutor.getInstructionMode() != null ? tutor.getInstructionMode() : "");
        response.put("verificationStatus", tutor.getVerificationStatus() != null ? tutor.getVerificationStatus() : "PENDING");
        response.put("isVerified", Boolean.TRUE.equals(tutor.getIsVerified()));
        response.put("role", "TUTOR");

        return response;
    }

    public List<Tutor> searchBySubject(String subject) {
        if (subject == null || subject.isBlank()) {
            return Collections.emptyList();
        }
        String cleanSubject = subject.trim().toLowerCase();

        return tutorRepository.findAll().stream().filter(tutor -> {
            String subjects = tutor.getSubjectsOrSkills();
            if (subjects == null) return false;
            return Arrays.stream(subjects.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .anyMatch(s -> s.contains(cleanSubject) || cleanSubject.contains(s));
        }).toList();
    }
}