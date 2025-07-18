package com.example.Skoolo.dto;

import lombok.Data;
import java.util.List;

@Data
public class PromotionRequest {
    private String academicYear;
    private Long classId;
    private Long sectionId;
    private List<StudentPromotion> promotions;

    @Data
    public static class StudentPromotion {
        private Long studentId;
        private String resultStatus; // Promoted, Repeated, Discontinued
        private Long nextClassId; // nullable if discontinued
        private Long nextSectionId; // nullable if discontinued
        private String remarks;
    }
}
