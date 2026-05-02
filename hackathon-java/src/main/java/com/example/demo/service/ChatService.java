package com.example.demo.service;

import com.example.demo.model.ChatMessage;
import com.example.demo.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ChatMessageRepository repository;

    public ChatMessage saveMessage(ChatMessage message) {
        return repository.save(message);
    }

    public List<ChatMessage> getHistory(String myId, String otherId) {
        // ברגע שמושכים היסטוריה, מסמנים את ההודעות שהתקבלו כ"נקראו"
        repository.markAsRead(otherId, myId);
        return repository.findChatHistory(myId, otherId);
    }
}