package com.baraton.campusnav.repository;

import com.baraton.campusnav.model.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// ─── Building Repository ─────────────────────────────────────
@Repository
public interface BuildingRepository extends JpaRepository<Building, Integer> {

    List<Building> findByNameContainingIgnoreCase(String name);

    List<Building> findByCategoryId(Integer categoryId);

    Optional<Building> findByCodeIgnoreCase(String code);

    @Query("SELECT b FROM Building b WHERE " +
           "LOWER(b.name) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(b.code) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(b.description) LIKE LOWER(CONCAT('%',:q,'%'))")
    List<Building> search(@Param("q") String query);
}
