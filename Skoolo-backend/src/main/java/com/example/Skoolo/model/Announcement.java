package com.example.Skoolo.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "announcements")
public class Announcement {
    @Id @GeneratedValue
    private Long id;

    private String title;
    private String content;
    private LocalDate date;
    private String target; // parents, teachers, all, specific classId, etc.

    @ManyToOne
    private Teacher postedBy;
}

