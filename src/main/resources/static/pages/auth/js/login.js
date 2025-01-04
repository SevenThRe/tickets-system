// /js/pages/auth/login.js

import {request} from "../../../js/utils/request-util";
import Validator from "../../../js/utils/validator-util";

/**
 * 登录页面逻辑控制
 * @author SeventhRe
 */
class LoginPage {
    constructor() {
        // 表单元素引用
        this.form = $('#loginForm');
        this.usernameInput = $('#username');
        this.passwordInput = $('#password');

        // 验证规则配置
        this.validator = Validator.createRules({
            username: [
                { type: 'required', message: '请输入用户名' },
                { type: 'minLength', param: 3, message: '用户名长度不能小于3个字符' }
            ],
            password: [
                { type: 'required', message: '请输入密码' },
                { type: 'minLength', param: 6, message: '密码长度不能小于6个字符' }
            ]
        });

        this.bindEvents();
    }

    /**
     * 绑定事件处理
     * @private
     */
    bindEvents() {
        this.form.on('submit', (e) => this.handleSubmit(e));
    }

    /**
     * 处理表单提交
     * @param {Event} e - 事件对象
     * @private
     */
    async handleSubmit(e) {
        e.preventDefault();

        // 表单数据收集
        const formData = {
            username: this.usernameInput.val().trim(),
            password: this.passwordInput.val()
        };

        try {
            // 表单验证
            const errors = await this.validator.validate(formData);
            if (Object.keys(errors).length > 0) {
                this.showErrors(errors);
                return;
            }

            // 发送登录请求
            const response = await request.post('/auth/login', formData);

            // 登录成功处理
            if (response.code === 200) {
                localStorage.setItem('token', response.data.token);
                // 根据角色跳转
                this.redirectByRole(response.data.userInfo.role);
            }
        } catch (error) {
            console.error('登录失败:', error);
            this.showError('登录失败，请稍后重试');
        }
    }

    /**
     * 根据用户角色进行页面跳转
     * @param {string} role - 用户角色
     * @private
     */
    redirectByRole(role) {
        const roleRedirectMap = {
            'ADMIN': '/admin/dashboard.html',
            'MANAGER': '/admin/dashboard.html',
            'USER': '/user/dashboard.html'
        };

        window.location.href = roleRedirectMap[role] || '/user/dashboard.html';
    }

    /**
     * 显示表单错误
     * @param {Object} errors - 错误信息对象
     * @private
     */
    showErrors(errors) {
        Object.entries(errors).forEach(([field, message]) => {
            const input = $(`#${field}`);
            input.addClass('is-invalid')
                .next('.invalid-feedback')
                .text(message);
        });
    }

    /**
     * 显示全局错误消息
     * @param {string} message - 错误信息
     * @private
     */
    showError(message) {
        // 可以使用Bootstrap的Toast或Alert组件显示错误
        alert(message);
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    new LoginPage();
});