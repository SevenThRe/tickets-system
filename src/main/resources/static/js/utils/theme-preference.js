/**
 * ThemePreference.js
 * 用户主题偏好管理类
 * 负责用户主题偏好的存储和同步
 */
class ThemePreference {
    constructor() {
        this.STORAGE_KEY = 'theme_preference';
        this.SYNC_INTERVAL = 5 * 60 * 1000; // 5分钟同步一次
        this._initSync();
    }

    /**
     * 初始化定期同步
     * @private
     */
    _initSync() {
        // 设置定期同步
        setInterval(() => {
            this._syncToServer();
        }, this.SYNC_INTERVAL);
    }

    /**
     * 保存用户主题偏好
     * @param {Object} preference 主题偏好配置
     * @returns {Promise<boolean>} 是否保存成功
     */
    async savePreference(preference) {
        try {
            // 保存到本地存储
            this._saveToLocal(preference);
            
            // 同步到服务器
            await this._syncToServer();
            
            return true;
        } catch (error) {
            console.error('Failed to save theme preference:', error);
            return false;
        }
    }

    /**
     * 获取用户主题偏好
     * @returns {Object|null} 用户主题偏好配置
     */
    async getPreference() {
        try {
            // 优先从本地获取
            let preference = this._getFromLocal();
            
            // 如果本地没有，从服务器获取
            if (!preference) {
                preference = await this._getFromServer();
                if (preference) {
                    this._saveToLocal(preference);
                }
            }
            
            return preference;
        } catch (error) {
            console.error('Failed to get theme preference:', error);
            return null;
        }
    }

    /**
     * 保存到本地存储
     * @private
     * @param {Object} preference 主题偏好配置
     */
    _saveToLocal(preference) {
        try {
            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(preference)
            );
        } catch (error) {
            console.error('Failed to save to local storage:', error);
        }
    }

    /**
     * 从本地存储获取
     * @private
     * @returns {Object|null} 主题偏好配置
     */
    _getFromLocal() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to get from local storage:', error);
            return null;
        }
    }

    /**
     * 同步到服务器
     * @private
     * @returns {Promise<boolean>} 是否同步成功
     */
    async _syncToServer() {
        const preference = this._getFromLocal();
        if (!preference) return false;

        // 这里没用RequestUtils完全是因为当时没写，那个工具类是后来写的，前面我也懒得改了，所以就直接用$.ajax了
        // 就是因为频繁要追加error处理，token校验我才选择封装了RequestUtils
        try {
            const response = await $.ajax({
                url: '/api/user/theme-preference',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                data: JSON.stringify(preference),
                contentType: 'application/json'
            });

            return response.code === 200;
        } catch (error) {
            console.error('Failed to sync to server:', error);
            return false;
        }
    }

    /**
     * 从服务器获取
     * @private
     * @returns {Promise<Object|null>} 主题偏好配置
     */
    async _getFromServer() {
        try {
            const response = await $.ajax({
                url: '/api/user/theme-preference',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            return response.code === 200 ? response.data : null;
        } catch (error) {
            console.error('Failed to get from server:', error);
            return null;
        }
    }
}

// 导出单例
export const themePreference = new ThemePreference();
export default ThemePreference;