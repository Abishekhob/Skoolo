package com.example.Skoolo.service;

import com.example.Skoolo.dto.TimetableEntryDto;
import com.example.Skoolo.model.*;
import com.example.Skoolo.repo.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class TimetableService {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private SectionRepository sectionRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private TimetableRepository timetableRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private TeacherSubjectAssignmentRepository teacherSubjectAssignmentRepository;


    public void processTimetableFile(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.contains("-")) {
            throw new RuntimeException("Invalid filename. Format must be: 'Class 1-A.xlsx'");
        }

        String[] parts = filename.replace(".xlsx", "").split("-");
        String className = parts[0].trim();
        String sectionName = parts[1].trim();

        ClassEntity classEntity = classRepository.findByClassName(className)
                .orElseThrow(() -> new RuntimeException("Class not found: " + className));
        Section section = sectionRepository.findBySectionNameAndClassEntity(sectionName, classEntity)
                .orElseThrow(() -> new RuntimeException("Section not found: " + sectionName));

        Workbook workbook = WorkbookFactory.create(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        String currentDay = null;
        for (Row row : sheet) {
            if (row.getRowNum() == 0) continue; // Skip header

            String dayCell = getCellAsString(row.getCell(0));
            if (!dayCell.isEmpty()) currentDay = dayCell.toUpperCase();

            String period = getCellAsString(row.getCell(1));
            String startTime = getCellAsString(row.getCell(2));
            String endTime = getCellAsString(row.getCell(3));
            String subjectName = getCellAsString(row.getCell(4));

            if (currentDay == null || subjectName.isEmpty()) {
                throw new RuntimeException("Missing day or subject at row " + (row.getRowNum() + 1));
            }

            Subject subject = subjectRepository.findBySubjectNameIgnoreCase(subjectName)
                    .orElseThrow(() -> new RuntimeException("Subject not found: " + subjectName + " at row " + (row.getRowNum() + 1)));

            Timetable timetable = new Timetable();
            timetable.setDayOfWeek(currentDay);
            timetable.setPeriod(period);
            timetable.setStartTime(startTime);
            timetable.setEndTime(endTime);
            timetable.setSubject(subject);
            timetable.setClassEntity(classEntity);
            timetable.setSection(section);

            timetableRepository.save(timetable);
        }

        workbook.close();
    }

    private String getCellAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING: return cell.getStringCellValue().trim();
            case NUMERIC: return DateUtil.isCellDateFormatted(cell)
                    ? cell.getLocalDateTimeCellValue().toLocalTime().toString()
                    : String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            default: return "";
        }
    }

    public List<Timetable> getTimetableForSection(Long classId, Long sectionId) {
        return timetableRepository.findByClassEntityIdAndSectionId(classId, sectionId);
    }

    public void updateTimetable(List<TimetableEntryDto> entries) {
        for (TimetableEntryDto dto : entries) {
            Optional<Timetable> existingOpt = timetableRepository
                    .findByDayOfWeekAndPeriodAndClassEntityIdAndSectionId(
                            dto.getDayOfWeek(),
                            dto.getPeriod(),
                            dto.getClassId(),
                            dto.getSectionId()
                    );

            if (existingOpt.isPresent()) {
                Timetable existing = existingOpt.get();

                // ✅ Try to find subject by name, or create a new one
                Subject subject = subjectRepository.findBySubjectName(dto.getSubjectName());
                if (subject == null) {
                    subject = new Subject();
                    subject.setSubjectName(dto.getSubjectName());
                    subject = subjectRepository.save(subject); // Save and assign
                }

                existing.setSubject(subject);
                existing.setStartTime(dto.getStartTime());
                existing.setEndTime(dto.getEndTime());

                timetableRepository.save(existing);
            }
        }
    }


    public void assignTeacherToSubjectInSection(Long classId, Long sectionId, Long subjectId, Long teacherId) {

        // 1. Assign in timetable
        List<Timetable> entries = timetableRepository.findByClassEntityIdAndSectionIdAndSubjectId(
                classId, sectionId, subjectId
        );

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        for (Timetable entry : entries) {
            entry.setTeacher(teacher);
        }
        timetableRepository.saveAll(entries);

        // 2. Save mapping to teacher_subject_assignments table

        // Check if already exists to avoid duplicate insert
        boolean exists = teacherSubjectAssignmentRepository
                .findByTeacherIdAndSubjectIdAndClassEntityIdAndSectionId(
                        teacherId, subjectId, classId, sectionId
                ).isPresent();

        if (!exists) {
            TeacherSubjectAssignment assignment = new TeacherSubjectAssignment();
            assignment.setTeacher(teacher);
            assignment.setSubject(subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new RuntimeException("Subject not found")));
            assignment.setClassEntity(classRepository.findById(classId)
                    .orElseThrow(() -> new RuntimeException("Class not found")));
            assignment.setSection(sectionRepository.findById(sectionId)
                    .orElseThrow(() -> new RuntimeException("Section not found")));

            teacherSubjectAssignmentRepository.save(assignment);
        }
    }


    public List<TimetableEntryDto> getTimetableForTeacher(Long teacherId) {
        List<Timetable> entries = timetableRepository.findByTeacherId(teacherId);

        return entries.stream().map(entry -> {
            TimetableEntryDto dto = new TimetableEntryDto();
            dto.setDayOfWeek(entry.getDayOfWeek());
            dto.setPeriod(entry.getPeriod());
            dto.setStartTime(entry.getStartTime());
            dto.setEndTime(entry.getEndTime());
            dto.setSubjectName(entry.getSubject().getSubjectName());
            dto.setClassName(entry.getClassEntity().getClassName());
            dto.setSectionName(entry.getSection().getSectionName());
            return dto;
        }).toList();
    }
}
