/**
 * theme-constants.js
 * 主题系统常量配置
 */
window.ThemeConst = {
    // 主题类型定义
    TYPES: {
        LIGHT: 'light',
        DARK: 'dark',
        CUSTOM: 'custom'
    },

    // 主题变量类别
    VARIABLE_CATEGORY: {
        COLORS: 'colors',
        TYPOGRAPHY: 'typography',
        SPACING: 'spacing',
        BORDERS: 'borders',
        SHADOWS: 'shadows'
    },

    // 默认主题变量
    DEFAULT_VARIABLES: {
        colors: {
            // 主要颜色
            primary: {
                base: '#3f6ad8',
                light: '#6f8be7',
                dark: '#2952b3',
                contrast: '#ffffff'
            },
            // 次要颜色
            secondary: {
                base: '#6c757d',
                light: '#989ea4',
                dark: '#5a6268',
                contrast: '#ffffff'
            },
            // 功能色
            success: {
                base: '#3ac47d',
                light: '#5dd999',
                dark: '#2e9d64',
                contrast: '#ffffff'
            },
            danger: {
                base: '#d92550',
                light: '#e25d7b',
                dark: '#b11d42',
                contrast: '#ffffff'
            },
            warning: {
                base: '#f7b924',
                light: '#f9ca54',
                dark: '#d69e1f',
                contrast: '#000000'
            },
            info: {
                base: '#16aaff',
                light: '#44bdff',
                dark: '#0f87cc',
                contrast: '#ffffff'
            },
            // 中性色
            gray: {
                50: '#f8f9fa',
                100: '#f0f2f4',
                200: '#e9ecef',
                300: '#dee2e6',
                400: '#ced4da',
                500: '#adb5bd',
                600: '#6c757d',
                700: '#495057',
                800: '#343a40',
                900: '#212529'
            },
            // 背景色
            background: {
                body: '#f8f9fa',
                component: '#ffffff',
                active: '#e9ecef',
                hover: '#f8f9fa',
                selected: '#e8f0fe'
            },
            // 边框色
            border: {
                light: '#e9ecef',
                normal: '#dee2e6',
                dark: '#343a40',
                focus: '#80bdff'
            },
            // 文本色
            text: {
                primary: '#495057',
                secondary: '#6c757d',
                light: '#adb5bd',
                muted: '#6c757d',
                white: '#ffffff',
                dark: '#212529'
            }
        },
        typography: {
            // 字体族
            fontFamily: {
                base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                heading: 'inherit',
                monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            },
            // 字号
            fontSize: {
                base: '1rem',
                sm: '0.875rem',
                lg: '1.25rem',
                heading: {
                    h1: '2.5rem',
                    h2: '2rem',
                    h3: '1.75rem',
                    h4: '1.5rem',
                    h5: '1.25rem',
                    h6: '1rem'
                }
            },
            // 字重
            fontWeight: {
                light: 300,
                normal: 400,
                medium: 500,
                semibold: 600,
                bold: 700
            },
            // 行高
            lineHeight: {
                none: 1,
                tight: 1.25,
                normal: 1.5,
                loose: 2
            }
        },
        spacing: {
            // 基础间距
            base: '1rem',
            // 间距尺寸
            sizes: {
                0: '0',
                1: '0.25rem',
                2: '0.5rem',
                3: '1rem',
                4: '1.5rem',
                5: '3rem'
            },
            // 组件间距
            component: {
                sm: '0.5rem',
                md: '1rem',
                lg: '1.5rem'
            }
        },
        borders: {
            // 边框宽度
            width: {
                0: '0',
                1: '1px',
                2: '2px',
                3: '3px',
                4: '4px'
            },
            // 圆角
            radius: {
                none: '0',
                sm: '0.25rem',
                md: '0.375rem',
                lg: '0.5rem',
                pill: '50rem',
                circle: '50%'
            }
        },
        shadows: {
            // 阴影
            none: 'none',
            sm: '0 .125rem .25rem rgba(0,0,0,.075)',
            md: '0 .5rem 1rem rgba(0,0,0,.15)',
            lg: '0 1rem 3rem rgba(0,0,0,.175)',
            inset: 'inset 0 1px 2px rgba(0,0,0,.075)'
        }
    },

    // 组件样式配置
    COMPONENTS: {
        // 按钮样式
        button: {
            paddingY: '.375rem',
            paddingX: '.75rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            borderRadius: '.25rem',
            // 尺寸变体
            sizes: {
                sm: {
                    paddingY: '.25rem',
                    paddingX: '.5rem',
                    fontSize: '.875rem',
                    lineHeight: '1.5',
                    borderRadius: '.2rem'
                },
                lg: {
                    paddingY: '.5rem',
                    paddingX: '1rem',
                    fontSize: '1.25rem',
                    lineHeight: '1.5',
                    borderRadius: '.3rem'
                }
            }
        },
        // 表单控件样式
        input: {
            paddingY: '.375rem',
            paddingX: '.75rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            borderRadius: '.25rem',
            borderWidth: '1px'
        },
        // 卡片样式
        card: {
            borderRadius: '.25rem',
            borderWidth: '1px',
            padding: '1.25rem'
        },
        // 表格样式
        table: {
            cell: {
                paddingY: '.75rem',
                paddingX: '.75rem'
            },
            borderWidth: '1px'
        }
    },

    // 响应式断点
    BREAKPOINTS: {
        xs: '0',
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px'
    },

    // 过渡动画
    TRANSITIONS: {
        timing: {
            base: '.15s ease-in-out'
        }
    },

    // z-index层级管理
    Z_INDEX: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070
    }
};

// 主题工具方法
window.ThemeConst.utils = {
    /**
     * 获取默认主题变量
     * @returns {Object} 默认主题变量
     */
    getDefaultVariables() {
        return JSON.parse(JSON.stringify(window.ThemeConst.DEFAULT_VARIABLES));
    },

    /**
     * 生成深色主题变量
     * @param {Object} lightTheme 浅色主题变量
     * @returns {Object} 深色主题变量
     */
    generateDarkTheme(lightTheme) {
        const darkTheme = this.getDefaultVariables();

        // 调整颜色
        darkTheme.colors.background.body = '#1a1a1a';
        darkTheme.colors.background.component = '#2d2d2d';
        darkTheme.colors.text.primary = '#ffffff';
        darkTheme.colors.text.secondary = '#cccccc';
        // ... 其他深色主题颜色调整

        return darkTheme;
    },

    /**
     * 验证主题变量
     * @param {Object} variables 主题变量
     * @returns {Boolean} 是否有效
     */
    validateThemeVariables(variables) {
        const requiredCategories = Object.values(window.ThemeConst.VARIABLE_CATEGORY);
        return requiredCategories.every(category => category in variables);
    }
};