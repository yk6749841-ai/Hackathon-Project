package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;



@Entity
@Table(name = "scenarios")
@Data
public class Scenario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String systemPrompt;

    private String difficulty;
    private String category;

    @Column(columnDefinition = "TEXT")
    private String rawData;
}