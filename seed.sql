DROP DATABASE IF EXISTS employee_tracker_db;

CREATE DATABASE employee_tracker_db;

USE employee_tracker_db;

CREATE TABLE department (
	id INTEGER NOT NULL AUTO_INCREMENT, 
    PRIMARY KEY (id),
    name VARCHAR(30)
);

CREATE TABLE roles (
	id INTEGER NOT NULL AUTO_INCREMENT, 
    PRIMARY KEY (id),
    title VARCHAR(30),
    salary DECIMAL(10,2),
    department_id INTEGER(10)
);

CREATE TABLE employee (
	id INTEGER NOT NULL AUTO_INCREMENT, 
    PRIMARY KEY (id),
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INTEGER(10) NOT NULL,
    manager_id INTEGER(10) NULL
);
    
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 	("Walter", "White", 1, null), 
		("Jesse", "Pinkman", 2, 1), 
        ("Skyler", "White", 3, 1), 
        ("Saul", "Goodman", 5, 2),
        ("Hank", "Schrader", 4, 3);

INSERT INTO roles (title, salary, department_id)
VALUES ("Boss", 120000, 1), ("Manager", 90000, 2), ("HR Manager", 45000, 3), ("Engineer", 60000, 4), ("Legal Counsel", 165000, 5);

INSERT INTO department (name)
VALUES ("Sales"), ("Engineer"), ("HR"), ("Marketing"), ("Risk Management");