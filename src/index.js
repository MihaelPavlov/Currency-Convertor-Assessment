const readline = require('node:readline');
const moment = require('moment');
const chalk = require('chalk');
const NodeCache = require('node-cache');
const cache = new NodeCache();
const https = require('https');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// const rl2 = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });


// var recursiveAsyncReadLine = function () {
//     // setColor();
//     rl.question('Enter a Date:', async function (date) {
//         if (date == 'end')
//             return rl.close();
//         let amount = 0;
//          amount = await recursiveReadLineAmount();
//          console.log("Confirmed amount -> ", amount)
//         // console.log('Got it! Your answer was: "', isValidDate(answer), '"');


//         recursiveAsyncReadLine();
//     });
// };

// recursiveAsyncReadLine();


// var recursiveReadLineAmount = function(){
//     rl.question('Enter a Amount:', function (amount) {

//         if (isAmountValid(amount)) {
//            return amount;
//         }
//         else { 
//             recursiveReadLineAmount();
//         }
//         // console.log('Got it! Your answer was: "', isValidDate(answer), '"');

//     });
// }

const DATE_QUESTION = "date";
const AMOUNT_QUESTION = "amount";
const BASE_CURRENCY_QUESTION = "baseCurrency";
const TARGET_CURRENCY_QUESTION = "targetCurrency";

// var questions = [
//     { question: "Enter a Date", type: "date", validateFunc: isValidDate, result: null },
//     { question: "Enter amount", type: "amount", validateFunc: isAmountValid, result: null },
//     { question: "Enter base currency", type: "baseCurrency", validateFunc: isBaseCurrencyValid, result: null },
//     { question: "Enter target currency", type: "targetCurrency", validateFunc: isTargetCurrencyValid, result: null },
// ];

const questions = {
    [DATE_QUESTION]: { question: "Enter a Date", validateFunc: isValidDate, result: null },
    [AMOUNT_QUESTION]: { question: "Enter amount", validateFunc: isAmountValid, result: null },
    [BASE_CURRENCY_QUESTION]: { question: "Enter base currency", validateFunc: isBaseCurrencyValid, result: null },
    [TARGET_CURRENCY_QUESTION]: { question: "Enter target currency", validateFunc: isTargetCurrencyValid, result: null }
};

const askQuestion = (theQuestion) => {
    return new Promise((resolve, reject) => {
        try {
            rl.question(theQuestion + ": ", theAnswer => resolve(theAnswer));
        } catch {
            reject("No Answer");
        }
    })
}
async function start() {
    const questionKeys = Object.keys(questions);
    for (let i = 0; i < questionKeys.length; i++) {
        const key = questionKeys[i];
        let answer = await askQuestion(questions[key].question);
        let endingDetected = await isEnding(answer);
        if (endingDetected) {
            rl.close()
            return;
        }

        let isValid = await questions[key].validateFunc(answer);
        while (endingDetected || !(isValid)) {
            answer = await askQuestion(questions[key].question);

            endingDetected = await isEnding(answer)
            if (endingDetected) {
                console.log("end everything")
                rl.close()
                return;
            }

            isValid = await questions[key].validateFunc(answer);
        }

        questions[key].result = isValid;

        // reset the flow
        if (i === questionKeys.length - 1) {
            if (questionKeys.map(x => questions[x].result).filter(x => x != null).length != questionKeys.length) {
                console.log("something went wrong")
            }
            else {
                // console.log(questions[BASE_CURRENCY_QUESTION].result["results"])

                // console.log(questions[TARGET_CURRENCY_QUESTION].result["results"][questions[BASE_CURRENCY_QUESTION].result["base"]])
                const targetRes = questions[TARGET_CURRENCY_QUESTION].result["results"][questions[BASE_CURRENCY_QUESTION].result];
                console.log("result -> ", questions[AMOUNT_QUESTION].result / targetRes);


                const data = {
                    date: questions[DATE_QUESTION].result,
                    amount: parseFloat(questions[AMOUNT_QUESTION].result),
                    base_currency: questions[BASE_CURRENCY_QUESTION].result,
                    target_currency: questions[TARGET_CURRENCY_QUESTION].result["base"],
                    converted_amount: parseFloat((questions[AMOUNT_QUESTION].result / targetRes).toFixed(2)),
                };
                const jsonData = JSON.stringify(data, null, 2);
                const nestedDir = path.join(__dirname, 'conversions');

                const filePath = path.join(nestedDir, `conversion-${Date.now()}.json`);

                // Write the JSON data to the file
                fs.writeFile(filePath, jsonData, 'utf8', (err) => {});

                // console.log(questionKeys.map(x => questions[x].result))
                i = -1;
            }
        }
    }
    // for (let i = 0; i < questions.length; i++) {
    //     let answer = await askQuestion(questions[i].question);
    //     const endingDetected = await isEnding(answer);

    //     while (endingDetected || !(await questions[i].validateFunc(answer))) {
    //         if (endingDetected) {
    //             console.log("end everything")
    //             rl.close()
    //             return;
    //         }
    //         answer = await askQuestion(questions[i].question);

    //     }
    //     questions[i].result = answer;


    //     // reset the flow
    //     if (i === questions.length - 1) {
    //         console.log(questions.map(x => x.result))
    //         i = -1;
    //     }
    // }

    // const total = answers.reduce((a, b) => { return Number(a) + Number(b) });
    // console.log(`The sum of array ${answers} is ${total}`);
    rl.close();
}

start();

function getCachedData(key) {
    // Check if the data is in the in-memory cache
    const inMemoryData = cache.get(key);
    if (cache.has(key)) {
        console.log('Cache hit (in-memory):', key);
        return inMemoryData;
    }
    console.log('No Cache hit');

    // If not in in-memory cache, fetch data from external source

    // const fetchedData = fetchDataFromExternalSource(key);

    // // If data is fetched, cache it in-memory for future use
    // cache.set(key, fetchedData, /* optional expiration in seconds */);

    // console.log('Cache miss (in-memory):', key);
    // return fetchedData;
}

function cacheData(key, data) {
    cache.set(key, data);
}

async function isBaseCurrencyValid(currencyCode) {
    let result = getCachedData('currencies');
    if (!result) {
        result = await makeHttpGetRequest();
    }

    if (result["currencies"][currencyCode.toUpperCase()]) {
        return currencyCode.toUpperCase();
    }
    else {
        console.log('Please enter a valid currency code');
        return false;
    }

    async function makeHttpGetRequest() {
        return new Promise((resolve, reject) => {
            https.get(`https://api.fastforex.io/currencies?api_key=46c152ae42-f59a1ab152-semeig`, res => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    let result = JSON.parse(Buffer.concat(data).toString());
                    cacheData("currencies", result);
                    resolve(result);
                });
            });
        });
    }
}

async function isTargetCurrencyValid(currencyCode) {

    return await makeHttpGetRequest(currencyCode.toLowerCase());

    async function makeHttpGetRequest(currencyCode) {
        return new Promise((resolve, reject) => {
            https.get(`https://api.fastforex.io/historical?date=${questions[DATE_QUESTION].result}&from=${currencyCode}&api_key=46c152ae42-f59a1ab152-semeig`, res => {
                let data = [];
                res.on('data', (chunk) => {
                    data.push(chunk);
                });

                res.on('end', () => {
                    let result = JSON.parse(Buffer.concat(data).toString());
                    if (result["error"]) {
                        console.log(result["error"]);
                        resolve(false);
                    }
                    else if (result["base"]) {
                        resolve(result);
                    }
                });
                // res.on('error', (error) => {
                //     let result = JSON.parse(Buffer.concat(error).toString());

                //     console.log('Please enter a valid currency code');
                //     resolve(false);
                // });
            });
        });
    }
}

async function isEnding(isEnding) {
    if (isEnding === "end") {
        return true;
    }

    return false;
}
async function isValidDate(date) {
    const dateFormat = 'YYYY-MM-DD';

    if (moment(date, dateFormat, true).isValid()) {
        return date;
    } else {
        console.log(chalk.red(`Invalid date. Please enter a valid date in format: ${chalk.blue(dateFormat)}`));
    }
}

async function isAmountValid(amount) {
    const splittedAmount = amount.toString().split(".");
    if (!splittedAmount[1] || splittedAmount[1].length  != 2) {
        console.log('Please enter a valid amount');
        return false;
    }

    return amount;
}



// not used 
const localeToCurrency = {
    'de-DE': 'EUR', // Germany
    'en-GB': 'GBP', // UK
    'en-US': 'USD', // US
};
const formatCurrencyForLocale = (amount, locale = 'en-US') =>
    amount.toLocaleString(locale, {
        style: 'currency',
        currency: localeToCurrency[locale] ?? 'USD'
    });

function setColor(color) {
    process.stdout.write(`\x1b[33m`); // \x1b is the escape character, 33m is the color code for yellow
}
