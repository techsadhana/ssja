package com.ssja.smarttutor.controller;

import com.ssja.smarttutor.entity.Course;
import com.ssja.smarttutor.service.CourseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping({"/api/courses", "/api/course"})
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // CREATE COURSE
    @PostMapping("/new")
    public ResponseEntity<?> createCourse(
            @RequestBody Map<String, Object> body
    ) {

        System.out.println(body);
        try {
            Course course = courseService.createCourse(body);
            return ResponseEntity.status(HttpStatus.CREATED).body(course);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage(), "status", "false")
            );
        }
    }

    // Root POST alias
    @PostMapping
    public ResponseEntity<?> createCourseAlias(
            @RequestBody Map<String, Object> body
    ) {
        return createCourse(body);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourse(
            @PathVariable Long id
    ) {
        try {
            return ResponseEntity.ok(
                    courseService.getCourse(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<Course>> getAllCourses() {

        return ResponseEntity.ok(
                courseService.getAllCourses()
        );
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCoursesAlias() {

        return ResponseEntity.ok(
                courseService.getAllCourses()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<Course>> searchCourse(
            @RequestParam String query
    ) {

        return ResponseEntity.ok(
                courseService.searchCourse(query)
        );
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<Course>> getCoursesByTutor(
            @PathVariable Long tutorId
    ) {

        return ResponseEntity.ok(
                courseService.getCoursesByTutor(tutorId)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCourse(
            @PathVariable Long id
    ) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(
                    Map.of("message", "Course deleted successfully")
            );
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message", e.getMessage())
            );
        }
    }
}