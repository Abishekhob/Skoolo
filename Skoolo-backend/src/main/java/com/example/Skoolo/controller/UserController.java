package com.example.Skoolo.controller;

import com.example.Skoolo.dto.PasswordDTO;
import com.example.Skoolo.model.Parent;
import com.example.Skoolo.model.PasswordResetToken;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.ParentRepository;
import com.example.Skoolo.repo.PasswordResetTokenRepository;
import com.example.Skoolo.repo.UserRepository;
import java.time.LocalDateTime;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/user/")
@Controller
public class UserController {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ParentRepository parentRepository;

    @PostMapping("/set-password")
    public ResponseEntity<String> setPassword(@RequestBody PasswordDTO dto) {
        PasswordResetToken token = tokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("Token expired");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setPasswordSet(true);
        userRepository.save(user);

        tokenRepository.delete(token); // optional

        return ResponseEntity.ok("Password set successfully.");
    }


    @GetMapping("/chat-contacts")
    public ResponseEntity<List<User>> getChatContacts(@RequestParam Long teacherId) {
        List<Parent> parents = parentRepository.findParentsByTeacherId(teacherId);
        List<User> parentUsers = parents.stream()
                .map(Parent::getUser)
                .filter(Objects::nonNull)
                .toList();

        List<User> otherTeachers = userRepository.findOtherTeachers(teacherId);

        Set<User> combined = new HashSet<>();
        combined.addAll(parentUsers);
        combined.addAll(otherTeachers);

        return ResponseEntity.ok(new ArrayList<>(combined));
    }

}
