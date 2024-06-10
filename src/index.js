const questionController = require('./controllers/question.controller');

questionController.askQuestions();

// const readline = require('node:readline');
// const moment = require('moment');
// const chalk = require('chalk');
// const NodeCache = require('node-cache');
// const cache = new NodeCache();
// const https = require('https');
// const fs = require('fs');
// const path = require('path');

// const configPath = './config.json';
// const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });

// const DATE_QUESTION = "date";
// const AMOUNT_QUESTION = "amount";
// const BASE_CURRENCY_QUESTION = "baseCurrency";
// const TARGET_CURRENCY_QUESTION = "targetCurrency";

// const questions = {
//     [DATE_QUESTION]: { question: "Enter a Date", validateFunc: isValidDate, result: null },
//     [AMOUNT_QUESTION]: { question: "Enter amount", validateFunc: isAmountValid, result: null },
//     [BASE_CURRENCY_QUESTION]: { question: "Enter base currency", validateFunc: isBaseCurrencyValid, result: null },
//     [TARGET_CURRENCY_QUESTION]: { question: "Enter target currency", validateFunc: isTargetCurrencyValid, result: null }
// };

// const askQuestion = (theQuestion) => {
//     return new Promise((resolve, reject) => {
//         try {
//             rl.question(theQuestion + ": ", theAnswer => resolve(theAnswer));
//         } catch {
//             reject("No Answer");
//         }
//     })
// }
// async function start() {
//     const questionKeys = Object.keys(questions);
//     for (let i = 0; i < questionKeys.length; i++) {
//         const key = questionKeys[i];
//         let answer = await askQuestion(questions[key].question);
//         let endingDetected = await isEnding(answer);
//         if (endingDetected) {
//             rl.close()
//             return;
//         }

//         let isValid = await questions[key].validateFunc(answer);
//         while (endingDetected || !(isValid)) {
//             answer = await askQuestion(questions[key].question);

//             endingDetected = await isEnding(answer)
//             if (endingDetected) {
//                 console.log("end everything")
//                 rl.close()
//                 return;
//             }

//             isValid = await questions[key].validateFunc(answer);
//         }

//         questions[key].result = isValid;

//         // reset the flow and save the file
//         if (i === questionKeys.length - 1) {
//             if (questionKeys.map(x => questions[x].result).filter(x => x != null).length != questionKeys.length) {
//                 console.log("something went wrong")
//             }
//             else {
//                 const targetRes = questions[BASE_CURRENCY_QUESTION].result["results"][questions[TARGET_CURRENCY_QUESTION].result];

//                 const amount = parseFloat(questions[AMOUNT_QUESTION].result);
//                 const convertedAmount = parseFloat((questions[AMOUNT_QUESTION].result * targetRes).toFixed(2));
//                 const baseCurrency = questions[BASE_CURRENCY_QUESTION].result["base"];
//                 const targetCurrency = questions[TARGET_CURRENCY_QUESTION].result;
//                 const data = {
//                     date: questions[DATE_QUESTION].result,
//                     amount: amount,
//                     base_currency: baseCurrency,
//                     target_currency: targetCurrency,
//                     converted_amount: convertedAmount,
//                 };
//                 const jsonData = JSON.stringify(data);
//                 const nestedDir = path.join(__dirname, 'conversions');

//                 const filePath = path.join(nestedDir, `conversion-${Date.now()}.json`);

//                 fs.writeFile(filePath, jsonData, 'utf8', (err) => { });
//                 console.log(`${amount} ${baseCurrency} is ${convertedAmount} ${targetCurrency}`)
//                 i = -1;
//             }
//         }
//     }
//     rl.close();
// }

// start();

// function getCachedData(key) {
//     // Check if the data is in the in-memory cache
//     const inMemoryData = cache.get(key);
//     if (cache.has(key)) {
//         console.log('Cache hit (in-memory):', key);
//         return inMemoryData;
//     }
//     console.log('No Cache hit');

//     // If not in in-memory cache, fetch data from external source

//     // const fetchedData = fetchDataFromExternalSource(key);

//     // // If data is fetched, cache it in-memory for future use
//     // cache.set(key, fetchedData, /* optional expiration in seconds */);

//     // console.log('Cache miss (in-memory):', key);
//     // return fetchedData;
// }

// function cacheData(key, data) {
//     cache.set(key, data);
// }

// async function isBaseCurrencyValid(currencyCode) {
//     let result = getCachedData(`currencyHistory-${currencyCode}-${questions[DATE_QUESTION].result}`);
//     if (!result) {
//         result = await makeHttpGetRequest(currencyCode);
//     }

//     if (result) {
//         return result;
//     }
//     else {
//         console.log('Please enter a valid currency code');
//         return false;
//     }

//     async function makeHttpGetRequest(currencyCode) {
//         return new Promise((resolve, reject) => {
//             https.get(`https://api.fastforex.io/historical?date=${questions[DATE_QUESTION].result}&from=${currencyCode}&api_key=${config.EXCHANGE_RATE_API_KEY}`, res => {
//                 let data = [];
//                 res.on('data', (chunk) => {
//                     data.push(chunk);
//                 });

//                 res.on('end', () => {
//                     let result = JSON.parse(Buffer.concat(data).toString());
//                     if (result["error"]) {
//                         resolve(false);
//                     }
//                     else if (result["base"]) {
//                         cacheData(`currencyHistory-${currencyCode.toLowerCase()}-${questions[DATE_QUESTION].result}`, result);
//                         resolve(result);
//                     }
//                 });
//                 // res.on('error', (error) => {
//                 //     let result = JSON.parse(Buffer.concat(error).toString());

//                 //     console.log('Please enter a valid currency code');
//                 //     resolve(false);
//                 // });bgn
//             });
//         });
//     }
// }

// async function isTargetCurrencyValid(currencyCode) {
//     let result = getCachedData(`currencyHistory-${questions[BASE_CURRENCY_QUESTION].result["base"].toLowerCase()}-${questions[DATE_QUESTION].result}`);
//     if (result["results"][currencyCode.toUpperCase()]) {
//         return currencyCode.toUpperCase();
//     }
//     else {
//         console.log('Please enter a valid currency code');
//         return false;
//     }
// }

// async function isEnding(isEnding) {
//     if (isEnding === "end") {
//         return true;
//     }

//     return false;
// }
// async function isValidDate(date) {
//     const dateFormat = 'YYYY-MM-DD';

//     if (moment(date, dateFormat, true).isValid()) {
//         return date;
//     } else {
//         console.log(chalk.red(`Invalid date. Please enter a valid date in format: ${chalk.blue(dateFormat)}`));
//     }
// }

// async function isAmountValid(amount) {
//     const splittedAmount = amount.toString().split(".");
//     if (!splittedAmount[1] || splittedAmount[1].length != 2) {
//         console.log('Please enter a valid amount');
//         return false;
//     }

//     return amount;
// }
