/**
 * login.js
 * 登录页面业务逻辑处理
 *
 * 功能：
 * 1. 登录表单验证与提交
 * 2. 错误信息统一处理
 * 3. 登录状态管理
 * 4. 防重复提交
 *
 * @author SeventhRe
 * @version 1.0.0
 */

import { CONFIG } from '/static/config/index.js';
import { request } from '/static/js/utils/request-util.js';
import { eventBus } from '/static/js/utils/event-bus.js';
import  BaseComponent  from '/static/js/components/base/base-component.js';

class LoginPage extends BaseComponent {
    /**
     * 构造函数
     * 初始化页面组件和状态
     */

    constructor() {
        super({
            container: '#loginContainer', // 添加容器选择器
            events: {
                'submit #loginForm': '_handleSubmit',
                'input #username': '_handleUsernameInput',
                'input #password': '_handlePasswordInput',
                'keypress #password': '_handleEnterPress'
            }
        });
        // 缓存DOM引用
        this._initDomRefs();

        // 状态标志
        this.isSubmitting = false;

        // 初始化组件
        this.init();
    }

    /**
     * 缓存DOM引用
     * @private
     */
    _initDomRefs() {
        this.$form = $('#loginForm');
        this.$username = $('#username');
        this.$password = $('#password');
        this.$rememberMe = $('#rememberMe');
        this.$submitBtn = $('#submitBtn');
    }

    /**
     * 组件初始化
     * @override
     */
    async init() {
        try {
            await this._restoreUsername();
            this._initValidation();

            // 初始化防抖处理
            this._debouncedValidate = _.debounce(
                (field) => this._validateField(field),
                300
            );
        } catch (error) {
            console.error('登录页面初始化失败:', error);
        }
    }

    /**
     * 处理表单提交
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        if (!this._validateForm()) return;

        this.isSubmitting = true;
        this._setLoading(true);

        try {
            const formData = this._getFormData();
            // 使用request工具类发送请求
            const response = await request.post(
                CONFIG.API.AUTH.LOGIN,
                formData
            );

            if (response.code === 200) {
                this._handleLoginSuccess(response.data);
                // 使用事件总线触发登录成功事件
                eventBus.emit('auth:login', response.data);
            }
        } catch (error) {
            this._handleError(error);
        } finally {
            this.isSubmitting = false;
            this._setLoading(false);
        }
    }

    /**
     * 处理用户名输入
     * @param {Event} e - 事件对象
     * @private
     */
    _handleUsernameInput(e) {
        this._debouncedValidate('username');
    }

    /**
     * 处理密码输入
     * @param {Event} e - 事件对象
     * @private
     */
    _handlePasswordInput(e) {
        this._debouncedValidate('password');
    }

    /**
     * 处理回车按键
     * @param {Event} e - 事件对象
     * @private
     */
    _handleEnterPress(e) {
        if (e.key === 'Enter') {
            this.$form.submit();
        }
    }

    /**
     * 处理登录成功
     * @param {Object} data - 登录返回数据
     * @private
     */
    _handleLoginSuccess(data) {
        // 保存token和用户信息
        localStorage.setItem(CONFIG.JWT.TOKEN_KEY, data.token);
        localStorage.setItem('userInfo', JSON.stringify(data.user));

        // 处理记住用户名
        if (this.$rememberMe.prop('checked')) {
            localStorage.setItem('rememberedUsername', this.$username.val().trim());
        } else {
            localStorage.removeItem('rememberedUsername');
        }

        // 重定向
        this._redirect(data.user.roleCode);
    }

    /**
     * 处理错误
     * @param {Error} error - 错误对象
     * @private
     */
    _handleError(error) {
        // 使用基类的错误展示方法
        this.showError(error.message || CONFIG.MESSAGE.ERROR.SERVER);
    }

    /**
     * 页面重定向
     * @param {string} roleCode - 角色代码
     * @private
     */
    _redirect(roleCode) {
        const redirectMap = {
            'ADMIN': '/admin/dashboard.html',
            'USER': '/user/dashboard.html'
        };
        window.location.href = redirectMap[roleCode] || '/login.html';
    }

    /**
     * 表单验证和相关辅助方法
     */

    /**
     * 初始化验证规则
     * @private
     */
    _initValidation() {
        // 用户名验证规则
        this.usernameRules = {
            required: true,
            minlength: 3,
            maxlength: 20,
            pattern: /^[a-zA-Z0-9_]+$/
        };

        // 密码验证规则
        this.passwordRules = {
            required: true,
            minlength: 6,
            maxlength: 20
        };
    }

    /**
     * 验证整个表单
     * @returns {boolean} 验证结果
     * @private
     */
    _validateForm() {
        const isUsernameValid = this._validateField('username');
        const isPasswordValid = this._validateField('password');
        return isUsernameValid && isPasswordValid;
    }

    /**
     * 验证单个字段
     * @param {string} field - 字段名称(username|password)
     * @returns {boolean} 验证结果
     * @private
     */
    _validateField(field) {
        const $field = this[`$${field}`];
        const value = $field.val().trim();
        const rules = field === 'username' ? this.usernameRules : this.passwordRules;

        // 清除之前的错误提示
        this._clearFieldError(field);

        // 验证必填项
        if (rules.required && !value) {
            const message = field === 'username' ?
                CONFIG.MESSAGE.ERROR.VALIDATION.USERNAME_REQUIRED :
                CONFIG.MESSAGE.ERROR.VALIDATION.PASSWORD_REQUIRED;
            this._showFieldError(field, message);
            return false;
        }

        // 验证长度
        if (value.length < rules.minlength || value.length > rules.maxlength) {
            const message = field === 'username' ?
                CONFIG.MESSAGE.ERROR.VALIDATION.USERNAME_LENGTH :
                CONFIG.MESSAGE.ERROR.VALIDATION.PASSWORD_LENGTH;
            this._showFieldError(field, message);
            return false;
        }

        // 验证用户名格式
        if (field === 'username' && rules.pattern && !rules.pattern.test(value)) {
            this._showFieldError(field, CONFIG.MESSAGE.ERROR.VALIDATION.USERNAME_FORMAT);
            return false;
        }

        return true;
    }

    /**
     * 显示字段错误信息
     * @param {string} field - 字段名称
     * @param {string} message - 错误信息
     * @private
     */
    _showFieldError(field, message) {
        const $field = this[`$${field}`];
        const $feedback = $field.siblings('.invalid-feedback');

        $field.addClass('is-invalid');
        $feedback.text(message);

        // 使用BaseComponent的错误展示机制
        this.showError(message);
    }

    /**
     * 清除字段错误信息
     * @param {string} field - 字段名称
     * @private
     */
    _clearFieldError(field) {
        const $field = this[`$${field}`];
        const $feedback = $field.siblings('.invalid-feedback');

        $field.removeClass('is-invalid');
        $feedback.text('');
    }

    /**
     * 获取表单数据
     * @returns {Object} 表单数据对象
     * @private
     */
    _getFormData() {
        return {
            username: this.$username.val().trim(),
            password: this.$password.val(),
            rememberMe: this.$rememberMe.prop('checked')
        };
    }

    /**
     * 恢复记住的用户名
     * @private
     */
    async _restoreUsername() {
        try {
            const rememberedUsername = localStorage.getItem('rememberedUsername');
            if (rememberedUsername) {
                this.$username.val(rememberedUsername);
                this.$rememberMe.prop('checked', true);
            }
        } catch (error) {
            console.error('恢复用户名失败:', error);
        }
    }

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否处于加载状态
     * @private
     */
    _setLoading(isLoading) {
        const $btn = this.$submitBtn;
        const loadingHtml = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>登录中...';
        const normalHtml = '登录';

        $btn.prop('disabled', isLoading)
            .html(isLoading ? loadingHtml : normalHtml);

        // 设置输入框禁用状态
        this.$username.prop('disabled', isLoading);
        this.$password.prop('disabled', isLoading);
        this.$rememberMe.prop('disabled', isLoading);
    }

    /**
     * 清理组件资源
     * 继承自BaseComponent的destroy方法
     * @override
     */
    destroy() {
        // 清除防抖函数
        if (this._debouncedValidate) {
            this._debouncedValidate.cancel();
        }

        // 清除DOM引用
        this.$form = null;
        this.$username = null;
        this.$password = null;
        this.$rememberMe = null;
        this.$errorMsg = null;
        this.$submitBtn = null;

        // 调用父类销毁方法
        super.destroy();
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    new LoginPage();
});