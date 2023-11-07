const inquirer = require('inquirer');
const fs = require('fs');



function promptQuestions() {
    inquirer.prompt([{
        type: 'list',
        name: 'listChoice',
        message: 'What would you like to do',
        choices: ['View all Employees','Add Employee', 'Update Employee Role', 'View all Roles', 'Add Role','Add a Department']
    }]).then(answer)
}