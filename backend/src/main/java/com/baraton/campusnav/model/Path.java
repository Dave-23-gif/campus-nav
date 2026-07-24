package com.baraton.campusnav.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "paths",
       uniqueConstraints = @UniqueConstraint(columnNames = {"from_id", "to_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Path {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "from_id", nullable = false)
    private Building from;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "to_id", nullable = false)
    private Building to;

    @Column(nullable = false)
    private Double distance;   // metres — used as Dijkstra edge weight

    @Column(name = "path_name", length = 100)
    private String pathName;

    @Column(name = "is_accessible")
    private Boolean isAccessible = true;
}
