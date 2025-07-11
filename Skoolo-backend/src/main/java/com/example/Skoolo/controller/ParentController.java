package com.example.Skoolo.controller;

import com.example.Skoolo.model.Parent;
import com.example.Skoolo.repo.ParentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parents")
public class ParentController {


    @Autowired
    private ParentRepository parentRepository;

    @GetMapping
    public List<Parent> getAllParents() {
        return parentRepository.findAll(); // or with DTO
    }

}
