package com.example.Skoolo.service;

import com.example.Skoolo.dto.StudentAddRequest;
import com.example.Skoolo.dto.StudentUpdateRequest;
import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Parent;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.model.Student;
import com.example.Skoolo.repo.ClassRepository;
import com.example.Skoolo.repo.ParentRepository;
import com.example.Skoolo.repo.SectionRepository;
import com.example.Skoolo.repo.StudentRepository;
import com.opencsv.CSVReader;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private ParentRepository parentRepository;

    // MAIN ENTRY
    public void processStudentFile(MultipartFile file, Long classId, Long sectionId) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null) throw new RuntimeException("File name is invalid");

        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found: " + classId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionId));

        if (filename.endsWith(".csv")) {
            processStudentCsv(file, classEntity, section);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            processStudentExcel(file, classEntity, section);
        } else {
            throw new RuntimeException("Unsupported file type: " + filename);
        }
    }


    // CSV HANDLER
    private void processStudentCsv(MultipartFile file, ClassEntity classEntity, Section section) throws Exception {
        try (Reader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            CSVReader csvReader = new CSVReader(reader);
            String[] nextLine;
            boolean isFirstLine = true;

            while ((nextLine = csvReader.readNext()) != null) {
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }

                handleStudentData(
                        nextLine[0], nextLine[1], nextLine[2], nextLine[3],
                        nextLine[4], nextLine[5], nextLine[6], nextLine[7],
                        classEntity, section
                );
            }
        }
    }

    // EXCEL HANDLER
    private void processStudentExcel(MultipartFile file, ClassEntity classEntity, Section section) throws Exception {
        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);
        boolean isFirstRow = true;

        for (Row row : sheet) {
            if (isFirstRow) {
                isFirstRow = false;
                continue;
            }

            String firstName = getCellValueAsString(row.getCell(0));
            String lastName = getCellValueAsString(row.getCell(1));
            String dobStr = getCellValueAsString(row.getCell(2));
            String gender = getCellValueAsString(row.getCell(3));
            String contact = getCellValueAsString(row.getCell(4));
            String address = getCellValueAsString(row.getCell(5));
            String parentEmail = getCellValueAsString(row.getCell(6));
            String enrollDateStr = getCellValueAsString(row.getCell(7));

            handleStudentData(firstName, lastName, dobStr, gender, contact,
                    address, parentEmail, enrollDateStr, classEntity, section);
        }

        workbook.close();
    }

    private void handleStudentData(String firstName, String lastName, String dobStr, String gender,
                                   String contact, String address, String parentEmail, String enrollDateStr,
                                   ClassEntity classEntity, Section section) {

        try {
            if (dobStr == null || dobStr.trim().isEmpty()) throw new RuntimeException("DOB is missing");
            if (enrollDateStr == null || enrollDateStr.trim().isEmpty()) throw new RuntimeException("Enrollment Date is missing");

            LocalDate dob = LocalDate.parse(dobStr);
            LocalDate enrollDate = LocalDate.parse(enrollDateStr);

            Student student = new Student();
            student.setFirstName(firstName);
            student.setLastName(lastName);
            student.setDob(dob);
            student.setGender(gender);
            student.setContactNumber(contact);
            student.setAddress(address);
            student.setStatus("active");
            student.setEnrollmentDate(enrollDate);
            student.setParentEmail(parentEmail);
            student.setCurrentClass(classEntity);
            student.setCurrentSection(section);

            Optional<Parent> optionalParent = parentRepository.findByUserEmail(parentEmail);

            if (optionalParent.isPresent()) {
                Parent parent = optionalParent.get();
                student.setParent(parent);
                studentRepository.save(student);

                List<Student> unmatchedStudents = studentRepository.findByParentIsNullAndParentEmail(parentEmail);
                for (Student s : unmatchedStudents) {
                    try {
                        s.setParent(parent);
                        studentRepository.save(s);
                    } catch (Exception e) {
                        System.err.println("Failed to match old student: " + s.getFirstName() + " " + s.getLastName());
                    }
                }
            } else {
                studentRepository.save(student);
            }

        } catch (Exception e) {
            System.err.println("Error saving student: " + firstName + " " + lastName + " – " + e.getMessage());
        }
    }



    // ✅ Excel-safe cell reader
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate().toString(); // yyyy-MM-dd
                } else {
                    return String.valueOf((long) cell.getNumericCellValue()); // round off numbers like IDs
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula(); // or evaluate
            case BLANK:
            case ERROR:
            default:
                return "";
        }
    }

    public List<Student> getAllStudents() {

            return studentRepository.findAll();


    }

    public Student addStudent(Student student) {
        return studentRepository.save(student);
    }


    public void addStudentToSection(StudentAddRequest req) {
        ClassEntity classEntity = classRepository.findById(req.getClassId())
                .orElseThrow(() -> new RuntimeException("Class not found"));

        Section section = sectionRepository.findById(req.getSectionId())
                .orElseThrow(() -> new RuntimeException("Section not found"));

        Student student = new Student();
        student.setFirstName(req.getFirstName());
        student.setLastName(req.getLastName());
        student.setGender(req.getGender());
        student.setDob(LocalDate.parse(req.getDob())); // format: YYYY-MM-DD
        student.setContactNumber(req.getContactNumber());
        student.setAddress(req.getAddress());
        student.setParentEmail(req.getParentEmail());
        student.setEnrollmentDate(LocalDate.parse(req.getEnrollmentDate()));
        student.setCurrentClass(classEntity);
        student.setCurrentSection(section);

        Optional<Parent> optionalParent = parentRepository.findByUserEmail(req.getParentEmail());

        if (optionalParent.isPresent()) {
            Parent parent = optionalParent.get();
            student.setParent(parent);
            studentRepository.save(student);

            // Update previously unmatched students with the same email
            List<Student> unmatchedStudents = studentRepository.findByParentIsNullAndParentEmail(req.getParentEmail());
            for (Student s : unmatchedStudents) {
                try {
                    s.setParent(parent);
                    studentRepository.save(s);
                } catch (Exception e) {
                    System.err.println("Failed to match old student: " + s.getFirstName() + " " + s.getLastName());
                }
            }
        } else {
            // No parent found, save student anyway
            studentRepository.save(student);
        }
    }

    public void updateStudent(Long studentId, StudentUpdateRequest req) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setFirstName(req.getFirstName());
        student.setLastName(req.getLastName());
        student.setGender(req.getGender());
        student.setDob(LocalDate.parse(req.getDob()));
        student.setContactNumber(req.getContactNumber());
        student.setAddress(req.getAddress());
        student.setEnrollmentDate(LocalDate.parse(req.getEnrollmentDate()));

        studentRepository.save(student);
    }


}
