// backend/assistantConfig.js
const fs = require('fs');
const path = require('path');

const configFilePath = path.join(__dirname, 'assistant-config.json');

// Function to read the assistant ID from the config file
function getAssistantId() {
  try {
    if (fs.existsSync(configFilePath)) {
      const configData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
      return configData.assistantId || null;
    }
  } catch (error) {
    console.error('Error reading assistant config:', error);
  }
  return null;
}

// Function to save the assistant ID to the config file
function saveAssistantId(assistantId) {
  try {
    const configData = { assistantId, updatedAt: new Date().toISOString() };
    fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2), 'utf8');
    console.log(`Assistant ID saved to config file: ${assistantId}`);
  } catch (error) {
    console.error('Error saving assistant config:', error);
  }
}

module.exports = {
  getAssistantId,
  saveAssistantId
};