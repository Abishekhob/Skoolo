package com.example.Skoolo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "parents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Parent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String firstName;
    private String lastName;
    private String contactNumber;
    private String address;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Student> children;

    public String getFullName() {
        return firstName + " " + lastName;
    }

}


