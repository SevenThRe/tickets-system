/**
 * register.js
 * 注册页面控制器
 */
class Register {
    constructor() {
        // 缓存DOM元素
        this.$form = $('#registerForm');
        this.$username = $('#username');
        this.$password = $('#password');
        this.$confirmPassword = $('#confirmPassword');
        this.$realName = $('#realName');
        this.$email = $('#email');
        this.$phone = $('#phone');
        this.$submitBtn = $('#submitBtn');
        this.$togglePassword = $('#togglePassword');
        this.$toggleConfirmPassword = $('#toggleConfirmPassword');

        // 用户名列表缓存
        this.usernameList = [];

        // 验证规则
        this.validationRules = {
            username: {
                required: true,
                minLength: 3,
                maxLength: 20,
                pattern: /^[a-zA-Z0-9_]+$/
            },
            password: {
                required: true,
                minLength: 6,
                maxLength: 20,
                pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/
            },
            confirmPassword: {
                required: true,
                equals: 'password'
            },
            realName: {
                required: true,
                maxLength: 50
            },
            email: {
                required: true,
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            },
            phone: {
                required: true,
                pattern: /^1[3-9]\d{9}$/
            },
        };

        // 状态标志
        this.isSubmitting = false;

        // 防抖处理
        this.debounceValidate = this._debounce(
            (field) => this.validateField(field),
            300
        );

        // 初始化
        this.init();
    }

    // 初始化
    async init() {
        // 绑定事件
        this._bindEvents();

        // 加载用户名列表(用于唯一性校验)
        await this._loadUsernames();
    }

    // 绑定事件
    _bindEvents() {
        const self = this;

        // 表单提交
        this.$form.on('submit', function(e) {
            e.preventDefault();
            self._handleSubmit(e);
        });

        // 输入验证
        this.$username.on('input', () => this.debounceValidate('username'));
        this.$password.on('input', () => {
            this.debounceValidate('password');
            if(this.$confirmPassword.val()) {
                this.validateField('confirmPassword');
            }
        });
        this.$confirmPassword.on('input', () => this.debounceValidate('confirmPassword'));
        this.$realName.on('input', () => this.debounceValidate('realName'));
        this.$email.on('input', () => this.debounceValidate('email'));
        this.$phone.on('input', () => this.debounceValidate('phone'));

        // 密码显示切换
        this.$togglePassword.on('click', () => this._togglePasswordVisibility(this.$password));
        this.$toggleConfirmPassword.on('click', () => this._togglePasswordVisibility(this.$confirmPassword));
    }

    // 加载用户名列表
    async _loadUsernames() {
        try {
            const response = await $.ajax({
                url: '/api/users/usernames',
                method: 'GET'
            });

            if(response.code === 200) {
                this.usernameList = response.data;
            }
        } catch(error) {
            console.error('加载用户名列表失败:', error);
        }
    }


    // 字段验证
    validateField(field) {
        let $field;

        $field = this[`$${field}`];

        if (!$field || $field.length === 0) {
            console.error(`Field ${field} not found`);
            return false;
        }

        const value = $field.val()?.trim() || '';
        const rules = this.validationRules[field];
        let errorMessage = '';

        // 必填验证
        if(rules.required && !value) {
            errorMessage = '此项是必填的';
        }
        // 最小长度验证
        else if(rules.minLength && value.length < rules.minLength) {
            errorMessage = `最小长度为${rules.minLength}个字符`;
        }
        // 最大长度验证
        else if(rules.maxLength && value.length > rules.maxLength) {
            errorMessage = `最大长度为${rules.maxLength}个字符`;
        }
        // 密码确认
        else if(field === 'confirmPassword' && value !== this.$password.val()) {
            errorMessage = '两次输入的密码不一致';
        }
        // 正则验证
        else if(rules.pattern && !rules.pattern.test(value)) {
            switch(field) {
                case 'username':
                    errorMessage = '用户名只能包含字母、数字和下划线';
                    break;
                case 'password':
                    errorMessage = '密码必须包含字母和数字';
                    break;
                case 'email':
                    errorMessage = '请输入有效的邮箱地址';
                    break;
                case 'phone':
                    errorMessage = '请输入有效的手机号码';
                    break;
                default:
                    errorMessage = '格式不正确';
            }
        }

        const isValid = !errorMessage;

        // 更新字段状态
        this._updateFieldStatus($field, isValid, errorMessage);

        // 用户名唯一性校验
        if(field === 'username' && isValid) {
            return this._checkUsernameUnique(value);
        }

        return isValid;
    }

    // 处理表单提交
    async _handleSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if(this.isSubmitting) return;

        if(!this._validateForm()) {
            return;
        }

        try {
            this.isSubmitting = true;
            this._setSubmitting(true);

            const formData = this._getFormData();

            const response = await $.ajax({
                url: '/api/auth/register',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData)
            });

            if(response.code === 200) {
                this._showSuccess('注册成功!');
                setTimeout(() => {
                    window.location.href = '/pages/auth/login.html';
                }, 1500);
            } else {
                throw new Error(response.msg);
            }

        } catch(error) {
            this._showError(error.message || '注册失败');
        } finally {
            this.isSubmitting = false;
            this._setSubmitting(false);
        }
    }

    // 获取表单数据
    _getFormData() {
        return {
            username: this.$username.val().trim(),
            password: this.$password.val(),
            realName: this.$realName.val().trim(),
            email: this.$email.val().trim(),
            phone: this.$phone.val().trim(),
        };
    }

    // 表单验证
    _validateForm() {
        let isValid = true;

        // 验证所有字段
        Object.keys(this.validationRules).forEach(field => {
            if(!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // 检查用户名唯一性
    _checkUsernameUnique(username) {
        if(this.usernameList.includes(username)) {
            this._showFieldError(this.$username, '用户名已存在');
            return false;
        }
        return true;
    }

    // 显示字段错误
    _showFieldError($field, message) {
        $field.addClass('is-invalid')
            .removeClass('is-valid');

        let $feedback = $field.siblings('.invalid-feedback');
        if(!$feedback.length) {
            $feedback = $('<div class="invalid-feedback"></div>').insertAfter($field);
        }
        $feedback.text(message);
    }

    // 更新字段状态
    _updateFieldStatus($field, isValid, errorMessage = '') {
        $field.toggleClass('is-invalid', !isValid)
            .toggleClass('is-valid', isValid);

        const $feedback = $field.siblings('.invalid-feedback');
        if(isValid) {
            $feedback.remove();
        } else {
            this._showFieldError($field, errorMessage);
        }
    }

    // 切换密码可见性
    _togglePasswordVisibility($field) {
        const type = $field.attr('type');
        const newType = type === 'password' ? 'text' : 'password';
        $field.attr('type', newType);

        const $icon = $field.siblings('.input-group-text').find('i');
        $icon.toggleClass('bi-eye bi-eye-slash');
    }

    // 设置提交状态
    _setSubmitting(isSubmitting) {
        this.$submitBtn.prop('disabled', isSubmitting)
            .html(isSubmitting ? '<span class="spinner-border spinner-border-sm"></span> 提交中...' : '注册');
        this.$form.find('input, select').prop('disabled', isSubmitting);
    }


    /**
     * 显示成功提示
     * @param {string} message - 成功消息
     * @private
     */
    _showSuccess(message) {
        this._showNotification(message, 'success');
    }

    /**
     * 显示错误提示
     * @param {string} message - 错误消息
     * @private
     */
    _showError(message) {
        this._showNotification(message, 'danger');
    }

    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 ('success' | 'danger')
     * @private
     */
    _showNotification(message, type) {
        // 移除已有的通知
        $('.notification-alert').remove();

        // 创建新的通知元素
        const $notification = $(`
            <div class="notification-alert alert alert-${type} alert-dismissible fade show" role="alert" style="position: fixed; top: 20px; right: 20px; z-index: 1050;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `);

        // 添加到页面
        $('body').append($notification);

        // 3秒后自动消失
        setTimeout(() => {
            $notification.alert('close');
        }, 3000);
    }


    // 防抖函数
    _debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // 销毁实例
    destroy() {
        // 解绑所有事件
        this.$form.off();
        this.$username.off();
        this.$password.off();
        this.$confirmPassword.off();
        this.$realName.off();
        this.$email.off();
        this.$phone.off();
        this.$roleSelect.off();
        this.$togglePassword.off();
        this.$toggleConfirmPassword.off();

        // 清理引用
        this.$form = null;
        this.$username = null;
        this.$password = null;
        this.$confirmPassword = null;
        this.$realName = null;
        this.$email = null;
        this.$phone = null;
        this.$submitBtn = null;
        this.$roleSelect = null;
        this.$errorAlert = null;
        this.$togglePassword = null;
        this.$toggleConfirmPassword = null;
    }
}

// 页面加载完成后初始化
$(document).ready(function() {
    window.register = new Register();
});