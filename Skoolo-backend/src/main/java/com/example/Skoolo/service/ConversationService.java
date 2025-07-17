package com.example.Skoolo.service;

import com.example.Skoolo.dto.ChatUserDTO;
import com.example.Skoolo.dto.ConversationDTO;
import com.example.Skoolo.model.*;
import com.example.Skoolo.model.enums.Role;
import com.example.Skoolo.repo.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private ParentRepository parentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeacherSubjectAssignmentRepository assignmentRepository;

    @Autowired
    private SectionRepository sectionRepository;

    public List<Conversation> getUserConversations(Long userId) {
        return conversationRepository.findByUser1IdOrUser2Id(userId, userId);
    }

    public Optional<Conversation> getConversationById(Long conversationId) {
        return conversationRepository.findById(conversationId);
    }

    public Optional<Conversation> createConversation(Long userId1, Long userId2) {
        User user1 = userRepository.findById(userId1).orElseThrow(() -> new RuntimeException("User1 not found"));
        User user2 = userRepository.findById(userId2).orElseThrow(() -> new RuntimeException("User2 not found"));

        if (!canUsersChat(user1, user2)) {
            System.out.println("Cannot create conversation: Users not permitted to chat.");
            return Optional.empty(); // No permission
        }

        Optional<Conversation> existing = conversationRepository.findByUsers(user1, user2);
        if (existing.isPresent()) {
            System.out.println("Conversation already exists between users " + userId1 + " and " + userId2);
            return existing;
        }

        Conversation conversation = new Conversation();
        conversation.setUser1(user1);
        conversation.setUser2(user2);
        conversation.setCreatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        System.out.println("Created new conversation between users " + userId1 + " and " + userId2);
        return Optional.of(conversation);
    }

    // Core permission logic:
    public boolean canUsersChat(User user1, User user2) {
        System.out.println("Checking if users can chat: " + user1.getId() + " (" + user1.getRole() + ") and "
                + user2.getId() + " (" + user2.getRole() + ")");
        if (user1.getRole() == Role.TEACHER && user2.getRole() == Role.PARENT) {
            return teacherCanChatWithParent(user1, user2);
        } else if (user1.getRole() == Role.PARENT && user2.getRole() == Role.TEACHER) {
            return teacherCanChatWithParent(user2, user1);
        } else if (user1.getRole() == Role.TEACHER && user2.getRole() == Role.TEACHER) {
            Teacher teacher1 = teacherRepository.findByUserId(user1.getId());
            Teacher teacher2 = teacherRepository.findByUserId(user2.getId());

            if (teacher1 == null || teacher2 == null) {
                System.out.println("One of the teachers is null in canUsersChat.");
                return false;
            }

            boolean sharesClass = teachersShareClass(user1, user2);

            boolean isClassTeacherOfOther = findClassTeachersForTeacher(teacher1).stream()
                    .anyMatch(classTeacher -> classTeacher.getId().equals(teacher2.getId()));

            return sharesClass || isClassTeacherOfOther;
        }
        return false;
    }


    public List<Teacher> findClassTeachersForTeacher(Teacher currentTeacher) {
        if (currentTeacher == null) return List.of();

        // Step 1: Get all sections the teacher is assigned to (via subject assignments)
        List<TeacherSubjectAssignment> assignments = assignmentRepository.findByTeacher(currentTeacher);
        if (assignments.isEmpty()) return List.of();

        // Step 2: Collect classIds and sectionIds from assignments
        Set<Long> classIds = assignments.stream()
                .map(a -> a.getClassEntity().getId())
                .collect(Collectors.toSet());

        Set<Long> sectionIds = assignments.stream()
                .map(a -> a.getSection().getId())
                .collect(Collectors.toSet());

        if (classIds.isEmpty() || sectionIds.isEmpty()) return List.of();

        // Step 3: Find all sections where classId and sectionId match
        List<Section> sections = sectionRepository.findByClassEntityIdInAndIdIn(classIds, sectionIds);

        // 🔍 Debug: Print matched sections and their class teachers
        System.out.println("Matched sections for current teacher:");
        sections.forEach(s -> {
            String className = s.getClassEntity() != null ? s.getClassEntity().getClassName() : "N/A";
            String sectionName = s.getSectionName();
            String classTeacherName = s.getClassTeacher() != null
                    ? s.getClassTeacher().getUser().getFirstName() + " " + s.getClassTeacher().getUser().getLastName()
                    : "None";
            System.out.println("Section: " + sectionName + " (Class: " + className + "), Class Teacher: " + classTeacherName);
        });

        // Step 4: From those sections, extract distinct class teachers (excluding current teacher)
        return sections.stream()
                .map(Section::getClassTeacher)
                .filter(ct -> ct != null && !ct.getId().equals(currentTeacher.getId()))
                .distinct()
                .collect(Collectors.toList());
    }



    private boolean teacherCanChatWithParent(User teacherUser, User parentUser) {
        Teacher teacher = teacherRepository.findByUserId(teacherUser.getId());
        Parent parent = parentRepository.findByUserId(parentUser.getId());

        if (teacher == null || parent == null) {
            System.out.println("teacherCanChatWithParent: teacher or parent null");
            return false;
        }

        // 🔄 Use SECTION instead of just class
        List<TeacherSubjectAssignment> assignments = assignmentRepository.findByTeacher(teacher);
        Set<Long> teacherSectionIds = assignments.stream()
                .map(a -> a.getSection().getId())
                .collect(Collectors.toSet());

        System.out.println("teacherCanChatWithParent: Teacher teaches sections: " + teacherSectionIds);

        for (Student child : parent.getChildren()) {
            Long childSectionId = child.getCurrentSection() != null ? child.getCurrentSection().getId() : null;
            System.out.println("Checking child " + child.getId() + " current section: " + childSectionId);
            if (childSectionId != null && teacherSectionIds.contains(childSectionId)) {
                System.out.println("✅ Parent's child is in teacher's section.");
                return true;
            }
        }
        return false;
    }


    private boolean teachersShareClass(User teacherUser1, User teacherUser2) {
        Teacher t1 = teacherRepository.findByUserId(teacherUser1.getId());
        Teacher t2 = teacherRepository.findByUserId(teacherUser2.getId());

        if (t1 == null || t2 == null) {
            System.out.println("teachersShareClass: One of the teachers is null.");
            return false;
        }

        Set<Long> t1ClassIds = assignmentRepository.findByTeacher(t1).stream()
                .map(a -> a.getClassEntity().getId())
                .collect(Collectors.toSet());

        Set<Long> t2ClassIds = assignmentRepository.findByTeacher(t2).stream()
                .map(a -> a.getClassEntity().getId())
                .collect(Collectors.toSet());

        System.out.println("teachersShareClass: t1 classes: " + t1ClassIds);
        System.out.println("teachersShareClass: t2 classes: " + t2ClassIds);

        t1ClassIds.retainAll(t2ClassIds);
        boolean result = !t1ClassIds.isEmpty();
        System.out.println("teachersShareClass result: " + result);
        return result;
    }

    public List<ChatUserDTO> getAvailableUsersToChat(Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ChatUserDTO> allowed = new ArrayList<>();

        // 1. Add default eligible users (via permission checks)
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            if (u.getId().equals(currentUserId)) continue;

            if (canUsersChat(currentUser, u)) {
                allowed.add(new ChatUserDTO(
                        u.getId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getRole(),
                        isClassTeacher(u),
                        getProfilePicUrlForUser(u)
                ));
            }
        }

        // 2. Add parents of students in teacher's class/section
        if (currentUser.getRole() == Role.TEACHER) {
            Teacher teacher = teacherRepository.findByUserId(currentUserId);
            if (teacher != null) {
                List<TeacherSubjectAssignment> assignments = assignmentRepository.findByTeacher(teacher);

                Set<Long> sectionIds = assignments.stream()
                        .map(a -> a.getSection().getId())
                        .collect(Collectors.toSet());

                if (!sectionIds.isEmpty()) {
                    // Find students in those sections
                    List<Student> students = studentRepository.findByCurrentSectionIdIn(sectionIds);

                    for (Student student : students) {
                        Parent parent = student.getParent();
                        if (parent == null || parent.getUser() == null) continue;

                        User parentUser = parent.getUser();

                        boolean alreadyExists = allowed.stream()
                                .anyMatch(dto -> dto.getId().equals(parentUser.getId()));

                        if (!alreadyExists) {
                            allowed.add(new ChatUserDTO(
                                    parentUser.getId(),
                                    parentUser.getFirstName(),
                                    parentUser.getLastName(),
                                    parentUser.getRole(),
                                    false,
                                    getProfilePicUrlForUser(parentUser)
                            ));
                        }
                    }
                }
            }
        }

        return allowed;
    }


    private boolean isClassTeacher(User user) {
        if (user.getRole() != Role.TEACHER) return false;
        Teacher teacher = teacherRepository.findByUserId(user.getId());
        return teacher != null && sectionRepository.existsByClassTeacher(teacher);
    }

    public List<ConversationDTO> getUserConversationsAsDTO(Long userId) {
        List<Conversation> conversations = getUserConversations(userId);
        List<ConversationDTO> dtoList = new ArrayList<>();

        for (Conversation conv : conversations) {
            User u1 = conv.getUser1();
            User u2 = conv.getUser2();

            ChatUserDTO dto1 = new ChatUserDTO(
                    u1.getId(), u1.getFirstName(), u1.getLastName(), u1.getRole(), isClassTeacher(u1),  getProfilePicUrlForUser(u1)
            );

            ChatUserDTO dto2 = new ChatUserDTO(
                    u2.getId(), u2.getFirstName(), u2.getLastName(), u2.getRole(), isClassTeacher(u2), getProfilePicUrlForUser(u2)
            );

            dtoList.add(new ConversationDTO(conv.getId(), dto1, dto2, conv.getCreatedAt()));
        }

        return dtoList;
    }

    private String getProfilePicUrlForUser(User user) {
        Teacher teacher = teacherRepository.findByUserId(user.getId());
        if (teacher != null && teacher.getProfilePicUrl() != null) {
            return "http://localhost:8081" + teacher.getProfilePicUrl();
        }
        return null;
    }


}
