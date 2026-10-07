package com.ssja.smarttutor.controller;

import com.ssja.smarttutor.entity.Tutor;
import com.ssja.smarttutor.service.TutorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping({"/api/tutor", "/api/tutors"})
public class TutorController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.ssja.smarttutor.sessions.SessionAuth sessionAuth;
    private final TutorService tutorService;

    public TutorController(TutorService tutorService) {
        this.tutorService = tutorService;
    }

    // SIGNUP / REGISTRATION (Supports JSON body, URL-encoded form data, and multipart)
    @PostMapping(value = {"/signup", "/register", "", "/"})
    public ResponseEntity<?> signup(
            @RequestBody(required = false) Map<String, Object> body
//            @RequestParam(required = false) Map<String, Object> params
    ) {
//        Map<String, Object> tutorData = new HashMap<>();
//        if (params != null && !params.isEmpty()) {
//            tutorData.putAll(params);
//        }
//        if (body != null && !body.isEmpty()) {
//            tutorData.putAll(body);
//        }
//
//        if (tutorData.isEmpty()) {
//            return ResponseEntity.badRequest().body(
//                    Map.of("message", "Request body/form data cannot be empty", "status", "false")
//            );
//        }

        try {
            Tutor createdTutor = tutorService.createTutor(body);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Tutor application submitted successfully");
            resp.put("status", "true");
            resp.put("id", createdTutor.getId());
            resp.put("tutorId", createdTutor.getId());
            resp.put("verificationStatus", createdTutor.getVerificationStatus() != null ? createdTutor.getVerificationStatus() : "PENDING");
            resp.put("fullName", createdTutor.getFullName() != null ? createdTutor.getFullName() : "");
            resp.put("email", createdTutor.getEmail());
            resp.put("phoneNumber", createdTutor.getPhoneNumber() != null ? createdTutor.getPhoneNumber() : "");
            resp.put("phone", createdTutor.getPhoneNumber() != null ? createdTutor.getPhoneNumber() : "");
            resp.put("bio", createdTutor.getBio() != null ? createdTutor.getBio() : "");
            resp.put("city", createdTutor.getCity() != null ? createdTutor.getCity() : "");
            resp.put("state", createdTutor.getState() != null ? createdTutor.getState() : "");
            resp.put("pincode", createdTutor.getPincode() != null ? createdTutor.getPincode() : "");
            resp.put("highestQualification", createdTutor.getHighestQualification() != null ? createdTutor.getHighestQualification() : "");
            resp.put("education", createdTutor.getHighestQualification() != null ? createdTutor.getHighestQualification() : "");
            resp.put("teachingExperience", createdTutor.getTeachingExperience() != null ? createdTutor.getTeachingExperience() : "");
            resp.put("experience", createdTutor.getTeachingExperience() != null ? createdTutor.getTeachingExperience() : "");
            resp.put("subjectsOrSkills", createdTutor.getSubjectsOrSkills() != null ? createdTutor.getSubjectsOrSkills() : "");
            resp.put("specialization", createdTutor.getSubjectsOrSkills() != null ? createdTutor.getSubjectsOrSkills() : "");
            resp.put("instructionMode", createdTutor.getInstructionMode() != null ? createdTutor.getInstructionMode() : "");
            resp.put("hourlyRate", createdTutor.getHourlyRate() != null ? createdTutor.getHourlyRate() : 0.0);
            resp.put("role", "TUTOR");
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    Map.of("message", e.getMessage(), "status", "false")
            );
        }
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        Map<String, Object> loginStatus = tutorService.loginTutor(loginData);

        if (Boolean.TRUE.equals(loginStatus.get("can"))) {
            loginStatus.put("sessionToken",sessionAuth.issue(((Number)loginStatus.get("id")).longValue(),"TUTOR"));
            return ResponseEntity.ok(loginStatus);
        } else {
            return ResponseEntity.badRequest().body(loginStatus);
        }
    }

    // SEARCH TUTORS BY SPECIALITY / SUBJECT
    @GetMapping("/search")
    public ResponseEntity<List<Tutor>> searchBySpeciality(
            @RequestParam(required = false) String speciality,
            @RequestParam(required = false) String subject
    ) {
        String query = speciality != null ? speciality : subject;
        List<Tutor> tutors = tutorService.searchBySubject(query);
        return ResponseEntity.ok(tutors);
    }

    // GET ALL TUTORS
    @GetMapping({"", "/", "/all"})
    public ResponseEntity<List<Tutor>> getThemAll() {
        return ResponseEntity.ok(tutorService.getAllTutors());
    }

    // GET TUTOR BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Tutor> getTutorById(@PathVariable Long id) {
        return ResponseEntity.ok(tutorService.getTutorById(id));
    }

    // UPDATE TUTOR
    @PutMapping("/{id}")
    public ResponseEntity<Tutor> updateTutor(
            @PathVariable Long id,
            @RequestBody Tutor tutor
    ) {
        return ResponseEntity.ok(tutorService.updateTutor(id, tutor));
    }

    // DELETE TUTOR
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTutor(@PathVariable Long id) {
        tutorService.deleteTutor(id);
        return ResponseEntity.ok("Tutor deleted successfully");
    }

}
