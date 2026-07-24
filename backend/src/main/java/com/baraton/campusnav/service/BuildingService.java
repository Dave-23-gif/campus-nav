package com.baraton.campusnav.service;

import com.baraton.campusnav.model.Building;
import com.baraton.campusnav.model.Path;
import com.baraton.campusnav.model.Path;
import com.baraton.campusnav.repository.BuildingRepository;
import com.baraton.campusnav.repository.PathRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * BuildingService — handles all building search and retrieval.
 */
@Service
public class BuildingService {

    private final BuildingRepository buildingRepo;

    public BuildingService(BuildingRepository buildingRepo) {
        this.buildingRepo = buildingRepo;
    }

    public List<Building> getAllBuildings() {
        return buildingRepo.findAll();
    }

    public Optional<Building> getById(Integer id) {
        return buildingRepo.findById(id);
    }

    public List<Building> search(String query) {
        if (query == null || query.isBlank()) return getAllBuildings();
        return buildingRepo.search(query.trim());
    }

    public List<Building> getByCategory(Integer categoryId) {
        return buildingRepo.findByCategoryId(categoryId);
    }

    @Transactional
    public Building save(Building building) {
        return buildingRepo.save(building);
    }

    @Transactional
    public void delete(Integer id) {
        buildingRepo.deleteById(id);
    }
}

/**
 * PathService — manages campus path edges (Admin use).
 */
@Service
class PathService {

    private final PathRepository pathRepo;

    PathService(PathRepository pathRepo) {
        this.pathRepo = pathRepo;
    }

    public List<Path> getAllPaths() {
        return pathRepo.findAll();
    }

    public List<Path> getPathsFrom(Integer buildingId) {
        return pathRepo.findByFromId(buildingId);
    }

    @Transactional
    public Path save(Path path) {
        return pathRepo.save(path);
    }

    @Transactional
    public void delete(Integer id) {
        pathRepo.deleteById(id);
    }
}
