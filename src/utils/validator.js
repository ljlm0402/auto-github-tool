const { BRANCH_NAME, VALIDATION } = require("../constants");
const { AGTError, ERROR_CODES } = require("./errors");

/**
 * 이슈 번호 검증
 */
function validateIssueNumber(issueNumber) {
  const num = parseInt(issueNumber, 10);
  if (isNaN(num) || num <= 0) {
    throw new AGTError(
      "Issue number must be a positive integer",
      ERROR_CODES.INVALID_ISSUE_NUMBER,
      { input: issueNumber }
    );
  }
  return num;
}

/**
 * 빈 값 검증
 */
function validateNotEmpty(value, fieldName) {
  if (!value || value.trim() === "") {
    throw new AGTError(
      `${fieldName} cannot be empty`,
      ERROR_CODES.EMPTY_FIELD,
      { field: fieldName }
    );
  }
  return value.trim();
}

/**
 * 브랜치명 검증 및 정규화
 */
function sanitizeBranchName(name) {
  if (!name || typeof name !== "string") {
    throw new AGTError(
      "Branch name is required",
      ERROR_CODES.INVALID_BRANCH_NAME,
      { input: name }
    );
  }

  // 기본 정규화
  const sanitized = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_\/]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");

  // 빈 문자열 체크
  if (!sanitized) {
    throw new AGTError(
      "Branch name cannot be empty after sanitization",
      ERROR_CODES.INVALID_BRANCH_NAME,
      { original: name, sanitized }
    );
  }

  // 길이 체크
  if (sanitized.length > BRANCH_NAME.MAX_LENGTH) {
    throw new AGTError(
      `Branch name too long (max ${BRANCH_NAME.MAX_LENGTH} characters)`,
      ERROR_CODES.INVALID_BRANCH_NAME,
      { length: sanitized.length, max: BRANCH_NAME.MAX_LENGTH }
    );
  }

  // Shell injection 방지 - 위험한 문자 체크
  for (const char of BRANCH_NAME.FORBIDDEN_CHARS) {
    if (sanitized.includes(char)) {
      throw new AGTError(
        `Branch name contains forbidden character: ${char}`,
        ERROR_CODES.INVALID_BRANCH_NAME,
        { forbiddenChar: char, input: sanitized }
      );
    }
  }

  // 최종 정규식 검증
  if (!BRANCH_NAME.REGEX.test(sanitized)) {
    throw new AGTError(
      "Branch name contains invalid characters",
      ERROR_CODES.INVALID_BRANCH_NAME,
      { input: sanitized, pattern: BRANCH_NAME.REGEX.toString() }
    );
  }

  return sanitized;
}

/**
 * 색상 코드 검증 (hex)
 */
function validateHexColor(color) {
  if (!color) return "FFFFFF";

  // # 제거
  const cleanColor = color.replace("#", "");

  // 6자리 hex 검증
  if (!VALIDATION.HEX_COLOR.test(cleanColor)) {
    throw new AGTError(
      "Invalid color format. Use 6-digit hex code (e.g., FFFFFF or #FFFFFF)",
      ERROR_CODES.INVALID_COLOR,
      { input: color }
    );
  }

  return cleanColor.toUpperCase();
}

/**
 * 라벨 선택 입력 파싱
 */
function parseLabelsInput(input, availableLabels) {
  if (!input || !input.trim()) return [];

  return input
    .split(",")
    .map((item) => item.trim())
    .map((item) => {
      // 숫자인 경우
      if (/^\d+$/.test(item)) {
        const index = parseInt(item, 10) - 1;
        return availableLabels[index] || null;
      }
      // 알파벳인 경우 (a, b, c...)
      const index = item.charCodeAt(0) - 97 + 9;
      return availableLabels[index] || null;
    })
    .filter((label) => label !== null);
}

module.exports = {
  validateIssueNumber,
  validateNotEmpty,
  sanitizeBranchName,
  validateHexColor,
  parseLabelsInput,
};
