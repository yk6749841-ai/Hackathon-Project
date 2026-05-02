package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendWelcomeEmail(String toEmail, String fullName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("ברוכים הבאים למערכת הסימולציות!");
        message.setText("שלום " + fullName + ",\n\n" +
                "המנהל/ת צירפ/ה אותך למערכת הסימולציות.\n" +
                "ניתן להתחבר למערכת באמצעות חשבון הגוגל שלך בקישור הבא:\n" +
                "https://your-app-link.com/login\n\n" + // כאן שימי את הלינק האמיתי
                "בהצלחה!");

        mailSender.send(message);
    }
}