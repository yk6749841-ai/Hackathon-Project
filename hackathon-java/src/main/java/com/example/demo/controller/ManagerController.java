package com.example.demo.controller;

import com.example.demo.model.Scenario;
import com.example.demo.model.ScenarioAssignment;
import com.example.demo.model.SimulationResult;
import com.example.demo.model.User;
import com.example.demo.repository.ScenarioAssignmentRepository;
import com.example.demo.repository.ScenarioRepository;
import com.example.demo.repository.SimulationResultRepository;
import com.example.demo.repository.UserRepository;

// --- הייבואים החסרים שהוספתי ---
import com.example.demo.repository.PersonalNoteRepository; // חובה בשביל למחוק פתקיות
import org.springframework.http.ResponseEntity; // חובה בשביל להחזיר תשובה ל-React

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ScenarioRepository scenarioRepository;

    @Autowired
    private ScenarioAssignmentRepository assignmentRepository;

    @Autowired
    private SimulationResultRepository resultRepository;

    // הוספתי את זה כדי שהמחיקה תעבוד
    @Autowired
    private PersonalNoteRepository personalNoteRepository;

    @GetMapping("/search-agent")
    public List<User> searchAgent(@RequestParam(defaultValue = "") String name) {
        return userRepository.findByFullNameContainingIgnoreCaseAndRole(name, "AGENT");
    }

    @PostMapping("/add-agent")
    public User addAgent(@RequestBody User agent) {
        agent.setRole("AGENT");
        return userRepository.save(agent);
    }

    @GetMapping("/all-agents")
    public List<User> getAllAgents() {
        return userRepository.findAll().stream()
                .filter(u -> "AGENT".equals(u.getRole())).toList();
    }

    @PostMapping("/add-scenario")
    public Scenario addScenario(@RequestBody Scenario scenario) {
        return scenarioRepository.save(scenario);
    }

    @GetMapping("/scenarios")
    public List<Scenario> getScenarios() {
        return scenarioRepository.findAll();
    }

    @PostMapping("/assign-to-agent")
    public ScenarioAssignment assignToAgent(@RequestParam Long agentId, @RequestParam Long scenarioId, @RequestParam String difficulty) {
        User agent = userRepository.findById(agentId).orElseThrow(() -> new RuntimeException("Agent not found"));
        Scenario scenario = scenarioRepository.findById(scenarioId).orElseThrow(() -> new RuntimeException("Scenario not found"));

        ScenarioAssignment assignment = new ScenarioAssignment();
        assignment.setAgent(agent);
        assignment.setScenario(scenario);
        assignment.setDifficulty(difficulty);
        assignment.setStatus("PENDING");
        return assignmentRepository.save(assignment);
    }

    @DeleteMapping("/delete-scenario/{id}")
    public void deleteScenario(@PathVariable Long id) {
        Scenario scenario = scenarioRepository.findById(id).orElse(null);

        if (scenario != null) {
            List<ScenarioAssignment> assignmentsToDelete = assignmentRepository.findAll().stream()
                    .filter(assignment -> assignment.getScenario() != null && assignment.getScenario().getId().equals(id))
                    .toList();

            assignmentRepository.deleteAll(assignmentsToDelete);
            scenarioRepository.deleteById(id);
        }
    }

    @GetMapping("/all-results")
    public List<SimulationResult> getAllResults() {
        return resultRepository.findAll();
    }

    // --- הפונקציה המתוקנת של מחיקת נציג ---
@DeleteMapping("/agent/{id}")
@Transactional
public ResponseEntity<?> deleteAgent(@PathVariable Long id) {
    try {
        // 1. מחיקת המשימות (זה מה שהיה חסר!)
        // ודאי שקיים מתודה כזו ב-ScenarioAssignmentRepository
        assignmentRepository.deleteByAgentId(id); 

        // 2. מחיקת כל הפתקיות האישיות
        personalNoteRepository.deleteByAgentId(id);

        // 3. מחיקת תוצאות הסימולציה
        resultRepository.deleteByAgentId(id);

        // 4. עכשיו כשהוא "חופשי" מכל קשר, אפשר למחוק אותו
        userRepository.deleteById(id);
        
        return ResponseEntity.ok().body("הנציג וכל נתוניו נמחקו בהצלחה");
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("שגיאה במחיקת הנציג: " + e.getMessage());
    }
}
}