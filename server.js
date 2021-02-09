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
            name: "newPrompt",
            message: "Employee Tracker: What would you like to do?",
            choices: [
                "View all Employees",
                "View All Employees by Department",
                "View All Employees by Role",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Exit application"
            ],
        },
    ])
    .then(function(response){
        //console.log(response.newPrompt)
        switch (response.newPrompt) {
            case "View all Employees":
                viewAllEmployees();
                break;
            case "View All Employees by Department":
                viewAllDepartments();
                break;
            case "View All Employees by Role":
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
        'SELECT e.id, e.first_name, e.last_name, r.title, r.salary FROM employee e JOIN roles r on e.role_id = r.id', (err, res) => {
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
function viewAllRoles () {
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
                    console.table(res);
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
        console.log(res)
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
            console.log(role);
            connection.query("INSERT INTO roles SET ? ", role, (err,res) => {
                if (err) throw err;
                console.log(res);
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