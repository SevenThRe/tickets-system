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
            },
            OPERATION: Object.freeze({
                CREATE: 'CREATE',
                PROCESS: 'PROCESS',
                NOTE: 'NOTE',
                TRANSFER: 'TRANSFER',
                RESOLVE: 'RESOLVE',
                CLOSE: 'CLOSE',
                EVALUATE: 'EVALUATE'
            }),
            OPERATION_MAP: {
                text: {
                    CREATE: '创建工单',
                    PROCESS: '开始处理',
                    NOTE: '添加备注',
                    TRANSFER: '转交工单',
                    RESOLVE: '完成处理',
                    CLOSE: '关闭工单',
                    EVALUATE: '评价工单'
                }
            },
            EVALUATION: {
                MIN_SCORE: 1,
                MAX_SCORE: 5,
                MIN_CONTENT_LENGTH: 5,
                MAX_CONTENT_LENGTH: 500
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
        },
        // 新增部门管理相关的常量
        VALIDATION: {
            NAME: {
                MIN_LENGTH: 2,
                MAX_LENGTH: 50,
                PATTERN: /^[\u4e00-\u9fa5a-zA-Z0-9_-]{2,50}$/  // 中文、字母、数字、下划线、中划线
            },
            CODE: {
                MIN_LENGTH: 2,
                MAX_LENGTH: 10,
                PATTERN: /^[A-Z0-9]{2,10}$/  // 大写字母和数字
            },
            DESCRIPTION: {
                MAX_LENGTH: 200
            },
            ORDER: {
                MIN: 0,
                MAX: 9999
            }
        },
        BASE_ROLE: Object.freeze({
            ADMIN: 'ADMIN',    // 系统管理员
            DEPT: 'DEPT',      // 部门主管
            USER: 'USER'       // 普通用户
        }),
        // 角色相关配置
        ROLE: {
            // 角色状态
            STATUS: Object.freeze({
                ENABLED: 1,   // 启用
                DISABLED: 0   // 禁用
            }),
            STATUS_MAP: {
                text: {
                    1: '启用',
                    0: '禁用'
                },
                class: {
                    1: 'text-success',
                    0: 'text-danger'
                }
            },
            // 角色编码规则
            CODE_PATTERN: /^[A-Z][A-Z0-9_]{2,19}$/,  // 大写字母开头,允许大写字母、数字和下划线
            CODE_MAX_LENGTH: 20,
            NAME_MAX_LENGTH: 50,
            DESCRIPTION_MAX_LENGTH: 200
        },

        // 权限相关配置
        PERMISSION: {
            // 权限类型
            TYPE: Object.freeze({
                MENU: 'MENU',        // 菜单权限
                FUNCTION: 'FUNCTION', // 功能权限
                DATA: 'DATA'         // 数据权限
            }),
            TYPE_MAP: {
                text: {
                    'MENU': '菜单权限',
                    'FUNCTION': '功能权限',
                    'DATA': '数据权限'
                }
            },
            // 权限编码定义
            CODE: {
                // 系统管理权限
                SYSTEM: {
                    VIEW: 'SYSTEM_VIEW',           // 系统管理查看
                    SETTINGS: 'SYSTEM_SETTINGS',   // 系统设置管理
                    MONITOR: 'SYSTEM_MONITOR'      // 系统监控
                },
                // 用户管理权限
                USER: {
                    VIEW: 'USER_VIEW',            // 用户查看
                    CREATE: 'USER_CREATE',        // 用户创建
                    UPDATE: 'USER_UPDATE',        // 用户更新
                    DELETE: 'USER_DELETE',        // 用户删除
                    IMPORT: 'USER_IMPORT',        // 用户导入
                    EXPORT: 'USER_EXPORT'         // 用户导出
                },
                // 部门管理权限
                DEPT: {
                    VIEW: 'DEPT_VIEW',           // 部门查看
                    CREATE: 'DEPT_CREATE',       // 部门创建
                    UPDATE: 'DEPT_UPDATE',       // 部门更新
                    DELETE: 'DEPT_DELETE',       // 部门删除
                    ASSIGN: 'DEPT_ASSIGN'        // 部门人员分配
                },
                // 工单管理权限
                TICKET: {
                    VIEW: 'TICKET_VIEW',         // 工单查看
                    CREATE: 'TICKET_CREATE',     // 工单创建
                    PROCESS: 'TICKET_PROCESS',   // 工单处理
                    TRANSFER: 'TICKET_TRANSFER', // 工单转交
                    CLOSE: 'TICKET_CLOSE',       // 工单关闭
                    DELETE: 'TICKET_DELETE'      // 工单删除
                },
                // 权限管理权限
                PERMISSION: {
                    VIEW: 'PERMISSION_VIEW',     // 权限查看
                    ASSIGN: 'PERMISSION_ASSIGN'  // 权限分配
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
            PUT_CHANGE_PASSWORD: '/users/password',
            PUT_SETTING_UPDATE: '/users/settings',
            GET_SETTING: '/users/settings',
            POST_AVATAR_UPLOAD:'/users/avatar'
        },
        TICKET: {
            GET_LIST: '/tickets',
            GET_MY_TICKETS:'/tickets/my',
            POST_CREATE: '/tickets',
            GET_TODOS: '/tickets/todos',        // 获取待办工单
            GET_RECENT: '/tickets/recent',      // 获取最近工单
            GET_STATISTICS: '/tickets/statistics',  // 获取工单统计
            GET_DETAIL: id => `/tickets/${id}`,       // 获取工单详情
            PUT_PROCESS: id => `/tickets/${id}/process`,  // 提交工单处理
            PUT_UPLOAD: id => `/tickets/${id}/attachments`,  // 上传工单附件
            PUT_RESOLVE: id => `/tickets/${id}/resolve`,
            POST_TRANSFER: id => `/tickets/${id}/transfer`,
            PUT_CLOSE: id => `/tickets/${id}/close`,
            POST_UPLOAD: '/tickets/attachments',
            GET_ATTACHMENT: id => `/tickets/${id}/attachments`,
            DELETE_ATTACHMENT: id => `/attachments/${id}`,
            DOWNLOAD_ATTACHMENT: id => `/attachments/${id}/download`,
            BATCH_DOWNLOAD: '/tickets/attachments/batch-download',
            MAX_PROCESSING_COUNT: 5,    // 单人最大处理中工单数
            MIN_HANDLE_HOURS: 1,       // 最小处理时间(小时)
            MAX_HANDLE_HOURS: 720,     // 最大处理时间(30天)
        },
        REFRESH_INTERVAL: {
            ADMIN: 3 * 60 * 1000,     // 管理员刷新间隔
            DEPT: 5 * 60 * 1000,      // 部门主管刷新间隔
            USER: 10 * 60 * 1000      // 普通用户刷新间隔
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

            // 新增API路径
            GET_ALL: '/departments/all',                    // 获取所有部门(扁平结构)
            GET_CHILDREN: id => `/departments/${id}/children`,  // 获取子部门
            GET_ANCESTORS: id => `/departments/${id}/ancestors`, // 获取祖先部门
            GET_SUBORDINATES: id => `/departments/${id}/subordinates`, // 获取下属部门
            PUT_MOVE: id => `/departments/${id}/move`,      // 移动部门
            PUT_ORDER: '/departments/order',                // 更新排序
            PUT_STATUS: id => `/departments/${id}/status`,  // 更新状态

            // 成员管理相关API
            GET_AVAILABLE_USERS: '/departments/available-users',  // 获取可添加的用户
            GET_MEMBER_STATS: id => `/departments/${id}/member-stats`, // 获取成员统计
            PUT_MEMBER_POSITION: (deptId, userId) =>
                `/departments/${deptId}/members/${userId}/position`, // 更新成员职位
            PUT_MEMBER_STATUS: (deptId, userId) =>
                `/departments/${deptId}/members/${userId}/status`,  // 更新成员状态
            POST_BATCH_ADD_MEMBERS: id => `/departments/${id}/members/batch`, // 批量添加成员
            DELETE_BATCH_MEMBERS: id => `/departments/${id}/members/batch`   // 批量移除成员
        },
        SYSTEM: {
            GET_THEMES: '/system/themes',
            POST_SET_THEME: '/system/theme/set',
            GET_THEME_PREVIEW: '/system/theme/preview',
            POST_SAVE_THEME: '/system/theme/save',
            GET_DEPARTMENT_LIST: '/system/departments',
            GET_ROLE_LIST: '/system/roles'
        },
        ROLE: {
            GET_LIST: '/roles',                    // 获取角色列表
            GET_DETAIL: id => `/roles/${id}`,      // 获取角色详情
            POST_CREATE: '/roles',                 // 创建角色
            PUT_UPDATE: id => `/roles/${id}`,      // 更新角色
            DELETE: id => `/roles/${id}`,          // 删除角色
            GET_PERMISSIONS: id => `/roles/${id}/permissions`,  // 获取角色权限
            PUT_PERMISSIONS: id => `/roles/${id}/permissions`,  // 更新角色权限
            GET_USERS: id => `/roles/${id}/users`  // 获取角色下的用户
        },

        PERMISSION: {
            GET_LIST: '/permissions',              // 获取权限列表
            GET_TREE: '/permissions/tree',         // 获取权限树
            GET_USER_PERMISSIONS: '/permissions/user'  // 获取当前用户权限
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

    // 消息提示
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
            DEPARTMENT: {
                NOT_FOUND: '部门不存在',
                CREATE_FAILED: '创建部门失败',
                UPDATE_FAILED: '更新部门失败',
                DELETE_FAILED: '删除部门失败',
                MOVE_FAILED: '移动部门失败',
                STATUS_UPDATE_FAILED: '更新部门状态失败',

                // 表单验证错误
                NAME_REQUIRED: '请输入部门名称',
                CODE_REQUIRED: '请输入部门编码',
                NAME_FORMAT: '部门名称只能包含中文、字母、数字、下划线和中划线',
                CODE_FORMAT: '部门编码只能包含大写字母和数字',
                NAME_LENGTH: '部门名称长度必须在2-50个字符之间',
                CODE_LENGTH: '部门编码长度必须在2-10个字符之间',
                DESCRIPTION_LENGTH: '部门描述长度不能超过200个字符',
                ORDER_INVALID: '排序号必须是0-9999之间的整数',
                PARENT_INVALID: '无效的父部门',
                MANAGER_REQUIRED: '请选择部门主管',

                // 成员管理错误
                MEMBER_ADD_FAILED: '添加成员失败',
                MEMBER_REMOVE_FAILED: '移除成员失败',
                MEMBER_UPDATE_FAILED: '更新成员信息失败',
                MAX_MEMBERS_EXCEEDED: '超出部门最大成员数限制',
                MEMBER_NOT_FOUND: '成员不存在',
                DUPLICATE_MEMBER: '该用户已是部门成员'
            },
            TICKET: {
                NOT_FOUND: '工单不存在',
                CREATE_FAILED: '创建工单失败',
                UPDATE_FAILED: '更新工单失败',
                DELETE_FAILED: '删除工单失败',
                ASSIGN_FAILED: '分配工单失败',
                COMMENT_FAILED: '评论失败',
                LOAD_FAILED: '加载工单列表失败',
                DETAIL_FAILED: '加载工单详情失败',
                PROCESS_FAILED: '处理工单失败',
                TRANSFER_FAILED: '转交工单失败',
                CLOSE_FAILED: '关闭工单失败',
                EVALUATE_FAILED: '评价工单失败',
                ATTACHMENT_UPLOAD_FAILED: '附件上传失败',
                ATTACHMENT_DOWNLOAD_FAILED: '附件下载失败',
                ATTACHMENT_DELETE_FAILED: '删除附件失败',
                NOTE_ADD_FAILED: '添加备注失败',
                // 表单验证错误
                TITLE_REQUIRED: '请输入工单标题',
                CONTENT_REQUIRED: '请输入工单内容',
                DEPARTMENT_REQUIRED: '请选择处理部门',
                TITLE_LENGTH: '标题长度应在5-50个字符之间',
                CONTENT_LENGTH: '内容长度应在10-500个字符之间',
                EVALUATION_SCORE_REQUIRED: '请选择评分',
                EVALUATION_CONTENT_REQUIRED: '请输入评价内容',
                NOTE_CONTENT_REQUIRED: '请输入备注内容',
                CLOSE_REASON_REQUIRED: '请输入关闭原因',
                FILE_SIZE_LIMIT: '文件大小不能超过10MB',
                FILE_TYPE_ERROR: '不支持的文件类型'
            },
            ROLE: {
                NOT_FOUND: '角色不存在',
                CREATE_FAILED: '创建角色失败',
                UPDATE_FAILED: '更新角色失败',
                DELETE_FAILED: '删除角色失败',
                PERMISSION_UPDATE_FAILED: '更新角色权限失败',
                // 表单验证错误
                CODE_REQUIRED: '请输入角色编码',
                NAME_REQUIRED: '请输入角色名称',
                CODE_FORMAT: '角色编码只能包含大写字母、数字和下划线，且必须以字母开头',
                CODE_LENGTH: '角色编码长度必须在3-20个字符之间',
                NAME_LENGTH: '角色名称长度必须在2-50个字符之间',
                DESCRIPTION_LENGTH: '角色描述长度不能超过200个字符',
                BASE_ROLE_REQUIRED: '请选择基础角色类型'
            },

            PERMISSION: {
                LOAD_FAILED: '加载权限列表失败',
                UPDATE_FAILED: '更新权限失败',
                UNAUTHORIZED: '没有相关操作权限'
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
                COMMENT: '评论成功',
                PROCESS: '工单处理成功',
                TRANSFER: '工单转交成功',
                CLOSE: '工单关闭成功',
                EVALUATE: '评价提交成功',
                NOTE_ADD: '备注添加成功',
                ATTACHMENT_UPLOAD: '附件上传成功',
                ATTACHMENT_DELETE: '附件删除成功'
            },
            THEME: {
                CREATE: '主题创建成功',
                UPDATE: '主题更新成功',
                DELETE: '主题删除成功',
                SAVE: '主题保存成功',
                APPLY: '主题应用成功'
            },
            ROLE: {
                CREATE: '角色创建成功',
                UPDATE: '角色更新成功',
                DELETE: '角色删除成功',
                PERMISSION_UPDATE: '角色权限更新成功'
            },
            DEPARTMENT: {
                CREATE: '创建部门成功',
                UPDATE: '更新部门成功',
                DELETE: '删除部门成功',
                MOVE: '移动部门成功',
                STATUS_UPDATE: '更新部门状态成功',
                MEMBER_ADD: '添加成员成功',
                MEMBER_REMOVE: '移除成员成功',
                MEMBER_UPDATE: '更新成员信息成功'
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
    },

    // 文件相关常量
    FILE: {
        MAX_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'application/x-rar-compressed'
        ],
        TYPE_MAP: {
            'image/jpeg': 'JPEG 图片',
            'image/png': 'PNG 图片',
            'image/gif': 'GIF 图片',
            'application/pdf': 'PDF 文档',
            'application/msword': 'Word 文档',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word 文档',
            'application/vnd.ms-excel': 'Excel 表格',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel 表格',
            'application/zip': 'ZIP 压缩包',
            'application/x-rar-compressed': 'RAR 压缩包'
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