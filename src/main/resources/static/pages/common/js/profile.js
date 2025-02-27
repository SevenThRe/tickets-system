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
            const userId = parsedUserInfo.userId;

            // 发送请求获取完整的用户信息
            const response = await $.ajax({
                url: `/api/users/${userId}/info`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                this.state.userInfo = response.data;
                this.updateUI();

            } else {
                throw new Error(response.msg || '加载用户信息失败');
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

        // 清除当前页面的内容
        $('#userName').text('');
        $('#userRole').text('');
        $('#userAvatar').attr('src', '');
        $('.profile-cover').removeClass('role-ADMIN role-DEPT role-USER');
        this.$basicInfoForm.find('input, select').val('').prop('readonly', false).prop('hidden', false).removeClass('bg-light');



        // 更新头部显示信息
        $('#userName').text(userInfo.realName || userInfo.username);
        $('#userRole').text(userInfo.roleName || '普通用户');

        const timestamp = new Date().getTime();
        const avatarPath = `/images/${userInfo.username}_${userInfo.userId}_avatar.png?t=${timestamp}`;

        $('#userAvatar')
            .attr('src', avatarPath)
            .on('error', function() {
                // 如果加载失败，使用默认头像
                $(this).attr('src', '/images/default-avatar.png');
            });

        // 更新角色背景色
        $('.profile-cover').removeClass('role-ADMIN role-DEPT role-USER')
            .addClass(`role-${userInfo.baseRoleCode}`);


        // 基本信息表单填充
        const formData = {
            'username': userInfo.username,        // 用户名(只读)
            'userId': userInfo.userId,            // 用户ID(隐藏)
            'realName': userInfo.realName,        // 真实姓名
            'email': userInfo.email,              // 邮箱
            'phone': userInfo.phone,              // 手机号
            'departmentName': userInfo.departmentName,  // 部门名称(只读,用于展示)
            'departmentId': userInfo.departmentId,      // 部门ID(隐藏,用于提交)
            'roleName': userInfo.roleName,        // 角色名称(只读,用于展示)
            'roleId': userInfo.roleId             // 角色ID(隐藏,用于提交)
        };

        // 遍历表单字段进行填充
        Object.keys(formData).forEach(field => {
            const $input = this.$basicInfoForm.find(`[name="${field}"]`);
            if($input.length) {
                $input.val(formData[field] || '');

                // 设置只读字段
                if(['username', 'departmentName', 'roleName'].includes(field)) {
                    $input.prop('readonly', true)
                        .addClass('bg-light');
                }

                // 隐藏字段
                if(['departmentId', 'roleId', 'userId'].includes(field)) {
                    $input.prop('hidden', true);
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
     * @param {Event} e - 表单提交事件对象
     */
    async handleBasicInfoSubmit(e) {
        e.preventDefault();
        if(this.state.loading) return;

        // 表单验证
        if(!this.validateBasicInfoForm()) {
            return;
        }

        try {
            this.state.loading = true;
            this.disableForm(true);

            // 获取表单数据
            const submitData = {
                userId: this.$basicInfoForm.find('input[name="userId"]').val(),  // 从隐藏字段获取
                realName: this.$basicInfoForm.find('input[name="realName"]').val(),
                email: this.$basicInfoForm.find('input[name="email"]').val(),
                phone: this.$basicInfoForm.find('input[name="phone"]').val(),
            };

            console.log(submitData);

            // 发送请求
            const response = await $.ajax({
                url: '/api/users/profile',
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify(submitData)
            });

            if(response.code === 200) {
                // 更新本地状态
                this.state.userInfo = {
                    ...this.state.userInfo,
                    ...response.data
                };

                NotifyUtil.success('个人信息更新成功');
                this.updateUI();
                setTimeout(() => {
                    window.location.reload();
                },3000)
            } else {
                throw new Error(response.msg || '更新失败');
            }

        } catch(error) {
            console.error('更新个人信息失败:', error);
            // 优先使用后端返回的错误信息
            const errorMsg = error.responseJSON ? error.responseJSON.msg : error.message;
            NotifyUtil.error(errorMsg || '更新失败，请重试');
        } finally {
            this.state.loading = false;
            this.disableForm(false);
        }
    }

    /**
     * 验证表单数据
     * @returns {boolean} 验证结果
     */
    validateBasicInfoForm() {
        const email = $('#email').val();
        const phone = $('#phone').val();
        const realName = $('#realName').val();

        // 真实姓名验证
        if(!realName || realName.length < 2) {
            NotifyUtil.error('请输入有效的真实姓名');
            return false;
        }

        // 邮箱格式验证
        if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            NotifyUtil.error('请输入有效的邮箱地址');
            return false;
        }

        // 手机号验证
        if(!/^1[3-9]\d{9}$/.test(phone)) {
            NotifyUtil.error('请输入有效的手机号码');
            return false;
        }

        return true;
    }

    /**
     * 禁用/启用表单
     * @param {boolean} disabled - 是否禁用
     */
    disableForm(disabled) {
        this.$basicInfoForm.find('input,button').not('[readonly]').prop('disabled', disabled);
        const $submitBtn = this.$basicInfoForm.find('[type="submit"]');

        if(disabled) {
            $submitBtn.html('<span class="spinner-border spinner-border-sm me-1"></span>提交中...');
        } else {
            $submitBtn.text('保存修改');
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
        // 设置变更事件
        $('.form-check-input').on('change', (e) => {
            this.handleSettingChange(e);
        });
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
                this.updateSettingsUI();
            }
        } catch (error) {
            console.error('加载用户设置失败:', error);
            NotifyUtil.error('加载设置失败');
        }
    }

    /**
     * 更新设置UI
     */
    updateSettingsUI() {
        const { settings } = this.state;
        // 更新开关状态
        Object.keys(settings).forEach(key => {
            $(`#${key}`).prop('checked', settings[key]);
        });
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
                    newPassword: data.newPassword,
                    userId: this.state.userInfo.userId
                })
            });

            if (response.code === 200) {
                this.showSuccess('密码修改成功');
                this.$passwordForm[0].reset();

                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/pages/auth/login.html';
            } else {
                throw new Error(response.msg || '修改失败');
            }

        } catch (error) {
            console.error('修改密码失败:', error);
            const errorMsg = error.responseJSON ? error.responseJSON.msg : error.message;
            NotifyUtil.error(errorMsg || '修改失败，请重试');
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

        // 检查文件类型
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validImageTypes.includes(file.type)) {
            NotifyUtil.error('请选择JPG、PNG或GIF格式的图片文件');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            NotifyUtil.error('图片大小不能超过2MB');
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
            NotifyUtil.error('请选择图片');
            return;
        }

        try {
            const formData = new FormData();
            // 修改这里的字段名为'file'以匹配后端
            formData.append('file', file);
            formData.append('userId', this.state.userInfo.userId);
            formData.append('username', this.state.userInfo.username);

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
                // 刷新头像显示
                // const avatarPath = `/images/${this.state.userInfo.username}_${this.state.userInfo.userId}_avatar.png?t=${new Date().getTime()}`;
                // $('#userAvatar').attr('src', avatarPath);
                this.avatarModal.hide();
                NotifyUtil.success('头像更新成功');
                // this.updateUI();
                setTimeout(() => {
                    window.location.reload();
                },3000)

            } else {
                throw new Error(response.msg || '上传失败');
            }

        } catch (error) {
            console.error('上传头像失败:', error);
            NotifyUtil.error(error.responseJSON?.msg || '上传失败，请重试');
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
                    [setting]: value,
                    userId: this.state.userInfo.userId
                })
            });

            if (response.code === 200) {
                this.state.settings[setting] = value;
                NotifyUtil.success('设置已更新');
            } else {
                // 恢复开关状态
                target.checked = !value;

                throw new Error(response.msg || '更新失败');
            }
        } catch (error) {
            console.error('更新设置失败:', error);
            NotifyUtil.error(error.responseJSON?.msg || '更新设置失败');
            // 恢复开关状态
            target.checked = !value;
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