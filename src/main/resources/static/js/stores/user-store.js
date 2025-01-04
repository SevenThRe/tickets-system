import {eventBus} from "../utils/event-bus";

/**
 * Created by SevenThRe
 * UserStore
 * 用户状态管理类,处理用户登录状态、权限、个人信息等
 */
class UserStore {
    constructor() {
        // 存储键名定义
        this.STORAGE_KEYS = {
            TOKEN: 'auth_token',
            USER_INFO: 'user_info',
            PERMISSIONS: 'user_permissions'
        };

        // 当前状态
        this.state = {
            token: null,
            userInfo: null,
            permissions: [],
            isLoading: false
        };

        // 初始化存储的数据
        this._initFromStorage();
    }
//
    /**
     * 从本地存储初始化数据
     * @private
     */
    _initFromStorage() {
        try {
            // 恢复token
            this.state.token = localStorage.getItem(this.STORAGE_KEYS.TOKEN);
            
            // 恢复用户信息
            const userInfoStr = localStorage.getItem(this.STORAGE_KEYS.USER_INFO);
            if (userInfoStr) {
                this.state.userInfo = JSON.parse(userInfoStr);
            }
            
            // 恢复权限信息
            const permissionsStr = localStorage.getItem(this.STORAGE_KEYS.PERMISSIONS);
            if (permissionsStr) {
                this.state.permissions = JSON.parse(permissionsStr);
            }
        } catch (error) {
            console.error('Failed to init from storage:', error);
            this.clearUserInfo();
        }
    }

    /**
     * 保存数据到本地存储
     * @private
     */
    _saveToStorage() {
        try {
            // 保存token
            if (this.state.token) {
                localStorage.setItem(this.STORAGE_KEYS.TOKEN, this.state.token);
            } else {
                localStorage.removeItem(this.STORAGE_KEYS.TOKEN);
            }
            
            // 保存用户信息
            if (this.state.userInfo) {
                localStorage.setItem(
                    this.STORAGE_KEYS.USER_INFO,
                    JSON.stringify(this.state.userInfo)
                );
            } else {
                localStorage.removeItem(this.STORAGE_KEYS.USER_INFO);
            }
            
            // 保存权限信息
            if (this.state.permissions.length) {
                localStorage.setItem(
                    this.STORAGE_KEYS.PERMISSIONS,
                    JSON.stringify(this.state.permissions)
                );
            } else {
                localStorage.removeItem(this.STORAGE_KEYS.PERMISSIONS);
            }
        } catch (error) {
            console.error('Failed to save to storage:', error);
        }
    }

    /**
     * 用户登录
     * @param {String} username 用户名
     * @param {String} password 密码
     * @returns {Promise<Object>} 登录结果
     */
    async login(username, password) {
        try {
            this.state.isLoading = true;
            
            // 调用登录接口
            const response = await $.ajax({
                url: '/api/auth/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ username, password })
            });

            if (response.code === 200) {
                // 保存token
                this.state.token = response.data.token;
                // 获取并保存用户信息
                await this.fetchUserInfo();
                // 获取并保存权限信息
                await this.fetchPermissions();
                // 保存到本地存储
                this._saveToStorage();
                // 触发登录成功事件
                eventBus.emit('userLogin', this.state.userInfo);
                
                return {
                    success: true,
                    data: this.state.userInfo
                };
            }
            
            return {
                success: false,
                message: response.message || '登录失败'
            };
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: '登录失败，请稍后重试'
            };
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * 获取用户信息
     * @returns {Promise<Object>} 用户信息
     */
    async fetchUserInfo() {
        try {
            const response = await $.ajax({
                url: '/api/users/current',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.state.token}`
                }
            });

            if (response.code === 200) {
                this.state.userInfo = response.data;
                this._saveToStorage();
                return response.data;
            }
            
            throw new Error(response.message || '获取用户信息失败');
        } catch (error) {
            console.error('Fetch user info failed:', error);
            throw error;
        }
    }

    /**
     * 获取用户权限
     * @returns {Promise<Array>} 权限列表
     */
    async fetchPermissions() {
        try {
            const response = await $.ajax({
                url: '/api/users/permissions',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.state.token}`
                }
            });

            if (response.code === 200) {
                this.state.permissions = response.data;
                this._saveToStorage();
                return response.data;
            }
            
            throw new Error(response.message || '获取权限信息失败');
        } catch (error) {
            console.error('Fetch permissions failed:', error);
            throw error;
        }
    }

    /**
     * 退出登录
     * @returns {Promise<Boolean>} 是否成功退出
     */
    async logout() {
        try {
            // 调用退出接口
            await $.ajax({
                url: '/api/auth/logout',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.state.token}`
                }
            });
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            // 清除用户信息
            this.clearUserInfo();
            // 触发登出事件
            eventBus.emit('userLogout');
        }
        
        return true;
    }

    /**
     * 清除用户信息
     */
    clearUserInfo() {
        // 清除状态
        this.state.token = null;
        this.state.userInfo = null;
        this.state.permissions = [];
        
        // 清除存储
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    /**
     * 更新用户信息
     * @param {Object} userInfo 用户信息
     */
    updateUserInfo(userInfo) {
        this.state.userInfo = {
            ...this.state.userInfo,
            ...userInfo
        };
        this._saveToStorage();
        // 触发用户信息更新事件
        eventBus.emit('userUpdate', this.state.userInfo);
    }

    /**
     * 获取当前用户信息
     * @returns {Object} 用户信息
     */
    getCurrentUser() {
        return this.state.userInfo;
    }

    /**
     * 获取JWT Token
     * @returns {String} token
     */
    getToken() {
        return this.state.token;
    }

    /**
     * 检查是否已登录
     * @returns {Boolean} 是否已登录
     */
    isLoggedIn() {
        return !!this.state.token && !!this.state.userInfo;
    }

    /**
     * 检查是否有指定权限
     * @param {String} permission 权限标识
     * @returns {Boolean} 是否有权限
     */
    hasPermission(permission) {
        return this.state.permissions.includes(permission);
    }

    /**
     * 检查是否有指定角色
     * @param {String} role 角色标识
     * @returns {Boolean} 是否有角色
     */
    hasRole(role) {
        return this.state.userInfo?.role === role;
    }

    /**
     * 获取用户权限列表
     * @returns {Array} 权限列表
     */
    getPermissions() {
        return [...this.state.permissions];
    }
}

// 导出单例实例
export const userStore = new UserStore();
export default UserStore;