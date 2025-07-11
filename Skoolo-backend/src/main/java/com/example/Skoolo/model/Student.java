package com.example.Skoolo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String contactNumber;
    private String address;
    private String status; // active, discontinued, graduated

    @Column(name = "parent_email")
    private String parentEmail;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    @JsonBackReference
    private Parent parent;

    @ManyToOne
    @JoinColumn(name = "class_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "sections"})
    private ClassEntity currentClass;

    @ManyToOne
    @JoinColumn(name = "section_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "classEntity", "classTeacher"})
    private Section currentSection;

    private LocalDate enrollmentDate;

    // ✅ Add this method to get full name
    public String getFullName() {
        return (firstName != null ? firstName : "") +
                (lastName != null ? " " + lastName : "");
    }
}
