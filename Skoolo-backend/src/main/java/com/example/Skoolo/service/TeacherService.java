package com.example.Skoolo.service;

import com.example.Skoolo.dto.TeacherDTO;
import com.example.Skoolo.dto.TeacherRequest;
import com.example.Skoolo.dto.TimetableEntryDto;
import com.example.Skoolo.model.*;
import com.example.Skoolo.model.enums.Role;
import com.example.Skoolo.repo.*;
import com.opencsv.CSVReader;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final SectionRepository sectionRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final SubjectRepository subjectRepository;
    private final TimetableRepository timetableRepository;

    @Autowired
    private EmailService emailService;


    public void processTeacherFile(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null) throw new RuntimeException("File name is invalid");

        if (filename.endsWith(".csv")) {
            processTeacherCsv(file);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            processTeacherExcel(file);
        } else {
            throw new RuntimeException("Unsupported file type: " + filename);
        }
    }

    private void processTeacherCsv(MultipartFile file) throws Exception {
        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            CSVReader csvReader = new CSVReader(reader);
            String[] nextLine;
            boolean isFirstLine = true;

            while ((nextLine = csvReader.readNext()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                String firstName = nextLine[0];
                String lastName = nextLine[1];
                String email = nextLine[2];
                String contact = nextLine[3];

                saveTeacherAndUser(firstName, lastName, email, contact);
            }
        }
    }

    private void processTeacherExcel(MultipartFile file) throws Exception {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            boolean isFirstRow = true;

            for (Row row : sheet) {
                if (isFirstRow) {
                    isFirstRow = false;
                    continue;
                }

                String firstName = getCellValue(row.getCell(0));
                String lastName = getCellValue(row.getCell(1));
                String email = getCellValue(row.getCell(2));
                String contact = getCellValue(row.getCell(3));

                saveTeacherAndUser(firstName, lastName, email, contact);
            }
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    private void saveTeacherAndUser(String firstName, String lastName, String email, String contact) {
        if (userRepository.existsByEmail(email)) return;

        // 🔐 User account
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setRole(Role.TEACHER);
        user.setActive(true);
        user.setPasswordSet(false);
        userRepository.save(user);

        // 👨‍🏫 Teacher profile
        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setFirstName(firstName);
        teacher.setLastName(lastName);
        teacher.setContactNumber(contact);
        teacherRepository.save(teacher);

        // 📧 Password setup email
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusDays(1));
        tokenRepository.save(resetToken);

        try {
            emailService.sendPasswordSetupEmail(email, token);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + email + ": " + e.getMessage());
            e.printStackTrace();
        }

    }

    public void assignClassTeacher(Long teacherId, Long sectionId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found: " + teacherId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        section.setClassTeacher(teacher); // 👈 Assigns class teacher to specific section
        sectionRepository.save(section);
    }

    public void assignSubjectsToTeacher(Long teacherId, Set<Long> subjectIds) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Set<Subject> subjects = new HashSet<>(subjectRepository.findAllById(subjectIds));
        teacher.setSubjects(subjects); // Replace previous assignments

        teacherRepository.save(teacher); // 🔄 JPA updates `teacher_subjects` table
    }


    public List<TeacherDTO> getAllTeachers() {
        return teacherRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private TeacherDTO mapToDTO(Teacher teacher) {
        TeacherDTO dto = new TeacherDTO();
        dto.setId(teacher.getId());
        dto.setFullName(teacher.getFullName());
        dto.setFirstName(teacher.getFirstName());
        dto.setLastName(teacher.getLastName());
        dto.setContactNumber(teacher.getContactNumber());
        dto.setRole(teacher.getRole());

        // Get email from the linked user
        dto.setEmail(teacher.getUser() != null ? teacher.getUser().getEmail() : null);

        // Convert Subject entities to just names
        dto.setSubjects(
                teacher.getSubjects().stream()
                        .map(Subject::getSubjectName) // assuming subject has getName()
                        .collect(Collectors.toList())
        );

        return dto;
    }



    public List<Teacher> findTeachersBySubjectId(Long subjectId) {
        return teacherRepository.findBySubjectId(subjectId);
    }

    public ResponseEntity<?> addTeacherManually(TeacherRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // 🔐 Create user
        User user = new User();
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmail(req.getEmail());
        user.setRole(Role.TEACHER);
        user.setActive(true);
        user.setPasswordSet(false);
        userRepository.save(user);

        // 👨‍🏫 Create teacher profile
        Teacher teacher = new Teacher();
        teacher.setUser(user);
        teacher.setFirstName(req.getFirstName());
        teacher.setLastName(req.getLastName());
        teacher.setContactNumber(req.getContactNumber());
        teacherRepository.save(teacher);

        // 📧 Send password setup email
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(LocalDateTime.now().plusDays(1));
        tokenRepository.save(resetToken);

        try {
            emailService.sendPasswordSetupEmail(req.getEmail(), token);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }

        return ResponseEntity.ok("Teacher added successfully.");
    }




}

