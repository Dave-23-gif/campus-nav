package com.baraton.campusnav.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

// ─── Category ────────────────────────────────────────────────
@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 50)
    private String icon;
}
