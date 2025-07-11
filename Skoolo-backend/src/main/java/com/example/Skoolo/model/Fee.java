package com.example.Skoolo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "fees")
public class Fee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String feeType; // tuition, transport, etc.
    private BigDecimal amount;
    private LocalDate dueDate;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "sections"}) // <-- added
    private ClassEntity classEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "classEntity"}) // <-- added
    private Section section;
}
