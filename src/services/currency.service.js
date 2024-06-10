const https = require('https');
const config = require('../config/config.json');
const cacheHelper = require('../helpers/cache.helper');

const getHistoricalExchangeRate = (currencyCode, date) => {
    return new Promise((resolve, reject) => {
        https.get(`https://api.fastforex.io/historical?date=${date}&from=${currencyCode}&api_key=${config.EXCHANGE_RATE_API_KEY}`, res => {
            let data = [];
            res.on('data', (chunk) => {
                data.push(chunk);
            });

            res.on('end', () => {
                let result = JSON.parse(Buffer.concat(data).toString());
                if (result["error"]) {
                    resolve(false);
                } else if (result["base"]) {
                    cacheHelper.setCacheData(`currencyHistory-${currencyCode.toLowerCase()}-${date}`, result);
                    resolve(result);
                }
            });
        });
    });
}

module.exports = { getHistoricalExchangeRate };
