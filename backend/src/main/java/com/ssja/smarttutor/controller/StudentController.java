package com.ssja.smarttutor.controller;

import com.ssja.smarttutor.entity.Student;
import com.ssja.smarttutor.entity.Tutor;
import com.ssja.smarttutor.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping({"/api/students", "/api/student"})
public class StudentController {

    @org.springframework.beans.factory.annotation.Autowired
    private com.ssja.smarttutor.sessions.SessionAuth sessionAuth;
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // SIGNUP (Supports JSON body, URL-encoded form data, and multipart)
    @PostMapping(value = {"/signup", "/register", "", "/"})
    public ResponseEntity<?> signup(
            @RequestBody(required = false) Map<String, Object> body
    ) {
//            @RequestParam(required = false) Map<String, Object> params
//        Map<String, Object> studentData = new HashMap<>();
//        if (params != null && !params.isEmpty()) {
//            studentData.putAll(params);
//        }
//        if (body != null && !body.isEmpty()) {
//            studentData.putAll(body);
//        }

        if (body.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Request body/form data cannot be empty", "status", "false")
            );
        }

        try {
            Student savedStudent = studentService.createStudent(body);
            return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "status", "false"));
        }
    }

    // GET ALL STUDENTS
    @GetMapping({"", "/"})
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(
                studentService.getAllStudents()
        );
    }

    // GET STUDENT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(
                studentService.getStudentById(id)
        );
    }

    // UPDATE STUDENT
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable Long id,
            @RequestBody Student student) {

        return ResponseEntity.ok(
                studentService.updateStudent(id, student)
        );
    }

    // DELETE STUDENT
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteStudent(@PathVariable Long id) {

        studentService.deleteStudent(id);

        return ResponseEntity.ok("Student deleted successfully");
    }

    // LOGIN
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginStu(@RequestBody Map<String, String> loginData) {

        Map<String, Object> loginStatus = studentService.loginStu(loginData);

        if (Boolean.TRUE.equals(loginStatus.get("can"))) {
            loginStatus.put("sessionToken",sessionAuth.issue(((Number)loginStatus.get("id")).longValue(),"STUDENT"));
            return ResponseEntity.ok(loginStatus);
        } else {
            return ResponseEntity.badRequest().body(loginStatus);
        }
    }

    // SEARCH TUTOR BY TOPIC
    @GetMapping("/course/search/{topic}")
    public ResponseEntity<Map<String, Object>> searchTutor(@PathVariable String topic) {

        List<Tutor> match = studentService.searchTutor(topic);

        if (!match.isEmpty()) {
            return ResponseEntity.ok(Map.of("data", match));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}