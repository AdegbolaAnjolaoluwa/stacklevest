const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

// Default data structure if file doesn't exist
const DEFAULT_DATA = {
  users: [],
  channels: [],
  messages: []
};

// Ensure DB file exists
function initDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DATA, null, 2));
    console.log('Database initialized.');
  }
}

// Read data
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database:', err);
    return DEFAULT_DATA;
  }
}

// Write data
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

module.exports = {
  initDB,
  readDB,
  writeDB
};
