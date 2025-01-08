/**
 * register.js
 * 注册页面控制器
 */
class Register extends BaseComponent {
    /**
     * 构造函数
     */
    constructor() {
        super({
            container: '#registerForm',
            events: {
                'submit #registerForm': '_handleSubmit',
                'click #togglePassword': '_handleTogglePassword',
                'click #toggleConfirmPassword': '_handleToggleConfirmPassword'
            }
        });

        // 缓存DOM元素
        this.form = $('#registerForm');
        this.username = $('#username');
        this.password = $('#password');
        this.confirmPassword = $('#confirmPassword');
        this.realName = $('#realName');
        this.email = $('#email');
        this.phone = $('#phone');
        this.submitBtn = $('#submitBtn');
        this.errorAlert = $('#errorAlert');
        this.togglePasswordBtn = $('#togglePassword');
        this.departmentSelect = $('#departmentId');
        this.positionSelect = $('#positionId');

        // 验证规则
        this.validationRules = {
            departmentId: {
                required: true
            },
            positionId: {
                required: true
            },
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
            }
        };

        // 状态标志
        this.isSubmitting = false;

        // 防抖处理
        this.debounceValidate = window.utils.debounce(
            (field) => this.validateField(field),
            300
        );
        // 初始化加载部门数据
        this._loadDepartments();

        // 添加部门选择事件监听
        this.departmentSelect.on('change', () => this._handleDepartmentChange());
        // 绑定事件
        this._bindEvents();
    }

    /**
     * 绑定事件处理
     */
    _bindEvents() {
        // 输入验证
        this.username.on('input', () => this.debounceValidate('username'));
        this.password.on('input', () => this.debounceValidate('password'));
        this.password.on('input', () => {
            // 密码变更时同时校验确认密码
            if (this.confirmPassword.val()) {
                this.validateField('confirmPassword');
            }
        });
        this.confirmPassword.on('input', () => this.debounceValidate('confirmPassword'));
        this.realName.on('input', () => this.debounceValidate('realName'));
        this.email.on('input', () => this.debounceValidate('email'));
        this.phone.on('input', () => this.debounceValidate('phone'));
    }

    /**
     * 处理表单提交
     * @param {Event} e - 事件对象
     */
    async _handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        if (!this._validateForm()) {
            return;
        }

        try {
            this.isSubmitting = true;
            this._setLoading(true);
            this._clearError();

            const formData = this._getFormData();

            // 调用注册接口
            const response = await window.requestUtil.post(Const.API.AUTH.POST_REGISTER, formData);

            if (response.code === 200) {
                this.showSuccess('注册成功，即将跳转到登录页面');
                setTimeout(() => {
                    window.location.href = '/pages/auth/login.html';
                }, 1500);
            } else {
                throw new Error(response.message || '注册失败');
            }

        } catch (error) {
            console.error('注册失败:', error);
            this._handleError(error);
        } finally {
            this.isSubmitting = false;
            this._setLoading(false);
        }
    }

    /**
     * 获取表单数据
     * @returns {Object} 表单数据对象
     */
    _getFormData() {
        return {
            username: this.username.val().trim(),
            password: this.password.val(),
            realName: this.realName.val().trim(),
            email: this.email.val().trim(),
            phone: this.phone.val().trim(),
            departmentId: parseInt(this.departmentSelect.val()) || null,
            positionId: parseInt(this.positionSelect.val()) || null
        };
    }

    /**
     * 加载部门数据
     * @private
     */
    async _loadDepartments() {
        try {
            const response = await window.requestUtil.get(Const.API.DEPT.GET_LIST);
            if(response.code === 200) {
                this._renderDepartmentOptions(response.data);
            }
        } catch(error) {
            console.error('加载部门数据失败:', error);
            this.showError('加载部门数据失败');
        }
    }

    /**
     * 渲染部门选项
     * @param {Array} departments - 部门数据
     * @private
     */
    _renderDepartmentOptions(departments) {
        const options = departments.map(dept =>
            `<option value="${dept.departmentId}">${dept.departmentName}</option>`
        );

        this.departmentSelect
            .find('option:not(:first)')
            .remove()
            .end()
            .append(options.join(''));
    }

    /**
     * 处理部门选择变更
     * @private
     */
    async _handleDepartmentChange() {
        const departmentId = this.departmentSelect.val();

        // 重置职位选择
        this.positionSelect
            .val('')
            .prop('disabled', !departmentId)
            .find('option:not(:first)')
            .remove();

        if(!departmentId) return;

        try {
            const response = await window.requestUtil.get(
                `/positions/${departmentId}`
            );

            if(response.code === 200) {
                this._renderPositionOptions(response.data);
            }
        } catch(error) {
            console.error('加载职位数据失败:', error);
            this.showError('加载职位数据失败');
        }
    }

    /**
     * 渲染职位选项
     * @param {Array} positions - 职位数据
     * @private
     */
    _renderPositionOptions(positions) {
        const options = positions.map(pos =>
            `<option value="${pos.positionId}">${pos.positionName}</option>`
        );

        this.positionSelect
            .find('option:not(:first)')
            .remove()
            .end()
            .append(options.join(''));
    }

    /**
     * 校验表单
     * @returns {boolean} 校验是否通过
     */
    _validateForm() {
        let isValid = true;

        // 验证所有字段
        Object.keys(this.validationRules).forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });

        // 密码确认验证
        if (this.password.val() !== this.confirmPassword.val()) {
            this._showFieldError(this.confirmPassword, '两次输入的密码不一致');
            isValid = false;
        }

        return isValid;
    }

    /**
     * 验证单个字段
     * @param {string} field - 字段名称
     * @returns {boolean} 验证结果
     */
    validateField(field) {
        const $field = this[field];
        const value = $field.val().trim();
        const rules = this.validationRules[field];

        // 错误消息
        let errorMessage = '';

        // 必填验证
        if (rules.required && !value) {
            errorMessage = '此项是必填的';
        }
        // 最小长度验证
        else if (rules.minLength && value.length < rules.minLength) {
            errorMessage = `最小长度为${rules.minLength}个字符`;
        }
        // 最大长度验证
        else if (rules.maxLength && value.length > rules.maxLength) {
            errorMessage = `最大长度为${rules.maxLength}个字符`;
        }
        // 密码确认校验
        else if (field === 'confirmPassword') {
            if (value !== this.password.val()) {
                errorMessage = '两次输入的密码不一致';
            }
        }
        // 正则验证
        else if (rules.pattern && !rules.pattern.test(value)) {
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
                    errorMessage = '请输入有效的手机号';
                    break;
                default:
                    errorMessage = '格式不正确';
            }
        }

        const isValid = !errorMessage;

        // 更新字段状态
        this._updateFieldStatus($field, isValid, errorMessage);

        return isValid;
    }

    /**
     * 显示字段错误
     * @param {jQuery} $field - 字段jQuery对象
     * @param {string} message - 错误信息
     */
    _showFieldError($field, message) {
        $field.addClass('is-invalid')
            .removeClass('is-valid');

        const $feedback = $field.siblings('.invalid-feedback');
        if ($feedback.length) {
            $feedback.text(message);
        } else {
            $field.after(`<div class="invalid-feedback">${message}</div>`);
        }
    }

    /**
     * 更新字段状态
     * @param {jQuery} $field - 字段jQuery对象
     * @param {boolean} isValid - 是否有效
     * @param {string} errorMessage - 错误信息
     */
    _updateFieldStatus($field, isValid, errorMessage = '') {
        if (isValid) {
            $field.addClass('is-valid')
                .removeClass('is-invalid');
            $field.siblings('.invalid-feedback').remove();
        } else {
            this._showFieldError($field, errorMessage);
        }
    }
    /**
     * 切换密码可见性
     * @param {Event} e - 事件对象
     * @private
     */
    _handleTogglePassword(e) {
        this._togglePasswordVisibility(this.password, $(e.currentTarget));
    }

    /**
     * 切换确认密码可见性
     * @param {Event} e - 事件对象
     * @private
     */
    _handleToggleConfirmPassword(e) {
        this._togglePasswordVisibility(this.confirmPassword, $(e.currentTarget));
    }

    /**
     * 切换密码输入框可见性
     * @param {jQuery} input - 密码输入框
     * @param {jQuery} icon - 切换图标
     * @private
     */
    _togglePasswordVisibility(input, icon) {
        const type = input.attr('type');
        const newType = type === 'password' ? 'text' : 'password';

        input.attr('type', newType);

        // 切换图标
        if (newType === 'text') {
            icon.removeClass('bi-eye').addClass('bi-eye-slash');
        } else {
            icon.removeClass('bi-eye-slash').addClass('bi-eye');
        }
    }

    /**
     * 处理错误
     * @param {Error} error - 错误对象
     */
    _handleError(error) {
        let errorMessage = '注册失败，请稍后重试';

        if (error.status === 400) {
            switch(error.code) {
                case 40001:
                    errorMessage = '用户名已存在';
                    break;
                case 40002:
                    errorMessage = '邮箱已被注册';
                    break;
                case 40003:
                    errorMessage = '手机号已被注册';
                    break;
                default:
                    errorMessage = error.message || errorMessage;
            }
        }

        this.showError(errorMessage);
    }

    /**
     * 清除错误提示
     */
    _clearError() {
        this.errorAlert
            .addClass('d-none')
            .text('');

        this.form.find('.is-invalid')
            .removeClass('is-invalid');
    }

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否加载中
     */
    _setLoading(isLoading) {
        this.submitBtn
            .prop('disabled', isLoading)
            .toggleClass('btn-loading', isLoading)
            .html(isLoading ? '' : '注册');

        this.form.find('input')
            .prop('disabled', isLoading);
    }

    /**
     * 销毁实例
     */
    destroy() {
        // 清除事件监听
        this.form.off();
        this.username.off();
        this.password.off();
        this.confirmPassword.off();
        this.realName.off();
        this.email.off();
        this.phone.off();
        this.togglePasswordBtn.off();
        // 移除新增的事件监听
        this.departmentSelect.off();
        this.positionSelect.off();

        // 取消防抖函数
        this.debounceValidate.cancel();

        // 清除DOM引用
        this.form = null;
        this.username = null;
        this.password = null;
        this.confirmPassword = null;
        this.realName = null;
        this.email = null;
        this.phone = null;
        this.submitBtn = null;
        this.errorAlert = null;
        this.togglePasswordBtn = null;
        this.departmentSelect = null;
        this.positionSelect = null;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.register = new Register();
});