package com.example.demo.controller;

import com.example.demo.model.ChatMessage;
import com.example.demo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    @Autowired
    private ChatService chatService;

    // משיכת היסטוריה (זה כבר היה לך, מעולה!)
    @GetMapping("/history/{myId}/{otherId}")
    public List<ChatMessage> getHistory(@PathVariable String myId, @PathVariable String otherId) {
        return chatService.getHistory(myId, otherId);
    }

    // --- התוספת שלנו לשליחת הודעה ושמירה בדאטה-בייס ---
    @PostMapping("/send")
    public ChatMessage sendMessage(@RequestBody ChatMessage message) {
        return chatService.saveMessage(message);
    }
}