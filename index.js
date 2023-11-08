const { prompt } = require("inquirer");
const inquirer = require('inquirer');
const db = require("./db/connection");
require("console.table");
const fs = require('fs')

// allow async await:
const utils = require("util");
db.query = utils.promisify(db.query);


function startApp() {
    inquirer.prompt([{
        type: 'list',
        name: 'listChoice',
        message: 'What would you like to do',
        choices: [
            'View all Employees',
            'View all Departments',
            'Add Employee',
            'Update Employee Role',
            'View all Roles',
            'Add Role',
            'Add a Department',
            'Quit']
    }]).then((answers) => {
        switch (answers.listChoice) {
            case 'Add Role':
                addRole();
                break;


            case 'Add a Department':
                addDepartment()
                break;
        }

    })

}

async function addRole() {
    const departments = await db.query(
        "select id as value, name as name from department"
    );
    const { role_title, role_salary, dept_id } = await prompt([
        {
            type: "input",
            name: "role_title",
            message: "Enter the title of the new role.",
        },
        {
            type: "input",
            name: "role_salary",
            message: "Enter the salary of the new role.",
        },
        {
            type: "list",
            name: "dept_id",
            message: "Which department does this role belong to?",
            choices: departments,
        },
    ]);
    await db.query(
        "insert into role (title, salary, department_id) values (?,?,?) ",
        [role_title, role_salary, dept_id]
    );
    console.log("The new role was successfully added.");
    startApp();
}

async function addDepartment() {
    const name = await prompt([{
        type: "input",
        name: "name",
        message: "What is the name of the department you are adding?"
    }])
    await db.query(
        "INSERT INTO department (name) VALUES (?) ", [name]
    );
    console.log('The new department was successfully added');
    startApp();
}

async function addEmployee() {
    let managers = await db.query(
        "SELECT id as value, CONCAT(first_name, ' ', last_name) as name from employee"
    )
    const roleList = db.query(
        "SELECT id as value, title as role_name from role,  "
    )
    managers = [{ value: null, name: "No manager" }, ...managers];
    let answers = await db.prompt([
        {
            type: "input",
            name: "firstName",
            message: "What is the first name of the new employee?"
        },
        {
            type: "input",
            name: "lastName",
            message: "please enter the last name of the new employee?"
        },
        {
            type: "list",
            name: "role",
            message: "what is the role of the employee?",
            choices: roleList
        },
        {
            type: "list",
            name: "manager",
            message: "Who is the manager of the employee",
            choices: managers
        }
    ])
    await db.query(
        "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [answers.firstName, answers.lastName, answers.role, answers.manager]
    )
    console.log("Employee successfully added")
    startApp();

}

startApp();