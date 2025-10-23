/**
 * AGT Error Handling System
 * Centralized error definitions, formatting, and handling
 */

const logger = require("../logger");
const path = require("path");

/**
 * Custom Error class for AGT
 */
class AGTError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = "AGTError";
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error code constants
 */
const ERROR_CODES = {
  // Git errors
  GIT_NOT_FOUND: "GIT_NOT_FOUND",
  GIT_NOT_REPOSITORY: "GIT_NOT_REPOSITORY",
  GIT_COMMAND_FAILED: "GIT_COMMAND_FAILED",

  // GitHub CLI errors
  GH_NOT_INSTALLED: "GH_NOT_INSTALLED",
  GH_AUTH_FAILED: "GH_AUTH_FAILED",
  GH_COMMAND_FAILED: "GH_COMMAND_FAILED",
  GH_RATE_LIMIT: "GH_RATE_LIMIT",

  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  NETWORK_TIMEOUT: "NETWORK_TIMEOUT",
  CONNECTION_REFUSED: "CONNECTION_REFUSED",

  // Input validation errors
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_ISSUE_NUMBER: "INVALID_ISSUE_NUMBER",
  INVALID_BRANCH_NAME: "INVALID_BRANCH_NAME",
  INVALID_COLOR: "INVALID_COLOR",
  EMPTY_FIELD: "EMPTY_FIELD",

  // Resource errors
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  BRANCH_NOT_FOUND: "BRANCH_NOT_FOUND",
  ISSUE_NOT_FOUND: "ISSUE_NOT_FOUND",

  // Operation errors
  OPERATION_FAILED: "OPERATION_FAILED",
  OPERATION_CANCELLED: "OPERATION_CANCELLED",

  // Unknown
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

/**
 * Error message templates with solutions
 */
const ERROR_MESSAGES = {
  [ERROR_CODES.GIT_NOT_FOUND]: {
    title: "Git Not Found",
    message: "Git is not installed or not available in your PATH.",
    solution: "Install Git from: https://git-scm.com/downloads",
    docs: "https://git-scm.com/book/en/v2/Getting-Started-Installing-Git",
  },
  [ERROR_CODES.GIT_NOT_REPOSITORY]: {
    title: "Not a Git Repository",
    message: "This directory is not a Git repository.",
    solution:
      "Initialize a repository with: git init\nOr clone an existing one with: git clone <url>",
    docs: "https://git-scm.com/docs/git-init",
  },
  [ERROR_CODES.GIT_COMMAND_FAILED]: {
    title: "Git Command Failed",
    message: "A Git command failed to execute.",
    solution: "Check the command output above for details.",
    docs: "https://git-scm.com/docs",
  },
  [ERROR_CODES.GH_NOT_INSTALLED]: {
    title: "GitHub CLI Not Found",
    message: "GitHub CLI (gh) is not installed or not available in your PATH.",
    solution:
      "Install GitHub CLI from: https://cli.github.com\nOr run: brew install gh (macOS)\n       apt install gh (Ubuntu)",
    docs: "https://cli.github.com/manual/installation",
  },
  [ERROR_CODES.GH_AUTH_FAILED]: {
    title: "GitHub Authentication Failed",
    message: "You are not authenticated with GitHub CLI.",
    solution:
      "Authenticate with: gh auth login\nFollow the prompts to complete authentication.",
    docs: "https://cli.github.com/manual/gh_auth_login",
  },
  [ERROR_CODES.GH_COMMAND_FAILED]: {
    title: "GitHub Command Failed",
    message: "A GitHub CLI command failed to execute.",
    solution: "Check the command output above for details.",
    docs: "https://cli.github.com/manual/",
  },
  [ERROR_CODES.GH_RATE_LIMIT]: {
    title: "GitHub API Rate Limit Exceeded",
    message: "You have exceeded the GitHub API rate limit.",
    solution:
      "Wait for the rate limit to reset or authenticate for higher limits.",
    docs: "https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting",
  },
  [ERROR_CODES.NETWORK_ERROR]: {
    title: "Network Error",
    message: "A network error occurred while connecting to GitHub.",
    solution:
      "Check your internet connection.\nVerify that GitHub is accessible: https://www.githubstatus.com/",
    docs: null,
  },
  [ERROR_CODES.NETWORK_TIMEOUT]: {
    title: "Network Timeout",
    message: "The request timed out while waiting for a response.",
    solution: "Check your internet connection and try again.",
    docs: null,
  },
  [ERROR_CODES.CONNECTION_REFUSED]: {
    title: "Connection Refused",
    message: "The connection was refused by the remote server.",
    solution: "Check your internet connection and firewall settings.",
    docs: null,
  },
  [ERROR_CODES.INVALID_INPUT]: {
    title: "Invalid Input",
    message: "The provided input is invalid.",
    solution: "Please check the input format and try again.",
    docs: null,
  },
  [ERROR_CODES.INVALID_ISSUE_NUMBER]: {
    title: "Invalid Issue Number",
    message: "The issue number must be a positive integer.",
    solution: "Enter a valid issue number (e.g., 1, 42, 123).",
    docs: null,
  },
  [ERROR_CODES.INVALID_BRANCH_NAME]: {
    title: "Invalid Branch Name",
    message: "The branch name contains invalid characters.",
    solution:
      "Use only letters, numbers, hyphens, and underscores.\nAvoid spaces and special characters.",
    docs: "https://git-scm.com/docs/git-check-ref-format",
  },
  [ERROR_CODES.INVALID_COLOR]: {
    title: "Invalid Color Code",
    message: "The color code must be a 6-digit hexadecimal value.",
    solution: "Use format: RRGGBB or #RRGGBB (e.g., FF5733 or #FF5733).",
    docs: null,
  },
  [ERROR_CODES.EMPTY_FIELD]: {
    title: "Required Field Empty",
    message: "A required field cannot be empty.",
    solution: "Please provide a value for the required field.",
    docs: null,
  },
  [ERROR_CODES.RESOURCE_NOT_FOUND]: {
    title: "Resource Not Found",
    message: "The requested resource could not be found.",
    solution: "Verify that the resource exists and try again.",
    docs: null,
  },
  [ERROR_CODES.BRANCH_NOT_FOUND]: {
    title: "Branch Not Found",
    message: "The specified branch does not exist.",
    solution: "Check available branches with: git branch -a",
    docs: null,
  },
  [ERROR_CODES.ISSUE_NOT_FOUND]: {
    title: "Issue Not Found",
    message: "The specified issue does not exist.",
    solution: "Check available issues with: agt list",
    docs: null,
  },
  [ERROR_CODES.OPERATION_FAILED]: {
    title: "Operation Failed",
    message: "The operation failed to complete.",
    solution: "Check the error details above and try again.",
    docs: null,
  },
  [ERROR_CODES.OPERATION_CANCELLED]: {
    title: "Operation Cancelled",
    message: "The operation was cancelled by the user.",
    solution: null,
    docs: null,
  },
  [ERROR_CODES.UNKNOWN_ERROR]: {
    title: "Unknown Error",
    message: "An unexpected error occurred.",
    solution:
      "Please report this issue at: https://github.com/ljlm0402/auto-github-tool/issues",
    docs: null,
  },
};

/**
 * Detect error code from error message
 */
function detectErrorCode(error) {
  const message = error.message || String(error);
  const lowerMessage = message.toLowerCase();

  // Git errors
  if (
    lowerMessage.includes("not a git repository") ||
    lowerMessage.includes("not in a git directory")
  ) {
    return ERROR_CODES.GIT_NOT_REPOSITORY;
  }
  if (lowerMessage.includes("git") && lowerMessage.includes("not found")) {
    return ERROR_CODES.GIT_NOT_FOUND;
  }

  // GitHub CLI errors
  if (lowerMessage.includes("gh") && lowerMessage.includes("not found")) {
    return ERROR_CODES.GH_NOT_INSTALLED;
  }
  if (
    lowerMessage.includes("authentication") ||
    lowerMessage.includes("not logged in") ||
    lowerMessage.includes("auth login")
  ) {
    return ERROR_CODES.GH_AUTH_FAILED;
  }
  if (lowerMessage.includes("rate limit")) {
    return ERROR_CODES.GH_RATE_LIMIT;
  }

  // Network errors
  if (
    lowerMessage.includes("network") ||
    lowerMessage.includes("enotfound") ||
    lowerMessage.includes("dns")
  ) {
    return ERROR_CODES.NETWORK_ERROR;
  }
  if (lowerMessage.includes("timeout") || lowerMessage.includes("etimedout")) {
    return ERROR_CODES.NETWORK_TIMEOUT;
  }
  if (lowerMessage.includes("econnrefused")) {
    return ERROR_CODES.CONNECTION_REFUSED;
  }

  // Resource errors
  if (lowerMessage.includes("branch") && lowerMessage.includes("not found")) {
    return ERROR_CODES.BRANCH_NOT_FOUND;
  }
  if (lowerMessage.includes("issue") && lowerMessage.includes("not found")) {
    return ERROR_CODES.ISSUE_NOT_FOUND;
  }

  return ERROR_CODES.UNKNOWN_ERROR;
}

/**
 * Format error for display
 */
function formatError(error) {
  // If already an AGTError with code
  let code = error.code;

  // Auto-detect code if not set
  if (!code) {
    code = detectErrorCode(error);
  }

  const errorInfo =
    ERROR_MESSAGES[code] || ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR];
  const context = error.context || {};

  let output = `\n❌ ${errorInfo.title}\n`;
  output += `\n${errorInfo.message}\n`;

  // Add original error message if different
  if (error.message && !error.message.includes("❌")) {
    output += `\n📄 Details: ${error.message}\n`;
  }

  // Add context information
  if (context.cwd) {
    output += `\n📁 Current directory: ${context.cwd}`;
  }
  if (context.command) {
    output += `\n⚡ Command: ${context.command}`;
  }
  if (context.file) {
    output += `\n📝 File: ${context.file}`;
  }

  // Add solution
  if (errorInfo.solution) {
    output += `\n\n💡 Solution:\n   ${errorInfo.solution.replace(
      /\n/g,
      "\n   "
    )}`;
  }

  // Add docs link
  if (errorInfo.docs) {
    output += `\n\n📚 Documentation:\n   ${errorInfo.docs}`;
  }

  // Add help command
  output += `\n\n❓ Need help? Run: agt help\n`;

  return output;
}

/**
 * Handle error and optionally exit
 */
function handleError(error, exitProcess = true) {
  // Ensure error is AGTError
  const agtError =
    error instanceof AGTError
      ? error
      : new AGTError(
          error.message || String(error),
          detectErrorCode(error),
          error.context || {}
        );

  // Log error
  logger.error(agtError.message, {
    code: agtError.code,
    context: agtError.context,
    stack: agtError.stack,
  });

  // Display formatted error
  console.error(formatError(agtError));

  // Cleanup and exit
  if (exitProcess) {
    cleanup();
    process.exitCode = 1;
  }
}

/**
 * Cleanup before exit
 */
function cleanup() {
  try {
    // Clear cache timers
    const cache = require("../cache");
    if (cache && cache.clear) {
      cache.clear();
    }
  } catch (e) {
    // Ignore cleanup errors
  }

  try {
    // Rotate log file if needed
    logger.rotateLog();
  } catch (e) {
    // Ignore cleanup errors
  }
}

/**
 * Wrap error with AGTError
 */
function wrapError(error, code, context = {}) {
  if (error instanceof AGTError) {
    return error;
  }

  return new AGTError(error.message || String(error), code, context);
}

module.exports = {
  AGTError,
  ERROR_CODES,
  ERROR_MESSAGES,
  handleError,
  formatError,
  detectErrorCode,
  wrapError,
  cleanup,
};
