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
            message: "Would you like to add a team member?",
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



///Add an employee


connection.connect((err) => {
    if(err) throw err;
    console.log(`connected as id ${connection.threadId}/n`);
    start();
});