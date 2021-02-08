USE employee_tracker_db;

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 	("Walter", "White", 1, null), 
		("Jesse", "Pinkman", 1, 1), 
        ("Skyler", "White", 2, 1), 
        ("Saul", "Goodman", 3, 2),
        ("Hank", "Schrader", 3, 3);

INSERT INTO roles (title, salary, department_id)
VALUES ("Boss", 120000, 1), ("Manager", 90000, 2), ("Engineer", 60000, 4);

INSERT INTO department (name)
VALUES ("Customer Success"), ("Engineer"), ("HR"), ("Marketing");
