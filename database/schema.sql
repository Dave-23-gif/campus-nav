-- ============================================================
--  Campus Navigation System — Database Schema
--  University of Eastern Africa, Baraton
--  Author: David Chikamai  |  Course: INSY492
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus_nav;
USE campus_nav;

-- ------------------------------------------------------------
-- categories: building types (lecture hall, lab, office, etc.)
-- ------------------------------------------------------------
CREATE TABLE categories (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE,
    icon    VARCHAR(50)  DEFAULT 'building'
);

INSERT INTO categories (name, icon) VALUES
    ('Lecture Hall',        'chalkboard'),
    ('Laboratory',          'flask'),
    ('Administrative',      'briefcase'),
    ('Library',             'book'),
    ('Cafeteria',           'utensils'),
    ('Dormitory',           'bed'),
    ('Sports Facility',     'running'),
    ('Chapel/Worship',      'church'),
    ('Medical',             'hospital'),
    ('Parking',             'parking');

-- ------------------------------------------------------------
-- buildings: campus locations (nodes in the graph)
-- ------------------------------------------------------------
CREATE TABLE buildings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(20)  UNIQUE,           -- short code e.g. "SB", "LIB"
    description TEXT,
    category_id INT,
    map_x       DECIMAL(8,2) NOT NULL,         -- X coordinate on campus map (pixels)
    map_y       DECIMAL(8,2) NOT NULL,         -- Y coordinate on campus map (pixels)
    image_url   VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO buildings (name, code, description, category_id, map_x, map_y) VALUES
    ('School of Business',           'SB',   'Main business school building with lecture halls and offices.', 1, 320, 210),
    ('Science Block',                'SC',   'Physics, Chemistry and Biology laboratories.',                  2, 480, 160),
    ('University Library',           'LIB',  'Main library with reading rooms and digital resources.',        4, 220, 310),
    ('Administration Block',         'ADM',  'Vice Chancellor office and student affairs.',                   3, 150, 180),
    ('Student Centre / Cafeteria',   'CAF',  'Food court and student common area.',                           5, 390, 360),
    ('Male Dormitory A',             'DORM-A','Student residence — male students.',                           6, 560, 380),
    ('Female Dormitory B',           'DORM-B','Student residence — female students.',                         6, 130, 410),
    ('Sports Complex',               'SPT',  'Football field, basketball courts and gym.',                    7, 500, 460),
    ('University Chapel',            'CHP',  'Interdenominational worship centre.',                           8, 280, 140),
    ('Health Centre',                'HC',   'Campus clinic and pharmacy.',                                   9, 160, 330),
    ('Engineering Block',            'ENG',  'Electrical and civil engineering labs.',                        2, 450, 260),
    ('Parking Lot A',                'PKA',  'Main visitor and staff parking.',                               10, 80,  200);

-- ------------------------------------------------------------
-- paths: weighted edges between buildings (graph edges)
-- ------------------------------------------------------------
CREATE TABLE paths (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    from_id     INT NOT NULL,
    to_id       INT NOT NULL,
    distance    DECIMAL(8,2) NOT NULL,         -- metres (used as Dijkstra weight)
    path_name   VARCHAR(100),                  -- e.g. "Main Boulevard"
    is_accessible BOOLEAN DEFAULT TRUE,        -- wheelchair accessible?
    FOREIGN KEY (from_id) REFERENCES buildings(id),
    FOREIGN KEY (to_id)   REFERENCES buildings(id),
    UNIQUE KEY unique_path (from_id, to_id)
);

-- Paths are bidirectional — insert both directions
INSERT INTO paths (from_id, to_id, distance, path_name) VALUES
    (1,  2,  180, 'North Academic Walk'),
    (2,  1,  180, 'North Academic Walk'),
    (1,  3,  120, 'Library Lane'),
    (3,  1,  120, 'Library Lane'),
    (1,  5,  90,  'Central Path'),
    (5,  1,  90,  'Central Path'),
    (2,  11, 100, 'Science-Engineering Link'),
    (11, 2,  100, 'Science-Engineering Link'),
    (3,  4,  140, 'Admin Road'),
    (4,  3,  140, 'Admin Road'),
    (4,  10, 80,  'Health Walkway'),
    (10, 4,  80,  'Health Walkway'),
    (4,  12, 70,  'Parking Access'),
    (12, 4,  70,  'Parking Access'),
    (5,  6,  160, 'East Dorm Path'),
    (6,  5,  160, 'East Dorm Path'),
    (5,  7,  170, 'West Dorm Path'),
    (7,  5,  170, 'West Dorm Path'),
    (5,  8,  200, 'Sports Road'),
    (8,  5,  200, 'Sports Road'),
    (1,  9,  110, 'Chapel Way'),
    (9,  1,  110, 'Chapel Way'),
    (3,  10, 90,  'Health Lane'),
    (10, 3,  90,  'Health Lane'),
    (6,  8,  120, 'Dorm-Sports Link'),
    (8,  6,  120, 'Dorm-Sports Link'),
    (9,  4,  130, 'Admin-Chapel Road'),
    (4,  9,  130, 'Admin-Chapel Road'),
    (11, 5,  140, 'Engineering South Path'),
    (5,  11, 140, 'Engineering South Path');

-- ------------------------------------------------------------
-- users: admin accounts (role-based access)
-- ------------------------------------------------------------
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(80)  NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,       -- BCrypt hash
    role          ENUM('ADMIN','VIEWER') DEFAULT 'VIEWER',
    active        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default admin (password: Admin@1234 — change immediately in production)
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@baraton.ac.ke',
     '$2a$12$KIX9e7n/PsATdm/5A8eBXuZIH4eQsNZ9uJVtA4e.nFZ0dJ0eF4Fwi',
     'ADMIN');
