/**
 * 系统全局配置
 * 集中管理所有常量和配置项
 */
export const CONFIG = {
    // API基础URL
    BASE_URL: '/api',

    // JWT配置
    JWT: {
        TOKEN_KEY: 'auth_token',
        HEADER_KEY: 'Authorization'
    },

    // 缓存配置
    CACHE: {
        PREFIX: 'cache_',
        EXPIRE_TIME: 30 * 60 * 1000,
        CLEANUP_INTERVAL: 60 * 1000
    },

    // 主题配置
    THEME: {
        STORAGE_KEY: 'current_theme',
        TYPES: {
            LIGHT: 'light',
            DARK: 'dark',
            CUSTOM: 'custom'
        }
    },

    // 工单配置
    TICKET: {
        STATUS: {
            PENDING: 0,   // 待处理
            PROCESSING: 1, // 处理中
            COMPLETED: 2,  // 已完成
            CLOSED: 3     // 已关闭
        },
        PRIORITY: {
            NORMAL: 0,    // 普通
            URGENT: 1,    // 紧急
            CRITICAL: 2   // 非常紧急
        }
    },

    // API接口路径
    API: {
        AUTH: {
            LOGIN: '/auth/login',
            LOGOUT: '/auth/logout'
        },
        USER: {
            CURRENT: '/users/current',
            PERMISSIONS: '/users/permissions'
        },
        TICKET: {
            LIST: '/tickets/list',
            CREATE: '/tickets/create',
            UPDATE: '/tickets/update'
        },
        SYSTEM: {
            THEMES: '/system/themes',
            DICT: '/system/dict'
        }
    },

    // 消息配置
    MESSAGE: {
        ERROR: {
            NETWORK: '网络错误，请稍后重试',
            SERVER: '服务器错误',
            TIMEOUT: '请求超时',
            UNAUTHORIZED: '未授权或登录已过期'
        }
    }
};