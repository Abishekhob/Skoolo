package com.example.Skoolo.dto;

import com.example.Skoolo.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatUserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private Role role;
    private boolean isClassTeacher;
    private String profilePicUrl;

}
