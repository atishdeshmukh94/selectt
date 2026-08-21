CREATE DATABASE IF NOT EXISTS selectt_db;
USE selectt_db;

-- Users table for admin access
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    bio TEXT,
    role ENUM('admin', 'staff') DEFAULT 'staff',
    job_title VARCHAR(100),
    country VARCHAR(100),
    city_state VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    facebook VARCHAR(255),
    x_com VARCHAR(255),
    linkedin VARCHAR(255),
    instagram VARCHAR(255),
    image VARCHAR(255) DEFAULT './images/user/owner.jpg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cars inventory table
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    variant VARCHAR(100),
    year INT,
    price DECIMAL(15, 2) NOT NULL,
    emi DECIMAL(15, 2),
    km INT,
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    location VARCHAR(100),
    image VARCHAR(255),
    is_assured BOOLEAN DEFAULT FALSE,
    tag VARCHAR(50),
    hub VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table for inquiries
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    message TEXT,
    car_id INT,
    status ENUM('new', 'contacted', 'converted', 'closed') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL
);
