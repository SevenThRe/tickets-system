/**
 * theme-constants.js
 * 主题系统常量定义
 */

const ThemeConstants = {
    // 主题类型
    THEME_TYPE: {
        LIGHT: 'light',
        DARK: 'dark',
        CUSTOM: 'custom'
    },

    // 变量类别
    VARIABLE_CATEGORY: {
        COLORS: 'colors',
        TYPOGRAPHY: 'typography',
        SPACING: 'spacing',
        BORDERS: 'borders',
        SHADOWS: 'shadows',
        ANIMATIONS: 'animations'
    },

    // 主题变量默认值
    DEFAULT_VARIABLES: {
        colors: {
            // 品牌色 这个是主题的主色调，当设计navbar时，可以用这个色调作为navbar的背景色
            brand: {
                primary: '#3f6ad8',
                secondary: '#6c757d',
                success: '#3ac47d',
                info: '#16aaff',
                warning: '#f7b924',
                danger: '#d92550'
            },
            // 文本色
            text: {
                primary: '#495057',
                secondary: '#6c757d',
                muted: '#999999',
                light: '#f8f9fa',
                dark: '#343a40'
            },
            // 背景色
            background: {
                body: '#f8f9fa',
                component: '#ffffff',
                active: '#e9ecef',
                hover: '#f8f9fa'
            },
            // 边框色
            border: {
                light: '#e9ecef',
                normal: '#dee2e6',
                dark: '#343a40'
            }
        },
        typography: {
            fontFamily: {
                base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial',
                mono: 'SFMono-Regular, Menlo, Monaco, Consolas'
            },
            fontSize: {
                xs: '12px',
                sm: '14px',
                base: '16px',
                lg: '18px',
                xl: '20px',
                xxl: '24px'
            },
            fontWeight: {
                light: '300',
                normal: '400',
                medium: '500',
                bold: '700'
            },
            lineHeight: {
                tight: '1.25',
                normal: '1.5',
                loose: '1.75'
            }
        },
        spacing: {
            base: '4px',
            xs: '0.25rem',
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem'
        },
        borders: {
            width: {
                none: '0',
                thin: '1px',
                medium: '2px',
                thick: '4px'
            },
            radius: {
                none: '0',
                sm: '0.25rem',
                md: '0.5rem',
                lg: '1rem',
                full: '9999px'
            },
            style: {
                solid: 'solid',
                dashed: 'dashed',
                dotted: 'dotted'
            }
        },
        shadows: {
            none: 'none',
            sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px rgba(0, 0, 0, 0.1)',
            lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
            xl: '0 20px 25px rgba(0, 0, 0, 0.1)'
        },
        animations: {
            duration: {
                fast: '150ms',
                normal: '300ms',
                slow: '500ms'
            },
            timing: {
                linear: 'linear',
                ease: 'ease',
                easeIn: 'ease-in',
                easeOut: 'ease-out',
                easeInOut: 'ease-in-out'
            }
        }
    },

    // 事件名称
    EVENTS: {
        THEME_CHANGED: 'theme:changed',
        THEME_SAVED: 'theme:saved',
        THEME_DELETED: 'theme:deleted',
        VARIABLE_CHANGED: 'theme:variable:changed'
    },

    // 本地存储键名
    STORAGE_KEYS: {
        CURRENT_THEME: 'current_theme',
        USER_THEMES: 'user_themes'
    },

    // API 路径
    API: {
        GET_THEMES: '/api/system/themes',
        GET_USER_THEMES: '/api/user/themes',
        SAVE_THEME: '/api/user/themes',
        SET_CURRENT_THEME: '/api/user/themes/current',
        DELETE_THEME: '/api/user/themes/' //+ {themeId}
    }
};

// 导出常量
export default ThemeConstants;
