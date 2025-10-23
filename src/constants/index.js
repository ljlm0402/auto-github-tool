/**
 * Application Constants
 * Centralized configuration values to avoid magic numbers
 */

/**
 * Cache Time-To-Live (TTL) in milliseconds
 */
const CACHE_TTL = {
  LABELS: 5 * 60 * 1000, // 5 minutes - labels don't change frequently
  ISSUES: 1 * 60 * 1000, // 1 minute - issues change frequently
  PULL_REQUESTS: 1 * 60 * 1000, // 1 minute - PRs change frequently
  REPO_STATS: 5 * 60 * 1000, // 5 minutes - stats are relatively stable
  CONTRIBUTORS: 10 * 60 * 1000, // 10 minutes - contributors rarely change
};

/**
 * Retry configuration for network operations
 */
const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3, // Maximum number of retry attempts
  BASE_DELAY_MS: 1000, // Base delay in milliseconds (1 second)
  BACKOFF_MULTIPLIER: 2, // Exponential backoff multiplier (1s, 2s, 4s)
};

/**
 * GitHub API configuration
 */
const GITHUB = {
  MAX_ITEMS_PER_PAGE: 100, // GitHub API maximum items per page
  DEFAULT_PAGE_SIZE: 30, // Default number of items to fetch
  API_VERSION: "2022-11-28", // GitHub API version
};

/**
 * Logging configuration
 */
const LOG = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB - maximum log file size
  MAX_BACKUP_FILES: 3, // Maximum number of backup log files to keep
  DEFAULT_TAIL_LINES: 50, // Default number of log lines to tail
  ROTATION_CHECK_INTERVAL: 60 * 60 * 1000, // 1 hour - how often to check for rotation
};

/**
 * Protected branch names that should never be deleted
 */
const PROTECTED_BRANCHES = [
  "main",
  "master",
  "develop",
  "development",
  "staging",
  "production",
  "release",
];

/**
 * Branch name validation
 */
const BRANCH_NAME = {
  MAX_LENGTH: 255, // Maximum branch name length
  REGEX: /^[a-zA-Z0-9_\/-]+$/, // Valid characters: letters, numbers, _, /, -
  FORBIDDEN_CHARS: ["$", "(", ")", "`", ";", "|", "&", "<", ">"], // Characters that could cause shell injection
};

/**
 * Input validation patterns
 */
const VALIDATION = {
  HEX_COLOR: /^[0-9A-Fa-f]{6}$/, // 6-digit hex color
  ISSUE_NUMBER: /^\d+$/, // Positive integer
  GITHUB_USERNAME: /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, // GitHub username format
};

/**
 * Terminal output configuration
 */
const TERMINAL = {
  MAX_LIST_ITEMS: 10, // Maximum items to show in a list before pagination
  SPINNER_INTERVAL: 80, // Spinner update interval in ms
  PROGRESS_BAR_WIDTH: 20, // Width of progress bars in characters
};

/**
 * Network timeout configuration
 */
const TIMEOUTS = {
  API_REQUEST_MS: 30000, // 30 seconds - API request timeout
  COMMAND_EXECUTION_MS: 60000, // 60 seconds - command execution timeout
  USER_INPUT_MS: 300000, // 5 minutes - user input timeout
};

/**
 * File paths
 */
const PATHS = {
  CONFIG_LOCAL: ".agtrc.json", // Local config file name
  CONFIG_GLOBAL: "~/.agtrc.json", // Global config file path
  LOG_DIR: "~/.agt", // Log directory
  LOG_FILE: "~/.agt/agt.log", // Log file path
};

/**
 * Exit codes
 */
const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_USAGE: 2,
  NOT_A_GIT_REPO: 10,
  GH_NOT_INSTALLED: 11,
  GH_AUTH_FAILED: 12,
  NETWORK_ERROR: 20,
  USER_CANCELLED: 130, // SIGINT (Ctrl+C)
};

module.exports = {
  CACHE_TTL,
  RETRY_CONFIG,
  GITHUB,
  LOG,
  PROTECTED_BRANCHES,
  BRANCH_NAME,
  VALIDATION,
  TERMINAL,
  TIMEOUTS,
  PATHS,
  EXIT_CODES,
};
