/**
 * 이슈 번호 검증
 */
function validateIssueNumber(issueNumber) {
  const num = parseInt(issueNumber, 10);
  if (isNaN(num) || num <= 0) {
    throw new Error("❌ Invalid issue number. Please enter a positive number.");
  }
  return num;
}

/**
 * 빈 값 검증
 */
function validateNotEmpty(value, fieldName) {
  if (!value || value.trim() === "") {
    throw new Error(`❌ ${fieldName} cannot be empty.`);
  }
  return value.trim();
}

/**
 * 브랜치명 검증 및 정규화
 */
function sanitizeBranchName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * 색상 코드 검증 (hex)
 */
function validateHexColor(color) {
  if (!color) return "FFFFFF";

  // # 제거
  const cleanColor = color.replace("#", "");

  // 6자리 hex 검증
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanColor)) {
    throw new Error(
      "❌ Invalid color format. Please use 6-digit hex code (e.g., FFFFFF or #FFFFFF)."
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

/**
 * 안전한 에러 처리
 */
function handleError(error, context = "") {
  const message = error.message || String(error);

  if (message.includes("not a git repository")) {
    console.error(
      "\n❌ This is not a Git repository. Please run 'git init' first.\n"
    );
  } else if (message.includes("gh") && message.includes("not found")) {
    console.error(
      "\n❌ GitHub CLI is not installed. Please install it: https://cli.github.com/\n"
    );
  } else if (message.includes("authentication")) {
    console.error(
      "\n❌ GitHub authentication failed. Please run 'gh auth login' first.\n"
    );
  } else {
    console.error(`\n❌ Error${context ? ` (${context})` : ""}: ${message}\n`);
  }

  process.exit(1);
}

module.exports = {
  validateIssueNumber,
  validateNotEmpty,
  sanitizeBranchName,
  validateHexColor,
  parseLabelsInput,
  handleError,
};
