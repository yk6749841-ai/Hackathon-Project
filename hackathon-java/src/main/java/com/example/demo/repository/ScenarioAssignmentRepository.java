package com.example.demo.repository;

import com.example.demo.model.ScenarioAssignment;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; // ייבוא חסר
import org.springframework.data.jpa.repository.Query;    // ייבוא חסר
import org.springframework.data.repository.query.Param; // ייבוא חסר
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional; // ייבוא חסר
import java.util.List;

@Repository
public interface ScenarioAssignmentRepository extends JpaRepository<ScenarioAssignment, Long> {
    List<ScenarioAssignment> findByAgentAndStatus(User agent, String status);
    List<ScenarioAssignment> findByAgent(User agent);

    // הוספת הפונקציה שחסרה וגרמה לשגיאת ה-Build
    @Modifying
    @Transactional
    @Query("DELETE FROM ScenarioAssignment s WHERE s.agent.id = :agentId")
    void deleteByAgentId(@Param("agentId") Long agentId);
}