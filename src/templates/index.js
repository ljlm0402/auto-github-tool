const fs = require("fs");
const path = require("path");
const readlineSync = require("readline-sync");

/**
 * 이슈 템플릿 질문 매핑
 */
const ISSUE_TEMPLATE_QUESTIONS = {
  "bug_report.md": {
    Description: "🐞 Describe the bug clearly: ",
    Expected: "✅ What did you expect to happen?: ",
    Actual: "What actually happened?: ",
    OS: "💻 What operating system are you using? (e.g., Windows, macOS, Linux): ",
    NodeVersion: "🛠 Enter your Node.js version (e.g., 16.x): ",
    PackageManagerVersion: "📦 Enter your NPM/Yarn version (e.g., 8.x): ",
    Dependencies: "🔗 List any other relevant dependencies (optional): ",
    Additional: "📎 Add any additional context (optional): ",
  },
  "feature_request.md": {
    Motivation:
      "❓ Explain why this feature is needed and what problem it solves: ",
    Solution: "💡 Describe the proposed solution: ",
    Alternatives: "🔄 What alternatives have you considered?: ",
    Additional:
      "📎 Add any other relevant information or references (optional): ",
  },
  "question.md": {
    Summary: "❓ Summarize your question: ",
    Additional: "📎 Add any other relevant information (optional): ",
  },
};

/**
 * PR 템플릿 질문 매핑
 */
const PR_TEMPLATE_QUESTIONS = {
  Summary: "📌 Provide a short summary of your changes: ",
  Issue: "🔍 Enter the related issue number (e.g., #27): ",
  Changes: "✨ Describe the major changes in your PR: ",
  Test: "✅ Have you tested the changes locally? (yes/no): ",
  Guidelines:
    "📏 Does your code follow the project's style guidelines? (yes/no): ",
  Documentation:
    "📖 Have you updated the documentation if necessary? (yes/no): ",
  Additional: "🔗 Add any additional information (optional): ",
};

/**
 * 템플릿의 placeholder를 사용자 입력으로 치환
 */
async function replacePlaceholders(template, questions) {
  for (const key in questions) {
    const prompt = questions[key];
    const answer = readlineSync.question(prompt);
    template = template.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), answer);
  }
  return template;
}

/**
 * 이슈 템플릿 가져오기
 */
async function fetchIssueTemplate() {
  const templateDir = path.join(".github", "ISSUE_TEMPLATE");

  if (!fs.existsSync(templateDir)) {
    return "";
  }

  const files = fs
    .readdirSync(templateDir)
    .filter((file) => file.endsWith(".md"));
  if (files.length === 0) {
    return "";
  }

  console.log("\n📌 Available Issue Templates:");
  files.forEach((file, index) => console.log(`${index + 1}. ${file}`));

  const choice = readlineSync.question(
    "\nSelect a template number or press Enter to skip: "
  );

  if (!choice.trim()) {
    return "";
  }

  const templateChoice = parseInt(choice) - 1;

  if (!files[templateChoice]) {
    console.log("⚠️  Invalid template selection, skipping...");
    return "";
  }

  let template = fs.readFileSync(
    path.join(templateDir, files[templateChoice]),
    "utf-8"
  );
  const questions = ISSUE_TEMPLATE_QUESTIONS[files[templateChoice]] || {};

  if (Object.keys(questions).length > 0) {
    template = await replacePlaceholders(template, questions);
  }

  return template;
}

/**
 * PR 템플릿 가져오기
 */
async function fetchPRTemplate(fetchOpenIssuesCallback) {
  const templatePath = path.join(".github", "PULL_REQUEST_TEMPLATE.md");

  if (!fs.existsSync(templatePath)) {
    return "";
  }

  let template = fs.readFileSync(templatePath, "utf-8");
  const answers = {};

  for (const [key, question] of Object.entries(PR_TEMPLATE_QUESTIONS)) {
    let answer;

    if (key === "Issue") {
      // 이슈 목록 표시
      if (fetchOpenIssuesCallback) {
        fetchOpenIssuesCallback();
      }

      answer = readlineSync.question(question).trim();
      const issueNumbers = answer
        .split(",")
        .map((num) => num.trim())
        .filter((num) => num !== "")
        .map((num) => `- #${num}`)
        .join("\n");

      answers[key] = issueNumbers;
    } else if (["Test", "Guidelines", "Documentation"].includes(key)) {
      answer =
        readlineSync.question(question).toLowerCase() === "yes" ? "x" : " ";
      answers[key] = answer;
    } else {
      answers[key] = readlineSync.question(question).trim();
    }

    template = template.replace(
      new RegExp(`{{ ${key} }}`, "g"),
      answers[key] || ""
    );
  }

  return template;
}

module.exports = {
  fetchIssueTemplate,
  fetchPRTemplate,
  ISSUE_TEMPLATE_QUESTIONS,
  PR_TEMPLATE_QUESTIONS,
};
