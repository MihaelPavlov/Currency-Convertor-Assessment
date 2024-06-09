const NodeCache = require('node-cache');
const cache = new NodeCache();

const getCachedData = (key) => {
    const inMemoryData = cache.get(key);
    if (cache.has(key)) {
        console.log('Cache hit (in-memory):', key);
        return inMemoryData;
    }
    console.log('No Cache hit');
    return null;
}

const setCacheData = (key, data) => {
    cache.set(key, data);
}

module.exports = { getCachedData, setCacheData };
