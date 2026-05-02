package com.example.demo.controller;

import com.example.demo.model.PersonalNote;
import com.example.demo.model.User;
import com.example.demo.repository.PersonalNoteRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notes")
public class PersonalNoteController {

    @Autowired
    private PersonalNoteRepository noteRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. משיכת כל הפתקים של נציג ספציפי
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<PersonalNote>> getNotesByAgent(@PathVariable Long agentId) {
        Optional<User> agentOpt = userRepository.findById(agentId);
        
        if (agentOpt.isPresent()) {
            List<PersonalNote> notes = noteRepository.findByAgent(agentOpt.get());
            return ResponseEntity.ok(notes);
        }
        return ResponseEntity.notFound().build();
    }

    // 2. שמירה או עדכון של פתק לנציג
    @PostMapping("/agent/{agentId}")
    public ResponseEntity<PersonalNote> saveOrUpdateNote(@PathVariable Long agentId, @RequestBody PersonalNote note) {
        Optional<User> agentOpt = userRepository.findById(agentId);
        
        if (agentOpt.isPresent()) {
            note.setAgent(agentOpt.get()); // שיוך הפתק לנציג
            PersonalNote savedNote = noteRepository.save(note);
            return ResponseEntity.ok(savedNote);
        }
        return ResponseEntity.badRequest().build();
    }

    // 3. מחיקת פתק
    @DeleteMapping("/{noteId}")
    public ResponseEntity<?> deleteNote(@PathVariable Long noteId) {
        noteRepository.deleteById(noteId);
        return ResponseEntity.ok().build();
    }
}