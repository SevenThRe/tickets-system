/**
 * NotifyUtil.js
 * 通用通知提示工具类
 */
class NotifyUtil {
    /**
     * 显示通知
     * @param {string} message - 提示消息
     * @param {string} type - 提示类型：success, error, warning, info
     * @param {object} options - 额外配置选项
     */
    static show(message, type = 'info', options = {}) {
        // 默认配置
        const defaultOptions = {
            position: 'top-right',
            duration: 3000,
            closeable: true
        };

        // 合并配置
        const settings = { ...defaultOptions, ...options };

        // 创建通知容器（如果不存在）
        let container = document.querySelector('.notify-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notify-container';
            document.body.appendChild(container);
        }

        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notify notify-${type}`;

        // 添加通知内容
        notification.innerHTML = `
            <div class="notify-content">
                <i class="notify-icon bi ${this._getIcon(type)}"></i>
                <span class="notify-message">${message}</span>
                ${settings.closeable ? '<button class="notify-close">&times;</button>' : ''}
            </div>
        `;

        // 添加到容器
        container.appendChild(notification);

        // 添加动画类
        setTimeout(() => notification.classList.add('show'), 10);

        // 绑定关闭按钮事件
        if (settings.closeable) {
            const closeBtn = notification.querySelector('.notify-close');
            closeBtn.addEventListener('click', () => this._removeNotification(notification));
        }

        // 自动关闭
        if (settings.duration > 0) {
            setTimeout(() => this._removeNotification(notification), settings.duration);
        }
    }

    /**
     * 成功提示
     * @param {string} message - 提示消息
     * @param {object} options - 配置选项
     */
    static success(message, options = {}) {
        this.show(message, 'success', options);
    }

    /**
     * 错误提示
     * @param {string} message - 提示消息
     * @param {object} options - 配置选项
     */
    static error(message, options = {}) {
        this.show(message, 'error', options);
    }

    /**
     * 警告提示
     * @param {string} message - 提示消息
     * @param {object} options - 配置选项
     */
    static warning(message, options = {}) {
        this.show(message, 'warning', options);
    }

    /**
     * 信息提示
     * @param {string} message - 提示消息
     * @param {object} options - 配置选项
     */
    static info(message, options = {}) {
        this.show(message, 'info', options);
    }

    /**
     * 显示加载提示
     * @param {string} message - 提示消息
     */
    static loading(message = '正在加载...') {
        this.show(message, 'info', { duration: 0, closeable: false });
    }

    /**
     * 关闭所有通知
     */
    static closeLoading() {
        const notifications = document.querySelectorAll('.notify');
        notifications.forEach(notification => {
            this._removeNotification(notification);
        });
    }


    /**
     * 获取图标类名
     * @private
     */
    static _getIcon(type) {
        const icons = {
            success: 'bi-check-circle-fill',
            error: 'bi-x-circle-fill',
            warning: 'bi-exclamation-triangle-fill',
            info: 'bi-info-circle-fill'
        };
        return icons[type] || icons.info;
    }

    /**
     * 移除通知
     * @private
     */
    static _removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();

            // 检查并清理空容器
            const container = document.querySelector('.notify-container');
            if (container && !container.hasChildNodes()) {
                container.remove();
            }
        }, 300);
    }
}

// 添加到全局对象
window.NotifyUtil = NotifyUtil;