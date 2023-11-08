const inquirer = require('inquirer');
const fs = require('fs');



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
    }]).then(answer)
}

module.exports = startApp()