module.exports = {
  model: "o4-mini", // Can easily change to "o4-medium" or other models
  maxConversationHistory: 5, // Number of past messages to include
  port: process.env.PORT || 3001
};