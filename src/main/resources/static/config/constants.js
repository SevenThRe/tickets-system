/**
 * constants.js
 * 系统常量配置文件
 * 定义所有全局常量和配置项
 */
window.Const = {
    // 基础配置
    BASE_URL: '/api',
    JWT: {
        TOKEN_KEY: 'auth_token',
        HEADER_KEY: 'Authorization',
        TOKEN_PREFIX: 'Bearer '
    },
    CACHE: {
        PREFIX: 'cache_',
        EXPIRE_TIME: 30 * 60 * 1000, // 30分钟
        CLEANUP_INTERVAL: 60 * 1000   // 1分钟
    },
    
    // 业务模块相关常量
    BUSINESS: {
        TICKET: {
            STATUS: Object.freeze({
                PENDING: 0,
                PROCESSING: 1,
                COMPLETED: 2,
                CLOSED: 3
            }),
            STATUS_MAP: {
                type: {
                    0: 'PENDING',
                    1: 'PROCESSING',
                    2: 'COMPLETED',
                    3: 'CLOSED'
                },
                text: {
                    0: '待处理',
                    1: '处理中',
                    2: '已完成',
                    3: '已关闭'
                },
                class: {
                    0: 'text-normal',
                    1: 'text-warning',
                    2: 'text-success',
                    3: 'text-muted'
                }
            },
            PRIORITY: Object.freeze({
                NORMAL: 0,
                URGENT: 1,
                CRITICAL: 2
            }),
            PRIORITY_MAP: {
                text: {
                    0: '普通',
                    1: '紧急',
                    2: '非常紧急'
                },
                class: {
                    0: 'text-normal',
                    1: 'text-warning',
                    2: 'text-danger'
                }
            }
        },
        USER: {
            ROLES: Object.freeze({
                ADMIN: 'admin',
                USER: 'user',
                GUEST: 'guest'
            }),
            STATUS: Object.freeze({
                ACTIVE: 1,
                INACTIVE: 0
            })
        },
        DEPARTMENT: {
            MAX_LEVEL: 5, // 最大层级
            MAX_CHILDREN: 50, // 每个部门最大子部门数
            STATUS: Object.freeze({
                ACTIVE: 1,
                INACTIVE: 0
            }),
            STATUS_MAP: {
                text: {
                    1: '正常',
                    0: '禁用'
                },
                class: {
                    1: 'text-success',
                    0: 'text-danger'
                }
            }
        }
    },
    
    // UI相关常量
    UI: {
        THEME: {
            STORAGE_KEY: 'current_theme',
            TYPES: Object.freeze({
                LIGHT: 'light',
                DARK: 'dark',
                CUSTOM: 'custom'
            }),
            DEFAULT: 'light'
        },
        PAGINATION: {
            PAGE_SIZES: [10, 20, 50, 100],
            DEFAULT_PAGE_SIZE: 10,
            DEFAULT_CURRENT: 1
        }
    },
    
    // API相关常量
    API: {
        AUTH: {
            POST_LOGIN: '/auth/login',
            POST_LOGOUT: '/auth/logout',
            POST_REFRESH: '/auth/refresh',
            POST_RESET_PASSWORD: '/auth/reset-password'
        },
        USER: {
            GET_LIST: '/users',
            GET_CURRENT: '/users/current',
            GET_PERMISSIONS: '/users/permissions',
            PUT_UPDATE_PROFILE: '/users/profile',
            PUT_CHANGE_PASSWORD: '/users/password'
        },
        TICKET: {
            GET_LIST: '/tickets',
            POST_CREATE: '/tickets',
            GET_DETAIL: id => `/tickets/${id}`,
            PUT_PROCESS: id => `/tickets/${id}/process`,
            PUT_RESOLVE: id => `/tickets/${id}/resolve`,
            POST_TRANSFER: id => `/tickets/${id}/transfer`,
            PUT_CLOSE: id => `/tickets/${id}/close`,
            POST_UPLOAD: '/tickets/attachments'
        },
        DEPARTMENT: {
            GET_LIST: '/departments',
            GET_TREE: '/departments/tree',
            GET_DETAIL: id => `/departments/${id}`,
            POST_CREATE: '/departments',
            PUT_UPDATE: id => `/departments/${id}`,
            DELETE: id => `/departments/${id}`,
            GET_MEMBERS: id => `/departments/${id}/members`,
            POST_ADD_MEMBER: id => `/departments/${id}/members`,
            DELETE_MEMBER: (deptId, memberId) => `/departments/${deptId}/members/${memberId}`,
            PUT_MANAGER: id => `/departments/${id}/manager`,
            PUT_ORDER: '/departments/order',
            GET_AVAILABLE_MANAGERS: '/departments/available-managers'
        },
        SYSTEM: {
            GET_THEMES: '/system/themes',
                POST_SET_THEME: '/system/theme/set',
                GET_THEME_PREVIEW: '/system/theme/preview',
                POST_SAVE_THEME: '/system/theme/save',
                GET_DEPARTMENT_LIST: '/system/departments',
                GET_ROLE_LIST: '/system/roles'
        }
    },
    // 错误码和消息
    ERROR_CODES: {
        NETWORK_TIMEOUT: 1001,
            NETWORK_CONNECTION: 1002,
            SERVER_ERROR: 1003,
            UNKNOWN_ERROR: 1004,
            UNAUTHORIZED: 2001,
            FORBIDDEN: 2002,
            TOKEN_EXPIRED: 2003,
            LOGIN_FAILED: 2004,
            VALIDATION_ERROR: 3001
    },
    MESSAGES: {
        ERROR: {
            NETWORK: {
                TIMEOUT: '请求超时，请稍后重试',
                    CONNECTION: '网络连接失败，请检查网络',
                    SERVER: '服务器错误，请稍后重试',
                    UNKNOWN: '未知错误，请稍后重试'
            },
            AUTH: {
                UNAUTHORIZED: '请先登录',
                    FORBIDDEN: '无权访问',
                    TOKEN_EXPIRED: '登录已过期，请重新登录',
                    LOGIN_FAILED: '登录失败，用户名或密码错误'
            },
            VALIDATION: {
                USERNAME_REQUIRED: '请输入用户名',
                    PASSWORD_REQUIRED: '请输入密码',
                    USERNAME_FORMAT: '用户名只能包含字母、数字和下划线',
                    USERNAME_LENGTH: '用户名长度必须在3-20个字符之间',
                    PASSWORD_LENGTH: '密码长度必须在6-20个字符之间',
                    EMAIL_FORMAT: '邮箱格式不正确',
                    MOBILE_FORMAT: '手机号格式不正确',
                    UNKNOWN: '验证失败'
            },
            TICKET: {
                NOT_FOUND: '工单不存在',
                    CREATE_FAILED: '创建工单失败',
                    UPDATE_FAILED: '更新工单失败',
                    DELETE_FAILED: '删除工单失败',
                    ASSIGN_FAILED: '分配工单失败',
                    COMMENT_FAILED: '评论失败'
            }
        },
        SUCCESS: {
            AUTH: {
                LOGIN: '登录成功',
                    LOGOUT: '退出成功',
                    PASSWORD_RESET: '密码重置成功',
                    PASSWORD_CHANGE: '密码修改成功'
            },
            TICKET: {
                CREATE: '工单创建成功',
                    UPDATE: '工单更新成功',
                    DELETE: '工单删除成功',
                    ASSIGN: '工单分配成功',
                    COMMENT: '评论成功'
            },
            THEME: {
                CREATE: '主题创建成功',
                    UPDATE: '主题更新成功',
                    DELETE: '主题删除成功',
                    SAVE: '主题保存成功',
                    APPLY: '主题应用成功'
            }
        }
    },
    // 时间格式常量
    TIME_FORMAT: {
        DATE: 'YYYY-MM-DD',
        TIME: 'HH:mm:ss',
        DATETIME: 'YYYY-MM-DD HH:mm:ss'
    },

    // 数据验证规则
    VALIDATION_RULES: {
        USERNAME: {
            min: 3,
            max: 20,
            pattern: 'REGEX.USERNAME'
        }
    }
};

// 辅助函数：替换URL中的占位符
window.Const.replaceUrlParams = function(url, params) {
    if (!params) return url;
    return url.replace(/\{(\w+)\}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
    });
};

// 防止常量被修改
Object.freeze(window.Const);

// 添加命名空间前缀
window.Const.NAMESPACE = 'Const_';
