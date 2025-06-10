const fs = require('fs');
const path = require('path');
const { fileStorePath } = require('../../config');

module.exports = {
  saveTradeLog: (data) => {
    let logs = [];
    try {
      if (fs.existsSync(fileStorePath)) {
        logs = JSON.parse(fs.readFileSync(fileStorePath));
      }
    } catch (err) {
      console.error('Error reading logs:', err);
    }
    logs.push(data);
    fs.writeFileSync(fileStorePath, JSON.stringify(logs, null, 2));
  }
};