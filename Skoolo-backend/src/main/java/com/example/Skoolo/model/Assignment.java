package com.example.Skoolo.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "assignments")
public class Assignment {
    @Id @GeneratedValue
    private Long id;

    private String type; // assignment, homework, reminder, exam, instruction
    private String title;
    @Column(length = 1000) // or more if needed
    private String description;

    private LocalDate dueDate;

    @ManyToOne private Subject subject;
    @ManyToOne private Teacher teacher;
    @ManyToOne
    private ClassEntity classEntity;
    @ManyToOne private Section section;
}
