package com.example.Skoolo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordSetupEmail(String toEmail, String token) {
        String link = "https://your-domain.com/set-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Set Your Password");
        message.setText("Hello,\n\nPlease click the link below to set your password:\n" + link +
                "\n\nThis link is valid for 24 hours.");

        mailSender.send(message);
    }
}
