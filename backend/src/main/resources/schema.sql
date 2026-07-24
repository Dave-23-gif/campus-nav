-- ============================================================
--  Campus Navigation System — Database Schema
--  University of Eastern Africa, Baraton
-- ============================================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE,
    icon    VARCHAR(50)  DEFAULT 'building'
);

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(20)  UNIQUE,
    description TEXT,
    category_id INT,
    map_x       DECIMAL(8,2) NOT NULL,
    map_y       DECIMAL(8,2) NOT NULL,
    image_url   VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Paths table
CREATE TABLE IF NOT EXISTS paths (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    from_id     INT NOT NULL,
    to_id       INT NOT NULL,
    distance    DECIMAL(8,2) NOT NULL,
    path_name   VARCHAR(100),
    is_accessible BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (from_id) REFERENCES buildings(id),
    FOREIGN KEY (to_id)   REFERENCES buildings(id),
    UNIQUE KEY unique_path (from_id, to_id)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(80)  NOT NULL UNIQUE,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('ADMIN','VIEWER') DEFAULT 'VIEWER',
    active        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
