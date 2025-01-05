/**
 * validator-util.js
 * 表单验证工具类，提供可扩展的验证规则和自定义验证支持
 * @author SeventhRe
 * @version 2.0.2
 */
class ValidatorUtil {
    /**
     * 创建验证器实例
     * @param {Object} rules - 验证规则配置
     */
    constructor(rules = {}) {
        // 表单验证规则配置
        this.rules = rules;

        // 验证消息常量
        this.VALIDATION_MESSAGES = {
            REQUIRED: '此项是必填的',
            USERNAME_FORMAT: '用户名只能包含字母、数字和下划线',
            USERNAME_LENGTH: '用户名长度必须在3-20个字符之间',
            PASSWORD_LENGTH: '密码长度必须在6-20个字符之间',
            EMAIL_FORMAT: '请输入有效的邮箱地址',
            MOBILE_FORMAT: '请输入有效的手机号码',
            TICKET_STATUS: '无效的工单状态',
            TICKET_PRIORITY: '无效的工单优先级',
            THEME_TYPE: '无效的主题类型',
            UNKNOWN: '验证失败'
        };

        // 系统默认验证器定义
        this.validators = {
            required: {
                validate: value => value !== undefined && value !== null && value !== '',
                message: this.VALIDATION_MESSAGES.REQUIRED
            },
            username: {
                validate: value => /^[a-zA-Z0-9_]+$/.test(value),
                message: this.VALIDATION_MESSAGES.USERNAME_FORMAT
            },
            usernameLength: {
                validate: value => value.length >= 3 && value.length <= 20,
                message: this.VALIDATION_MESSAGES.USERNAME_LENGTH
            },
            password: {
                validate: value => value.length >= 6 && value.length <= 20,
                message: this.VALIDATION_MESSAGES.PASSWORD_LENGTH
            },
            email: {
                validate: value => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
                message: this.VALIDATION_MESSAGES.EMAIL_FORMAT
            },
            mobile: {
                validate: value => /^1[3-9]\d{9}$/.test(value),
                message: this.VALIDATION_MESSAGES.MOBILE_FORMAT
            },
            ticketStatus: {
                validate: value => {
                    const TICKET_STATUS = window.Const?.TICKET?.STATUS || {};
                    return Object.values(TICKET_STATUS).includes(Number(value));
                },
                message: this.VALIDATION_MESSAGES.TICKET_STATUS
            },
            ticketPriority: {
                validate: value => {
                    const TICKET_PRIORITY = window.Const?.TICKET?.PRIORITY || {};
                    return Object.values(TICKET_PRIORITY).includes(Number(value));
                },
                message: this.VALIDATION_MESSAGES.TICKET_PRIORITY
            },
            themeType: {
                validate: value => {
                    const THEME_TYPES = window.Const?.THEME?.TYPES || {};
                    return Object.values(THEME_TYPES).includes(value);
                },
                message: this.VALIDATION_MESSAGES.THEME_TYPE
            },
            min: {
                validate: (value, param) => Number(value) >= param,
                message: param => `不能小于${param}`
            },
            max: {
                validate: (value, param) => Number(value) <= param,
                message: param => `不能大于${param}`
            },
            length: {
                validate: (value, param) => String(value).length === param,
                message: param => `长度必须为${param}个字符`
            },
            minLength: {
                validate: (value, param) => String(value).length >= param,
                message: param => `长度不能小于${param}个字符`
            },
            maxLength: {
                validate: (value, param) => String(value).length <= param,
                message: param => `长度不能超过${param}个字符`
            },
            pattern: {
                validate: (value, param) => new RegExp(param).test(value),
                message: '格式不正确'
            },
            // 针对部门管理新增的验证器
            departmentCode: {
                validate: value => /^[A-Z0-9]{2,10}$/.test(value),
                message: '部门编码只能包含大写字母和数字，长度2-10位'
            },
            departmentName: {
                validate: value => value.length >= 2 && value.length <= 50,
                message: '部门名称长度必须在2-50个字符之间'
            },
            departmentOrder: {
                validate: value => Number.isInteger(Number(value)) && Number(value) >= 0,
                message: '排序号必须是非负整数'
            }
        };

        this.formRules = {
            loginForm: {
                username: [
                    { type: 'required' },
                    { type: 'username' },
                    { type: 'usernameLength' }
                ],
                password: [
                    { type: 'required' },
                    { type: 'password' }
                ]
            },
            departmentForm: {
                name: [
                    { type: 'required' },
                    { type: 'departmentName' }
                ],
                code: [
                    { type: 'required' },
                    { type: 'departmentCode' }
                ],
                orderNum: [
                    { type: 'departmentOrder' }
                ]
            },
            ticketForm: {
                title: [
                    { type: 'required' },
                    { type: 'maxLength', param: 50 }
                ],
                content: [
                    { type: 'required' },
                    { type: 'maxLength', param: 500 }
                ],
                priority: [
                    { type: 'required' },
                    { type: 'ticketPriority' }
                ],
                status: [
                    { type: 'required' },
                    { type: 'ticketStatus' }
                ]
            },
            themeForm: {
                name: [
                    { type: 'required' },
                    { type: 'maxLength', param: 20 }
                ],
                type: [
                    { type: 'required' },
                    { type: 'themeType' }
                ]
            }
        };
    }

    /**
     * 添加自定义验证器
     * @param {string} name 验证器名称
     * @param {Object} validator 验证器配置对象
     */
    addValidator(name, validator) {
        if (!validator || typeof validator.validate !== 'function') {
            throw new Error('验证器必须包含validate函数');
        }
        this.validators[name] = validator;
    }

    /**
     * 验证单个字段
     * @param {string} field 字段名
     * @param {*} value 字段值
     * @param {Object} data 完整表单数据
     * @returns {Promise<Object>} 错误信息对象
     */
    async validateField(field, value, data = {}) {
        const fieldRules = this.rules[field];
        if (!fieldRules) return {};

        const errors = {};

        for (const rule of fieldRules) {
            try {
                if (rule.if && !await this._evaluateCondition(rule.if, data)) {
                    continue;
                }

                const validator = this.validators[rule.type];
                if (!validator) {
                    console.warn(`未知的验证器类型: ${rule.type}`);
                    continue;
                }

                const isValid = await this._executeValidation(validator, value, rule.param, data);

                if (!isValid) {
                    errors[field] = this._getErrorMessage(validator, rule);
                    break;
                }
            } catch (error) {
                console.error(`字段[${field}]验证异常:`, error);
                errors[field] = window.Const.MESSAGE.ERROR.VALIDATION.UNKNOWN;
                break;
            }
        }

        return errors;
    }

    /**
     * 验证整个表单
     * @param {string} formType 表单类型
     * @param {Object} data 表单数据
     * @returns {Promise<Object>} 错误信息对象
     */
    async validateForm(formType, data = {}) {
        // 获取预定义的表单规则
        const formRules = this.formRules[formType];
        if (!formRules) {
            console.warn(`未找到表单类型[${formType}]的验证规则`);
            return {};
        }

        this.rules = formRules;
        return await this.validate(data);
    }

    /**
     * 验证整个表单数据
     * @param {Object} data 表单数据对象
     * @returns {Promise<Object>} 错误信息对象
     */
    async validate(data = {}) {
        const errors = {};
        const validations = Object.entries(this.rules).map(async ([field, rules]) => {
            const fieldErrors = await this.validateField(field, data[field], data);
            Object.assign(errors, fieldErrors);
        });

        await Promise.all(validations);
        return errors;
    }

    // 私有辅助方法
    async _executeValidation(validator, value, param, data) {
        const result = validator.validate(value, param, data);
        return result instanceof Promise ? await result : result;
    }

    _getErrorMessage(validator, rule) {
        const message = rule.message || validator.message;
        return typeof message === 'function' ? message(rule.param) : message;
    }

    async _evaluateCondition(condition, data) {
        try {
            const result = condition(data);
            return result instanceof Promise ? await result : result;
        } catch (error) {
            console.error('条件评估失败:', error);
            return false;
        }
    }

    // 静态工厂方法
    static createValidator(rules) {
        return new ValidatorUtil(rules);
    }
}

// 创建全局单例
window.validatorUtil = new ValidatorUtil();