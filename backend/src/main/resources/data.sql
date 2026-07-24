-- ============================================================
--  Campus Navigation System — Sample Data
--  University of Eastern Africa, Baraton
-- ============================================================

-- Categories
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
    ('Parking',             'parking')
ON DUPLICATE KEY UPDATE name=name;

-- Buildings
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
    ('Parking Lot A',                'PKA',  'Main visitor and staff parking.',                               10, 80,  200)
ON DUPLICATE KEY UPDATE name=name;

-- Paths (bidirectional)
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
    (5,  11, 140, 'Engineering South Path')
ON DUPLICATE KEY UPDATE distance=distance;

-- Default admin user (password: Admin@1234)
INSERT INTO users (username, email, password_hash, role) VALUES
    ('admin', 'admin@baraton.ac.ke',
     '$2a$12$KIX9e7n/PsATdm/5A8eBXuZIH4eQsNZ9uJVtA4e.nFZ0dJ0eF4Fwi',
     'ADMIN')
ON DUPLICATE KEY UPDATE username=username;
