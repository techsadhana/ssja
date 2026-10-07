package com.ssja.smarttutor.service;

import com.ssja.smarttutor.entity.Course;
import com.ssja.smarttutor.entity.Tutor;
import com.ssja.smarttutor.repository.CourseRepository;
import com.ssja.smarttutor.repository.TutorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final TutorRepository tutorRepository;

    public CourseService(
            CourseRepository courseRepository,
            TutorRepository tutorRepository
    ) {
        this.courseRepository = courseRepository;
        this.tutorRepository = tutorRepository;
    }

    public Course createCourse(Map<String, Object> body) {

        if (body.get("name") == null || body.get("name").toString().isBlank()) {
            throw new RuntimeException("Course name is required");
        }
        if (body.get("tutorId") == null || body.get("tutorId").toString().isBlank()) {
            throw new RuntimeException("tutorId is required");
        }

        String name = body.get("name").toString().trim();
        String description = body.get("description") != null ? body.get("description").toString().trim() : "";

        Long tutorId = Long.parseLong(body.get("tutorId").toString().trim());

        Double price = 0.0;
        if (body.get("price") != null && !body.get("price").toString().isBlank()) {
            price = Double.parseDouble(body.get("price").toString().trim());
        }

        Integer duration = 60;
        if (body.get("duration") != null && !body.get("duration").toString().isBlank()) {
            duration = Integer.parseInt(body.get("duration").toString().trim());
        }

        Tutor tutor = tutorRepository.findById(tutorId)
                .orElseThrow(() ->
                        new RuntimeException("Tutor not found with id: " + tutorId)
                );

        Course course = new Course(
                name,
                description,
                tutor,
                price,
                duration
        );

        return courseRepository.save(course);
    }

    public Course getCourse(Long id) {

        return courseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Course not found with id: " + id
                        )
                );
    }

    public List<Course> getAllCourses() {

        return courseRepository.findAll();
    }

    public List<Course> searchCourse(String query) {

        return courseRepository
                .findByNameIgnoreCaseContaining(query);
    }

    public List<Course> getCoursesByTutor(Long tutorId) {

        return courseRepository.findByTutorId(tutorId);
    }

    public void deleteCourse(Long id) {

        if (!courseRepository.existsById(id)) {
            throw new RuntimeException(
                    "Course not found with id: " + id
            );
        }

        courseRepository.deleteById(id);
    }
}