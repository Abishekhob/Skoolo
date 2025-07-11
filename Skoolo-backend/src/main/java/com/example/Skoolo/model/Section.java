package com.example.Skoolo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sections")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) // Added constraint
    private String sectionName;

    @ManyToOne(fetch = FetchType.LAZY) // Changed to LAZY fetch
    @JoinColumn(name = "class_id", nullable = false) // Added nullable=false if a section must always belong to a class
    @JsonBackReference // This is crucial for bidirectional relationships to prevent infinite recursion
    private ClassEntity classEntity;

    @ManyToOne(fetch = FetchType.LAZY) // Added LAZY fetch
    @JoinColumn(name = "class_teacher_id")
    private Teacher classTeacher; // Ensure Teacher model also exists if used
}