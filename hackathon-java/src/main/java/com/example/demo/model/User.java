package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String agentCode;

    @Column(unique = true)
    private String idNumber;

    private String fullName;
    private String role;

    private String googleId;
    private String pictureUrl;

    @Column(name = "user_rank")
    private int rank = 1;

}

