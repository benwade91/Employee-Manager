INSERT INTO department (name)
VALUES
('SALES'), 
('ENGINEERING'), 
('FINANCE'), 
('LEGAL');

INSERT INTO roles (roles, salary, department_id)
VALUES
('SALES MANAGER', 130000, 1),
('ENTERPRISE', 100000, 1),
('CORPORATE', 90000, 1),
('ENG MANAGER', 150000, 2),
('SR ENGINEER', 130000, 2),
('JR ENGINEER', 90000, 2),
('FIN MANAGER', 120000, 3),
('FIN OPS', 90000, 3),
('SR ATTORNEY', 140000, 4),
('JR ATTORNEY', 100000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Chris', 'Smith', 1, null),
('Lexi', 'Martin', 2, 1),
('Clay', 'Alamo', 3, 1),
('Alex', 'Schmidt', 4, null),
('Ben', 'Wade', 5, 4),
('Matt', 'Wilson', 6, 4),
('Boris', 'Pang', 7, null),
('Logan', 'Brown', 8, 7),
('Rick', 'Vallejo', 9, null),
('Bailey', 'Martinez', 10, 9);
