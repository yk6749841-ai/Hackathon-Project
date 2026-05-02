package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/agent")
public class AgentController {

    @Autowired
    private ScenarioAssignmentRepository assignmentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SimulationResultRepository resultRepository;

    @GetMapping("/{id}/history")
    public ResponseEntity<?> getMyHistory(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        User user = userOpt.get();
        return ResponseEntity.ok(resultRepository.findByTraineeId(user.getAgentCode()));
    }

    @GetMapping("/assignment/{id}")
    public ScenarioAssignment getAssignment(@PathVariable Long id) {
        return assignmentRepository.findById(id).orElseThrow();
    }

    @GetMapping("/{id}/tasks")
    public List<ScenarioAssignment> getTasksById(@PathVariable Long id) {
        User agent = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("נציג לא נמצא"));
        
        // שולף את המשימות של הנציג, אבל מסנן החוצה את אלו שהוסתרו/הועברו לארכיון
        return assignmentRepository.findByAgent(agent).stream()
                .filter(task -> !"ARCHIVED".equals(task.getStatus()))
                .toList();
    }

    // --- הפונקציה החדשה שמעבירה לארכיון במקום למחוק ---
    @PutMapping("/task/{taskId}/archive")
    public ResponseEntity<?> archiveTask(@PathVariable Long taskId) {
        try {
            Optional<ScenarioAssignment> assignmentOpt = assignmentRepository.findById(taskId);
            
            if (assignmentOpt.isPresent()) {
                ScenarioAssignment assignment = assignmentOpt.get();
                // משנים את הסטטוס לארכיון במקום למחוק, שומרים על הכל בדאטה-בייס
                assignment.setStatus("ARCHIVED");
                assignmentRepository.save(assignment);
                
                return ResponseEntity.ok().body("המשימה הוסרה מהמסך בהצלחה");
            }
            
            return ResponseEntity.badRequest().body("המשימה לא נמצאה");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("שגיאה בהסרת המשימה: " + e.getMessage());
        }
    }
}