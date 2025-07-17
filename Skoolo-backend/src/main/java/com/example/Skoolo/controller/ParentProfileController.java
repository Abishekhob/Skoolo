package com.example.Skoolo.controller;

import com.example.Skoolo.dto.ParentProfileResponse;
import com.example.Skoolo.model.Parent;
import com.example.Skoolo.repo.ParentRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/parents/profile")
public class ParentProfileController {

    @Autowired
    private ParentRepository parentRepository;

    @GetMapping("/{userId}")
    public ParentProfileResponse getParentProfileByUserId(@PathVariable Long userId) {
        Optional<Parent> parentOpt = parentRepository.findOptionalByUserId(userId); // ✅

        if (parentOpt.isEmpty()) {
            throw new RuntimeException("Parent not found for userId: " + userId);
        }

        Parent parent = parentOpt.get();

        List<ParentProfileResponse.ChildInfo> children = parent.getChildren().stream()
                .map(child -> new ParentProfileResponse.ChildInfo(
                        child.getId(),
                        child.getFirstName(),
                        child.getLastName(),
                        child.getCurrentClass() != null ? child.getCurrentClass().getClassName() : "N/A",
                        child.getCurrentSection() != null ? child.getCurrentSection().getSectionName() : "N/A"
                ))
                .collect(Collectors.toList());

        return new ParentProfileResponse(
                parent.getFirstName(),
                parent.getLastName(),
                parent.getContactNumber(),
                parent.getAddress(),
                children
        );
    }

}
