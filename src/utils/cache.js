const { CACHE_TTL, LOG } = require("../constants");

/**
 * 간단한 인메모리 캐시 구현
 */
class Cache {
  constructor() {
    this.store = new Map();
    this.defaultTTL = CACHE_TTL.REPO_STATS; // Default 5 minutes
  }

  /**
   * 캐시에서 값 가져오기
   * @param {string} key - 캐시 키
   * @returns {any|null} - 캐시된 값 또는 null
   */
  get(key) {
    const item = this.store.get(key);

    if (!item) {
      return null;
    }

    // TTL 확인
    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * 캐시에 값 저장
   * @param {string} key - 캐시 키
   * @param {any} value - 저장할 값
   * @param {number} ttl - TTL (밀리초), 기본값 5분
   */
  set(key, value, ttl = this.defaultTTL) {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * 캐시에서 값 삭제
   * @param {string} key - 캐시 키
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * 캐시 전체 삭제
   */
  clear() {
    this.store.clear();
  }

  /**
   * 만료된 캐시 항목 정리
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiry) {
        this.store.delete(key);
      }
    }
  }

  /**
   * 캐시 크기 반환
   */
  size() {
    return this.store.size;
  }

  /**
   * 캐시 키 목록 반환
   */
  keys() {
    return Array.from(this.store.keys());
  }

  /**
   * 캐시된 값이 있는지 확인
   * @param {string} key - 캐시 키
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * 캐시 또는 콜백 실행
   * @param {string} key - 캐시 키
   * @param {Function} callback - 캐시 미스 시 실행할 함수
   * @param {number} ttl - TTL (밀리초)
   * @returns {Promise<any>}
   */
  async getOrSet(key, callback, ttl = this.defaultTTL) {
    const cached = this.get(key);

    if (cached !== null) {
      return cached;
    }

    const value = await callback();
    this.set(key, value, ttl);
    return value;
  }

  /**
   * 캐시 통계 정보
   */
  stats() {
    const now = Date.now();
    let validCount = 0;
    let expiredCount = 0;

    for (const [, item] of this.store.entries()) {
      if (now > item.expiry) {
        expiredCount++;
      } else {
        validCount++;
      }
    }

    return {
      total: this.store.size,
      valid: validCount,
      expired: expiredCount,
    };
  }
}

// 싱글톤 인스턴스
const cache = new Cache();

// 주기적으로 만료된 캐시 정리
// unref()를 사용하여 이 타이머가 프로세스 종료를 막지 않도록 함
const cleanupInterval = setInterval(() => {
  cache.cleanup();
}, LOG.ROTATION_CHECK_INTERVAL); // 1 hour

// 타이머가 프로세스 종료를 막지 않도록 설정
cleanupInterval.unref();

module.exports = cache;
