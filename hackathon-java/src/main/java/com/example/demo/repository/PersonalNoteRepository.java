package com.example.demo.repository;

import com.example.demo.model.PersonalNote;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query; // חובה להוסיף
import org.springframework.data.repository.query.Param; // חובה להוסיף
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface PersonalNoteRepository extends JpaRepository<PersonalNote, Long> {
    List<PersonalNote> findByAgent(User agent);

    @Modifying
    @Transactional
    @Query("DELETE FROM PersonalNote p WHERE p.agent.id = :agentId")
    void deleteByAgentId(@Param("agentId") Long agentId);
}