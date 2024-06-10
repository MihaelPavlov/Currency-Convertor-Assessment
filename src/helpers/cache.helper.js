const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

const getCachedData = (key) => {
    const inMemoryData = cache.get(key);
    if (cache.has(key)) {
        return inMemoryData;
    }
    return null;
}

const setCacheData = async (key, data) => {
    cache.set(key, data);
}

module.exports = { getCachedData, setCacheData };
