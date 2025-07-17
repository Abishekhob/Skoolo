package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParentProfileResponse {
    private String firstName;
    private String lastName;
    private String contactNumber;
    private String address;
    private List<ChildInfo> children;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChildInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String className;
        private String sectionName;
    }
}
