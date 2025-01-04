/**
 * theme-store.js
 * 主题数据存储管理
 */

import ThemeConstants from '../constants/theme-constants';
import ThemeUtils from "../utils/theme-utils";

class ThemeStore {
    constructor() {
        // 主题存储
        this.themes = new Map();
        this.userThemes = new Map();
        
        // 默认主题配置
        this._initDefaultThemes();
        
        // 尝试从本地存储恢复用户主题
        this._restoreFromLocal();
    }

    /**
     * 初始化默认主题
     * @private
     */
    _initDefaultThemes() {
        // 浅色主题
        this.addTheme({
            id: 'light',
            name: '浅色主题',
            type: ThemeConstants.THEME_TYPE.LIGHT,
            isSystem: true,
            variables: ThemeConstants.DEFAULT_VARIABLES
        });

        // 深色主题 - 基于默认变量生成深色版本
        this.addTheme({
            id: 'dark',
            name: '深色主题',
            type: ThemeConstants.THEME_TYPE.DARK,
            isSystem: true,
            variables: ThemeUtils.generateDarkTheme(ThemeConstants.DEFAULT_VARIABLES)
        });
    }

    /**
     * 从本地存储恢复数据
     * @private
     */
    _restoreFromLocal() {
        try {
            const savedData = localStorage.getItem('themeStore');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.deserialize(data);
            }
        } catch (error) {
            console.error('Failed to restore theme data from local storage:', error);
        }
    }

    /**
     * 保存到本地存储
     * @private
     */
    _saveToLocal() {
        try {
            const data = this.serialize();
            localStorage.setItem('themeStore', JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save theme data to local storage:', error);
        }
    }

    /**
     * 添加主题
     * @param {Object} theme 主题配置
     */
    addTheme(theme) {
        if (!theme.id) {
            throw new Error('Theme ID is required');
        }
        if (this.hasTheme(theme.id)) {
            throw new Error(`Theme ${theme.id} already exists`);
        }
        this.themes.set(theme.id, theme);
        
        // 如果是用户主题，同时保存到userThemes
        if (!theme.isSystem) {
            this.userThemes.set(theme.id, theme);
            this._saveToLocal();
        }
    }

    /**
     * 更新主题
     * @param {string} themeId 主题ID
     * @param {Object} updates 更新内容
     */
    updateTheme(themeId, updates) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            throw new Error(`Theme ${themeId} not found`);
        }

        if (theme.isSystem) {
            throw new Error('Cannot update system theme');
        }

        const updatedTheme = {
            ...theme,
            ...updates,
            variables: {
                ...theme.variables,
                ...updates.variables
            }
        };

        this.themes.set(themeId, updatedTheme);
        this.userThemes.set(themeId, updatedTheme);
        this._saveToLocal();

        return updatedTheme;
    }

    /**
     * 删除主题
     * @param {string} themeId 主题ID
     */
    removeTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            return false;
        }

        if (theme.isSystem) {
            throw new Error('Cannot remove system theme');
        }

        this.themes.delete(themeId);
        this.userThemes.delete(themeId);
        this._saveToLocal();

        return true;
    }

    /**
     * 获取主题
     * @param {string} themeId 主题ID
     */
    getTheme(themeId) {
        return this.themes.get(themeId);
    }

    /**
     * 获取所有主题
     */
    getAllThemes() {
        return Array.from(this.themes.values());
    }

    /**
     * 获取系统主题
     */
    getSystemThemes() {
        return this.getAllThemes().filter(theme => theme.isSystem);
    }

    /**
     * 获取用户主题
     */
    getUserThemes() {
        return Array.from(this.userThemes.values());
    }

    /**
     * 检查主题是否存在
     * @param {string} themeId 主题ID
     */
    hasTheme(themeId) {
        return this.themes.has(themeId);
    }

    /**
     * 复制主题
     * @param {string} sourceId 源主题ID
     * @param {string} newName 新主题名称
     */
    cloneTheme(sourceId, newName) {
        const sourceTheme = this.getTheme(sourceId);
        if (!sourceTheme) {
            throw new Error(`Theme ${sourceId} not found`);
        }

        const clonedTheme = {
            ...sourceTheme,
            id: `theme_${Date.now()}`,
            name: newName || `${sourceTheme.name} Copy`,
            isSystem: false,
            variables: JSON.parse(JSON.stringify(sourceTheme.variables))
        };

        this.addTheme(clonedTheme);
        return clonedTheme;
    }

    /**
     * 导出主题配置
     * @param {string} themeId 主题ID
     */
    exportTheme(themeId) {
        const theme = this.getTheme(themeId);
        if (!theme) {
            throw new Error(`Theme ${themeId} not found`);
        }

        return {
            name: theme.name,
            type: theme.type,
            variables: theme.variables
        };
    }

    /**
     * 导入主题配置
     * @param {Object} config 主题配置
     */
    importTheme(config) {
        // 生成新的主题ID
        const themeId = `theme_${Date.now()}`;
        // 创建主题
        const theme = {
            id: themeId,
            name: config.name || 'Imported Theme',
            type: config.type || 'custom',
            isSystem: false,
            // 深拷贝变量
            variables: JSON.parse(JSON.stringify(config.variables)) || {}
        };


        this.addTheme(theme);
        return themeId;
    }

    /**
     * 序列化存储数据
     */
    serialize() {
        return {
            userThemes: Array.from(this.userThemes.entries())
        };
    }

    /**
     * 反序列化数据到存储
     * @param {Object} data 序列化数据
     */
    deserialize(data) {
        if (data.userThemes) {
            data.userThemes.forEach(([id, theme]) => {
                this.addTheme(theme);
            });
        }
    }

    /**
     * 清空存储
     * 注意：不会删除系统主题
     */
    clear() {
        const systemThemes = this.getSystemThemes();
        this.themes.clear();
        this.userThemes.clear();
        
        systemThemes.forEach(theme => this.addTheme(theme));
        this._saveToLocal();
    }
}

export default ThemeStore;