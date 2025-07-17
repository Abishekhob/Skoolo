package com.example.Skoolo.service;

import com.example.Skoolo.model.Parent;
import com.example.Skoolo.model.PasswordResetToken;
import com.example.Skoolo.model.Student;
import com.example.Skoolo.model.User;
import com.example.Skoolo.model.enums.Role;
import com.example.Skoolo.repo.ParentRepository;
import com.example.Skoolo.repo.PasswordResetTokenRepository;
import com.example.Skoolo.repo.StudentRepository;
import com.example.Skoolo.repo.UserRepository;
import com.opencsv.CSVReader;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ParentService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    private final PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;



    public void processParentCsv(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();

        if (filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
            processParentExcel(file); // 📥 Excel
        } else {
            processParentCsvInternal(file); // 📥 CSV
        }
    }

    // 🔁 CSV processing logic
    private void processParentCsvInternal(MultipartFile file) throws Exception {
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
                String address = nextLine[4];

                saveParentAndMatchStudents(firstName, lastName, email, contact, address);
            }
        }
    }

    // 🔁 Excel processing logic
    private void processParentExcel(MultipartFile file) throws Exception {
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
                String address = getCellValue(row.getCell(4));

                saveParentAndMatchStudents(firstName, lastName, email, contact, address);
            }
        }
    }

    // 🔁 Utility to extract string value
    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue()); // for contact
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

    // 🔁 Common saving logic
    public void saveParentAndMatchStudents(String firstName, String lastName, String email, String contact, String address) {
        boolean isNewUser = false;
        User user;

        // 1️⃣ Get or create User
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setRole(Role.PARENT);
            user.setActive(true);
            user.setPasswordSet(false);
            userRepository.save(user);
            isNewUser = true;
        }

        // 2️⃣ Get or create Parent
        Parent parent = parentRepository.findByUserEmail(email).orElse(null);
        if (parent == null) {
            parent = new Parent();
            parent.setUser(user);
            parent.setFirstName(firstName);
            parent.setLastName(lastName);
            parent.setContactNumber(contact);
            parent.setAddress(address);
            parentRepository.save(parent);
        }

        // 3️⃣ Match unmatched students
        List<Student> unmatchedStudents = studentRepository.findByParentIsNullAndParentEmail(email);
        for (Student student : unmatchedStudents) {
            student.setParent(parent);
        }
        studentRepository.saveAll(unmatchedStudents);

        // 4️⃣ Send password setup email (only for new users)
        if (isNewUser) {
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken();
            resetToken.setToken(token);
            resetToken.setUser(user);
            resetToken.setExpiryDate(LocalDateTime.now().plusDays(1));
            tokenRepository.save(resetToken);

            try {
                emailService.sendPasswordSetupEmail(email, token);
            } catch (Exception e) {
                System.err.println("Failed to send setup email: " + e.getMessage());
            }
        }
    }


    public List<Student> getChildrenOfParent(Long parentId) {
        Parent parent = parentRepository.findById(parentId).orElseThrow(
                () -> new RuntimeException("Parent not found with ID: " + parentId)
        );
        return parent.getChildren();
    }
}
