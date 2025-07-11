package com.example.Skoolo.controller;

import com.example.Skoolo.model.Subject;
import com.example.Skoolo.repo.SubjectRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    @Autowired
    private SubjectRepository subjectRepository;

    @GetMapping
    public List<Map<String, Object>> getAllSubjects() {
        return subjectRepository.findAll().stream().map(subject -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", subject.getId());
            map.put("subjectName", subject.getSubjectName()); // Use 'subjectName' key for frontend
            return map;
        }).collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createSubject(@RequestBody Subject subject) {
        // Validate subject name for emptiness
        if (subject.getSubjectName() == null || subject.getSubjectName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject name cannot be empty.");
        }

        // Check if a subject with the same name already exists
        Optional<Subject> existingSubject = subjectRepository.findBySubjectNameIgnoreCase(subject.getSubjectName().trim());
        if (existingSubject.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Subject name '" + subject.getSubjectName() + "' already exists.");
        }

        Subject savedSubject = subjectRepository.save(subject);
        Map<String, Object> responseMap = new HashMap<>();
        responseMap.put("id", savedSubject.getId());
        responseMap.put("subjectName", savedSubject.getSubjectName());
        return new ResponseEntity<>(responseMap, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateSubject(@PathVariable Long id, @RequestBody Subject subjectDetails) {
        // Validate subject name
        if (subjectDetails.getSubjectName() == null || subjectDetails.getSubjectName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject name cannot be empty.");
        }
        return subjectRepository.findById(id)
                .map(subject -> {
                    subject.setSubjectName(subjectDetails.getSubjectName());
                    Subject updatedSubject = subjectRepository.save(subject);
                    Map<String, Object> responseMap = new HashMap<>();
                    responseMap.put("id", updatedSubject.getId());
                    responseMap.put("subjectName", updatedSubject.getSubjectName());
                    return new ResponseEntity<>(responseMap, HttpStatus.OK);
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found with id " + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id) {
        return subjectRepository.findById(id)
                .map(subject -> {
                    subjectRepository.delete(subject);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT); // 204 No Content
                })
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found with id " + id));
    }
}