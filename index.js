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
            'Update Manager',
            'Employees by Manager',
            'Employees by Department',
            'Delete Department',
            'Delete Role',
            'Delete Employee',
            'Quit']

    }]).then((answers) => {
        switch (answers.listChoice) {
            case 'Add Role':
                addRole();
                break;

            case 'Add a Department':
                addDepartment()
                break;

            case 'Add Employee':
                addEmployee()
                break;

            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "View all Departments":
                viewAllDepartments()
                break;

            case "View all Roles":
                viewAllRoles()
                break;

            case "View all Employees":
                viewAllEmployees()
                break;

            case "Update Manager":
                updateManager()
                break;

            case "Employees by Manager":
                employeeByManager()
                break;
            case "Employees by Department":
                employeeByDepartment()
                break;
            case "Delete Department":
                deleteDepartment()
                break;
            case "Delete Role":
                deleteRole()
                break;
            case "Delete Employee":
                deleteEmployee()
                break;

            case "Quit":
                db.close();
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

}

async function addDepartment() {
    const department_name = await prompt([{
        type: "input",
        name: "department_name",
        message: "What is the name of the department you are adding?"
    }])
    await db.query(
        "INSERT INTO department (department_name) VALUES (?) ", [department_name.department_name]
    );
    console.log('The new department was successfully added');
    startApp();
}

async function addEmployee() {
    let managers = await db.query(
        "select id as value, concat(first_name,' ',last_name) as name from employee where manager_id is null"
    )
    let roleList = await db.query(
        "SELECT id as value, title as name from role  "
    )
    managers = [{ value: null, name: "No manager" }, ...managers];
    let answers = await prompt([
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
async function updateEmployeeRole() {
    const roleList = await db.query(
        "SELECT id as value, title as name from role"
    );

    const employees = await db.query(
        "SELECT id as value, CONCAT(first_name, ' ', last_name) as name from employee"
    );

    const answers = await prompt([
        {
            type: "list",
            name: "employeeId",
            message: "Pick the employee whose role you want to change: ",
            choices: employees
        },
        {
            type: "list",
            name: "roleId",
            message: "What is the new role of the employee?",
            choices: roleList
        }
    ]);

    await db.query(
        "UPDATE employee SET role_id = ? WHERE id = ?", [answers.roleId, answers.employeeId]
    );

    console.log("Employee role has been successfully updated");
    startApp();
}
async function viewAllDepartments() {
    const viewDepartments = await db.query(
        "SELECT * FROM department"

    )
    console.table(viewDepartments)
    startApp()
}
async function viewAllRoles() {
    const viewRoles = await db.query(
        "SELECT role.id, role.title, role.salary, department.department_name from role left join department on department.id = role.department_id"

    )
    console.table(viewRoles)
    startApp()
}
async function viewAllEmployees() {
    const sql = await db.query(`SELECT employee.id, employee.first_name AS "first name", employee.last_name 
                    AS "last name", role.title, department.department_name AS department, role.salary, 
                    concat(manager.first_name, " ", manager.last_name) AS manager
                    FROM employee
                    LEFT JOIN role
                    ON employee.role_id = role.id
                    LEFT JOIN department
                    ON role.department_id = department.id
                    LEFT JOIN employee manager
                    ON manager.id = employee.manager_id` )
    console.table(sql)
    startApp()
}

async function updateManager() {
    const employees = await db.query(
        "select id as value, concat(first_name,' ',last_name) as name from employee where manager_id is not null"
    )
    const managers = await db.query("select id as value, concat(first_name,' ',last_name) as name from employee where manager_id is null")
    const employee = await prompt([
        {
            type: "list",
            name: "employeeName",
            message: "Choose the employee whose manager you want to change:",
            choices: employees
        }, {
            type: "list",
            name: "managerName",
            message: "Choose the new manager for the employee:",
            choices: managers
        }
    ])
    await db.query(
        "UPDATE employee set manager_id = ? where id = ?", [employee.managerName, employee.employeeName]
    )
    console.log("updated manager");
    startApp();
}

async function employeeByManager() {
    const results = await db.query(
        `SELECT
            m.id AS manager_id,
            CONCAT(m.first_name, ' ', m.last_name) AS manager_name,
            e.id AS employee_id,
            CONCAT(e.first_name, ' ', e.last_name) AS employee_name
        FROM
            employee AS m
        LEFT JOIN
            employee AS e
        ON
            m.id = e.manager_id
        WHERE
            e.manager_id IS NOT NULL
        ORDER BY
            manager_id, employee_id;`
    )
    console.table(results);
    startApp();
}

async function employeeByDepartment() {
    const results = await db.query(
        `SELECT
            d.id AS department_id,
            d.department_name,
            e.id AS employee_id,
            CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
            r.title as employee_role
        FROM
            department AS d
        LEFT JOIN
            role AS r
        ON
            d.id = r.department_id
        LEFT JOIN
            employee AS e
        ON
            r.id = e.role_id
        ORDER BY
            department_id, employee_id`
    )
    console.table(results);
    startApp();
}

async function deleteDepartment() {
    const data = await db.query(
        "SELECT id as value, department_name as name from department"
    );
    const results = await prompt([
        {
            type:"list",
            name:"departmentName",
            message:"Which department do you want to remove?",
            choices: data
        }
    ])
    await db.query(
        "DELETE FROM department where id = ?", [results.departmentName]
    )
    console.log('department deleted');
    startApp();
}

async function deleteRole() {
    const data = await db.query(
        "SELECT id as value, title as name from role"
    );
    const results = await prompt([
        {
            type:"list",
            name:"roleName",
            message:"Which role do you want to remove?",
            choices: data
        }
    ])
    await db.query(
        "DELETE FROM role where id = ?", [results.roleName]
    )
    console.log('role deleted');
    startApp();
}

//delete employee function
async function deleteEmployee() {
    const data = await db.query(
        "SELECT id as value, CONCAT(employee.first_name, ' ', employee.last_name) AS name from employee"
    );
    const results = await prompt([
        {
            type:"list",
            name:"employeeName",
            message:"Which Employee do you want to remove?",
            choices: data
        }
    ])
    await db.query(
        "DELETE FROM Employee where id = ?", [results.employeeName]
    )
    console.log('Employee deleted');
    startApp();
}

startApp();