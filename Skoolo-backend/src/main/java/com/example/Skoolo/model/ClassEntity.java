// src/main/java/com/example/Skoolo/model/ClassEntity.java
package com.example.Skoolo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "classes")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ClassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String className;

    // --- New field for sorting ---
    private Integer position; // Store the display order
    // ----------------------------

    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Section> sections = new ArrayList<>();

    public void addSection(Section section) {
        this.sections.add(section);
        section.setClassEntity(this);
    }

    public void removeSection(Section section) {
        this.sections.remove(section);
        section.setClassEntity(null);
    }
}