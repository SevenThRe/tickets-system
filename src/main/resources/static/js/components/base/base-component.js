/**
 * BaseComponent.js
 * 组件基类 - 提供基础组件功能和生命周期管理
 *
 * 职责:
 * 1. 提供组件生命周期管理
 * 2. 统一的事件处理机制
 * 3. 错误处理和状态管理
 * 4. DOM操作的封装
 */
class BaseComponent {
    /**
     * 组件构造函数
     * @param {Object} options - 组件配置参数
     * @param {String|jQuery} options.container - 组件容器选择器或jQuery对象
     * @param {Object} [options.events] - 事件配置
     * @param {Object} [options.data] - 初始数据
     */
    constructor(options = {}) {
        // 验证必要参数
        if (!options.container) {
            throw new Error('组件构造需要container参数');
        }

        /**
         * 组件容器
         * @type {jQuery}
         */
        this.container = typeof options.container === 'string' ?
            $(options.container) : options.container;

        /**
         * 事件配置
         * @type {Object}
         */
        this.events = options.events || {};

        /**
         * 组件数据
         * @type {Object}
         */
        this.data = options.data || {};

        /**
         * 存储事件处理函数的映射
         * @type {Map}
         * @private
         */
        this._eventHandlers = new Map();
    }

    /**
     * 组件初始化方法
     * @returns {Promise} 返回Promise以支持异步初始化
     */
    async init() {
        try {
            // 初始化前的准备工作
            await this.beforeInit();

            // 渲染组件
            await this.render();

            // 绑定事件
            this.bindEvents();

            // 初始化后的处理
            await this.afterInit();

            return true;
        } catch (error) {
            console.error('组件初始化失败:', error);
            // 展示错误信息
            this.showError(error.message);
            throw error;
        }
    }


    /**
     * 初始化前钩子
     * @returns {Promise}
     */
    async beforeInit() {
        // 子类可覆盖实现
    }

    /**
     * 初始化后钩子
     * @returns {Promise}
     */
    async afterInit() {
        // 子类可覆盖实现
    }

    /**
     * 绑定事件处理
     */
    bindEvents() {
        Object.entries(this.events).forEach(([eventKey, handler]) => {
            const [eventName, selector] = eventKey.split(' ');
            // 确保handler是函数
            if (typeof handler === 'string') {
                handler = this[handler].bind(this);
            } else {
                handler = handler.bind(this);
            }

            // 存储事件处理函数
            this._eventHandlers.set(eventKey, handler);

            // 绑定事件
            if (selector) {
                this.container.on(eventName, selector, handler);
            } else {
                this.container.on(eventName, handler);
            }
        });
    }

    /**
     * 解绑事件
     */
    unbindEvents() {
        this._eventHandlers.forEach((handler, eventKey) => {
            const [eventName, selector] = eventKey.split(' ');
            if (selector) {
                this.container.off(eventName, selector, handler);
            } else {
                this.container.off(eventName, handler);
            }
        });
        this._eventHandlers.clear();
    }

    /**
     * 更新组件状态
     * @param {Object} newData - 新数据
     * @param {Boolean} [render=true] - 是否重新渲染
     */
    async updateData(newData, render = true) {
        this.data = {
            ...this.data,
            ...newData
        };

        if (render) {
            await this.render();
        }
    }

    /**
     * 显示加载状态
     * @param {String} [message='加载中...'] - 加载提示文本
     */
    showLoading(message = '加载中...') {
        const loadingHtml = `
            <div class="component-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        this.container.append(loadingHtml);
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        this.container.find('.component-loading').remove();
    }

    /**
     * 显示错误信息
     * @param {String} message - 错误信息
     * @param {Number} [duration=3000] - 显示时长(毫秒)
     */
    showError(message, duration = 3000) {
        const errorHtml = `
            <div class="component-error alert alert-danger">
                ${message}
            </div>
        `;

        // 先移除已有的错误提示
        this.container.find('.component-error').remove();

        // 添加新的错误提示
        this.container.append(errorHtml);

        // 自动消失
        if (duration > 0) {
            setTimeout(() => {
                this.container.find('.component-error').fadeOut(() => {
                    $(this).remove();
                });
            }, duration);
        }
    }

    /**
     * 显示成功信息
     * @param {String} message - 成功信息
     * @param {Number} [duration=3000] - 显示时长(毫秒)
     */
    showSuccess(message, duration = 3000) {
        const successHtml = `
            <div class="component-success alert alert-success">
                ${message}
            </div>
        `;

        this.container.find('.component-success').remove();
        this.container.append(successHtml);

        if (duration > 0) {
            setTimeout(() => {
                this.container.find('.component-success').fadeOut(() => {
                    $(this).remove();
                });
            }, duration);
        }
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 解绑事件
        this.unbindEvents();
        // 清空容器
        this.container.empty();
        // 清理数据
        this.data = null;
    }

    /**
     * 触发自定义事件
     * @param {String} eventName - 事件名称
     * @param {*} data - 事件数据
     */
    trigger(eventName, data) {
        this.container.trigger(eventName, data);
    }

    /**
     * 订阅组件事件
     * @param {String} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(eventName, callback) {
        this.container.on(eventName, callback);
    }

    /**
     * 取消事件订阅
     * @param {String} eventName - 事件名称
     * @param {Function} [callback] - 回调函数
     */
    off(eventName, callback) {
        this.container.off(eventName, callback);
    }
}

// 添加到全局命名空间
window.BaseComponent = BaseComponent;