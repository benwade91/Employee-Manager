DROP DATABASE IF EXISTS employeeDB;

CREATE DATABASE employeeDB;

USE employeeDB;

DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employee;


CREATE TABLE department (
  id int NOT NULL AUTO_INCREMENT primary key,
  name VARCHAR(30) NOT NULL
);

CREATE TABLE roles (
  id int NOT NULL AUTO_INCREMENT primary key,
  roles VARCHAR(30) NOT NULL,
  salary INTEGER,
  department_id INTEGER,
  is_manager BOOLEAN NOT NULL,
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
  id int NOT NULL AUTO_INCREMENT primary key,
  first_name VARCHAR(30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INTEGER NOT NULL,
  manager_id INTEGER NULL,
  CONSTRAINT fk_roles FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id)
);