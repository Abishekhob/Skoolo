package com.example.Skoolo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String role;
}
