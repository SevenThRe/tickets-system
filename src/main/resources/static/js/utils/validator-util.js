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

        // 系统默认验证器定义
        this.validators = {
            required: {
                validate: value => value !== undefined && value !== null && value !== '',
                message: window.Const.MESSAGE.ERROR.VALIDATION.USERNAME_REQUIRED
            },
            username: {
                validate: value => /^[a-zA-Z0-9_]+$/.test(value),
                message: window.Const.MESSAGE.ERROR.VALIDATION.USERNAME_FORMAT
            },
            usernameLength: {
                validate: value => value.length >= 3 && value.length <= 20,
                message: window.Const.MESSAGE.ERROR.VALIDATION.USERNAME_LENGTH
            },
            password: {
                validate: value => value.length >= 6 && value.length <= 20,
                message: window.Const.MESSAGE.ERROR.VALIDATION.PASSWORD_LENGTH
            },
            email: {
                validate: value => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
                message: '请输入有效的邮箱地址'
            },
            mobile: {
                validate: value => /^1[3-9]\d{9}$/.test(value),
                message: '请输入有效的手机号码'
            },
            ticketStatus: {
                validate: value => Object.values(window.Const.TICKET.STATUS).includes(Number(value)),
                message: '无效的工单状态'
            },
            ticketPriority: {
                validate: value => Object.values(window.Const.TICKET.PRIORITY).includes(Number(value)),
                message: '无效的工单优先级'
            },
            themeType: {
                validate: value => Object.values(window.Const.THEME.TYPES).includes(value),
                message: '无效的主题类型'
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
            }
        };

        // 预定义的表单验证规则
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