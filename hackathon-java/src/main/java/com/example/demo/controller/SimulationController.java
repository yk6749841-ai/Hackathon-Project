package com.example.demo.controller;

import com.example.demo.model.SimulationResult;
import com.example.demo.model.ScenarioAssignment;
import com.example.demo.repository.ScenarioAssignmentRepository;
import com.example.demo.repository.SimulationResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    @Autowired
    private SimulationResultRepository repository;

    @Autowired
    private ScenarioAssignmentRepository assignmentRepository;

    @PostMapping("/save")
    public SimulationResult saveResult(@RequestBody SimulationResult result, @RequestParam Long assignmentId) {
        return assignmentRepository.findById(assignmentId).map(assignment -> {
            // קישור אוטומטי של התוצאה לתרחיש ולנציג מתוך המשימה
            result.setScenario(assignment.getScenario());
            result.setTraineeId(assignment.getAgent().getAgentCode());

            SimulationResult saved = repository.save(result);

            // עדכון המשימה כבוצעה
            assignment.setStatus("COMPLETED");
            assignmentRepository.save(assignment);

            return saved;
        }).orElseThrow(() -> new RuntimeException("Assignment not found: " + assignmentId));
    }
}