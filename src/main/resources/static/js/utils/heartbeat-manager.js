/**
 * 心跳管理类
 * 负责维护用户在线状态
 */
class HeartbeatManager {
    constructor() {
        this.interval = 5 * 60 * 1000; // 5分钟发送一次心跳
        this.timer = null;
        this.userId = null;
        this.subscribers = new Set(); // 添加订阅者集合
        this.userStatus = new Map();  // 添加用户状态Map

        // 从localStorage获取用户信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.userId) {
            this.userId = userInfo.userId;
            this.start();
        }

        // 监听storage变化，处理用户登录登出
        window.addEventListener('storage', (e) => {
            if (e.key === 'userInfo') {
                const newUserInfo = JSON.parse(e.newValue || '{}');
                if (newUserInfo.userId) {
                    this.userId = newUserInfo.userId;
                    this.start();
                } else {
                    this.stop();
                }
            }
        });
    }

    start() {
        if (!this.userId || this.timer) return;

        // 设置当前用户为在线状态
        this.userStatus.set(this.userId, {
            status: 'online',
            lastHeartbeat: Date.now()
        });

        // 立即发送一次心跳
        this.sendHeartbeat();

        // 启动定时器
        this.timer = setInterval(() => {
            this.sendHeartbeat();
        }, this.interval);

        console.log('心跳检测已启动');
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;

            // 设置当前用户为离线状态
            if (this.userId) {
                this.userStatus.set(this.userId, {
                    status: 'offline',
                    lastHeartbeat: Date.now()
                });
                this._notifyStatusChange(this.userId, 'offline');
            }

            this.userId = null;
        }
        console.log('心跳检测已停止');
    }

    /**
     * 订阅状态变更
     */
    subscribe(callback) {
        if (typeof callback === 'function') {
            this.subscribers.add(callback);
        }
    }

    /**
     * 取消订阅
     */
    unsubscribe(callback) {
        this.subscribers.delete(callback);
    }

    /**
     * 获取用户在线状态
     */
    getStatus(userId) {
        const userStatus = this.userStatus.get(userId);
        if (!userStatus) return 'offline';
        return userStatus.status;
    }

    async sendHeartbeat() {
        if (!this.userId) return;

        try {
            const response = await $.ajax({
                url: '/api/auth/heartbeat',
                method: 'POST',
                data: {
                    userId: this.userId
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200 && response.data) {
                // 更新在线用户状态
                this._updateOnlineStatus(response.data);
            }
        } catch (error) {
            console.error('心跳更新失败:', error);
            // 如果连续失败多次，可以考虑停止心跳
            if (error.status === 401) {
                this.stop();
            }
        }
    }

    /**
     * 更新在线状态
     */
    _updateOnlineStatus(onlineUsers) {
        const currentTime = Date.now();
        const statusChanged = new Set();

        // 更新在线用户状态
        onlineUsers.forEach(userId => {
            const prevStatus = this.getStatus(userId);
            this.userStatus.set(userId, {
                status: 'online',
                lastHeartbeat: currentTime
            });
            if (prevStatus !== 'online') {
                statusChanged.add(userId);
            }
        });

        // 检查离线用户
        this.userStatus.forEach((status, userId) => {
            if (!onlineUsers.includes(userId) && status.status === 'online') {
                status.status = 'offline';
                statusChanged.add(userId);
            }
        });

        // 通知状态变更
        statusChanged.forEach(userId => {
            this._notifyStatusChange(userId, this.getStatus(userId));
        });
    }

    /**
     * 通知状态变更
     */
    _notifyStatusChange(userId, status) {
        this.subscribers.forEach(callback => {
            try {
                callback(userId, status);
            } catch (error) {
                console.error('状态变更通知失败:', error);
            }
        });
    }
}

// 创建全局单例
window.heartbeatManager = new HeartbeatManager();