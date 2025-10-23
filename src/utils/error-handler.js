const { handleError: coreHandleError } = require("./errors");
const { RETRY_CONFIG } = require("../constants");

/**
 * 복구 가능한 에러 클래스
 */
class RecoverableError extends Error {
  constructor(message, retryable = true) {
    super(message);
    this.name = "RecoverableError";
    this.retryable = retryable;
  }
}

/**
 * 재시도 가능한 작업 실행
 * @param {Function} fn - 실행할 함수
 * @param {number} maxRetries - 최대 재시도 횟수
 * @param {number} baseDelay - 기본 대기 시간 (밀리초)
 * @returns {Promise<any>}
 */
async function withRetry(
  fn,
  maxRetries = RETRY_CONFIG.MAX_ATTEMPTS,
  baseDelay = RETRY_CONFIG.BASE_DELAY_MS
) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 재시도 불가능한 에러는 즉시 throw
      if (error.retryable === false) {
        throw error;
      }

      // 마지막 시도였다면 throw
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // 네트워크 관련 에러만 재시도
      const isNetworkError =
        error.message?.includes("network") ||
        error.message?.includes("timeout") ||
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("ETIMEDOUT");

      if (!isNetworkError) {
        throw error;
      }

      // 지수 백오프로 대기 시간 증가
      const delay =
        baseDelay * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt);
      console.log(
        `⚠️  Network error, retrying in ${delay / 1000}s... (${
          attempt + 1
        }/${maxRetries})`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * 대기 함수
 * @param {number} ms - 대기 시간 (밀리초)
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 안전한 에러 처리 (Deprecated - use errors/index.js instead)
 * @deprecated Use handleError from '../utils/errors' instead
 */
function handleError(error, context = "", exitProcess = true) {
  // Delegate to new error handling system
  coreHandleError(error, exitProcess);
}

/**
 * 에러를 사용자 친화적 메시지로 변환 (Deprecated)
 * @deprecated Use formatError from '../utils/errors' instead
 */
function formatError(error) {
  const { formatError: coreFormatError } = require("./errors");
  return coreFormatError(error);
}

module.exports = {
  RecoverableError,
  withRetry,
  sleep,
  handleError,
  formatError,
};
