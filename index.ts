#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';

console.log(chalk.bgCyanBright(chalk.magenta("\n\t\t Bank Management System \n")));

interface Account {
    withdraw(amount: number): void;
    deposit(amount: number): void;
    checkBalance(): number;
    viewHistory(): void;
    computeInterest(): number;
}

class Client {
    private firstName: string;
    private lastName: string;
    private age: number;
    private gender: string;
    private mobileNumber: string;

    constructor(firstName: string, lastName: string, age: number, gender: string, mobileNumber: string) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.gender = gender;
        this.mobileNumber = mobileNumber;
    }

    static validateMobileNumber(mobileNumber: string): boolean {
        return /^\d{10}$/.test(mobileNumber);
    }

    static validateAge(age: number): boolean {
        return age > 0;
    }
}

interface TransactionLog {
    type: string;
    amount: number;
    timestamp: string;
}

class BankAccount implements Account {
    private balance: number;
    private client: Client;
    private transactions: TransactionLog[];

    constructor(client: Client) {
        this.balance = 0;
        this.client = client;
        this.transactions = [];
    }

    withdraw(amount: number): void {
        if (isNaN(amount) || amount <= 0) {
            console.log(chalk.red("Invalid amount. Please enter a valid positive number."));
            return;
        }

        if (this.balance >= amount) {
            this.balance -= amount;
            this.transactions.push({ type: 'Withdraw', amount, timestamp: new Date().toISOString() });
            console.log(chalk.green(`Withdrawal of ${amount} successful. Remaining balance: ${this.balance}`));
        } else {
            console.log(chalk.red("Insufficient funds. Withdrawal cancelled."));
        }
    }

    deposit(amount: number): void {
        if (isNaN(amount) || amount <= 0) {
            console.log(chalk.red("Invalid amount. Please enter a valid positive number."));
            return;
        }

        if (amount > 100) {
            this.balance += amount - 5; // Deduct 5 if more than 100
        } else {
            this.balance += amount;
        }
        this.transactions.push({ type: 'Deposit', amount, timestamp: new Date().toISOString() });
        console.log(chalk.green(`Deposit of ${amount} successful. Remaining balance: ${this.balance}`));
    }

    checkBalance(): number {
        console.log(chalk.blue(`Current balance: ${this.balance}`));
        return this.balance;
    }

    viewHistory(): void {
        console.log(chalk.yellow("Transaction History:"));
        if (this.transactions.length === 0) {
            console.log(chalk.yellow("No transactions found."));
        } else {
            this.transactions.forEach((transaction, index) => {
                console.log(chalk.blue(`Transaction ${index + 1}:`));
                console.log(`Type: ${transaction.type}`);
                console.log(`Amount: ${transaction.amount}`);
                console.log(`Timestamp: ${transaction.timestamp}`);
                console.log();
            });
        }
    }

    computeInterest(): number {
        console.log(chalk.yellow("Interest Computation:"));

        const interestRate = 0.05; // 5% annual interest rate
        const currentBalance = this.checkBalance();
        const interest = currentBalance * interestRate;

        console.log(chalk.green(`Interest calculated: ${interest}`));
        return interest; // Return the calculated interest
    }
}

async function getClientInfo(): Promise<Client> {
    const answers = await inquirer.prompt([
        {
            name: 'firstName',
            message: 'Your first name:',
            type: 'input',
        },
        {
            name: 'lastName',
            message: 'Your last name:',
            type: 'input',
        },
        {
            name: 'age',
            message: 'Your age:',
            type: 'number',
        },
        {
            name: 'gender',
            message: 'Your gender (Male/Female):',
            type: 'list',
            choices: ['Male', 'Female'],
        },
        {
            name: 'mobileNumber',
            message: 'Your mobile number:',
            type: 'input',
        },
    ]);

    const { firstName, lastName, age, gender, mobileNumber } = answers;

    if (!firstName || !lastName || !age || !gender || !Client.validateMobileNumber(mobileNumber) || !Client.validateAge(age)) {
        console.log(chalk.red('All fields are required. Mobile number must be 10 digits. Please fill in all the details correctly.'));
        return getClientInfo(); // Prompt again for input
    }

    return new Client(firstName, lastName, age, gender, mobileNumber);
}

async function bankApp() {
    const client = await getClientInfo();
    const account = new BankAccount(client);

    while (true) {
        const { action } = await inquirer.prompt([
            {
                name: 'action',
                message: 'Choose an action:',
                type: 'list',
                choices: [
                    { name: 'Withdraw', value: 'withdraw' },
                    { name: 'Deposit', value: 'deposit' },
                    { name: 'Check Balance', value: 'checkBalance' },
                    { name: 'View Transaction History', value: 'viewHistory' },
                    { name: 'Compute Interest', value: 'computeInterest' },
                    { name: 'Exit', value: 'exit' },
                ],
            },
        ]);

        switch (action) {
            case 'withdraw':
                const { withdrawAmount } = await inquirer.prompt({
                    name: 'withdrawAmount',
                    message: 'Enter the amount to withdraw:',
                    type: 'input',
                });
                account.withdraw(parseFloat(withdrawAmount));
                break;
            case 'deposit':
                const { depositAmount } = await inquirer.prompt({
                    name: 'depositAmount',
                    message: 'Enter the amount to deposit:',
                    type: 'input',
                });
                account.deposit(parseFloat(depositAmount));
                break;
            case 'checkBalance':
                account.checkBalance();
                break;
            case 'viewHistory':
                account.viewHistory();
                break;
            case 'computeInterest':
                account.computeInterest();
                break;
            case 'exit':
                console.log(chalk.yellow('Exiting...'));
                process.exit(0);
            default:
                console.log(chalk.red('Invalid choice. Please try again.'));
        }
    }
}

bankApp();
