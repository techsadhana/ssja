package com.ssja.smarttutor.service;

import com.ssja.smarttutor.entity.Student;
import com.ssja.smarttutor.entity.Tutor;
import com.ssja.smarttutor.repository.StudentRepository;
import com.ssja.smarttutor.repository.TutorRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TutorRepository tutorRepository;

    public StudentService(StudentRepository studentRepository,
                          TutorRepository tutorRepository) {
        this.studentRepository = studentRepository;
        this.tutorRepository = tutorRepository;
    }

    // CREATE / SIGNUP
    public Student createStudent(Map<String, Object> student) {

        // Email validation
        Object emailObj = student.get("email");
        if (emailObj == null || emailObj.toString().trim().isEmpty()) {
            throw new RuntimeException("Email is required");
        }
        String email = emailObj.toString().trim();
        if (studentRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        // Phone Number validation
        String phoneNumber = null;
        if (student.get("phoneNumber") != null) {
            phoneNumber = student.get("phoneNumber").toString().trim();
        } else if (student.get("phone") != null) {
            phoneNumber = student.get("phone").toString().trim();
        }
        if (phoneNumber != null && !phoneNumber.isEmpty() && studentRepository.existsByPhoneNumber(phoneNumber)) {
            throw new RuntimeException("Phone number already registered");
        }

        // Password validation
        Object passwordObj = student.get("password");
        if (passwordObj == null || passwordObj.toString().trim().isEmpty()) {
            throw new RuntimeException("Password is required");
        }
        String password = passwordObj.toString().trim();
        if (password.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }

        // Confirm Password validation
        Object confirmPasswordObj = student.get("confirmPassword");
        if (confirmPasswordObj != null && !confirmPasswordObj.toString().trim().isEmpty()) {
            String confirmPassword = confirmPasswordObj.toString().trim();
            if (!password.equals(confirmPassword)) {
                throw new RuntimeException("Passwords do not match");
            }
        }

        // Full name
        String fullName = null;
        if (student.get("fullName") != null) {
            fullName = student.get("fullName").toString().trim();
        } else if (student.get("name") != null) {
            fullName = student.get("name").toString().trim();
        }

        // Education stage
        String educationStage = null;
        if (student.get("currentEducationStage") != null) {
            educationStage = student.get("currentEducationStage").toString().trim();
        } else if (student.get("educationStage") != null) {
            educationStage = student.get("educationStage").toString().trim();
        }

        // Location
        String state = student.get("state") != null ? student.get("state").toString().trim() : null;
        String city = student.get("city") != null ? student.get("city").toString().trim() : null;
        String pincode = student.get("pincode") != null ? student.get("pincode").toString().trim() : null;

        // Academic focus & interests
        String courseOrSubject = null;
        if (student.get("courseOrSubject") != null) {
            courseOrSubject = student.get("courseOrSubject").toString().trim();
        } else if (student.get("subject") != null) {
            courseOrSubject = student.get("subject").toString().trim();
        } else if (student.get("course") != null) {
            courseOrSubject = student.get("course").toString().trim();
        }

        String hobbiesOrSkills = null;
        if (student.get("hobbiesOrSkills") != null) {
            hobbiesOrSkills = student.get("hobbiesOrSkills").toString().trim();
        } else if (student.get("hobbies") != null) {
            hobbiesOrSkills = student.get("hobbies").toString().trim();
        }

        String primaryLearningGoal = null;
        if (student.get("primaryLearningGoal") != null) {
            primaryLearningGoal = student.get("primaryLearningGoal").toString().trim();
        } else if (student.get("learningGoal") != null) {
            primaryLearningGoal = student.get("learningGoal").toString().trim();
        }

        // Agreement to guidelines
        Boolean agreeToGuidelines = null;
        Object agreeObj = student.get("agreeToGuidelines") != null ? student.get("agreeToGuidelines") : student.get("agreedToTerms");
        if (agreeObj != null) {
            agreeToGuidelines = Boolean.parseBoolean(agreeObj.toString());
        }

        // Legacy fields (optional)
        String department = student.get("department") != null ? student.get("department").toString().trim() : null;
        String academicYear = student.get("academicYear") != null ? student.get("academicYear").toString().trim() : null;
        String rollNumber = student.get("rollNumber") != null ? student.get("rollNumber").toString().trim() : null;

        if (rollNumber != null && !rollNumber.isEmpty()) {
            if (studentRepository.existsByRollNumber(rollNumber)) {
                throw new RuntimeException("Roll number already registered");
            }
        } else {
            // Auto-generate unique roll number to satisfy existing NOT NULL/UNIQUE constraints in H2 database table
            rollNumber = "STU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        Student newStu = new Student();
        newStu.setFullName(fullName);
        newStu.setEmail(email);
        newStu.setPhoneNumber(phoneNumber);
        newStu.setCurrentEducationStage(educationStage);
        newStu.setState(state);
        newStu.setCity(city);
        newStu.setPincode(pincode);
        newStu.setCourseOrSubject(courseOrSubject);
        newStu.setHobbiesOrSkills(hobbiesOrSkills);
        newStu.setPrimaryLearningGoal(primaryLearningGoal);
        newStu.setPassword(password);
        newStu.setAgreeToGuidelines(agreeToGuidelines);

        newStu.setDepartment(department);
        newStu.setAcademicYear(academicYear);
        newStu.setRollNumber(rollNumber);

        return studentRepository.save(newStu);
    }

    // READ ALL
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // READ BY ID
    public Student getStudentById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found with id: " + id));
    }

    // UPDATE
    public Student updateStudent(Long id, Student updatedStudent) {

        Student existingStudent = getStudentById(id);

        if (updatedStudent.getFullName() != null) {
            existingStudent.setFullName(updatedStudent.getFullName());
        } else if (updatedStudent.getName() != null) {
            existingStudent.setFullName(updatedStudent.getName());
        }

        if (updatedStudent.getEmail() != null) {
            existingStudent.setEmail(updatedStudent.getEmail());
        }
        if (updatedStudent.getPhoneNumber() != null) {
            existingStudent.setPhoneNumber(updatedStudent.getPhoneNumber());
        }
        if (updatedStudent.getCurrentEducationStage() != null) {
            existingStudent.setCurrentEducationStage(updatedStudent.getCurrentEducationStage());
        }
        if (updatedStudent.getState() != null) {
            existingStudent.setState(updatedStudent.getState());
        }
        if (updatedStudent.getCity() != null) {
            existingStudent.setCity(updatedStudent.getCity());
        }
        if (updatedStudent.getPincode() != null) {
            existingStudent.setPincode(updatedStudent.getPincode());
        }
        if (updatedStudent.getCourseOrSubject() != null) {
            existingStudent.setCourseOrSubject(updatedStudent.getCourseOrSubject());
        }
        if (updatedStudent.getHobbiesOrSkills() != null) {
            existingStudent.setHobbiesOrSkills(updatedStudent.getHobbiesOrSkills());
        }
        if (updatedStudent.getPrimaryLearningGoal() != null) {
            existingStudent.setPrimaryLearningGoal(updatedStudent.getPrimaryLearningGoal());
        }
        if (updatedStudent.getAgreeToGuidelines() != null) {
            existingStudent.setAgreeToGuidelines(updatedStudent.getAgreeToGuidelines());
        }
        if (updatedStudent.getPassword() != null && !updatedStudent.getPassword().isBlank()) {
            existingStudent.setPassword(updatedStudent.getPassword());
        }

        // Legacy fields
        if (updatedStudent.getDepartment() != null) {
            existingStudent.setDepartment(updatedStudent.getDepartment());
        }
        if (updatedStudent.getAcademicYear() != null) {
            existingStudent.setAcademicYear(updatedStudent.getAcademicYear());
        }
        if (updatedStudent.getRollNumber() != null) {
            existingStudent.setRollNumber(updatedStudent.getRollNumber());
        }

        return studentRepository.save(existingStudent);
    }

    // DELETE
    public void deleteStudent(Long id) {

        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found with id: " + id);
        }

        studentRepository.deleteById(id);
    }

    // LOGIN
    public Map<String, Object> loginStu(Map<String, String> loginData) {

        String email = loginData.get("email");
        String password = loginData.get("password");

        if (email == null || email.isBlank()) {
            return Map.of("can", false, "message", "Email is required");
        }

        Optional<Student> loginExist = studentRepository.findByEmail(email);

        if (loginExist.isEmpty()) {
            return Map.of("can", false, "message", "You may need to signup");
        }

        Student student = loginExist.get();

        if (password != null && !password.isEmpty() && !password.equals(student.getPassword())) {
            return Map.of("can", false, "message", "Invalid email or password");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("can", true);
        response.put("message", "Login successful");
        response.put("id", student.getId());
        response.put("studentId", student.getId());
        response.put("email", student.getEmail());
        response.put("fullName", student.getFullName() != null ? student.getFullName() : "");
        response.put("phoneNumber", student.getPhoneNumber() != null ? student.getPhoneNumber() : "");
        response.put("currentEducationStage", student.getCurrentEducationStage() != null ? student.getCurrentEducationStage() : "");
        response.put("courseOrSubject", student.getCourseOrSubject() != null ? student.getCourseOrSubject() : "");
        response.put("primaryLearningGoal", student.getPrimaryLearningGoal() != null ? student.getPrimaryLearningGoal() : "");
        response.put("city", student.getCity() != null ? student.getCity() : "");
        response.put("state", student.getState() != null ? student.getState() : "");
        response.put("pincode", student.getPincode() != null ? student.getPincode() : "");
        response.put("hobbiesOrSkills", student.getHobbiesOrSkills() != null ? student.getHobbiesOrSkills() : "");
        response.put("role", "STUDENT");

        return response;
    }

    // SEARCH TUTOR
    public List<Tutor> searchTutor(String topic) {

        List<Tutor> allTutor = tutorRepository.findAll();

        return allTutor.stream().filter(data -> {
            if (data.getSpeciality() == null) return false;
            return Arrays.stream(data.getSpeciality().split(","))
                    .map(String::trim)
                    .toList()
                    .contains(topic.trim());
        }).toList();
    }
}
