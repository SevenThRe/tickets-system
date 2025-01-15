/**
 * 心跳管理类
 * 负责维护用户在线状态
 */
class HeartbeatManager {
    constructor() {
        this.interval = 5 * 60 * 1000; // 5分钟发送一次心跳
        this.timer = null;
        this.userId = null;

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
            this.userId = null;
        }
        console.log('心跳检测已停止');
    }

    async sendHeartbeat() {
        if (!this.userId) return;

        try {
            await $.ajax({
                url: '/api/auth/heartbeat',
                method: 'POST',
                data: {
                    userId: this.userId
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
        } catch (error) {
            console.error('心跳更新失败:', error);
            // 如果连续失败多次，可以考虑停止心跳
            if (error.status === 401) {
                this.stop();
            }
        }
    }
}

// 创建全局单例
window.heartbeatManager = new HeartbeatManager();