package com.example.Skoolo.service;

import com.example.Skoolo.model.Student;
import com.example.Skoolo.repo.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentService studentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this); // Initializes @Mock and @InjectMocks
    }

    @Test
    void testAddStudent_ShouldSaveAndReturnStudent() {
        // Step 1: Create a sample student
        Student student = new Student();
        student.setFirstName("John");
        student.setLastName("Doe");

        // Step 2: Define what happens when save() is called
        when(studentRepository.save(student)).thenReturn(student);

        // Step 3: Call the method you’re testing
        Student saved = studentService.addStudent(student);

        // Step 4: Verify the result
        assertNotNull(saved);
        assertEquals("John", saved.getFirstName());

        // Step 5: Verify if save() was actually called
        verify(studentRepository, times(1)).save(student);

        // ✅ Console output after successful test
        System.out.println("✅ testAddStudent_ShouldSaveAndReturnStudent passed successfully");
    }

}
