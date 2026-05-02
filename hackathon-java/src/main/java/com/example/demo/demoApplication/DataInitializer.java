package com.example.demo.demoApplication;

import com.example.demo.model.Scenario;
import com.example.demo.model.User;
import com.example.demo.repository.ScenarioRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepo, ScenarioRepository scenarioRepo) {
        return args -> {
            // 1. יצירת מנהל ראשון לפי תעודת זהות (במקום אימייל)
            boolean adminExists = userRepo.findAll().stream()
                    .anyMatch(u -> "ADMIN".equals(u.getRole()));

            if (!adminExists) {
                User admin = new User();
                admin.setEmail("admin@company.com");
                admin.setFullName("המנהלת הגדולה");
                admin.setRole("ADMIN");
                admin.setAgentCode("ADMIN_001");
                userRepo.save(admin);
                System.out.println("✅ Admin created!");
            }

            // 2. יצירת נציג ראשון לבדיקה
            if (userRepo.findAll().size() <= 1) {
                User agent = new User();
                agent.setIdNumber("987654321");
                agent.setEmail("agent1@company.com");
                agent.setFullName("ישראל ישראלי");
                agent.setRole("AGENT");
                agent.setAgentCode("AG001");
                userRepo.save(agent);
                System.out.println("✅ Agent created!");
            }

            // 3. יצירת תרחיש ראשון
            if (scenarioRepo.findAll().isEmpty()) {
                Scenario s = new Scenario();
                s.setName("לקוח עצבני על חיוב כפול");
                s.setDifficulty("Medium");
                s.setCategory("Service");
                s.setSystemPrompt("אתה לקוח שגילה שחייבו אותו פעמיים בבנק. אתה כועס מאוד אבל תירגע אם הנציג יפגין אמפתיה.");
                scenarioRepo.save(s);
                System.out.println("✅ First Scenario created!");
            }
        };
    }
}