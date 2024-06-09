const readlineUtil = require('../utils/readlineUtil');
const { DATE_QUESTION, AMOUNT_QUESTION, BASE_CURRENCY_QUESTION, TARGET_CURRENCY_QUESTION, questions, isEnding } = require('../helpers/validationHelper');
const { exportToJson } = require('../helpers/json.helper');

const askQuestions = async () => {
    const questionKeys = Object.keys(questions);
    console.log(questions);
    for (let i = 0; i < questionKeys.length; i++) {
        const key = questionKeys[i];
        let answer = await readlineUtil.askQuestion(questions[key].question);
        let endingDetected = await isEnding(answer);
        if (endingDetected) {
            readlineUtil.rl.close()
            return;
        }

        let isValid = await questions[key].validateFunc(answer);
        while (endingDetected || !(isValid)) {
            answer = await readlineUtil.askQuestion(questions[key].question);

            endingDetected = await isEnding(answer)
            if (endingDetected) {
                console.log("end everything")
                readlineUtil.rl.close()
                return;
            }

            isValid = await questions[key].validateFunc(answer);
        }

        questions[key].result = isValid;

        if (i === questionKeys.length - 1) {
            if (questionKeys.map(x => questions[x].result).filter(x => x != null).length != questionKeys.length) {
                console.log("something went wrong")
            } else {
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
                console.log(`${amount} ${baseCurrency} is ${convertedAmount} ${targetCurrency}`)
                i = -1;
            }
        }
    }
    readlineUtil.rl.close();
}

module.exports = { askQuestions };
