package com.example.Skoolo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "marks")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String examName;
    private int marksObtained;
    private int maxMarks;
    private String grade;
    private String academicYear;

    @ManyToOne
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Student student;

    @ManyToOne
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Subject subject;

    @ManyToOne
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "sections"})
    private ClassEntity classEntity;

    @ManyToOne
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "classEntity", "classTeacher"})
    private Section section;

}
