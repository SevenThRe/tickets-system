/**
 * Profile.js
 * 个人中心页面控制器
 */
class Profile {
    constructor() {
        // 缓存DOM引用
        this.$container = $('#main');
        this.$basicInfoForm = $('#basicInfoForm');
        this.$passwordForm = $('#passwordForm');
        this.$avatarModal = $('#avatarModal');
        this.$avatarPreview = $('#avatarPreview');
        this.$uploadBtn = $('#uploadAvatarBtn');

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

        // 初始化Bootstrap模态框
        this.avatarModal = new bootstrap.Modal(this.$avatarModal[0]);

        // 绑定事件处理器
        this.bindEvents();

        // 初始化组件
        this.init();
    }

    /**
     * 加载用户信息
     */
    async loadUserInfo() {
        try {
            // 从localStorage获取用户基本信息
            const storedUserInfo = localStorage.getItem('userInfo');
            if (!storedUserInfo) {
                window.location.href = '/pages/auth/login.html';
                return;
            }

            const parsedUserInfo = JSON.parse(storedUserInfo);
            const userId = parsedUserInfo.userId; // 或使用 username，取决于后端API的设计

            // 发送请求获取完整的用户信息
            const response = await $.ajax({
                url: `/api/users/${userId}/info`, // 或 /api/users/info/${username}
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                this.state.userInfo = response.data;
                this.updateUI();
            } else {
                throw new Error(response.message || '加载用户信息失败');
            }
        } catch (error) {
            console.error('加载用户信息失败:', error);
            if (error.status === 401) {
                // token过期或无效，跳转到登录页
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/pages/auth/login.html';
            }
            throw error;
        }
    }

    /**
     * 更新UI显示
     */
    updateUI() {
        const { userInfo } = this.state;
        if (!userInfo) return;

        // 更新头部显示信息
        $('#userName').text(userInfo.realName || userInfo.username);
        $('#userRole').text(userInfo.roleName || '普通用户');
        $('#userAvatar').attr('src', userInfo.avatar || '/images/default-avatar.png');

        // 填充表单
        const formMappings = {
            'username': userInfo.username,
            'realName': userInfo.realName,
            'email': userInfo.email,
            'phone': userInfo.phone,
            'departmentName': userInfo.departmentName,
            'position': userInfo.position,
            // 添加其他需要显示的字段
        };

        // 遍历字段映射并填充表单
        Object.entries(formMappings).forEach(([field, value]) => {
            const $input = this.$basicInfoForm.find(`[name="${field}"]`);
            if ($input.length) {
                $input.val(value || '');

                // 对于只读字段添加禁用状态
                if (['username', 'departmentName', 'position'].includes(field)) {
                    $input.prop('readonly', true)
                        .addClass('bg-light');
                }
            }
        });

        // 更新设置状态
        Object.entries(this.state.settings).forEach(([key, value]) => {
            $(`#${key}`).prop('checked', value);
        });
    }

    /**
     * 处理基本信息提交
     */
    async handleBasicInfoSubmit(e) {
        e.preventDefault();
        if (this.state.loading) return;

        if (!this.validateBasicInfoForm()) {
            return;
        }

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            this.state.loading = true;
            this.disableForm(this.$basicInfoForm, true);

            // 添加用户ID
            data.userId = this.state.userInfo.userId;

            const response = await $.ajax({
                url: '/api/users/profile',
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(data)
            });

            if (response.code === 200) {
                this.state.userInfo = {
                    ...this.state.userInfo,
                    ...response.data
                };
                NotifyUtil.success('个人信息更新成功');
                this.updateUI();
            } else {
                throw new Error(response.message || '更新失败');
            }

        } catch (error) {
            console.error('更新个人信息失败:', error);
            NotifyUtil.error(error.message || '更新失败，请重试');

            if (error.status === 401) {
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userInfo');
                    window.location.href = '/pages/auth/login.html';
                }, 1500);
            }
        } finally {
            this.state.loading = false;
            this.disableForm(this.$basicInfoForm, false);
        }
    }

    /**
     * 绑定事件处理器
     */
    bindEvents() {
        // 表单提交
        this.$basicInfoForm.on('submit', (e) => this.handleBasicInfoSubmit(e));
        this.$passwordForm.on('submit', (e) => this.handlePasswordSubmit(e));

        // 头像上传
        this.$uploadBtn.on('click', () => this.showAvatarModal());
        $('#avatarFile').on('change', (e) => this.handleAvatarPreview(e));
        $('#uploadAvatarSubmit').on('click', () => this.handleAvatarUpload());

        // 设置变更
        $('input[type="checkbox"]').on('change', (e) => this.handleSettingChange(e));
    }


    /**
     * 初始化
     */
    async init() {
        try {
            await Promise.all([
                this.loadUserInfo(),
                this.loadUserSettings()
            ]);
            this.updateUI();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面初始化失败，请刷新重试');
        }
    }


    /**
     * 加载用户设置
     */
    async loadUserSettings() {
        try {
            const response = await $.ajax({
                url: '/api/users/settings',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                this.state.settings = {
                    ...this.state.settings,
                    ...response.data
                };
            } else {
                throw new Error(response.message || '加载用户设置失败');
            }
        } catch (error) {
            console.error('加载用户设置失败:', error);
            throw error;
        }
    }
    /**
     * 处理密码修改
     */
    async handlePasswordSubmit(e) {
        e.preventDefault();
        if (this.state.loading) return;

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (!this.validatePasswordForm(data)) {
            return;
        }

        try {
            this.state.loading = true;
            this.disableForm(this.$passwordForm, true);

            const response = await $.ajax({
                url: '/api/users/password',
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    oldPassword: data.currentPassword,
                    newPassword: data.newPassword
                })
            });

            if (response.code === 200) {
                this.showSuccess('密码修改成功');
                this.$passwordForm[0].reset();
            } else {
                throw new Error(response.message || '修改失败');
            }

        } catch (error) {
            console.error('修改密码失败:', error);
            this.showError(error.message || '修改失败，请重试');
        } finally {
            this.state.loading = false;
            this.disableForm(this.$passwordForm, false);
        }
    }

    /**
     * 处理头像预览
     */
    handleAvatarPreview(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            this.showError('请选择图片文件');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            this.showError('图片大小不能超过2MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.$avatarPreview
                .attr('src', e.target.result)
                .show();
        };
        reader.readAsDataURL(file);
    }

    /**
     * 处理头像上传
     */
    async handleAvatarUpload() {
        const file = $('#avatarFile')[0].files[0];
        if (!file) {
            this.showError('请选择图片');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await $.ajax({
                url: '/api/users/avatar',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                data: formData,
                processData: false,
                contentType: false
            });

            if (response.code === 200) {
                this.state.userInfo.avatar = response.data.url;
                this.updateUI();
                this.avatarModal.hide();
                this.showSuccess('头像更新成功');
            } else {
                throw new Error(response.message || '上传失败');
            }

        } catch (error) {
            console.error('上传头像失败:', error);
            this.showError('上传失败，请重试');
        }
    }

    /**
     * 处理设置变更
     */
    async handleSettingChange(e) {
        const target = e.target;
        const setting = target.id;
        const value = target.checked;

        try {
            const response = await $.ajax({
                url: '/api/users/settings',
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({
                    [setting]: value
                })
            });

            if (response.code === 200) {
                this.state.settings[setting] = value;
                this.showSuccess('设置已更新');
            } else {
                throw new Error(response.message || '更新失败');
            }

        } catch (error) {
            console.error('更新设置失败:', error);
            // 恢复原来的状态
            target.checked = this.state.settings[setting];
            this.showError('更新设置失败');
        }
    }

    /**
     * 显示头像上传模态框
     */
    showAvatarModal() {
        this.$avatarPreview.hide();
        $('#avatarFile').val('');
        this.avatarModal.show();
    }

    /**
     * 验证基本信息表单
     */
    validateBasicInfoForm() {
        const email = $('#email').val();
        const phone = $('#phone').val();

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            this.showError('请输入有效的邮箱地址');
            return false;
        }

        if (!/^1[3-9]\d{9}$/.test(phone)) {
            this.showError('请输入有效的手机号码');
            return false;
        }

        return true;
    }

    /**
     * 验证密码表单
     */
    validatePasswordForm(data) {
        if (!data.currentPassword) {
            this.showError('请输入当前密码');
            return false;
        }

        if (!data.newPassword || data.newPassword.length < 6) {
            this.showError('新密码长度不能少于6位');
            return false;
        }

        if (data.newPassword !== data.confirmPassword) {
            this.showError('两次输入的密码不一致');
            return false;
        }

        return true;
    }

    /**
     * 禁用/启用表单
     */
    disableForm($form, disabled) {
        $form.find('input,button').prop('disabled', disabled);
        const $submitBtn = $form.find('[type="submit"]');
        if (disabled) {
            $submitBtn.html('<span class="spinner-border spinner-border-sm"></span> 提交中...');
        } else {
            $submitBtn.text('保存');
        }
    }

    // 在 Profile 类中
    showSuccess(message) {
        NotifyUtil.success(message);
    }

    showError(message) {
        NotifyUtil.error(message);
    }

    /**
     * 销毁实例
     */
    destroy() {
        // 清理事件监听
        this.$basicInfoForm.off();
        this.$passwordForm.off();
        this.$uploadBtn.off();
        $('input[type="checkbox"]').off();

        // 销毁模态框
        if (this.avatarModal) {
            this.avatarModal.dispose();
        }

        // 清理状态和引用
        this.state = null;
        this.$container = null;
        this.$basicInfoForm = null;
        this.$passwordForm = null;
        this.$avatarModal = null;
        this.$avatarPreview = null;
        this.$uploadBtn = null;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.profile = new Profile();
});