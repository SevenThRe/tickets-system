/**
 * theme-utils.js
 * 主题工具类，提供主题相关的工具方法
 */
import ThemeConstants from '../constants/theme-constants';

class ThemeUtils {
    /**
     * 应用主题变量到DOM
     * @param {Object} variables 主题变量对象
     */
    static applyThemeVariables(variables) {
        const root = document.documentElement;
        const flattenVars = this.flattenThemeVariables(variables);
        
        Object.entries(flattenVars).forEach(([key, value]) => {
            root.style.setProperty(`--${key}`, value);
        });
    }

    /**
     * 扁平化主题变量
     * @param {Object} variables 主题变量对象
     * @param {String} prefix 变量前缀
     * @returns {Object} 扁平化后的变量对象
     */
    static flattenThemeVariables(variables, prefix = '') {
        return Object.entries(variables).reduce((acc, [key, value]) => {
            const newPrefix = prefix ? `${prefix}-${key}` : key;
            
            if (typeof value === 'object' && value !== null) {
                return {
                    ...acc,
                    ...this.flattenThemeVariables(value, newPrefix)
                };
            }
            
            return {
                ...acc,
                //ES6动态属性名
                [newPrefix]: value
            };
        }, {});
    }

    /**
     * 生成深色主题变量
     * @param {Object} lightTheme 浅色主题变量
     * @returns {Object} 深色主题变量
     */
    static generateDarkTheme(lightTheme) {
        const darkTheme = JSON.parse(JSON.stringify(lightTheme));
        
        // 转换颜色
        if (darkTheme.colors) {
            // 品牌色反转
            darkTheme.colors.brand = this._invertBrandColors(lightTheme.colors.brand);
            
            // 文本颜色反转
            darkTheme.colors.text = {
                primary: '#ffffff',
                secondary: '#cccccc',
                muted: '#999999',
                light: '#666666',
                dark: '#eeeeee'
            };
            
            // 背景色反转
            darkTheme.colors.background = {
                body: '#1a1a1a',
                component: '#2d2d2d',
                active: '#3d3d3d',
                hover: '#4d4d4d'
            };
            
            // 边框色反转
            darkTheme.colors.border = {
                light: '#3d3d3d',
                normal: '#4d4d4d',
                dark: '#666666'
            };
        }

        return darkTheme;
    }

    /**
     * 反转品牌颜色
     * @private
     * @param {Object} brandColors 品牌颜色对象
     * @returns {Object} 反转后的品牌颜色
     */
    static _invertBrandColors(brandColors) {
        return Object.entries(brandColors).reduce((acc, [key, value]) => {
            acc[key] = this._adjustColorForDarkTheme(value);
            return acc;
        }, {});
    }

    /**
     * 调整颜色适应深色主题
     * @private
     * @param {String} color 颜色值
     * @returns {String} 调整后的颜色
     */
    static _adjustColorForDarkTheme(color) {
        const rgb = this._hexToRgb(color);
        if (!rgb) return color;

        // 增加亮度，但保持色调
        const hsl = this._rgbToHsl(rgb.r, rgb.g, rgb.b);
        hsl.l = 1 - hsl.l * 0.8; // 反转亮度并调整

        const adjustedRgb = this._hslToRgb(hsl.h, hsl.s, hsl.l);
        return this._rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
    }

    /**
     * 验证主题配置
     * @param {Object} config 主题配置
     * @returns {Boolean} 是否有效
     */
    static validateThemeConfig(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }

        // 必需字段检查
        const requiredFields = ['name', 'type', 'variables'];
        if (!requiredFields.every(field => field in config)) {
            return false;
        }

        // 类型检查
        if (!Object.values(ThemeConstants.THEME_TYPE).includes(config.type)) {
            return false;
        }

        // 变量结构检查
        const requiredVariableCategories = Object.values(ThemeConstants.VARIABLE_CATEGORY);
        return requiredVariableCategories.every(category => 
            category in config.variables
        );
    }

    /**
     * 规范化主题变量
     * @param {Object} variables 原始变量
     * @returns {Object} 规范化后的变量
     */
    static normalizeThemeVariables(variables) {
        const normalized = {};
        
        Object.entries(variables).forEach(([category, values]) => {
            if (category in ThemeConstants.DEFAULT_VARIABLES) {
                normalized[category] = this._mergeWithDefault(
                    values,
                    ThemeConstants.DEFAULT_VARIABLES[category]
                );
            }
        });

        return normalized;
    }

    /**
     * 与默认值合并
     * @private
     * @param {Object} values 当前值
     * @param {Object} defaults 默认值
     * @returns {Object} 合并后的值
     */
    static _mergeWithDefault(values, defaults) {
        const result = { ...defaults };
        
        Object.entries(values).forEach(([key, value]) => {
            if (key in defaults) {
                if (typeof value === 'object' && value !== null) {
                    result[key] = this._mergeWithDefault(value, defaults[key]);
                } else {
                    result[key] = value;
                }
            }
        });

        return result;
    }

    /**
     * 颜色转换相关工具方法
     */
    static _hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static _rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = Math.round(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    static _rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return { h, s, l };
    }

    static _hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
}

export default ThemeUtils;