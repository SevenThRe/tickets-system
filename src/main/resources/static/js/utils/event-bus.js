/**
 * Created by SevenThRe
 * EventBus 事件总线
 * 提供全局事件发布订阅机制，用于组件间通信
 */
class EventBus {
    constructor() {
        // 事件存储对象
        this._events = new Map();
        // 一次性事件存储
        this._onceEvents = new Map();
        // 命名空间事件存储
        this._namespaces = new Map();
        // 最大监听器数量
        this.maxListeners = 10;
        // 最大事件数量
        this.maxEvents = 100;
        // 是否开启调试模式
        this.debug = false;
        // 事件历史记录
        this._eventHistory = [];
        this.maxHistory = 50;
    }

    /**
     * 添加事件监听器
     * @param {String} event 事件名称
     * @param {Function} callback 回调函数
     * @param {Object} options 配置选项
     * @param {String} options.namespace 命名空间
     * @param {Object} options.context 回调函数上下文
     * @param {Number} options.priority 优先级(默认为0)
     * @returns {Function} 返回取消订阅函数
     */
    on(event, callback, options = {}) {
        // 事件数量限制检查
        if (this._events.size >= this.maxEvents) {
            this._warn(`已达到最大事件数量限制: ${this.maxEvents}`);
            return () => {}; // 返回空函数避免调用报错
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

        // 监听器数量限制检查
        if (listeners.length >= this.maxListeners) {
            this._warn(`事件 "${eventKey}" 超出最大监听器限制 (${this.maxListeners})`);
        }

        // 创建监听器对象，增加时间戳用于相同优先级的排序
        const listener = {
            callback: context ? callback.bind(context) : callback,
            priority,
            timestamp: Date.now(),
            options
        };

        // 按优先级和时间戳插入
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
            // 清理事件队列
            if (listeners.length === 0) {
                this._events.delete(eventKey);
                if (namespace) {
                    const namespaceEvents = this._namespaces.get(namespace);
                    namespaceEvents.delete(eventKey);
                    if (namespaceEvents.size === 0) {
                        this._namespaces.delete(namespace);
                    }
                }
            }
        };
    }

    /**
     * 触发事件
     * @param {String} event 事件名称
     * @param {...any} args 传递给监听器的参数
     * @returns {Boolean} 是否成功触发
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

        // 复制监听器数组，防止回调中修改监听器列表
        [...listeners].forEach(listener => {
            try {
                listener.callback.apply(this, args);
            } catch (error) {
                success = false;
                errors.push({
                    event,
                    error,
                    listener: listener.callback.name || '匿名函数',
                    timestamp: Date.now()
                });
                this._error(`事件 "${event}" 回调执行错误:`, error);
            }
        });

        // 如果有错误，触发错误事件
        if (errors.length > 0) {
            this.emit('eventbus:error', errors);
        }

        return success;
    }

    /**
     * 记录事件历史
     * @private
     */
    _addToHistory(event, args) {
        this._eventHistory.unshift({
            event,
            args,
            timestamp: Date.now()
        });

        if (this._eventHistory.length > this.maxHistory) {
            this._eventHistory.pop();
        }
    }

    /**
     * 获取事件历史记录
     * @returns {Array} 事件历史记录
     */
    getEventHistory() {
        return [...this._eventHistory];
    }

    /**
     * 添加一次性事件监听器
     * @param {String} event 事件名称
     * @param {Function} callback 回调函数
     * @param {Object} options 配置选项
     * @returns {Function} 返回取消订阅函数
     */
    once(event, callback, options = {}) {
        this._validateEventName(event);
        this._validateCallback(callback);

        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            callback.apply(options.context || this, args);
        };

        // 存储原始回调便于后续移除
        this._onceEvents.set(onceWrapper, callback);
        
        return this.on(event, onceWrapper, options);
    }

    /**
     * 移除事件监听器
     * @param {String} event 事件名称
     * @param {Function} callback 回调函数
     * @param {String} namespace 命名空间
     */
    off(event, callback, namespace) {
        // 如果只传入命名空间，移除该命名空间下所有事件
        if (typeof event === 'undefined' && namespace) {
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

        // 如果没有提供回调，移除该事件的所有监听器
        if (!callback) {
            this._events.delete(eventKey);
            return;
        }

        const listeners = this._events.get(eventKey);
        if (!listeners) return;

        // 查找并移除监听器
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
     * 异步触发事件
     * @param {String} event 事件名称
     * @param {...any} args 传递给监听器的参数
     * @returns {Promise<Boolean>} 是否成功触发
     */
    async emitAsync(event, ...args) {
        this._validateEventName(event);
        
        const listeners = this._events.get(event);
        if (!listeners || !listeners.length) {
            this._debug(`Event "${event}" has no listeners`);
            return false;
        }

        try {
            // 顺序执行所有异步监听器
            for (const listener of listeners) {
                await listener.callback.apply(this, args);
            }
            return true;
        } catch (error) {
            this._error(`Error in async event "${event}" callback:`, error);
            return false;
        }
    }

    /**
     * 获取事件监听器数量
     * @param {String} event 事件名称
     * @param {String} namespace 命名空间
     * @returns {Number} 监听器数量
     */
    listenerCount(event, namespace) {
        if (!event) {
            return this._events.size;
        }
        
        const eventKey = namespace ? `${namespace}:${event}` : event;
        const listeners = this._events.get(eventKey);
        return listeners ? listeners.length : 0;
    }

    /**
     * 获取所有事件名称
     * @returns {Array} 事件名称列表
     */
    eventNames() {
        return Array.from(this._events.keys());
    }

    /**
     * 清除所有事件监听器
     */
    clear() {
        this._events.clear();
        this._onceEvents.clear();
        this._namespaces.clear();
    }

    /**
     * 设置最大监听器数量
     * @param {Number} count 最大数量
     */
    setMaxListeners(count) {
        this.maxListeners = count;
    }

    /**
     * 验证事件名称
     * @private
     * @param {String} event 事件名称
     */
    _validateEventName(event) {
        if (!event || typeof event !== 'string') {
            throw new TypeError('Event name must be a non-empty string');
        }
    }

    /**
     * 验证回调函数
     * @private
     * @param {Function} callback 回调函数
     */
    _validateCallback(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Event callback must be a function');
        }
    }

    /**
     * 输出调试信息
     * @private
     * @param {...any} args 调试参数
     */
    _debug(...args) {
        if (this.debug) {
            console.log('[EventBus Debug]', ...args);
        }
    }

    /**
     * 输出警告信息
     * @private
     * @param {...any} args 警告参数
     */
    _warn(...args) {
        console.warn('[EventBus Warning]', ...args);
    }

    /**
     * 输出错误信息
     * @private
     * @param {...any} args 错误参数
     */
    _error(...args) {
        console.error('[EventBus Error]', ...args);
    }

    _sortListeners(eventKey) {
        const listeners = this._events.get(eventKey);
        if (!listeners) return;

        const sorted = Array.from(listeners).sort((a, b) => {
            if (a.priority === b.priority) {
                return a.timestamp - b.timestamp;
            }
            return b.priority - a.priority;
        });

        this._events.set(eventKey, new Set(sorted));
    }


}

export const eventBus = new EventBus();
