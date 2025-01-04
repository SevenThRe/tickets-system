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
            THEMES: '/system/themes', // 获取主题列表
            SET_THEME: '/system/theme/set',// 设置当前主题
            THEME_PREVIEW: '/system/theme/preview', // 预览当前主题
            SAVE_THEME: '/system/theme/save' // 保存主题
        }
    },

    // 消息配置
    MESSAGE: {
        ERROR: {
            NETWORK: '网络错误，请稍后重试',
            SERVER: '服务器错误',
            TIMEOUT: '请求超时',
            UNAUTHORIZED: '未授权或登录已过期',
            FORBIDDEN: '无访问权限',
            NOT_FOUND: '资源不存在',
            VALIDATION: {
                USERNAME_REQUIRED: '请输入用户名',
                PASSWORD_REQUIRED: '请输入密码',
                USERNAME_FORMAT: '用户名只能包含字母、数字和下划线',
                USERNAME_LENGTH: '用户名长度必须在3-20个字符之间',
                PASSWORD_LENGTH: '密码长度必须在6-20个字符之间'
                // ...
            }
        },
        SUCCESS: {
            LOGOUT: '退出登录成功',
            CREATE_TICKET: '创建工单成功',
            UPDATE_TICKET: '更新工单成功',
            DELETE_TICKET: '删除工单成功',
            CREATE_THEME: '创建主题成功',
            UPDATE_THEME: '更新主题成功',
            DELETE_THEME: '删除主题成功',
            SET_THEME: '设置主题成功',
            CREATE_USER: '创建用户成功',
            UPDATE_USER: '更新用户成功',
            DELETE_USER: '删除用户成功',
            UPDATE_PASSWORD: '更新密码成功',
            UPDATE_PROFILE: '更新个人信息成功',
            UPDATE_PERMISSIONS: '更新权限成功',
            UPDATE_ROLE: '更新角色成功',
            UPDATE_DEPARTMENT: '更新部门成功',
            SAVE_THEME: '主题保存成功'
        }

    }
};