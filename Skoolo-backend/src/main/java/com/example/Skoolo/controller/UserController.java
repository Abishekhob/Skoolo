package com.example.Skoolo.controller;

import com.example.Skoolo.dto.PasswordDTO;
import com.example.Skoolo.model.PasswordResetToken;
import com.example.Skoolo.model.User;
import com.example.Skoolo.repo.ParentRepository;
import com.example.Skoolo.repo.PasswordResetTokenRepository;
import com.example.Skoolo.repo.UserRepository;
import com.example.Skoolo.service.ConversationService;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

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
    @Autowired
    private ConversationService conversationService;

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




}
