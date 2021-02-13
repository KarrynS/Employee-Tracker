//Dependencies
const inquirer = require("inquirer");
const mysql = require('mysql');
const consoletable = require("console.table");
require('dotenv').config();

//Establishing connection to database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER, 
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE
});

//Inquirer Prompts for all possible user interactions
const start = () => {
    return inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Employee Tracker: What would you like to do?",
            choices: [
                "View all Employees",
                "View All Departments",
                "View All Roles",
                "View employees by role",
                "View employees by department",
                "Add an employee",
                "Add a department",
                "Add a role",
                "Update employee role",
                "Delete employee",
                "Delete a department",
                "Delete a role",
                "View total budget of a department",
                "Exit application"
            ],
        },
    ])
    .then((answer) => {
        switch (answer.action) {
            case "View all Employees":
                viewAllEmployees();
                break;
            case "View All Departments":
                viewAllDepartments();
                break;
            case "View All Roles":
                viewAllRoles();
                break;
            case "View employees by role":
                viewEmployeesByRole();
                break;
            case "View employees by department":
                viewEmployeesByDepartment();
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;         
            case "Add an employee":
                addEmployee();
                break;
            case "Update employee role":
                updateEmployeeRole();
                break;
            case "Delete employee":
                deleteEmployee();
                break;
            case "Delete a department":
                deleteDepartment();
                break;
            case "Delete a role":
                deleteRole();
                break;
            case "View total budget of a department":
                viewDepartmentBudget();
                break;
            default:
                connection.end()
                break;
        }
    });
}

//Functions for all user interactions

//View all employees
function viewAllEmployees() {
    connection.query(
        `SELECT e.id, e.first_name, e.last_name, r.title, r.salary 
        FROM employee e 
        JOIN roles r on e.role_id = r.id`, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    })
}

//View all departments
function viewAllDepartments() {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    })
}

//View all roles
function viewAllRoles() {
    connection.query('SELECT * FROM roles', (err,res) => {
        if (err) throw err;
        console.table(res);
        start();
    })
}

//View employees by role
function viewEmployeesByRole() {
    connection.query(
        `SELECT roles.title, roles.id FROM roles`, (err, res) => {
            if(err) throw err;
            const roles = res.map(({ id, title}) => ({
                value: id,
                name: title,
            }));
            inquirer.prompt([
                {
                    name: "role", 
                    type: "list", 
                    message: "What role would you like to view?",
                    choices: roles
                }, 
            ]).then(function(answer) {
                connection.query(
                    `SELECT e.id, CONCAT(e.first_name, " ", e.last_name) AS name, roles.title, roles.salary
                    FROM employee e
                    LEFT JOIN roles ON e.role_id = roles.id
                    LEFT JOIN employee ON e.manager_id = e.id
                    WHERE e.role_id = ?`, (answer.role), (err,res) => {
                        if (err) throw err;
                        console.table(res);
                        start();
                    }
                )
            })
        }
    )
}

//View employees by department
function viewEmployeesByDepartment() {
    connection.query(
        `SELECT * FROM department`, (err,res) => {
            if(err) throw err;
            const department = res.map(({id, name}) => ({
                value: id,
                name: name,
            }));
            inquirer.prompt([
                {
                    name: "department",
                    type: "list",
                    message: "Which department would you like to view?",
                    choices: department
                }
            ]).then((answer) => {
                connection.query(
                    `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name, roles.title, roles.salary, department.name AS department, CONCAT(mx.first_name, " ", mx.last_name) AS manager
                    FROM employee 
                    LEFT JOIN roles ON employee.role_id = roles.id
                    LEFT JOIN department ON roles.department_id = department.id 
                    LEFT JOIN employee AS mx ON employee.manager_id = mx.id
                    WHERE department.id = ?`, (answer.department), (err, res) => {
                        if (err) throw err;
                        console.table(res);
                        start();
                    }
                )
            })
        }
    )
}

//Adding a department
function addDepartment () {
    connection.query("SELECT name FROM department", (err,res) => {
        if (err) throw err;
        console.log("Existing departments:")
        console.table(res);

        const currentDepartments = res.map((department) => department.name);
        inquirer.prompt([
            {
                name: "department",
                type: "input",
                message: "New department name: "
            }
        ]).then(function(res){
            if (currentDepartments.includes(res.department)) {
                console.log("Department already exist");
                start();
            } else {
                connection.query('INSERT INTO department SET ?', 
                [
                    {
                        name: res.department
                    }
                ],
                (err) => {
                    if (err) throw err;
                    console.log(`/////New ${res.department} department was added/////`);
                    start();
                }
            )}
        })
    })
}

//Add a role
function addRole () {
    connection.query("SELECT name, id FROM department", (err,res) => {
        if (err) throw err;
        const currentDepartment = res.map(department =>({name : department.name, value:department.id}));
        inquirer.prompt([
            {
                name: "title",
                type: "input",
                message: "Please insert role"
            }, 
            {
                name: "salary",
                type: "input",
                message: "Salary of new role: "
            },
            {
                name: "department_id",
                type: "list",
                message: "Department of new role:  ",
                choices: currentDepartment
            }
        ]).then(function(role){
            connection.query("INSERT INTO roles SET ? ", role, (err,res) => {
                if (err) throw err;
                console.log(`/////New ${role.title} role successfully added //////`);
                start();
            })
        })
    })
}

///Add an employee
function addEmployee() {
    connection.query(
        `SELECT CONCAT(e.first_name, ' ', e.last_name) AS employee, e.id 
        FROM employee e`, (err, res) => {
        if(err) throw err;

        connection.query(
            `SELECT title, id
            FROM roles`, (err, res1) => {
            if (err) throw err;

            const rolesList = res1.map(roles =>({name : roles.title, value : roles.id}));
            const managerList = res.map(employee => ({name: employee.employee, value: employee.id}));
            inquirer.prompt([
                {
                    name: "first_name",
                    type: "input",
                    message: "Enter employee's first name: "
                }, 
                {
                    name: "last_name",
                    type: "input",
                    message: "Enter employee's last name: "
                },
                {
                    name: "role_id",
                    type: "list",
                    message: "Select employee's role :",
                    choices: rolesList.filter((item, index) => rolesList.indexOf(item) === index),
                },
                {
                    name: "manager_id",
                    type: "list",
                    message: "Select employee's manager :",
                    choices: managerList.filter((item, index) => managerList.indexOf(item) === index),
                }
            ],
            ).then((answer) => {
                connection.query(`INSERT INTO employee SET ?`, answer, (err, res) => {
                    if (err) throw err;
                    console.log(`/////${answer.first_name} ${answer.last_name} has been successfully added/////`);
                    start();
                })
            })
            })       
    })
}

//Update employee roles
function updateEmployeeRole() {
    connection.query(
        `SELECT CONCAT(e.first_name, ' ', e.last_name) AS employees, e.id, r.title
        FROM employee e 
        LEFT JOIN roles r 
        ON r.id = e.role_id`, (err, res) => {
        if (err) throw err;

        const rolesList = res.map(roles =>({name : roles.title, value : roles.id}));
        const employeeList = res.map(employee => ({name: employee.employees, value: employee.id}));
        inquirer.prompt([
            {
                name: "employee",
                type: "list",
                message: "Select employee who's role needs to be updated: ",
                choices: employeeList
            },
            {
                name: "role",
                type: "list",
                message: "Select employee's updated role: ",
                choices: rolesList.filter((item, index) => rolesList.indexOf(item) === index),
            },
        ],
        ).then((answer) => {
            connection.query(
                `UPDATE employee 
                SET role_id =?
                WHERE id = ?`, 
                [answer.role, answer.employee],
                (err, res) => {
                    if (err) throw err;
                    console.log(`/////Successfully updated employee role/////`);
                    start();
                }
            )
        })
    })
}

///BONUS

//BONUS: Delete an employee
function deleteEmployee() {
    connection.query(
        `SELECT CONCAT(e.first_name, ' ', e.last_name) AS employees, e.id
        FROM employee e`, (err, res) => {
            if (err) throw err;

            //const employeeList = res.map(employee => ({name: employee.employees, value: employee.id}));
            const employeeList = res.map(employee => ({name: employee.employees}));
            inquirer.prompt([
                {
                    name: "employee",
                    type: "list",
                    message: "Select employee you'd like to remove: ",
                    choices: employeeList
                }
            ],
            ).then((answer) => {
                connection.query(
                    `DELETE FROM employee WHERE CONCAT(employee.first_name, ' ', employee.last_name) = ?`,
                    [answer.employee], (err,res) => {
                        if (err) throw err;
                        console.log(`/////Successfully removed employee/////`);
                        start();
                    }
                )
            })
        }
    )
}

//BONUS: Delete roles
function deleteRole() {
    connection.query(
        `SELECT id, title, salary FROM roles;`, (err, res) => {
            if (err) throw err;
            const existingRoles = res.map(roles =>({name : roles.title}));
            inquirer.prompt([
                {
                    name: "role",
                    type: "list",
                    message: "Select department you'd like to remove: ",
                    choices: existingRoles
                }
            ],
        ).then((answer) => {
            //console.log(answer.role);
            connection.query(
                `DELETE FROM roles WHERE title =?`, [answer.role], (err,res) => {
                    if (err) throw err;
                    console.log(`/////Successfully removed role/////`);
                    start();
                }
            )
        })
        }
    )
}

//BONUS: Delete a department
function deleteDepartment() {
    connection.query(
        `SELECT * FROM department`,  (err, res) => {
            if (err) throw err;
        const departmentList = res.map(department => ({name: department.name}));
        inquirer.prompt([
            {
                name: "department",
                type: "list",
                message: "Select department you'd like to remove: ",
                choices: departmentList
            }
        ],
        ).then((response) => {
            connection.query(
                `DELETE FROM department
                WHERE name = ?`, [response.department], (err,res) => {
                    if (err) throw err;
                    console.log(`/////Department successfully deleted/////`);
                    start();
                }
            )
        })
        }
    )
}


//BONUS: Update employee managers


//BONUS: View employees by manager
/*function viewManager () {
    connection.query(
        `
        `, (err, res) => {
            if(err) throw err;
            console.table(res);
            start();
        }
    )
}


*/

//VBONUS: View combined saleries of all employess in that department 
function viewDepartmentBudget() {
    connection.query(
        `SELECT department.name, roles.salary, department.id FROM department
        JOIN roles
        WHERE roles.department_id = department.id`, (err, res) => {
            if (err) throw err;
            const departmentName = res.map((department => ({name: department.name})));

            //const departmentNameFilter = res.filter(department => {
            //    return department.name;
            //});

            inquirer.prompt([
                {
                    name: "department",
                    type: "list", 
                    message: "Select department to view total budget:",
                    choices: departmentName
                }
            ],
            ).then((answer) => {
                connection.query(
                    `SELECT SUM(roles.salary) AS total_budget
                    FROM roles
                    inner JOIN department
                    ON department.id = roles.department_id
                    WHERE department.name= ?`, 
                    [answer.department], (err,res) => {
                        if (err) throw err;
                        console.log("Total salary budget for this department is:")
                        console.table(res);
                        start();
                    }
                )
            })
        }
    )
}

connection.connect((err) => {
    if(err) throw err;
    console.log(`connected as id ${connection.threadId}/n`);
    start();
});

