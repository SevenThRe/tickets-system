/**
 * LoginPage 类 - 处理用户登录认证功能
 */
class LoginPage {
    constructor() {
        // 缓存 DOM 元素引用，提高性能
        this.elements = {
            form: $('#loginForm'),
            username: $('#username'),
            password: $('#password'),
            rememberMe: $('#rememberMe'),
            submitBtn: $('#submitBtn'),
            errorAlert: $('#errorAlert'),
            togglePasswordBtn: $('#togglePassword')
        };

        // 表单验证规则配置
        this.validation = {
            username: {
                required: true,
                minLength: 3,
                maxLength: 20,
                pattern: /^[a-zA-Z0-9_]+$/,
                messages: {
                    required: '请输入用户名',
                    minLength: '用户名至少3个字符',
                    maxLength: '用户名不能超过20个字符',
                    pattern: '用户名只能包含字母、数字和下划线'
                }
            },
            password: {
                required: true,
                minLength: 6,
                maxLength: 20,
                messages: {
                    required: '请输入密码',
                    minLength: '密码至少6个字符',
                    maxLength: '密码不能超过20个字符'
                }
            }
        };

        // 初始化状态
        this.state = {
            isSubmitting: false,
            isPasswordVisible: false,
            rememberUsername: false
        };

        // 初始化页面
        this.init();
    }

    /**
     * 初始化登录页面
     */
    async init() {
        try {
            // 检查是否已登录
            if (this.checkLoggedIn()) {
                return this.redirectToDashboard();
            }

            // 恢复记住的用户名
            await this.restoreUsername();

            // 绑定事件处理
            this.bindEvents();

            // 设置用户名输入框焦点
            this.elements.username.focus();

        } catch (error) {
            console.error('登录页面初始化失败:', error);
            this.showError('系统初始化失败，请刷新重试');
        }
    }

    /**
     * 绑定事件处理器
     */
    bindEvents() {
        // 表单提交事件
        this.elements.form.on('submit', (e) => this.handleSubmit(e));

        // 密码可见性切换
        this.elements.togglePasswordBtn.on('click', () => this.togglePasswordVisibility());

        // 输入框验证
        this.elements.username.on('blur', () => this.validateField('username'));
        this.elements.password.on('blur', () => this.validateField('password'));

        // 记住用户名复选框
        this.elements.rememberMe.on('change', (e) => {
            this.state.rememberUsername = e.target.checked;
        });
    }
    /**
     * 根据用户角色重定向到相应的仪表板页面
     * @param {Object} userInfo - 用户信息对象
     */
    redirectToDashboard(userInfo = null) {
        // 如果没有传入userInfo，尝试从localStorage获取
        if (!userInfo) {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (!storedUserInfo) {
                window.location.href = '/pages/auth/login.html';
                return;
            }
            userInfo = JSON.parse(storedUserInfo);
        }

        // 根据baseRoleCode进行重定向
        const roleRedirects = {
            'ADMIN': '/pages/admin/dashboard.html',
            'DEPT': '/pages/dept/dept-workspace.html',
            'USER': '/pages/user/dashboard.html'
        };

        const defaultPath = '/common/profile.html';
        const redirectPath = roleRedirects[userInfo.baseRoleCode] || defaultPath;
        window.location.href = redirectPath;
    }

    /**
     * 处理登录成功
     * @param {Object} data - 后端返回的数据
     */
    async handleLoginSuccess(data) {
        try {
            const { userInfo, token, permissions } = data;

            // 保存token,需要加Bearer前缀
            localStorage.setItem('token', `Bearer ${token}`);

            // 保存完整的用户信息,包括permissions
            localStorage.setItem('userInfo', JSON.stringify({
                ...userInfo,
                permissions: permissions || []
            }));

            // 记住用户名逻辑
            if (this.state.rememberUsername) {
                localStorage.setItem('rememberedUsername', this.elements.username.val().trim());
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            // 登录成功事件
            $(document).trigger('loginSuccess', [userInfo]);

            // 重定向
            this.redirectToDashboard(userInfo);

        } catch (error) {
            console.error('处理登录成功信息时出错:', error);
            this.showError('登录成功但跳转失败，请刷新重试');
        }
    }


    /**
     * 处理表单提交
     */
    async handleSubmit(e) {
        e.preventDefault();

        if (this.state.isSubmitting) return;

        try {
            // 验证表单
            if (!this.validateForm()) return;

            this.state.isSubmitting = true;
            this.setLoadingState(true);
            this.clearError();

            // 获取表单数据
            const formData = {
                username: this.elements.username.val().trim(),
                password: this.elements.password.val()
            };

            // 发送请求到正确的接口路径
            const response = await $.ajax({
                url: '/api/auth/login',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData)
            });

            if (response.code === 200) {
                await this.handleLoginSuccess(response.data);
            } else {
                throw new Error(response.msg || '登录失败');
            }

        } catch (error) {
            this.handleLoginError(error);
        } finally {
            this.state.isSubmitting = false;
            this.setLoadingState(false);
        }
    }


    /**
     * 切换密码显示状态
     */
    togglePasswordVisibility() {
        this.state.isPasswordVisible = !this.state.isPasswordVisible;
        const type = this.state.isPasswordVisible ? 'text' : 'password';
        this.elements.password.attr('type', type);

        const icon = this.state.isPasswordVisible ? 'bi-eye-slash' : 'bi-eye';
        this.elements.togglePasswordBtn.find('i')
            .removeClass('bi-eye bi-eye-slash')
            .addClass(icon);
    }

    /**
     * 验证单个表单字段
     */
    validateField(fieldName) {
        const element = this.elements[fieldName];
        const rules = this.validation[fieldName];
        const value = element.val().trim();

        if (rules.required && !value) {
            this.showFieldError(element, rules.messages.required);
            return false;
        }

        if (value.length < rules.minLength) {
            this.showFieldError(element, rules.messages.minLength);
            return false;
        }

        if (value.length > rules.maxLength) {
            this.showFieldError(element, rules.messages.maxLength);
            return false;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
            this.showFieldError(element, rules.messages.pattern);
            return false;
        }

        this.clearFieldError(element);
        return true;
    }

    /**
     * 显示字段错误信息
     */
    showFieldError(element, message) {
        element.addClass('is-invalid')
            .removeClass('is-valid');

        // 查找或创建错误提示元素
        let feedback = element.siblings('.invalid-feedback');
        if (!feedback.length) {
            feedback = $('<div class="invalid-feedback"></div>').insertAfter(element);
        }
        feedback.text(message);
    }

    /**
     * 清除字段错误提示
     */
    clearFieldError(element) {
        element.removeClass('is-invalid')
            .addClass('is-valid')
            .siblings('.invalid-feedback')
            .remove();
    }

    /**
     * 验证整个表单
     */
    validateForm() {
        return ['username', 'password'].every(field => this.validateField(field));
    }

    /**
     * 显示错误提示
     */
    showError(message) {
        this.elements.errorAlert
            .removeClass('d-none')
            .text(message);
    }

    /**
     * 清除错误提示
     */
    clearError() {
        this.elements.errorAlert
            .addClass('d-none')
            .text('');
    }

    /**
     * 设置加载状态
     */
    setLoadingState(isLoading) {
        this.elements.submitBtn
            .prop('disabled', isLoading)
            .toggleClass('btn-loading', isLoading)
            .html(isLoading ? '' : '登录');

        this.elements.form.find('input')
            .prop('disabled', isLoading);
    }

    /**
     * 检查是否已登录
     */
    checkLoggedIn() {
        return !!localStorage.getItem('token');
    }

    /**
     * 恢复记住的用户名
     */
    async restoreUsername() {
        const username = localStorage.getItem('rememberedUsername');
        if (username) {
            this.elements.username.val(username);
            this.elements.rememberMe.prop('checked', true);
            this.state.rememberUsername = true;
        }
    }

    /**
     * 处理登录错误
     */
    handleLoginError(error) {
        let message = '登录失败，请稍后重试';

        if (error.code) {
            message = error.msg || message;
        }

        this.showError(message);
        this.elements.password.val('').focus();
    }

    /**
     * 资源清理
     */
    destroy() {
        // 解绑所有事件
        Object.values(this.elements).forEach(element => {
            element.off();
        });

        // 移除 DOM 引用
        this.elements = null;
    }
}

// 当文档加载完成后初始化登录页面
$(document).ready(() => {
    window.loginPage = new LoginPage();
});