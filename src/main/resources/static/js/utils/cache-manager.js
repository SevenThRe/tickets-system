import EventBus from "./event-bus";

/**
 * 缓存管理组件
 * 提供统一的前端数据缓存解决方案，支持：
 * 1. 内存/持久化存储
 * 2. 模块化的数据类型管理
 * 3. 差异化的缓存策略
 * 4. 自动过期和清理
 */
class CacheManager {
    constructor() {
        /**
         * 存储配置
         * @private
         */
        this._storage = {
            memory: new Map(),     // 内存存储
            persistent: {}         // 持久化存储(localStorage)
        };

        /**
         * 基础配置
         * @private
         */
        this._config = {
            cleanupInterval: 60 * 1000,  // 清理间隔
            prefix: 'cache_'             // 持久化存储前缀
        };

        /**
         * 业务模块定义
         * @readonly
         */
        this.MODULES = {
            USER: 'user',
            TICKET: 'ticket',
            SYSTEM: 'system',
            COMMON: 'common'
        };

        /**
         * 数据类型定义
         * @readonly
         */
        this.DATA_TYPES = {
            USER: {
                PERMISSIONS: `${this.MODULES.USER}.permissions`,
                PROFILE: `${this.MODULES.USER}.profile`
            },
            TICKET: {
                LIST: `${this.MODULES.TICKET}.list`,
                DETAIL: `${this.MODULES.TICKET}.detail`
            },
            SYSTEM: {
                DICTIONARY: `${this.MODULES.SYSTEM}.dictionary`
            },
            COMMON: {
                DEPARTMENTS: `${this.MODULES.COMMON}.departments`
            }
        };

        /**
         * 缓存策略定义
         * @readonly
         */
        this.STRATEGIES = {
            REALTIME: {
                name: 'realtime',
                shouldCache: false,
                expiration: 0
            },
            SHORT: {
                name: 'short',
                shouldCache: true,
                expiration: 30 * 1000,
                persistent: false
            },
            STANDARD: {
                name: 'standard',
                shouldCache: true,
                expiration: 5 * 60 * 1000,
                persistent: true
            },
            LONG: {
                name: 'long',
                shouldCache: true,
                expiration: 30 * 60 * 1000,
                persistent: true
            }
        };

        /**
         * 数据类型策略映射
         * @private
         */
        this._typeStrategyMap = {
            [this.DATA_TYPES.USER.PERMISSIONS]: this.STRATEGIES.REALTIME,
            [this.DATA_TYPES.USER.PROFILE]: this.STRATEGIES.SHORT,
            [this.DATA_TYPES.TICKET.LIST]: this.STRATEGIES.STANDARD,
            [this.DATA_TYPES.TICKET.DETAIL]: this.STRATEGIES.REALTIME,
            [this.DATA_TYPES.SYSTEM.DICTIONARY]: this.STRATEGIES.LONG,
            [this.DATA_TYPES.COMMON.DEPARTMENTS]: this.STRATEGIES.STANDARD
        };

        // 初始化
        this._init();
    }

    /**
     * 初始化缓存管理器
     * @private
     */
    _init() {
        // 从localStorage恢复持久化数据
        this._restoreFromStorage();
        // 启动清理任务
        this._startCleanup();
    }

    /**
     * 设置缓存
     * @param {string} key - 缓存键
     * @param {string} type - 数据类型(必须使用DATA_TYPES中定义的类型)
     * @param {*} value - 缓存值
     * @param {Object} [options] - 自定义选项(可覆盖默认策略)
     * @returns {void}
     * @throws {Error} 当使用未定义的数据类型时抛出错误
     */
    async set(key, type, value, options = {}) {
        // 验证数据类型
        this._validateDataType(type);

        // 获取缓存策略
        const strategy = {
            ...this._typeStrategyMap[type],
            ...options
        };

        // 如果策略配置为不缓存，直接返回
        if (!strategy.shouldCache) {
            return;
        }

        // 构建缓存项
        const cacheItem = {
            key,
            type,
            value,
            timestamp: Date.now(),
            expiration: strategy.expiration
        };

        // 存储到内存
        this._storage.memory.set(key, cacheItem);

        // 如果需要持久化
        if (strategy.persistent) {
            this._persistToStorage(key, cacheItem);
        }

        // 触发缓存更新事件
        EventBus.emit('cache:updated', { key, type, value });
    }

    /**
     * 获取缓存
     * @param {string} key - 缓存键
     * @param {string} type - 数据类型
     * @param {Function} fetchFn - 获取数据的函数
     * @returns {Promise<*>} 数据值
     */
    async get(key, type, fetchFn) {
        // 验证数据类型
        this._validateDataType(type);

        const strategy = this._typeStrategyMap[type];

        // 实时数据直接获取
        if (!strategy.shouldCache) {
            return await fetchFn();
        }

        // 尝试从内存获取
        let cacheItem = this._storage.memory.get(key);

        // 如果内存没有，尝试从持久化存储获取
        if (!cacheItem && strategy.persistent) {
            cacheItem = this._getFromStorage(key);
            if (cacheItem) {
                this._storage.memory.set(key, cacheItem);
            }
        }

        // 检查是否过期
        if (cacheItem && !this._isExpired(cacheItem)) {
            return cacheItem.value;
        }

        // 获取新数据
        const value = await fetchFn();
        await this.set(key, type, value);
        return value;
    }

    /**
     * 清除指定类型的所有缓存
     * @param {string} type - 数据类型
     */
    clearByType(type) {
        // 验证数据类型
        this._validateDataType(type);

        // 清除内存缓存
        for (const [key, item] of this._storage.memory.entries()) {
            if (item.type === type) {
                this._storage.memory.delete(key);
                // 同时清除持久化存储
                this._removeFromStorage(key);
                // 触发事件
                EventBus.emit('cache:cleared', { key, type });
            }
        }
    }

    /**
     * 验证数据类型
     * @private
     */
    _validateDataType(type) {
        const isValid = Object.values(this.DATA_TYPES).some(group =>
            Object.values(group).includes(type)
        );
        if (!isValid) {
            throw new Error(`无效的数据类型: ${type}`);
        }
    }

    /**
     * 检查缓存是否过期
     * @private
     */
    _isExpired(item) {
        return Date.now() - item.timestamp > item.expiration;
    }

    /**
     * 持久化到localStorage
     * @private
     */
    _persistToStorage(key, item) {
        try {
            const storageKey = this._config.prefix + key;
            localStorage.setItem(storageKey, JSON.stringify(item));
        } catch (error) {
            console.warn('Cache persistence failed:', error);
        }
    }

    /**
     * 从localStorage获取
     * @private
     */
    _getFromStorage(key) {
        try {
            const storageKey = this._config.prefix + key;
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Cache retrieval failed:', error);
            return null;
        }
    }

    /**
     * 从localStorage删除
     * @private
     */
    _removeFromStorage(key) {
        try {
            const storageKey = this._config.prefix + key;
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.warn('Cache removal failed:', error);
        }
    }

    /**
     * 启动定时清理
     * @private
     */
    _startCleanup() {
        setInterval(() => {
            this._storage.memory.forEach((item, key) => {
                if (this._isExpired(item)) {
                    this._storage.memory.delete(key);
                    this._removeFromStorage(key);
                }
            });
        }, this._config.cleanupInterval);
    }

    /**
     * 从localStorage恢复持久化数据
     * @private
     */
    _restoreFromStorage() {
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(this._config.prefix)) {
                    const item = this._getFromStorage(
                        key.slice(this._config.prefix.length)
                    );
                    if (item && !this._isExpired(item)) {
                        this._storage.memory.set(item.key, item);
                    }
                }
            }
        } catch (error) {
            console.warn('Cache restoration failed:', error);
        }
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        const stats = {
            memorySize: 0,
            persistentSize: 0,
            itemCount: 0,
            expiredCount: 0
        };

        this._storage.memory.forEach(item => {
            stats.itemCount++;
            if (this._isExpired(item)) {
                stats.expiredCount++;
            }
            // 估算内存占用
            stats.memorySize += this._estimateSize(item);
            if (item.persistent) {
                stats.persistentSize += this._estimateSize(item);
            }
        });

        return stats;
    }
}

// 导出单例
export const cacheManager = new CacheManager();
export default CacheManager;