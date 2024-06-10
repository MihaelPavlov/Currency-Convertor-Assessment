const cacheHelper = require('./cache.helper');
const currencyService = require('../services/currency.service');
const moment = require('moment');
const chalk = require('chalk');
const logger = require('../utilities/logger.utility');

const ERROR_INVALID_AMOUNT = 'Please enter a valid amount';
const ERROR_INVALID_CURRENCY_CODE = 'Please enter a valid currency code';
const ERROR_INVALID_DATE = `Invalid date. Please enter a valid date in format:`;

const isAmountValid = (amount) => {
    const splittedAmount = amount.toString().split(".");
    if (!splittedAmount[1] || splittedAmount[1].length != 2) {
        logger.info(ERROR_INVALID_AMOUNT);
        return false;
    }
    return amount;
}

const isBaseCurrencyValid = async (currencyCode) => {
    let result = cacheHelper.getCachedData(`currencyHistory-${currencyCode}-${questions[DATE_QUESTION].result}`);
    if (!result) {
        result = await currencyService.getHistoricalExchangeRate(currencyCode, questions[DATE_QUESTION].result);
    }
    if (result) {
        return result;
    } else {
        logger.info(ERROR_INVALID_CURRENCY_CODE);
        return false;
    }
}

const isTargetCurrencyValid = async (currencyCode) => {
    let result = cacheHelper.getCachedData(`currencyHistory-${questions[BASE_CURRENCY_QUESTION].result["base"].toLowerCase()}-${questions[DATE_QUESTION].result}`);
    if (result["results"][currencyCode.toUpperCase()]) {
        return currencyCode.toUpperCase();
    } else {
        logger.info(ERROR_INVALID_CURRENCY_CODE);
        return false;
    }
}

const isEnding = async (isEnding) => {
    return isEnding.toLowerCase() === "end";
}

const isValidDate = (date) => {
    const dateFormat = 'YYYY-MM-DD';
    if (moment(date, dateFormat, true).isValid()) {
        return date;
    } else {
        logger.info(chalk.red(`${ERROR_INVALID_DATE} ${chalk.blue(dateFormat)}`));
        return false;
    }
}

const DATE_QUESTION = "date";
const AMOUNT_QUESTION = "amount";
const BASE_CURRENCY_QUESTION = "baseCurrency";
const TARGET_CURRENCY_QUESTION = "targetCurrency";

const questions = {
    [DATE_QUESTION]: { question: "", validateFunc: isValidDate, result: null },
    [AMOUNT_QUESTION]: { question: "", validateFunc: isAmountValid, result: null },
    [BASE_CURRENCY_QUESTION]: { question: "", validateFunc: isBaseCurrencyValid, result: null },
    [TARGET_CURRENCY_QUESTION]: { question: "", validateFunc: isTargetCurrencyValid, result: null }
};

// Question with Labels
// const questions = {
//     [DATE_QUESTION]: { question: "Enter a Date - ", validateFunc: isValidDate, result: null },
//     [AMOUNT_QUESTION]: { question: "Enter amount - ", validateFunc: isAmountValid, result: null },
//     [BASE_CURRENCY_QUESTION]: { question: "Enter base currency - ", validateFunc: isBaseCurrencyValid, result: null },
//     [TARGET_CURRENCY_QUESTION]: { question: "Enter target currency - ", validateFunc: isTargetCurrencyValid, result: null }
// };

module.exports = { DATE_QUESTION, AMOUNT_QUESTION, BASE_CURRENCY_QUESTION, TARGET_CURRENCY_QUESTION, questions, isEnding };
