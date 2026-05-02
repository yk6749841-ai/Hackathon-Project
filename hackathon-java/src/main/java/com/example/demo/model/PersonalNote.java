package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonProperty; // הוספנו את זה כדי לפתור את הבעיה

@Entity
@Table(name = "personal_notes")
@Data
public class PersonalNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // הקישור הייחודי לנציג - ככה אף אחד לא רואה פתקים של אחרים!
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User agent;

    @Column(columnDefinition = "TEXT")
    private String content;

    // --- הפתרון: מכריחים את Java לקרוא נכון את ה-JSON מה-React ---
    @JsonProperty("xPosition")
    private Double xPosition;

    @JsonProperty("yPosition")
    private Double yPosition;

    @JsonProperty("isDraft")
    private Boolean isDraft;

    private String color;

    private LocalDateTime createdAt = LocalDateTime.now();
}