/**
 * profile.js
 * 个人中心页面控制器
 */
class Profile extends BaseComponent {
    constructor() {
        super({
            container: '#main',
            events: {
                'submit #basicInfoForm': '_handleBasicInfoSubmit',
                'submit #passwordForm': '_handlePasswordSubmit',
                'click #uploadAvatarBtn': '_showAvatarModal',
                'change #avatarFile': '_handleAvatarPreview',
                'click #uploadAvatarSubmit': '_handleAvatarUpload',
                'change input[type="checkbox"]': '_handleSettingChange'
            }
        });

        // 状态管理
        this.state = {
            loading: false,
            userInfo: null,
            settings: {
                twoFactorAuth: false,
                loginNotification: false,
                ticketNotification: true,
                processNotification: true,
                systemNotification: true
            }
        };

        // 初始化模态框
        this.avatarModal = new bootstrap.Modal('#avatarModal');

        // 初始化验证器
        this.validator = window.validatorUtil;

        // 初始化
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            await this._loadUserInfo();
            await this._loadUserSettings();
            this._initNavbar();
            this._updateUI();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 加载用户信息
     * @private
     */
    async _loadUserInfo() {
        try {
            const response = await window.requestUtil.get(Const.API.USER.GET_CURRENT);
            this.state.userInfo = response.data;
        } catch (error) {
            console.error('加载用户信息失败:', error);
            throw error;
        }
    }

    /**
     * 加载用户设置
     * @private
     */
    async _loadUserSettings() {
        try {
            const response = await window.requestUtil.get(Const.API.USER.GET_SETTING);
            this.state.settings = {
                ...this.state.settings,
                ...response.data
            };
        } catch (error) {
            console.error('加载用户设置失败:', error);
            throw error;
        }
    }

    /**
     * 更新UI
     * @private
     */
    _updateUI() {
        // 更新用户基本信息
        const { userInfo } = this.state;
        $('#userName').text(userInfo.realName);
        $('#userRole').text(userInfo.roleName);
        $('#userAvatar').attr('src', userInfo.avatar || '/images/default-avatar.png');

        // 填充表单
        $('#basicInfoForm').find('input').each((_, input) => {
            const name = input.name;
            if (name in userInfo) {
                $(input).val(userInfo[name]);
            }
        });

        // 更新设置开关状态
        Object.entries(this.state.settings).forEach(([key, value]) => {
            $(`#${key}`).prop('checked', value);
        });
    }

    /**
     * 处理基本信息提交
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleBasicInfoSubmit(e) {
        e.preventDefault();
        if (this.state.loading) return;

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 表单验证
        const errors = await this.validator.validateForm('profileForm', data);
        if (Object.keys(errors).length > 0) {
            this._showFormErrors(form, errors);
            return;
        }

        try {
            this.state.loading = true;
            this._disableForm(form, true);

            const response = await window.requestUtil.put(Const.API.USER.PUT_UPDATE_PROFILE, data);

            this.state.userInfo = {
                ...this.state.userInfo,
                ...response.data
            };

            this.showSuccess('个人信息更新成功');
            this._updateUI();

        } catch (error) {
            console.error('更新个人信息失败:', error);
            this.showError(error.message || '更新失败，请重试');
        } finally {
            this.state.loading = false;
            this._disableForm(form, false);
        }
    }

    /**
     * 处理密码修改
     * @param {Event} e - 事件对象
     * @private
     */
    async _handlePasswordSubmit(e) {
        e.preventDefault();
        if (this.state.loading) return;

        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // 表单验证
        if (data.newPassword !== data.confirmPassword) {
            this.showError('两次输入的密码不一致');
            return;
        }

        const errors = await this.validator.validateForm('passwordForm', data);
        if (Object.keys(errors).length > 0) {
            this._showFormErrors(form, errors);
            return;
        }

        try {
            this.state.loading = true;
            this._disableForm(form, true);

            await window.requestUtil.put(Const.API.USER.PUT_CHANGE_PASSWORD, {
                oldPassword: data.currentPassword,
                newPassword: data.newPassword
            });

            this.showSuccess('密码修改成功');
            form.reset();

        } catch (error) {
            console.error('修改密码失败:', error);
            this.showError(error.message || '修改失败，请重试');
        } finally {
            this.state.loading = false;
            this._disableForm(form, false);
        }
    }

    /**
     * 显示头像上传模态框
     * @private
     */
    _showAvatarModal() {
        $('#avatarPreview').hide();
        $('#avatarFile').val('');
        this.avatarModal.show();
    }

    /**
     * 处理头像预览
     * @param {Event} e - 事件对象
     * @private
     */
    _handleAvatarPreview(e) {
        const file = e.target.files[0];
        if (!file) return;

        // 验证文件类型和大小
        if (!file.type.startsWith('image/')) {
            this.showError('请选择图片文件');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            this.showError('图片大小不能超过2MB');
            return;
        }

        // 预览图片
        const reader = new FileReader();
        reader.onload = (e) => {
            $('#avatarPreview')
                .attr('src', e.target.result)
                .show();
        };
        reader.readAsDataURL(file);
    }

    /**
     * 处理头像上传
     * @private
     */
    async _handleAvatarUpload() {
        const file = $('#avatarFile')[0].files[0];
        if (!file) {
            this.showError('请选择图片');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await window.requestUtil.post(Const.API.USER.POST_AVATAR_UPLOAD, formData);

            this.state.userInfo.avatar = response.data.url;
            this._updateUI();

            this.avatarModal.hide();
            this.showSuccess('头像更新成功');

        } catch (error) {
            console.error('上传头像失败:', error);
            this.showError('上传失败，请重试');
        }
    }

    /**
     * 处理设置变更
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleSettingChange(e) {
        const target = e.target;
        const setting = target.id;
        const value = target.checked;

        try {
            await window.requestUtil.put(Const.API.USER.PUT_SETTING_UPDATE, {
                [setting]: value
            });

            this.state.settings[setting] = value;
            this.showSuccess('设置已更新');

        } catch (error) {
            console.error('更新设置失败:', error);
            // 恢复原来的状态
            target.checked = this.state.settings[setting];
            this.showError('更新设置失败');
        }
    }

    /**
     * 显示表单错误
     * @param {HTMLFormElement} form - 表单元素
     * @param {Object} errors - 错误信息对象
     * @private
     */
    _showFormErrors(form, errors) {
        // 清除现有错误提示
        $(form).find('.is-invalid').removeClass('is-invalid');
        $(form).find('.invalid-feedback').remove();

        // 显示错误提示
        Object.entries(errors).forEach(([field, message]) => {
            const input = $(form).find(`[name="${field}"]`);
            input.addClass('is-invalid');
            input.after(`<div class="invalid-feedback">${message}</div>`);
        });
    }

    /**
     * 禁用/启用表单
     * @param {HTMLFormElement} form - 表单元素
     * @param {boolean} disabled - 是否禁用
     * @private
     */
    _disableForm(form, disabled) {
        $(form).find('input, button').prop('disabled', disabled);
        if (disabled) {
            $(form).find('[type="submit"]').html('<span class="spinner-border spinner-border-sm"></span> 提交中...');
        } else {
            $(form).find('[type="submit"]').text('保存');
        }
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.profile = new Profile();
});