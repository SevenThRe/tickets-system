/**
 * EventBus.js
 * 事件总线组件 - 提供全局事件发布订阅机制
 *
 * 主要功能:
 * 1. 事件注册与触发
 * 2. 命名空间管理
 * 3. 一次性事件支持
 * 4. 优先级队列
 * 5. 异步事件处理
 */
class EventBus {
    constructor() {
        /**
         * 事件存储映射
         * @type {Map<string, Array>}
         * @private
         */
        this._events = new Map();

        /**
         * 一次性事件存储
         * @type {Map<Function, Function>}
         * @private
         */
        this._onceEvents = new Map();

        /**
         * 命名空间存储
         * @type {Map<string, Set>}
         * @private
         */
        this._namespaces = new Map();

        // 配置项
        this.maxListeners = 10;  // 最大监听器数量
        this.maxEvents = 100;    // 最大事件数量
        this.debug = false;      // 调试模式标志

        /**
         * 事件历史记录
         * @type {Array}
         * @private
         */
        this._eventHistory = [];
        this.maxHistory = 50;    // 最大历史记录数
    }

    /**
     * 添加事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} [options] - 配置选项
     * @param {string} [options.namespace] - 命名空间
     * @param {Object} [options.context] - 回调函数上下文
     * @param {number} [options.priority=0] - 优先级(0-9)
     * @returns {Function} 返回取消订阅函数
     */
    on(event, callback, options = {}) {
        // 事件数量限制检查
        if (this._events.size >= this.maxEvents) {
            this._warn(`事件数量超出限制(${this.maxEvents})`);
            return () => {};
        }

        this._validateEventName(event);
        this._validateCallback(callback);

        const { namespace, context, priority = 0 } = options;
        const eventKey = namespace ? `${namespace}:${event}` : event;

        // 创建事件队列
        if (!this._events.has(eventKey)) {
            this._events.set(eventKey, []);
        }

        const listeners = this._events.get(eventKey);

        // 监听器数量检查
        if (listeners.length >= this.maxListeners) {
            this._warn(`事件 "${eventKey}" 的监听器数量超出限制(${this.maxListeners})`);
        }

        // 创建监听器对象
        const listener = {
            callback: context ? callback.bind(context) : callback,
            priority,
            timestamp: Date.now(),
            options
        };

        // 按优先级插入
        const index = listeners.findIndex(item =>
            item.priority < priority ||
            (item.priority === priority && item.timestamp > listener.timestamp)
        );

        if (index === -1) {
            listeners.push(listener);
        } else {
            listeners.splice(index, 0, listener);
        }

        // 记录命名空间
        if (namespace) {
            if (!this._namespaces.has(namespace)) {
                this._namespaces.set(namespace, new Set());
            }
            this._namespaces.get(namespace).add(eventKey);
        }

        // 返回取消订阅函数
        return () => {
            this.off(event, callback, namespace);
        };
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...any} args - 传递给监听器的参数
     * @returns {boolean} 是否成功触发
     */
    emit(event, ...args) {
        this._validateEventName(event);

        const listeners = this._events.get(event);
        if (!listeners || !listeners.length) {
            this._debug(`事件 "${event}" 没有监听器`);
            return false;
        }

        // 记录事件历史
        if (this.debug) {
            this._addToHistory(event, args);
        }

        let success = true;
        const errors = [];

        // 执行监听器回调
        [...listeners].forEach(listener => {
            try {
                listener.callback.apply(null, args);
            } catch (error) {
                success = false;
                errors.push({
                    event,
                    error,
                    listener: listener.callback.name || '匿名函数',
                    timestamp: Date.now()
                });
                this._error(`事件 "${event}" 回调执行出错:`, error);
            }
        });

        // 触发错误事件
        if (errors.length > 0) {
            this.emit('eventbus:error', errors);
        }

        return success;
    }

    /**
     * 添加一次性事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} [options] - 配置选项
     * @returns {Function} 返回取消订阅函数
     */
    once(event, callback, options = {}) {
        this._validateEventName(event);
        this._validateCallback(callback);

        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            callback.apply(options.context || null, args);
        };

        this._onceEvents.set(onceWrapper, callback);
        return this.on(event, onceWrapper, options);
    }

    /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {string} [namespace] - 命名空间
     */
    off(event, callback, namespace) {
        // 仅提供命名空间时,移除该命名空间下所有事件
        if (!event && namespace) {
            const events = this._namespaces.get(namespace);
            if (events) {
                events.forEach(eventKey => {
                    this._events.delete(eventKey);
                });
                this._namespaces.delete(namespace);
            }
            return;
        }

        this._validateEventName(event);
        const eventKey = namespace ? `${namespace}:${event}` : event;

        // 未提供回调时,移除该事件所有监听器
        if (!callback) {
            this._events.delete(eventKey);
            return;
        }

        const listeners = this._events.get(eventKey);
        if (!listeners) return;

        // 过滤移除目标监听器
        const filteredListeners = listeners.filter(listener => {
            const listenerCallback = listener.callback;
            return listenerCallback !== callback &&
                listenerCallback !== this._onceEvents.get(callback);
        });

        if (filteredListeners.length) {
            this._events.set(eventKey, filteredListeners);
        } else {
            this._events.delete(eventKey);
        }

        // 清理一次性事件记录
        this._onceEvents.delete(callback);
    }

    /**
     * 清除所有事件监听器
     */
    clear() {
        this._events.clear();
        this._onceEvents.clear();
        this._namespaces.clear();
        this._eventHistory = [];
    }

    // 工具方法
    _validateEventName(event) {
        if (!event || typeof event !== 'string') {
            throw new TypeError('事件名称必须是非空字符串');
        }
    }

    _validateCallback(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('事件回调必须是函数');
        }
    }

    _debug(...args) {
        if (this.debug) {
            console.log('[EventBus Debug]', ...args);
        }
    }

    _warn(...args) {
        console.warn('[EventBus Warning]', ...args);
    }

    _error(...args) {
        console.error('[EventBus Error]', ...args);
    }
}

// 创建全局单例
window.eventBus = new EventBus();