var inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
require('dotenv').config();
const logo = require('asciiart-logo');
const config = require('./package.json');
console.log(logo(config).render());

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
                'view employee by manager',
                'add a department',
                'add a role',
                'add an employee',
                'update an employee'
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
                case 'view employee by manager':
                    viewEmpByMngr();
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
                case 'update an employee':
                    updateEmp();
                    break;
            }
        })
}

const viewAllDept = function () {
    console.log('DEPARTMENTS');
    connection
        .query('SELECT * FROM department',
            function (err, results) {
                if (err) throw err;
                console.table(results);
                initAction();
            })
}

const viewAllRoles = function () {
    console.log('EMPLOYEE ROLES');
    connection
        .query('SELECT roles.roles, roles.salary, department.name FROM roles JOIN department ON roles.department_id = department.id',
            function (err, results) {
                if (err) throw err;
                console.table(results);
                initAction();
            })
}

const viewAllEmployees = function () {
    console.log('EMPLOYEES');
    connection
        .query('SELECT e.first_name, e.last_name, roles.roles, roles.salary, m.first_name AS mngr_f_name, m.last_name AS mngr_l_name FROM employee e LEFT JOIN employee m ON e.manager_id = m.id JOIN roles ON e.role_id = roles.id',
            function (err, results) {
                if (err) throw err;
                console.table(results);
                initAction();
            })
}

const viewEmpByMngr = function () {
    let mngrs = [];
    connection
        .query(`SELECT m.first_name, m.last_name, m.id, r.roles FROM employee m JOIN roles r ON m.role_id = r.id WHERE r.is_manager = true`,
            function (err, res) {
                if (err) throw err;
                for (i = 0; i < res.length; i++) {
                    mngrs.push(res[i].id + ' ' + res[i].first_name + ' ' + res[i].last_name + ' ' + res[i].roles, );
                }
                inquirer.prompt([{
                        type: 'list',
                        name: 'selectManager',
                        message: 'Which managers employees would you like to see?',
                        choices: mngrs
                    }])
                    .then(resp => {
                        let selectedMngr = (res[mngrs.indexOf(resp.selectManager)].id);
                        connection.query(`SELECT first_name, last_name, roles.roles FROM employee JOIN roles ON employee.role_id = roles.id WHERE employee.manager_id = ${selectedMngr}`,
                            function (err, res) {
                                if (err) throw err;
                                console.table(res);
                                initAction();
                            })
                    })
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
                    viewAllDept();
                })
        })
}

const addEmp = function () {
    let role = [];
    let mngrs = ['none'];
    connection.query('SELECT roles FROM roles', function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            role.push(res[i].roles);
        }
    });
    connection.query('SELECT first_name, last_name, roles.roles FROM employee JOIN roles ON employee.role_id = roles.id WHERE roles.is_manager = true', function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            mngrs.push(res[i].first_name + ' ' + res[i].last_name + ' ' + res[i].roles);
        }
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
            choices: mngrs
        }])
        .then(res => {
            let roleNum = role.indexOf(res.roleChoice) + 1;
            let mngrNum;
            if (res.mngrChoice !== 'none') {
                mngrNum = mngrs.indexOf(res.mngrChoice);
            } else {
                mngrNum = null
            }
            connection.query(`INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUE ('${res.fName}', '${res.lName}', ${roleNum}, ${mngrNum})`,
                function (err) {
                    if (err) throw err;
                    viewAllEmployees();
                })
        })
}

const addRole = function () {
    let depts = [];
    connection.query('SELECT name FROM department', function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            depts.push(res[i].name);
        }
    });
    inquirer.prompt([{
            type: 'input',
            name: 'roleName',
            message: 'What is the name of the role?',
        }, {
            type: 'number',
            name: 'salary',
            message: 'What is the salary for the roll?',
        }, {
            type: 'confirm',
            name: 'isMngr',
            message: 'Is this a manager role?',
        }, {
            type: 'list',
            name: 'deptChoice',
            message: 'What department does this role belong to?',
            choices: depts
        }])
        .then(res => {
            let deptNum = (depts.indexOf(res.deptChoice) + 1);
            connection.query(`INSERT INTO roles(roles, salary, department_id, is_manager) VALUE ('${res.roleName}', ${res.salary}, ${deptNum}, ${res.isMngr})`,
                function (err, ) {
                    if (err) throw err;
                    viewAllRoles();
                })
        })
}

const removeEmp = function (employeeId) {
    connection.query(`DELETE FROM employee WHERE id = ${employeeId}`)
}

const updateRole = function (index) {
    let roles = [];
    connection.query('SELECT * FROM roles',
        function (err, res) {
            if (err) throw err;
            for (i = 0; i < res.length; i++) {
                roles.push(res[i].id + ' ' + res[i].roles);
            }
            inquirer.prompt([{
                    type: 'list',
                    name: 'whatRole',
                    message: 'What should the employees new role be?',
                    choices: roles
                }])
                .then(resp => {
                    let roleIndex = roles.indexOf(resp.whatRole);
                    connection.query(`UPDATE employee SET role_id = ${res[roleIndex].id} WHERE id = ${index}`);
                    initAction();
                })
        })
}

const updateEmp = function () {
    let emps = [];
    let managers = [];
    let justWork;
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, roles.roles FROM employee JOIN roles ON employee.role_id = roles.id', function (err, res) {
        if (err) throw err;
        justWork = res;
        for (i = 0; i < res.length; i++) {
            emps.push(res[i].id + ' ' + res[i].first_name + ' ' + res[i].last_name + ' ' + res[i].roles);
        }
    });
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, roles.roles FROM employee JOIN roles ON employee.role_id = roles.id WHERE roles.is_manager = true', function (err, res) {
        if (err) throw err;
        for (i = 0; i < res.length; i++) {
            managers.push(res[i].id + ' ' + res[i].first_name + ' ' + res[i].last_name + ' ' + res[i].roles);
        }
    });
    inquirer.prompt([{
            type: 'list',
            name: 'empChoice',
            message: 'What would you like to update?',
            choices: ['Employee information',
                'Employee role',
                'Employees Manager',
                'Remove employee'
            ]
        }])
        .then(resp => {
            switch (resp.empChoice) {
                case 'Employee information':
                    inquirer.prompt([{
                        type: 'list',
                        name: 'empChoice',
                        message: 'Who would you like to UPDATE?',
                        choices: emps
                    }]).then(respo => {
                        empIndex = emps.indexOf(respo.empChoice);
                        removeEmp(justWork[empIndex].id);
                        addEmp();
                    })
                    break;
                case 'Employee role':
                    inquirer.prompt([{
                        type: 'list',
                        name: 'empChoice',
                        message: `Who's role would you like to UPDATE?`,
                        choices: emps
                    }]).then(respo => {
                        empIndex = emps.indexOf(respo.empChoice) + 1;
                        updateRole(empIndex);
                    })
                    break;
                case 'Employees Manager':
                    inquirer.prompt([{
                            type: 'list',
                            name: 'empChoice',
                            message: `Who's manager would you like to update?`,
                            choices: emps
                        }, {
                            type: 'list',
                            name: 'mngrChoice',
                            message: `Who should be the manager?`,
                            choices: managers
                        }])
                        .then(res => {
                            empIndex = emps.indexOf(res.empChoice);
                            mngrIndex = emps.indexOf(res.mngrChoice);
                            connection.query(`UPDATE employee SET manager_id = ${justWork[mngrIndex].id} WHERE id = ${justWork[empIndex].id}`);
                            initAction();
                        })
                    break;
                case 'Remove employee':
                    inquirer.prompt([{
                        type: 'list',
                        name: 'empChoice',
                        message: 'Who would you like to REMOVE?',
                        choices: emps
                    }]).then(res => {
                        empIndex = emps.indexOf(res.empChoice);
                        removeEmp(justWork[empIndex].id);
                        initAction();
                    })
                    break;
            }
        })
}