package com.example.demo.repository;

import com.example.demo.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
            "(m.senderId = :u1 AND m.recipientId = :u2) OR " +
            "(m.senderId = :u2 AND m.recipientId = :u1) " +
            "ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(String u1, String u2);

    @Transactional
    @Modifying
    @Query("UPDATE ChatMessage m SET m.isRead = true WHERE m.senderId = :senderId AND m.recipientId = :recipientId")
    void markAsRead(String senderId, String recipientId);

    // ספירת הודעות שלא נקראו עבור המנהל
    long countBySenderIdAndRecipientIdAndIsReadFalse(String senderId, String recipientId);
}