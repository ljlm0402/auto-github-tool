const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

/**
 * 이슈 템플릿 질문 매핑
 */
const ISSUE_TEMPLATE_QUESTIONS = {
  "bug_report.md": [
    {
      type: "input",
      name: "Description",
      message: "🐞 Describe the bug clearly:",
      validate: (input) => input.trim() !== "" || "This field is required",
    },
    {
      type: "input",
      name: "Expected",
      message: "✅ What did you expect to happen?:",
      validate: (input) => input.trim() !== "" || "This field is required",
    },
    {
      type: "input",
      name: "Actual",
      message: "What actually happened?:",
    },
    {
      type: "input",
      name: "OS",
      message:
        "💻 What operating system are you using? (e.g., Windows, macOS, Linux):",
    },
    {
      type: "input",
      name: "NodeVersion",
      message: "🛠 Enter your Node.js version (e.g., 16.x):",
    },
    {
      type: "input",
      name: "PackageManagerVersion",
      message: "📦 Enter your NPM/Yarn version (e.g., 8.x):",
    },
    {
      type: "input",
      name: "Dependencies",
      message: "🔗 List any other relevant dependencies (optional):",
    },
    {
      type: "input",
      name: "Additional",
      message: "📎 Add any additional context (optional):",
    },
  ],
  "feature_request.md": [
    {
      type: "input",
      name: "Motivation",
      message:
        "❓ Explain why this feature is needed and what problem it solves:",
      validate: (input) => input.trim() !== "" || "This field is required",
    },
    {
      type: "input",
      name: "Solution",
      message: "💡 Describe the proposed solution:",
      validate: (input) => input.trim() !== "" || "This field is required",
    },
    {
      type: "input",
      name: "Alternatives",
      message: "🔄 What alternatives have you considered?:",
    },
    {
      type: "input",
      name: "Additional",
      message:
        "📎 Add any other relevant information or references (optional):",
    },
  ],
  "question.md": [
    {
      type: "input",
      name: "Summary",
      message: "❓ Summarize your question:",
      validate: (input) => input.trim() !== "" || "This field is required",
    },
    {
      type: "input",
      name: "Additional",
      message: "📎 Add any other relevant information (optional):",
    },
  ],
};

/**
 * PR 템플릿 질문 매핑
 */
const PR_TEMPLATE_QUESTIONS = [
  {
    type: "input",
    name: "Summary",
    message: "📌 Provide a short summary of your changes:",
    validate: (input) => input.trim() !== "" || "This field is required",
  },
  {
    type: "input",
    name: "Issue",
    message: "🔍 Enter the related issue number (e.g., #27):",
  },
  {
    type: "input",
    name: "Changes",
    message: "✨ Describe the major changes in your PR:",
    validate: (input) => input.trim() !== "" || "This field is required",
  },
  {
    type: "confirm",
    name: "Test",
    message: "✅ Have you tested the changes locally?",
    default: true,
  },
  {
    type: "confirm",
    name: "Guidelines",
    message: "📏 Does your code follow the project's style guidelines?",
    default: true,
  },
  {
    type: "confirm",
    name: "Documentation",
    message: "📖 Have you updated the documentation if necessary?",
    default: true,
  },
  {
    type: "input",
    name: "Additional",
    message: "🔗 Add any additional information (optional):",
  },
];

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

  const { useTemplate } = await inquirer.prompt([
    {
      type: "confirm",
      name: "useTemplate",
      message: "Would you like to use a template?",
      default: true,
    },
  ]);

  if (!useTemplate) {
    return "";
  }

  const { templateChoice } = await inquirer.prompt([
    {
      type: "list",
      name: "templateChoice",
      message: "Select a template:",
      choices: files.map((file, index) => ({
        name: file,
        value: index,
      })),
    },
  ]);

  let template = fs.readFileSync(
    path.join(templateDir, files[templateChoice]),
    "utf-8"
  );

  const questions = ISSUE_TEMPLATE_QUESTIONS[files[templateChoice]];

  if (questions && questions.length > 0) {
    const answers = await inquirer.prompt(questions);

    // Replace placeholders in template
    for (const [key, value] of Object.entries(answers)) {
      template = template.replace(
        new RegExp(`{{\\s*${key}\\s*}}`, "g"),
        value || ""
      );
    }
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

  // 이슈 목록 표시 (있는 경우)
  if (fetchOpenIssuesCallback) {
    fetchOpenIssuesCallback();
  }

  // 모든 질문을 inquirer로 비동기 처리
  const answers = await inquirer.prompt(PR_TEMPLATE_QUESTIONS);

  // Issue 필드 처리 (쉼표로 구분된 이슈 번호들)
  if (answers.Issue) {
    const issueNumbers = answers.Issue.split(",")
      .map((num) => num.trim())
      .filter((num) => num !== "")
      .map((num) => `- #${num.replace("#", "")}`)
      .join("\n");
    answers.Issue = issueNumbers;
  }

  // 체크박스 필드 처리
  answers.Test = answers.Test ? "x" : " ";
  answers.Guidelines = answers.Guidelines ? "x" : " ";
  answers.Documentation = answers.Documentation ? "x" : " ";

  // Replace placeholders in template
  for (const [key, value] of Object.entries(answers)) {
    template = template.replace(new RegExp(`{{ ${key} }}`, "g"), value || "");
  }

  return template;
}

module.exports = {
  fetchIssueTemplate,
  fetchPRTemplate,
  ISSUE_TEMPLATE_QUESTIONS,
  PR_TEMPLATE_QUESTIONS,
};
