const fs = require('fs');
const { fileStorePath } = require('../../config');

module.exports = {
  getAll: (req, res) => {
    try {
      const trades = fs.existsSync(fileStorePath)
        ? JSON.parse(fs.readFileSync(fileStorePath))
        : [];
      res.json(trades);
    } catch (err) {
      res.status(500).json({ error: 'Failed to read trade logs.' });
    }
  }
};