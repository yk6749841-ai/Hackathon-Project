package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue"); // ערוצי הפצה
        config.setApplicationDestinationPrefixes("/app"); // קידומת להודעות נכנסות
        config.setUserDestinationPrefix("/user"); // קידומת להודעות פרטיות
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // הכתובת אליה ה-React יתחבר
        registry.addEndpoint("/ws-chat").setAllowedOrigins("*").withSockJS();
    }
}