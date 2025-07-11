package com.example.Skoolo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "timetables")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Timetable {
    @Id
    @GeneratedValue
    private Long id;

    private String dayOfWeek; // MONDAY, TUESDAY, etc.
    private String period; // 1st, 2nd, etc.
    private String startTime; // 09:00
    private String endTime;   // 09:45

    @ManyToOne
    private ClassEntity classEntity;
    @ManyToOne private Section section;
    @ManyToOne private Subject subject;
    @ManyToOne private Teacher teacher;
}
