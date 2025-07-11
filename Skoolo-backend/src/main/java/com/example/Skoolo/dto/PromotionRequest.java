package com.example.Skoolo.dto;

import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Section;
import lombok.Data;

import java.util.List;

@Data
public class PromotionRequest {
    private List<Long> studentIds;
    private ClassEntity nextClass;
    private Section nextSection;
    private String academicYear;
}

