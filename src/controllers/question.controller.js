const readlineUtil = require('../utilities/readline.utility');
const { DATE_QUESTION, AMOUNT_QUESTION, BASE_CURRENCY_QUESTION, TARGET_CURRENCY_QUESTION, questions, isEnding } = require('../helpers/validation.helper');
const { exportToJson } = require('../helpers/json.helper');
const logger = require('../utilities/logger.utility');

const askQuestions = async () => {
    const questionKeys = Object.keys(questions).filter(questionKey => questionKey !== DATE_QUESTION);

    for (let i = 0; i < questionKeys.length; i++) {
        const key = questionKeys[i];
        const result = await handleAnswer(key);
        if (result === null) return;

        if (i === questionKeys.length - 1) {
            if (questionKeys.map(x => questions[x].result).filter(x => x != null).length != questionKeys.length) {
                logger.warn("something went wrong");
            } else {
                processResults();
                i = -1; // Restart the loop
            }
        }
    }
    readlineUtil.rl.close();
};

const handleAnswer = async (key) => {
    let answer = await readlineUtil.askQuestion(questions[key].question);
    let endingDetected = await isEnding(answer);
    if (endingDetected) {
        readlineUtil.rl.close();
        return null;
    }

    let isValid = await questions[key].validateFunc(answer);
    while (!isValid) {
        answer = await readlineUtil.askQuestion(questions[key].question);
        endingDetected = await isEnding(answer);
        if (endingDetected) {
            readlineUtil.rl.close();
            return null;
        }
        isValid = await questions[key].validateFunc(answer);
    }

    questions[key].result = isValid;
    return isValid;
};

const processResults = () => {
    const targetRes = questions[BASE_CURRENCY_QUESTION].result["results"][questions[TARGET_CURRENCY_QUESTION].result];
    const amount = parseFloat(questions[AMOUNT_QUESTION].result);
    const convertedAmount = parseFloat((questions[AMOUNT_QUESTION].result * targetRes).toFixed(2));
    const baseCurrency = questions[BASE_CURRENCY_QUESTION].result["base"];
    const targetCurrency = questions[TARGET_CURRENCY_QUESTION].result;
    const data = {
        date: questions[DATE_QUESTION].result,
        amount: amount,
        base_currency: baseCurrency,
        target_currency: targetCurrency,
        converted_amount: convertedAmount,
    };
    exportToJson(data);
    logger.info(`${amount} ${baseCurrency} is ${convertedAmount} ${targetCurrency}`);
};

const validateAppArgs = (date) => {
    const isValidDate = questions[DATE_QUESTION].validateFunc(date);
    if (!isValidDate) {
        process.exit();
    }
}

module.exports = { askQuestions, validateAppArgs };
