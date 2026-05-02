package com.example.demo.repository;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    // עבור שלב ה-Login
    List<User> findByFullNameContainingIgnoreCaseAndRole(String fullName, String role);

    // עבור שליפת נתונים וצ'אט בהמשך
    Optional<User> findByAgentCode(String agentCode);

    // חיפוש לפי אימייל (עבור ה-DataInitializer)
    Optional<User> findByEmail(String email);
}




