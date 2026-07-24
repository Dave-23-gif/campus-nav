package com.baraton.campusnav.service;

import com.baraton.campusnav.model.Building;
import com.baraton.campusnav.model.Path;
import com.baraton.campusnav.repository.PathRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Dijkstra's Shortest Path Algorithm
 * ────────────────────────────────────────────────────────────
 * Finds the shortest walking route between two buildings on
 * the Baraton campus graph.
 *
 * Time complexity:  O((V + E) log V)  with a priority queue
 * Space complexity: O(V + E)
 */
@Service
public class RoutingService {

    private final PathRepository pathRepository;

    public RoutingService(PathRepository pathRepository) {
        this.pathRepository = pathRepository;
    }

    // ─── Result DTO ──────────────────────────────────────────
    public static class RouteResult {
        public final List<Building> path;        // ordered list of buildings to visit
        public final double totalDistance;       // metres
        public final boolean found;

        RouteResult(List<Building> path, double totalDistance, boolean found) {
            this.path          = path;
            this.totalDistance = totalDistance;
            this.found         = found;
        }

        public static RouteResult notFound() {
            return new RouteResult(Collections.emptyList(), 0, false);
        }
    }

    // ─── Main Algorithm ──────────────────────────────────────
    /**
     * Runs Dijkstra from {@code source} to {@code target}.
     * Loads all path edges lazily from the database,
     * builds an adjacency list, then relaxes edges.
     */
    public RouteResult findShortestPath(Building source, Building target) {
        if (source.getId().equals(target.getId())) {
            return new RouteResult(List.of(source), 0, true);
        }

        // 1. Load all edges and build adjacency map
        List<Path> allEdges = pathRepository.findAll();
        Map<Integer, List<Path>> adj = new HashMap<>();
        for (Path edge : allEdges) {
            adj.computeIfAbsent(edge.getFrom().getId(), k -> new ArrayList<>()).add(edge);
        }

        // 2. Distance map and predecessor map
        Map<Integer, Double>   dist = new HashMap<>();
        Map<Integer, Building> prev = new HashMap<>();
        Set<Integer>           visited = new HashSet<>();

        // Priority queue: [distance, buildingId]
        PriorityQueue<double[]> pq = new PriorityQueue<>(Comparator.comparingDouble(a -> a[0]));

        // Collect all node IDs
        Set<Integer> allNodes = new HashSet<>();
        for (Path e : allEdges) {
            allNodes.add(e.getFrom().getId());
            allNodes.add(e.getTo().getId());
        }
        allNodes.add(source.getId());
        allNodes.add(target.getId());

        for (Integer nodeId : allNodes) {
            dist.put(nodeId, Double.MAX_VALUE);
        }
        dist.put(source.getId(), 0.0);
        pq.offer(new double[]{0.0, source.getId()});

        // Keep a map of id -> Building for path reconstruction
        Map<Integer, Building> buildingMap = new HashMap<>();
        for (Path e : allEdges) {
            buildingMap.put(e.getFrom().getId(), e.getFrom());
            buildingMap.put(e.getTo().getId(), e.getTo());
        }
        buildingMap.put(source.getId(), source);
        buildingMap.put(target.getId(), target);

        // 3. Dijkstra main loop
        while (!pq.isEmpty()) {
            double[] current = pq.poll();
            double   currDist = current[0];
            int      currId   = (int) current[1];

            if (visited.contains(currId)) continue;
            visited.add(currId);

            if (currId == target.getId()) break;   // reached target

            List<Path> neighbours = adj.getOrDefault(currId, Collections.emptyList());
            for (Path edge : neighbours) {
                int    neighbourId  = edge.getTo().getId();
                double newDist      = currDist + edge.getDistance();

                if (newDist < dist.getOrDefault(neighbourId, Double.MAX_VALUE)) {
                    dist.put(neighbourId, newDist);
                    prev.put(neighbourId, buildingMap.get(currId));
                    pq.offer(new double[]{newDist, neighbourId});
                }
            }
        }

        // 4. Reconstruct path
        if (!prev.containsKey(target.getId()) && !source.getId().equals(target.getId())) {
            return RouteResult.notFound();
        }

        LinkedList<Building> path = new LinkedList<>();
        Building current = target;
        while (current != null) {
            path.addFirst(current);
            current = prev.get(current.getId());
        }

        double totalDistance = dist.getOrDefault(target.getId(), 0.0);
        return new RouteResult(new ArrayList<>(path), totalDistance, true);
    }
}
