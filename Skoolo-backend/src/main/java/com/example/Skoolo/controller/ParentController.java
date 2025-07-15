package com.example.Skoolo.controller;

import com.example.Skoolo.model.Parent;
import com.example.Skoolo.repo.ParentRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents")
public class ParentController {


    @Autowired
    private ParentRepository parentRepository;

    @GetMapping
    public List<Parent> getAllParents() {
        return parentRepository.findAll(); // or with DTO
    }

    @GetMapping("/{parentId}")
    public ResponseEntity<?> getParentById(@PathVariable Long parentId) {
        return parentRepository.findById(parentId)
                .map(parent -> {
                    return ResponseEntity.ok(new ParentUserIdDTO(parent.getId(), parent.getUser().getId()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DTO class to return minimal data
    static class ParentUserIdDTO {
        private Long parentId;
        private Long userId;

        public ParentUserIdDTO(Long parentId, Long userId) {
            this.parentId = parentId;
            this.userId = userId;
        }

        public Long getParentId() {
            return parentId;
        }

        public Long getUserId() {
            return userId;
        }
    }
}
