const fs = require("fs");
const path = require("path");
const os = require("os");
const { LOG } = require("../constants");

class Logger {
  constructor() {
    this.logDir = path.join(os.homedir(), ".agt");
    this.logFile = path.join(this.logDir, "agt.log");
    this.debugMode =
      process.env.AGT_DEBUG === "true" || process.argv.includes("--debug");
    this.ensureLogDir();
  }

  /**
   * 로그 디렉토리 생성
   */
  ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      // 로그 디렉토리 생성 실패는 무시 (권한 문제 등)
      console.warn("⚠️  Failed to create log directory:", error.message);
    }
  }

  /**
   * 로그 기록
   * @param {string} level - 로그 레벨 (INFO, ERROR, DEBUG, WARN)
   * @param {string} message - 로그 메시지
   * @param {Object} metadata - 추가 메타데이터
   */
  log(level, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      message,
      ...metadata,
    };

    try {
      // 파일에 JSON 형식으로 기록
      fs.appendFileSync(this.logFile, JSON.stringify(entry) + "\n", "utf-8");

      // 디버그 모드에서는 콘솔에도 출력
      if (this.debugMode) {
        const chalk = require("chalk");
        const levelColors = {
          INFO: chalk.blue,
          ERROR: chalk.red,
          DEBUG: chalk.gray,
          WARN: chalk.yellow,
        };
        const colorFn = levelColors[level] || chalk.white;
        console.log(
          colorFn(`[${level}]`),
          chalk.gray(timestamp),
          message,
          Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : ""
        );
      }
    } catch (error) {
      // 로그 기록 실패는 무시
    }
  }

  /**
   * INFO 레벨 로그
   */
  info(message, metadata = {}) {
    this.log("INFO", message, metadata);
  }

  /**
   * ERROR 레벨 로그
   */
  error(message, metadata = {}) {
    this.log("ERROR", message, metadata);
  }

  /**
   * DEBUG 레벨 로그
   */
  debug(message, metadata = {}) {
    this.log("DEBUG", message, metadata);
  }

  /**
   * WARN 레벨 로그
   */
  warn(message, metadata = {}) {
    this.log("WARN", message, metadata);
  }

  /**
   * 명령 실행 로그
   */
  logCommand(command, args = [], metadata = {}) {
    this.info(`Executing command: ${command} ${args.join(" ")}`, metadata);
  }

  /**
   * 로그 파일 경로 반환
   */
  getLogPath() {
    return this.logFile;
  }

  /**
   * 로그 파일 크기 확인
   */
  getLogSize() {
    try {
      const stats = fs.statSync(this.logFile);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 로그 파일 로테이션 (10MB 초과 시)
   */
  rotateLog() {
    const maxSize = LOG.MAX_SIZE_BYTES; // 10MB

    try {
      if (this.getLogSize() > maxSize) {
        const backupFile = path.join(this.logDir, `agt.log.${Date.now()}.bak`);
        fs.renameSync(this.logFile, backupFile);

        // 백업 파일이 MAX_BACKUP_FILES 개 이상이면 가장 오래된 것 삭제
        const backupFiles = fs
          .readdirSync(this.logDir)
          .filter(
            (file) => file.startsWith("agt.log.") && file.endsWith(".bak")
          )
          .sort();

        if (backupFiles.length > LOG.MAX_BACKUP_FILES) {
          fs.unlinkSync(path.join(this.logDir, backupFiles[0]));
        }
      }
    } catch (error) {
      // 로테이션 실패는 무시
    }
  }

  /**
   * 최근 로그 조회
   * @param {number} lines - 조회할 라인 수
   */
  tail(lines = LOG.DEFAULT_TAIL_LINES) {
    try {
      const content = fs.readFileSync(this.logFile, "utf-8");
      const logLines = content.trim().split("\n");
      return logLines.slice(-lines).map((line) => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * 로그 검색
   * @param {Object} filters - 검색 필터 { level, message, startTime, endTime }
   */
  search(filters = {}) {
    try {
      const logs = this.tail(1000); // 최근 1000개 로그 검색

      return logs.filter((log) => {
        if (filters.level && log.level !== filters.level) return false;
        if (filters.message && !log.message.includes(filters.message))
          return false;
        if (
          filters.startTime &&
          new Date(log.timestamp) < new Date(filters.startTime)
        )
          return false;
        if (
          filters.endTime &&
          new Date(log.timestamp) > new Date(filters.endTime)
        )
          return false;
        return true;
      });
    } catch (error) {
      return [];
    }
  }
}

// 싱글톤 인스턴스
const logger = new Logger();

module.exports = logger;
