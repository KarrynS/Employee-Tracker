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
                "Add a department",
                "Add a role",
                "Add an employee",
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
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRole();
                break;         
            case "Add an employee":
                addEmployee();
            case "Update employee role":
                updateEmployee();
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
                    console.log(`New ${res.department} department was added`);
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
        //console.log(res)
        const currentDepartment = res.map(department =>({name : department.name, value:department.id}));
        ///Get index of department id but show by name???
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
                ///////Dynamically select id and name from department table
            }
        ]).then(function(role){
            //console.log(role);
            connection.query("INSERT INTO roles SET ? ", role, (err,res) => {
                if (err) throw err;
                console.log(`New ${role.title} role successfully added`);
                start();
            })
            /*
            if (currentRoles.include(res.title)) {
                console.log("Role already exists");
                start();
            } else {
                connection.query('')
                //dynamically add  role plus department name from department table)
            
            }
            */

        })
    })
}


///Add an employee
function addEmployee() {
    connection.query("SELECT CONCAT(e.first_name, ' ', e.last_name) AS employee, e.id FROM employee e", (err, res) => {
        if(err) throw err;

        connection.query(
            `SELECT title, id
            FROM roles`, (err, res1) => {
            if (err) throw err;

            const rolesList = res1.map(roles =>({name : roles.title, value : roles.id}));
            console.log(rolesList);
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
                    console.log(` ${answer.first_name} ${answer.last_name} has been successfully added`);
                    start();
                })
            })
            })
//        const currentDepartment = res.map(department =>({name : department.name, value:department.id}));

        
    })
}


///BONUS
//Update employee managers
//View employess by manager
//Delete departments, roles and employees
//View combined saleries of all employess in that department 


connection.connect((err) => {
    if(err) throw err;
    console.log(`connected as id ${connection.threadId}/n`);
    start();
});