package com.example.Skoolo.service;

import com.example.Skoolo.dto.CreateClassRequest;
import com.example.Skoolo.model.ClassEntity;
import com.example.Skoolo.model.Section;
import com.example.Skoolo.repo.ClassRepository;
import com.example.Skoolo.repo.SectionRepository;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassService {

    @Autowired
    private ClassRepository classRepository;

    @Autowired
    private SectionRepository sectionRepository;

    public ClassEntity createClassWithSections(CreateClassRequest request) {
        ClassEntity newClass = new ClassEntity();
        newClass.setClassName(request.getClassName());

        // Save class first (so it has an ID)
        ClassEntity savedClass = classRepository.save(newClass);

        // Now create sections
        List<Section> sections = new ArrayList<>();
        for (String secName : request.getSections()) {
            Section section = new Section();
            section.setSectionName(secName);
            section.setClassEntity(savedClass);
            sections.add(section);
        }

        sectionRepository.saveAll(sections);

        // Set sections to return the full class with section data
        savedClass.setSections(sections);

        return savedClass;
    }

    public Optional<ClassEntity> getClassById(Long id) {
        return classRepository.findById(id);
    }

    @Transactional
    public ClassEntity updateClassWithSections(Long id, CreateClassRequest request) {
        ClassEntity existingClass = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found with ID: " + id));

        // Check if class name is being changed and if new name already exists for another class
        if (!existingClass.getClassName().equals(request.getClassName())) {
            if (classRepository.findByClassName(request.getClassName()).isPresent()) {
                throw new IllegalArgumentException("Class with name '" + request.getClassName() + "' already exists.");
            }
        }

        existingClass.setClassName(request.getClassName());

        // --- Handle Sections Update ---
        // 1. Collect current section names from the request
        List<String> newSectionNames = request.getSections().stream()
                .map(String::trim)
                .collect(Collectors.toList());

        // 2. Identify sections to remove (those in existingClass but not in newSectionNames)
        List<Section> sectionsToRemove = new ArrayList<>();
        for (Section existingSection : existingClass.getSections()) {
            if (!newSectionNames.contains(existingSection.getSectionName())) {
                sectionsToRemove.add(existingSection);
            }
        }
        for (Section section : sectionsToRemove) {
            existingClass.getSections().remove(section);
            // sectionRepository.delete(section); // If you're using orphanRemoval=true on @OneToMany,
            // JPA will handle deletion when the relationship is broken.
            // Otherwise, you might need to manually delete here.
            // Given your ClassEntity has orphanRemoval = true, this line is not strictly needed for deletion.
        }

        // 3. Identify sections to add (those in newSectionNames but not in existingClass)
        List<String> currentExistingSectionNames = existingClass.getSections().stream()
                .map(Section::getSectionName)
                .collect(Collectors.toList());
        for (String newName : newSectionNames) {
            if (!currentExistingSectionNames.contains(newName)) {
                Section newSection = new Section();
                newSection.setSectionName(newName);
                newSection.setClassEntity(existingClass); // Link to the class
                existingClass.getSections().add(newSection);
            }
        }
        // --- End Sections Update ---


        // Save the updated ClassEntity. Due to cascade and orphanRemoval, sections will be managed.
        return classRepository.save(existingClass);
    }

    @Transactional
    public void deleteClass(Long id) {
        ClassEntity classToDelete = classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found with ID: " + id));

        // Before deleting the class, you might need to handle related entities
        // For example, if students are linked to classes/sections, you might need to:
        // 1. Disassociate them (set class_id/section_id to null)
        // 2. Delete them (if class deletion implies student deletion)
        // This depends on your business rules and CASCADE settings.
        // For simplicity, assuming cascade delete is configured or no other entities are directly dependent
        // in a way that prevents simple class deletion.
        // If ClassEntity has `orphanRemoval = true` on `sections`, sections will be deleted automatically.

        classRepository.delete(classToDelete);
    }

    // --- New service method for reordering classes ---
    @Transactional
    public void updateClassPositions(List<Map<String, Object>> classUpdates) {
        for (Map<String, Object> update : classUpdates) {
            Long id = ((Number) update.get("id")).longValue(); // Handle potential Integer to Long conversion
            Integer newPosition = (Integer) update.get("position");

            classRepository.findById(id).ifPresent(classEntity -> {
                classEntity.setPosition(newPosition);
                classRepository.save(classEntity);
            });
        }
    }
}
