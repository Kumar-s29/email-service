// This file implements a simple logging utility using chalk for colored console output.
// It provides functions to log messages at different levels: info, warn, error, and debug

const chalk = require("chalk");

function logInfo(message) {
  console.log(chalk.blue("[INFO]"), message);
}

function logWarn(message) {
  console.warn(chalk.yellow("[WARN]"), message);
}

function logError(message) {
  console.error(chalk.red("[ERROR]"), message);
}

function logDebug(message) {
  console.log(chalk.gray("[DEBUG]"), message);
}

module.exports = {
  logInfo,
  logWarn,
  logError,
  logDebug,
};
