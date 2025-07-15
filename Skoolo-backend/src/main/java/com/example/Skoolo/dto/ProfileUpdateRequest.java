// dto/ProfileUpdateRequest.java
package com.example.Skoolo.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private String contactNumber;
    private String profilePicUrl; // from upload endpoint
}
