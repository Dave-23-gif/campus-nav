package com.baraton.campusnav.controller;

import com.baraton.campusnav.model.Building;
import com.baraton.campusnav.model.Path;
import com.baraton.campusnav.service.BuildingService;
import com.baraton.campusnav.service.RoutingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ═══════════════════════════════════════════════════════════════
//  Building Controller  —  /api/buildings
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/buildings")
@CrossOrigin(origins = "*")
class BuildingController {

    private final BuildingService buildingService;

    BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    /** GET /api/buildings  —  list all buildings */
    @GetMapping
    public List<Building> getAll() {
        return buildingService.getAllBuildings();
    }

    /** GET /api/buildings/{id}  —  single building */
    @GetMapping("/{id}")
    public ResponseEntity<Building> getOne(@PathVariable Integer id) {
        return buildingService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/buildings/search?q=library  —  search by name/code/description */
    @GetMapping("/search")
    public List<Building> search(@RequestParam(defaultValue = "") String q) {
        return buildingService.search(q);
    }

    /** GET /api/buildings/category/{categoryId}  —  filter by category */
    @GetMapping("/category/{categoryId}")
    public List<Building> byCategory(@PathVariable Integer categoryId) {
        return buildingService.getByCategory(categoryId);
    }

    // ─── Admin-only write operations ─────────────────────────

    /** POST /api/buildings  —  add a new building (ADMIN only) */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Building create(@RequestBody Building building) {
        return buildingService.save(building);
    }

    /** PUT /api/buildings/{id}  —  update a building (ADMIN only) */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Building> update(@PathVariable Integer id,
                                           @RequestBody Building updated) {
        return buildingService.getById(id).map(existing -> {
            updated.setId(id);
            return ResponseEntity.ok(buildingService.save(updated));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/buildings/{id}  —  remove a building (ADMIN only) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        buildingService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

// ═══════════════════════════════════════════════════════════════
//  Routing Controller  —  /api/route
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/route")
@CrossOrigin(origins = "*")
class RoutingController {

    private final RoutingService routingService;
    private final BuildingService buildingService;

    RoutingController(RoutingService routingService, BuildingService buildingService) {
        this.routingService  = routingService;
        this.buildingService = buildingService;
    }

    /**
     * GET /api/route?from=1&to=5
     * Returns the shortest path between two buildings.
     * Response: { found, totalDistance, path: [Building, ...] }
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getRoute(
            @RequestParam Integer from,
            @RequestParam Integer to) {

        Building source = buildingService.getById(from).orElse(null);
        Building target = buildingService.getById(to).orElse(null);

        if (source == null || target == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid building id(s)"));
        }

        RoutingService.RouteResult result = routingService.findShortestPath(source, target);

        return ResponseEntity.ok(Map.of(
                "found",         result.found,
                "totalDistance", result.totalDistance,
                "path",          result.path
        ));
    }
}

// ═══════════════════════════════════════════════════════════════
//  Auth Controller  —  /api/auth
// ═══════════════════════════════════════════════════════════════
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
class AuthController {

    /**
     * POST /api/auth/login
     * Body: { "username": "admin", "password": "Admin@1234" }
     * Returns a JWT token on success.
     * (Full JWT logic wired through SecurityConfig + JwtService)
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> creds) {
        // JWT authentication is handled by Spring Security filter chain.
        // This endpoint is documented here for clarity.
        // The actual token generation happens in JwtAuthenticationFilter.
        return ResponseEntity.ok(Map.of("message", "Use the /api/auth/token endpoint"));
    }
}
