package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    // 1. הרשמת מנהל (נשאר דומה, אבל משתמש ב-Email כזיהוי ראשוני)
    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@RequestBody User user) {
        user.setRole("ADMIN");
        return ResponseEntity.ok(userRepository.save(user));
    }

    // 2. כניסת נציג - לפי קוד נציג (Agent Code)
    // עד שנטמיע את ה-Google Login המלא, זה מאפשר לך להיכנס למערכת בבדיקות
    @GetMapping("/agent-login/{agentCode}")
    public ResponseEntity<?> agentLogin(@PathVariable String agentCode) {
        // חיפוש לפי קוד נציג במקום לפי תעודת זהות
        Optional<User> user = userRepository.findByAgentCode(agentCode);

        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.status(404).body("נציג לא נמצא במערכת. בדוק את קוד הנציג.");
    }

    // 3. Endpoint חדש עבור התחברות גוגל (הכנה לצד הלקוח)
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody User googleUser) {
        Optional<User> userOpt = userRepository.findByEmail(googleUser.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            user.setGoogleId(googleUser.getGoogleId());
            user.setPictureUrl(googleUser.getPictureUrl());

            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } else {
            return ResponseEntity.status(403).body("האימייל של גוגל לא רשום במערכת. פנה למנהל.");
        }
    }
}