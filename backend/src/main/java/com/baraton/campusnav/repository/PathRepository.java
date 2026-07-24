package com.baraton.campusnav.repository;

import com.baraton.campusnav.model.Building;
import com.baraton.campusnav.model.Path;
import com.baraton.campusnav.model.Path;
import com.baraton.campusnav.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// ─── Path Repository ─────────────────────────────────────────
@Repository
public interface PathRepository extends JpaRepository<Path, Integer> {

    List<Path> findByFromId(Integer fromId);

    @Query("SELECT p FROM Path p WHERE p.from.id = :id OR p.to.id = :id")
    List<Path> findAllConnected(@Param("id") Integer buildingId);
}

// ─── User Repository ─────────────────────────────────────────
@Repository
interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
