package com.example.Skoolo.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreateClassRequest {
    private String className;
    private List<String> sections;
}
