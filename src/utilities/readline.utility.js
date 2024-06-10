const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const askQuestion = (question) => {
    return new Promise((resolve, reject) => {
        try {
            rl.question(question, theAnswer => resolve(theAnswer));
        } catch {
            reject("No Answer");
        }
    });
}

module.exports = { rl, askQuestion };
