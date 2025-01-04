/**
 * 表单验证工具类
 * 提供丰富的验证规则和自定义验证支持
 */
class Validator {
    constructor(rules = {}) {
        // 验证规则配置
        this.rules = rules;
        
        // 内置验证器
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
                validate: value => /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value),
                message: '请输入有效的URL地址'
            },
            min: {
                validate: (value, param) => Number(value) >= param,
                message: (param) => `不能小于${param}`
            },
            max: {
                validate: (value, param) => Number(value) <= param,
                message: (param) => `不能大于${param}`
            },
            length: {
                validate: (value, param) => String(value).length === param,
                message: (param) => `长度必须为${param}个字符`
            },
            minLength: {
                validate: (value, param) => String(value).length >= param,
                message: (param) => `长度不能小于${param}个字符`
            },
            maxLength: {
                validate: (value, param) => String(value).length <= param,
                message: (param) => `长度不能超过${param}个字符`
            },
            pattern: {
                validate: (value, param) => new RegExp(param).test(value),
                message: '格式不正确'
            }
        };
    }

    /**
     * 添加自定义验证器
     * @param {string} name 验证器名称
     * @param {Object} validator 验证器配置
     */
    addValidator(name, validator) {
        if (typeof validator.validate !== 'function') {
            throw new Error('验证器必须包含validate函数');
        }
        this.validators[name] = validator;
    }

    /**
     * 验证单个字段
     * @param {string} field 字段名
     * @param {*} value 字段值
     * @param {Object} data 完整表单数据
     */
    async validateField(field, value, data = {}) {
        const fieldRules = this.rules[field];
        if (!fieldRules) return {};

        const errors = {};

        for (const rule of fieldRules) {
            // 跳过条件验证
            if (rule.if && !rule.if(data)) {
                continue;
            }

            // 获取验证器
            const validator = this.validators[rule.type];
            if (!validator) {
                console.warn(`未知的验证器类型: ${rule.type}`);
                continue;
            }

            try {
                // 执行验证
                const isValid = await validator.validate(value, rule.param, data);
                
                if (!isValid) {
                    // 获取错误信息
                    const message = rule.message ||
                        (typeof validator.message === 'function'
                            ? validator.message(rule.param)
                            : validator.message);

                    errors[field] = message;
                    break;  // 一个字段只显示一个错误
                }
            } catch (error) {
                console.error('验证执行失败:', error);
                errors[field] = '验证失败';
                break;
            }
        }

        return errors;
    }

    /**
     * 验证整个表单
     * @param {Object} data 表单数据
     */
    async validate(data = {}) {
        const errors = {};
        
        for (const field in this.rules) {
            const fieldErrors = await this.validateField(
                field,
                data[field],
                data
            );
            
            Object.assign(errors, fieldErrors);
        }

        return errors;
    }

    /**
     * 创建字段验证规则
     * @param {Array} rules 规则配置数组
     */
    static createRules(rules) {
        const validator = new Validator();
        for (const [field, fieldRules] of Object.entries(rules)) {
            validator.rules[field] = Array.isArray(fieldRules) 
                ? fieldRules 
                : [fieldRules];
        }
        return validator;
    }
}

// 使用示例：
/*
const validator = Validator.createRules({
    username: [
        { type: 'required', message: '用户名不能为空' },
        { type: 'minLength', param: 3, message: '用户名长度不能小于3个字符' }
    ],
    email: [
        { type: 'required' },
        { type: 'email' }
    ],
    password: [
        { type: 'required' },
        { type: 'pattern', param: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[^]{8,}$/, 
          message: '密码必须包含大小写字母和数字，且不少于8位' }
    ],
    confirmPassword: [
        { type: 'required' },
        { 
            type: 'custom',
            validate: (value, param, data) => value === data.password,
            message: '两次输入的密码不一致'
        }
    ]
});
*/

export default Validator;