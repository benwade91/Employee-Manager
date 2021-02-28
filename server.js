var inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.SQL_PWD,
    database: 'employeeDB'
});

connection.connect(err => {
    if (err) throw err;
    console.log(`connected as id: ${connection.threadId}`);
    initAction();
})


const initAction = function () {
    inquirer.prompt([{
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: ['view all departments',
                'view all roles',
                'view all employees',
                'add a department',
                'add a role',
                'add an employee',
                'update an employee role'
            ]
        }])
        .then(data => {
            switch (data.action) {
                case 'view all departments':
                    viewAllDept();
                    break;
                case 'view all roles':
                    viewAllRoles();
                    break;
                case 'view all employees':
                    viewAllEmployees();
                    break;
                case 'add a department':
                    addDept();
                    break;
                case 'add an employee':
                    addEmp();
                    break;
                case 'add a role':
                    addRole();
                    break;
                case 'update an employee role':
                    console.log(data.action);
                    break;
            }
        })
}

const viewAllDept = function () {
    connection
        .query('SELECT * FROM department',
            function (err, results) {
                if (err) throw err;
                console.table(results);
                initAction();
            })
}

const viewAllRoles = function () {
    connection
        .query('SELECT * FROM roles',
            function (err, results) {
                if (err) throw err;
                console.table(results);
                initAction();
            })
}

const viewAllEmployees = function () {
    connection
        .query('SELECT * FROM employee',
            function (err, results) {
                if (err) throw err;
                console.table(results);
                initAction();
            })
}

const addDept = function () {
    inquirer.prompt([{
            type: 'input',
            name: 'depName',
            message: 'Department name?',
        }])
        .then(res => {
            connection.query(`INSERT INTO department(name) VALUE ('${res.depName}')`,
                function (err, ) {
                    if (err) throw err;
                    initAction();
                })
        })
}

const addEmp = function () {
    let role = [];
    let mngrs = ['none'];
    let mngrOptions = [];
    connection.query('SELECT roles FROM roles', function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            role.push(res[i].roles);
        }
    });
    connection.query('SELECT first_name, last_name FROM employee', function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            mngrs.push(res[i].first_name + ' ' + res[i].last_name);
        }
        mngrOptions.push(mngrs[0], mngrs[1], mngrs[4], mngrs[7], mngrs[9]);
    })

    inquirer.prompt([{
            type: 'input',
            name: 'fName',
            message: 'Employee FIRST name?',
        }, {
            type: 'input',
            name: 'lName',
            message: 'Employee LAST name?',
        }, {
            type: 'list',
            name: 'roleChoice',
            message: 'What is the employees role?',
            choices: role
        }, {
            type: 'list',
            name: 'mngrChoice',
            message: 'Who is the employees manager?',
            choices: mngrOptions
        }])
        .then(res => {
            let roleNum = role.indexOf(res.roleChoice) + 1;
            let mngrNum;
            if (res.mngrChoice !== 'none') {
                mngrNum = mngrs.indexOf(res.mngrChoice);
            } else {
                mngrNum = null
            }
            console.log(mngrNum);
            connection.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUE ('${res.fName}', '${res.lName}', ${roleNum}, ${mngrNum})`,
                function (err) {
                    if (err) throw err;
                    initAction();
                })
        })
}

const addRole = function () {
    inquirer.prompt([{
            type: 'input',
            name: 'rolName',
            message: 'What is the name of the role?',
        }, {
            type: 'number',
            name: 'salary',
            message: 'What is the salary for the roll?',
        }])
        .then(res => {
            connection.query(`INSERT INTO roles(roles, salary) VALUE ('${res.roleName}', ${res.salary})`,
                function (err, ) {
                    if (err) throw err;
                    initAction();
                })
        })
}


// const updateEmp