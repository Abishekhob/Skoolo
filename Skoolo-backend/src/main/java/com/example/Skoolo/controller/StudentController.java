package com.example.Skoolo.controller;

import com.example.Skoolo.model.Student;
import com.example.Skoolo.repo.StudentRepository;
import com.example.Skoolo.service.StudentService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepository studentRepository;


    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return studentService.addStudent(student);
    }

    @GetMapping("/by-class")
    public ResponseEntity<List<Student>> getStudentsByClassAndSection(
            @RequestParam Long classId,
            @RequestParam Long sectionId
    ) {
        List<Student> students = studentRepository.findByCurrentClass_IdAndCurrentSection_Id(classId, sectionId);
        return ResponseEntity.ok(students);
    }


}

