package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_results")
@Data
public class SimulationResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // הוספת הקשר לנציג - זה מה שהיה חסר!
    @ManyToOne
    @JoinColumn(name = "agent_id")
    private User agent; 

    private String traineeId;

    @ManyToOne
    @JoinColumn(name = "scenario_id")
    private Scenario scenario;

    private Integer finalScore;

    @Column(columnDefinition = "TEXT")
    private String fullTranscript;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private Double empathyScore;
    private Double stressLevel;
    private Integer interruptions;
    private Long averageResponseTime;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}