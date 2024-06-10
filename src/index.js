const questionController = require('./controllers/question.controller');

const initialArgumentDate = process.argv.slice(2)[0];

questionController.validateAppArgs(initialArgumentDate);

questionController.askQuestions();
