const { prompt } = require("inquirer");
const db = require("./db/connection");
require("console.table");
const startApp = require('./index');

// allow async await:
const utils = require("util");
db.query = utils.promisify(db.query);

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
    const department_name = await prompt([{
        type: "Input",
        name: "department_name",
        message: "What is the name of the department you are adding?"
    }])
    await db.query(
        "INSERT INTO department (name) VALUES (?)", [department_name]
    )
    console.log('The new department was successfully added');
    startApp();
}

async function addEmployee() {
    let managers = await db.query(
        "SELECT id as value, CONCAT(first_name, ' ', last_name) as name from employee"
    )
    const Employee = db.query(
        "SELECT id as value,  "
    )
}