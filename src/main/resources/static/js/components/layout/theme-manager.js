/**
 * theme-manager.js
 * 主题管理核心类
 */
import ThemeConstants from '../../constants/theme-constants.js';
import ThemeStore from '../../stores/theme-store.js';
import ThemeUtils from '../../utils/theme-utils';

class ThemeManager {
    constructor() {
        // 初始化存储
        this.store = new ThemeStore();
        
        // 当前状态
        this.currentTheme = null;
        this.userId = null;
        this.isInitialized = false;
        
        // 绑定方法
        this._handleSystemThemeChange = this._handleSystemThemeChange.bind(this);
    }

    /**
     * 初始化主题管理器
     * @param {number} userId - 用户ID（可选）
     */
    async init(userId) {
        if (this.isInitialized) return;

        try {
            // 设置用户ID
            this.userId = userId;

            // 加载系统预设主题
            await this._loadSystemThemes();

            // 如果有用户ID，加载用户主题
            if (userId) {
                await this._loadUserThemes();
            }

            // 应用上次使用的主题或默认主题
            const lastThemeId = localStorage.getItem(ThemeConstants.STORAGE_KEYS.CURRENT_THEME);
            if (lastThemeId && this.store.hasTheme(lastThemeId)) {
                await this.applyTheme(lastThemeId);
            } else {
                await this.applyTheme(this._getDefaultThemeId());
            }

            // 监听系统主题变化
            this._watchSystemTheme();

            this.isInitialized = true;
        } catch (error) {
            console.error('Theme manager initialization failed:', error);
            throw error;
        }
    }

    /**
     * 加载系统预设主题
     */
    async _loadSystemThemes() {
        try {
            const response = await $.ajax({
                url: ThemeConstants.API.GET_THEMES,
                method: 'GET'
            });

            if (response.code === 200) {
                response.data.forEach(theme => {
                    this.store.addTheme({
                        id: theme.themeId,
                        name: theme.themeName,
                        type: theme.themeType,
                        isSystem: true,
                        variables: JSON.parse(theme.configJson)
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load system themes:', error);
            throw error;
        }
    }

    /**
     * 加载用户主题
     */
    async _loadUserThemes() {
        try {
            const response = await $.ajax({
                url: ThemeConstants.API.GET_USER_THEMES,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                response.data.forEach(theme => {
                    this.store.addUserTheme({
                        id: theme.themeId,
                        name: theme.themeName,
                        type: ThemeConstants.THEME_TYPE.CUSTOM,
                        variables: JSON.parse(theme.configJson),
                        isSystem: false
                    });
                });
            }
        } catch (error) {
            console.error('Failed to load user themes:', error);
            throw error;
        }
    }

    /**
     * 应用主题
     * @param {string} themeId - 主题ID
     */
    async applyTheme(themeId) {
        const theme = this.store.getTheme(themeId);
        if (!theme) {
            throw new Error(`Theme ${themeId} not found`);
        }

        try {
            // 应用CSS变量
            ThemeUtils.applyThemeVariables(theme.variables);
            
            // 更新body类名
            document.body.className = `theme-${theme.type} theme-${themeId}`;
            
            // 保存当前主题
            this.currentTheme = theme;
            localStorage.setItem(ThemeConstants.STORAGE_KEYS.CURRENT_THEME, themeId);

            // 如果是已登录用户，同步到服务器
            if (this.userId) {
                await this._syncUserCurrentTheme(themeId);
            }

            // 触发主题变更事件
            this._emitThemeChange(theme);

            return true;
        } catch (error) {
            console.error('Failed to apply theme:', error);
            throw error;
        }
    }

    /**
     * 创建新主题
     * @param {Object} config - 主题配置
     */
    async createTheme(config) {
        // 验证配置
        if (!ThemeUtils.validateThemeConfig(config)) {
            throw new Error('Invalid theme configuration');
        }

        // 生成主题ID
        const themeId = `theme_${Date.now()}`;

        // 创建主题对象
        const theme = {
            id: themeId,
            name: config.name,
            type: config.type || ThemeConstants.THEME_TYPE.CUSTOM,
            variables: ThemeUtils.normalizeThemeVariables(config.variables),
            isSystem: false
        };

        try {
            // 如果是已登录用户，保存到服务器
            if (this.userId) {
                const response = await $.ajax({
                    url: ThemeConstants.API.SAVE_THEME,
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    data: JSON.stringify({
                        themeName: theme.name,
                        themeType: theme.type,
                        configJson: JSON.stringify(theme.variables)
                    })
                });

                if (response.code === 200) {
                    theme.id = response.data.themeId;
                }
            }

            // 添加到存储
            this.store.addTheme(theme);

            // 触发主题保存事件
            this._emitThemeSaved(theme);

            return theme.id;
        } catch (error) {
            console.error('Failed to create theme:', error);
            throw error;
        }
    }

    /**
     * 删除主题
     * @param {string} themeId - 主题ID
     */
    async deleteTheme(themeId) {
        const theme = this.store.getTheme(themeId);
        if (!theme) return false;

        // 不能删除系统主题
        if (theme.isSystem) {
            throw new Error('Cannot delete system theme');
        }

        try {
            // 如果是当前主题，切换到默认主题
            if (this.currentTheme?.id === themeId) {
                await this.applyTheme(this._getDefaultThemeId());
            }

            // 如果是已登录用户，从服务器删除
            if (this.userId) {
                await $.ajax({
                    url: ThemeConstants.API.DELETE_THEME.replace('{themeId}', themeId),
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
            }

            // 从存储中删除
            this.store.removeTheme(themeId);

            // 触发主题删除事件
            this._emitThemeDeleted(themeId);

            return true;
        } catch (error) {
            console.error('Failed to delete theme:', error);
            throw error;
        }
    }

    /**
     * 同步用户当前主题到服务器
     * @param {string} themeId - 主题ID
     */
    async _syncUserCurrentTheme(themeId) {
        try {
            await $.ajax({
                url: ThemeConstants.API.SET_CURRENT_THEME,
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                data: JSON.stringify({ themeId })
            });
        } catch (error) {
            console.error('Failed to sync user current theme:', error);
            throw error;
        }
    }

    /**
     * 获取默认主题ID
     */
    _getDefaultThemeId() {
        return ThemeConstants.THEME_TYPE.LIGHT;
    }

    /**
     * 监听系统主题变化
     */
    _watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addListener(this._handleSystemThemeChange);
    }

    /**
     * 处理系统主题变化
     */
    _handleSystemThemeChange(e) {
        if (this.currentTheme?.followSystem) {
            this.applyTheme(e.matches ? 'dark' : 'light');
        }
    }

    /**
     * 触发主题变更事件
     */
    _emitThemeChange(theme) {
        const event = new CustomEvent(ThemeConstants.EVENTS.THEME_CHANGED, {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }

    /**
     * 触发主题保存事件
     */
    _emitThemeSaved(theme) {
        const event = new CustomEvent(ThemeConstants.EVENTS.THEME_SAVED, {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }

    /**
     * 触发主题删除事件
     */
    _emitThemeDeleted(themeId) {
        const event = new CustomEvent(ThemeConstants.EVENTS.THEME_DELETED, {
            detail: { themeId }
        });
        document.dispatchEvent(event);
    }

    /**
     * 获取当前主题
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * 获取所有主题
     */
    getAllThemes() {
        return this.store.getAllThemes();
    }

    /**
     * 获取用户主题
     */
    getUserThemes() {
        return this.store.getUserThemes();
    }

    /**
     * 析构函数
     */
    destroy() {
        // 移除系统主题监听
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.removeListener(this._handleSystemThemeChange);
        
        // 清理状态
        this.currentTheme = null;
        this.userId = null;
        this.isInitialized = false;
        
        // 清理存储
        this.store.clear();
    }
}

export default ThemeManager;