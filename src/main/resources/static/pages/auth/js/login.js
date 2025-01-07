// login.js
class LoginPage {
    constructor() {
        // 缓存DOM元素
        this.form = $('#loginForm');
        this.username = $('#username');
        this.password = $('#password');
        this.rememberMe = $('#rememberMe');
        this.submitBtn = $('#submitBtn');
        this.errorAlert = $('#errorAlert');
        this.togglePasswordBtn = $('#togglePassword');

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
                maxLength: 20
            }
        };

        // 状态标志
        this.isSubmitting = false;

        // 防抖处理
        this.debounceValidate = window.utils.debounce(
            (field) => this.validateField(field),
            300
        );

        // 绑定事件
        this.bindEvents();

        // 初始化
        this.init();
    }

    // 初始化
    async init() {
        try {
            // 检查是否已登录
            if (this.checkLoggedIn()) {
                this.redirectToDashboard();
                return;
            }

            await this.restoreUsername();
            this.initValidation();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('系统初始化失败，请刷新页面重试');
        }
    }

    // 检查是否已登录
    checkLoggedIn() {
        const token = localStorage.getItem('token');
        return !!token;
    }

    // 重定向到仪表板
    redirectToDashboard() {
        const roleRedirectMap = {
            'ADMIN': '/admin/dashboard.html',
            'DEPT': '/dept/dashboard.html',
            'USER': '/user/dashboard.html'
        };

        // 获取角色对应的重定向URL，如果未找到则默认跳转到个人中心
        window.location.href = roleRedirectMap[data.userInfo.role.roleCode] || '/common/profile.html';
    }

    // 绑定事件处理
    bindEvents() {
        // 表单提交
        this.form.on('submit', (e) => this.handleSubmit(e));

        // 密码可见性切换
        this.togglePasswordBtn.on('click', () => this.togglePasswordVisibility());

        // 输入验证
        this.username.on('input', () => this.debounceValidate('username'));
        this.password.on('input', () => this.debounceValidate('password'));

        // 按下回车时提交
        this.password.on('keypress', (e) => {
            if (e.key === 'Enter') {
                this.form.submit();
            }
        });
    }

    // 初始化验证
    initValidation() {
        this.form.find('input[required]').each((_, input) => {
            $(input).on('blur', () => {
                this.validateField(input.name);
            });
        });
    }

    // 表单提交处理
    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        if (!this.validateForm()) return;

        try {
            this.isSubmitting = true;
            this.setLoading(true);
            this.clearError();

            const formData = this.getFormData();

            // 使用请求工具类发送请求
            const response = await window.requestUtil.post(Const.API.AUTH.POST_LOGIN, formData);

            if (response.code === 200) {
                this.handleLoginSuccess(response.data);
            } else {
                throw new Error(response.message || '登录失败');
            }
        } catch (error) {
            console.error('登录错误:', error);
            this.handleLoginError(error);
        } finally {
            this.isSubmitting = false;
            this.setLoading(false);
        }
    }

    // 获取表单数据
    getFormData() {
        return {
            username: this.username.val().trim(),
            password: this.password.val(),
            rememberMe: this.rememberMe.prop('checked')
        };
    }

    // 切换密码可见性
    togglePasswordVisibility() {
        const type = this.password.attr('type');
        const newType = type === 'password' ? 'text' : 'password';

        this.password.attr('type', newType);
        this.togglePasswordBtn.find('i')
            .toggleClass('bi-eye bi-eye-slash');
    }

    // 表单验证
    validateForm() {
        let isValid = true;

        Object.keys(this.validationRules).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // 字段验证
    validateField(fieldName) {
        const field = this[fieldName];
        const value = field.val().trim();
        const rules = this.validationRules[fieldName];

        // 错误消息
        let errorMessage = '';

        // 必填验证
        if (rules.required && !value) {
            errorMessage = `请输入${fieldName === 'username' ? '用户名' : '密码'}`;
        }
        // 长度验证
        else if (value.length < rules.minLength) {
            errorMessage = `${fieldName === 'username' ? '用户名' : '密码'}至少${rules.minLength}个字符`;
        }
        else if (value.length > rules.maxLength) {
            errorMessage = `${fieldName === 'username' ? '用户名' : '密码'}不能超过${rules.maxLength}个字符`;
        }
        // 格式验证(仅用户名)
        else if (fieldName === 'username' && !rules.pattern.test(value)) {
            errorMessage = '用户名只能包含字母、数字和下划线';
        }

        const isValid = !errorMessage;
        this.updateFieldStatus(field, isValid, errorMessage);

        return isValid;
    }

    // 更新字段状态
    updateFieldStatus(field, isValid, errorMessage = '') {
        const formGroup = field.closest('.form-group');

        field.toggleClass('is-invalid', !isValid);
        formGroup.find('.invalid-feedback')
            .text(errorMessage);
    }

    // 恢复记住的用户名
    async restoreUsername() {
        const rememberedUsername = localStorage.getItem('rememberedUsername');
        if (rememberedUsername) {
            this.username.val(rememberedUsername);
            this.rememberMe.prop('checked', true);
        }
    }

    /**
     * 处理登录成功
     * @param {Object} data - 登录响应数据
     * @private
     */
    handleLoginSuccess(data) {
        // 保存认证信息
        localStorage.setItem('token', data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo));

        // 处理记住用户名
        if (this.rememberMe.prop('checked')) {
            localStorage.setItem('rememberedUsername', this.username.val().trim());
        } else {
            localStorage.removeItem('rememberedUsername');
        }

        // 触发登录成功事件
        window.eventBus.emit('auth:login', data.userInfo);

        // 根据角色跳转到相应页面
       this.redirectToDashboard();
    }

    // 处理登录错误
    handleLoginError(error) {
        let errorMessage = '登录失败，请稍后重试';

        if (error.status === 401) {
            errorMessage = '用户名或密码错误';
        } else if (error.status === 403) {
            errorMessage = '账号已被禁用';
        } else if (error.message) {
            errorMessage = error.message;
        }

        this.showError(errorMessage);

        // 清空密码
        this.password.val('').focus();
    }

    // 显示错误信息
    showError(message) {
        this.errorAlert
            .removeClass('d-none')
            .text(message)
            .addClass('shake');

        setTimeout(() => {
            this.errorAlert.removeClass('shake');
        }, 500);
    }

    // 清除错误信息
    clearError() {
        this.errorAlert
            .addClass('d-none')
            .text('');

        this.form.find('.is-invalid')
            .removeClass('is-invalid');
    }

    // 设置加载状态
    setLoading(isLoading) {
        this.submitBtn
            .prop('disabled', isLoading)
            .toggleClass('btn-loading', isLoading)
            .html(isLoading ? '' : '登录');

        // 禁用/启用表单字段
        this.form.find('input')
            .prop('disabled', isLoading);
    }

    // 销毁实例
    destroy() {
        // 清除事件监听
        this.form.off();
        this.username.off();
        this.password.off();
        this.togglePasswordBtn.off();

        // 取消防抖函数
        this.debounceValidate.cancel();

        // 清除DOM引用
        this.form = null;
        this.username = null;
        this.password = null;
        this.rememberMe = null;
        this.submitBtn = null;
        this.errorAlert = null;
        this.togglePasswordBtn = null;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.loginPage = new LoginPage();
});