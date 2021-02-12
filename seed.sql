USE employee_tracker_db;

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
