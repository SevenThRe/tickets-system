/**
 * validator-util.js
 * 表单验证工具类，提供可扩展的验证规则和自定义验证支持
 * @author SeventhRe
 * @version 2.0.1
 */

class Validator {
    /**
     * 创建验证器实例
     * @param {Object} rules - 验证规则配置
     */
    constructor(rules = {}) {
        /**
         * 表单验证规则配置
         * @private
         * @type {Object}
         */
        this.rules = rules;

        /**
         * 内置验证器定义
         * 每个验证器包含validate方法和错误提示消息
         * @private
         * @type {Object}
         */
        this.validators = {
            required: {
                validate: value => value !== undefined && value !== null && value !== '',
                message: '此字段不能为空'
            },
            email: {
                validate: value => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
                message: '请输入有效的邮箱地址'
            },
            mobile: {
                validate: value => /^1[3-9]\d{9}$/.test(value),
                message: '请输入有效的手机号码'
            },
            url: {
                validate: value => {
                    try {
                        new URL(value);
                        return true;
                    } catch {
                        return false;
                    }
                },
                message: '请输入有效的URL地址'
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
    }

    /**
     * 添加自定义验证器
     * @param {string} name - 验证器名称
     * @param {Object} validator - 验证器配置对象
     * @param {Function} validator.validate - 验证函数
     * @param {string|Function} validator.message - 错误消息或错误消息生成函数
     * @throws {Error} 当验证器配置无效时抛出错误
     */
    addValidator(name, validator) {
        if (!validator || typeof validator.validate !== 'function') {
            throw new Error('验证器必须包含validate函数');
        }
        this.validators[name] = validator;
    }

    /**
     * 验证单个字段
     * @param {string} field - 字段名
     * @param {*} value - 字段值
     * @param {Object} data - 完整表单数据，用于关联验证
     * @returns {Promise<Object>} 错误信息对象
     */
    async validateField(field, value, data = {}) {
        const fieldRules = this.rules[field];
        if (!fieldRules) return {};

        const errors = {};

        // 遍历字段的所有验证规则
        for (const rule of fieldRules) {
            try {
                // 条件验证检查
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
                    break;  // 一个字段只显示第一个错误
                }
            } catch (error) {
                console.error(`字段[${field}]验证异常:`, error);
                errors[field] = '验证执行失败';
                break;
            }
        }

        return errors;
    }

    /**
     * 验证整个表单
     * @param {Object} data - 表单数据对象
     * @returns {Promise<Object>} 错误信息对象
     */
    async validate(data = {}) {
        const errors = {};

        // 并行验证所有字段
        const validations = Object.entries(this.rules).map(async ([field, rules]) => {
            const fieldErrors = await this.validateField(field, data[field], data);
            Object.assign(errors, fieldErrors);
        });

        await Promise.all(validations);
        return errors;
    }

    /**
     * 创建验证规则配置
     * @param {Object} rules - 规则配置对象
     * @returns {Validator} 验证器实例
     */
    static createRules(rules) {
        return new Validator(rules);
    }

    /**
     * 执行验证逻辑
     * @private
     * @param {Object} validator - 验证器对象
     * @param {*} value - 待验证值
     * @param {*} param - 验证参数
     * @param {Object} data - 表单数据
     * @returns {Promise<boolean>} 验证结果
     */
    async _executeValidation(validator, value, param, data) {
        const result = validator.validate(value, param, data);
        return result instanceof Promise ? await result : result;
    }

    /**
     * 获取错误消息
     * @private
     * @param {Object} validator - 验证器对象
     * @param {Object} rule - 规则配置
     * @returns {string} 错误消息
     */
    _getErrorMessage(validator, rule) {
        const message = rule.message || validator.message;
        return typeof message === 'function' ? message(rule.param) : message;
    }

    /**
     * 评估条件表达式
     * @private
     * @param {Function} condition - 条件函数
     * @param {Object} data - 表单数据
     * @returns {Promise<boolean>} 条件评估结果
     */
    async _evaluateCondition(condition, data) {
        try {
            const result = condition(data);
            return result instanceof Promise ? await result : result;
        } catch (error) {
            console.error('条件评估失败:', error);
            return false;
        }
    }
}

// 导出验证器类
export default Validator;