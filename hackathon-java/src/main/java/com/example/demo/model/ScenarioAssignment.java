package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "scenario_assignments")
@Data // ה-Data מייצר אוטומטית את ה-setScenario וה-setAgent!
public class ScenarioAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // הקישור לנציג
    @ManyToOne
    @JoinColumn(name = "agent_id")
    private User agent;

    // 👇 זה השדה שגרם לשגיאה! הוא חייב להיות מסוג Scenario (ולא Long) 👇
    @ManyToOne
    @JoinColumn(name = "scenario_id")
    private Scenario scenario;

    private String difficulty;
    private String status;
}