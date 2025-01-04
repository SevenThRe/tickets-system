/**
 * Created by SevenThRe
 * 组件基类
 * 提供组件的基本生命周期管理和事件处理功能
 */
class BaseComponent {
    /**
     * 组件构造函数
     * @param {Object} options 组件配置项
     * @param {String|jQuery} options.container 组件容器选择器或jQuery对象
     * @param {Object} [options.events] 事件配置
     * @param {Object} [options.data] 初始数据
     */
    constructor(options) {
        this.container = typeof options.container === 'string' ? 
            $(options.container) : options.container;
        this.events = options.events || {};
        this.data = options.data || {};
        this._eventHandlers = new Map(); // 存储事件处理函数的映射
    }

    /**
     * 组件初始化方法
     * @returns {Promise} 返回Promise以支持异步初始化
     */
    async init() {
        try {
            await this.beforeInit();
            await this.render();
            this.bindEvents();
            await this.afterInit();
            return true;
        } catch (error) {
            console.error('Component initialization failed:', error);
            throw error;
        }
    }

    /**
     * 初始化前钩子
     * @returns {Promise}
     */
    async beforeInit() {
        // 子类可覆盖此方法
    }

    /**
     * 初始化后钩子
     * @returns {Promise}
     */
    async afterInit() {
        // 子类可覆盖此方法
    }

    /**
     * 渲染组件
     * @returns {Promise}
     */
    async render() {
        // 子类必须实现此方法
        throw new Error('Component must implement render method');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        Object.entries(this.events).forEach(([eventKey, handler]) => {
            const [eventName, selector] = eventKey.split(' ');
            const boundHandler = handler.bind(this);
            
            // 存储事件处理函数以便后续解绑
            this._eventHandlers.set(eventKey, boundHandler);
            
            if (selector) {
                this.container.on(eventName, selector, boundHandler);
            } else {
                this.container.on(eventName, boundHandler);
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
     * 更新组件数据
     * @param {Object} newData 新数据
     * @param {Boolean} [render=true] 是否重新渲染
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
     */
    showLoading() {
        const loadingHtml = '<div class="component-loading">加载中...</div>';
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
     * @param {String} message 错误信息
     */
    showError(message) {
        const errorHtml = `<div class="component-error">${message}</div>`;
        this.container.append(errorHtml);
        
        // 3秒后自动清除错误提示
        setTimeout(() => {
            this.container.find('.component-error').remove();
        }, 3000);
    }

    /**
     * 销毁组件
     */
    destroy() {
        this.unbindEvents();
        this.container.empty();
        this.data = null;
    }

    /**
     * 触发自定义事件
     * @param {String} eventName 事件名称
     * @param {*} data 事件数据
     */
    trigger(eventName, data) {
        this.container.trigger(eventName, data);
    }

    /**
     * 监听自定义事件
     * @param {String} eventName 事件名称
     * @param {Function} callback 回调函数
     */
    on(eventName, callback) {
        this.container.on(eventName, callback);
    }

    /**
     * 取消监听自定义事件
     * @param {String} eventName 事件名称
     * @param {Function} [callback] 回调函数，不传则取消该事件所有监听
     */
    off(eventName, callback) {
        this.container.off(eventName, callback);
    }

}

