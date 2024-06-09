const fs = require('fs');
const path = require('path');

const exportToJson = (data) => {
    const jsonData = JSON.stringify(data, null, 2);
    const nestedDir = path.join(__dirname, '../conversions');
    const filePath = path.join(nestedDir, `conversion-${Date.now()}.json`);

    fs.writeFile(filePath, jsonData, 'utf8', (err) => { });
}

module.exports = { exportToJson };
