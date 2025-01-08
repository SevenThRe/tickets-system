/**
 * UserManagement.js
 * 用户管理页面控制器
 */
class UserManagement {
    constructor() {
        // 缓存DOM元素引用
        this.$container = $('#main');
        this.$userList = $('#userList');
        this.$searchForm = $('#searchForm');
        this.$pagination = $('#pagination');
        this.$totalCount = $('#totalCount');
        this.$userForm = $('#userForm');

        // 状态管理
        this.state = {
            loading: false,
            mode: 'create',  // create|edit
            users: [],
            departments: [],
            roles: [],
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {
                keyword: '',
                roleId: '',
                departmentId: '',
                status: ''
            },
            currentUser: null
        };

        // 初始化模态框
        this.userModal = new bootstrap.Modal('#userModal');

        // 表单验证规则
        this.validationRules = {
            username: {
                required: true,
                pattern: /^[a-zA-Z0-9_]{3,20}$/,
                message: '用户名只能包含字母、数字和下划线，长度3-20位'
            },
            password: {
                required: true,
                minLength: 6,
                message: '密码不能少于6位'
            },
            realName: {
                required: true,
                maxLength: 20,
                message: '请输入真实姓名'
            },
            email: {
                required: true,
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: '请输入有效的邮箱地址'
            },
            role: {
                required: true,
                message: '请选择角色'
            },
            department: {
                required: true,
                message: '请选择部门'
            }
        };

        // 绑定事件
        this._bindEvents();

        // 初始化组件
        this.init();
    }

    /**
     * 绑定事件处理
     * @private
     */
    _bindEvents() {
        // 搜索相关事件
        this.$searchForm.on('submit', (e) => this._handleSearch(e));
        $('#resetBtn').on('click', () => this._handleReset());

        // 用户操作事件
        $('#createUserBtn').on('click', () => this._handleCreateUser());
        $('#saveUserBtn').on('click', () => this._handleSaveUser());

        // 编辑和删除事件
        this.$userList.on('click', '.edit-user', (e) => {
            const userId = $(e.currentTarget).data('id');
            this._handleEditUser(userId);
        });

        this.$userList.on('click', '.delete-user', (e) => {
            const userId = $(e.currentTarget).data('id');
            this._handleDeleteUser(userId);
        });

        // 禁用/启用事件
        this.$userList.on('click', '.toggle-status', (e) => {
            const userId = $(e.currentTarget).data('id');
            const status = $(e.currentTarget).data('status');
            this._handleToggleStatus(userId, status);
        });

        // 重置密码事件
        this.$userList.on('click', '.reset-password', (e) => {
            const userId = $(e.currentTarget).data('id');
            this._handleResetPassword(userId);
        });

        // 部门联动事件
        $('#department').on('change', () => this._handleDepartmentChange());

        // 表单验证
        this.$userForm.find('input,select').on('blur', (e) => {
            this._validateField($(e.target).attr('name'));
        });

        // 分页事件
        this.$pagination.on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && page !== this.state.pagination.current) {
                this.state.pagination.current = page;
                this._loadUsers();
            }
        });
    }

    /**
     * 初始化组件
     */
    async init() {
        try {
            // 并行加载数据
            await Promise.all([
                this._loadDepartments(),
                this._loadRoles(),
                this._loadUsers()
            ]);
        } catch (error) {
            console.error('初始化失败:', error);
            this._showError('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 加载部门数据
     * @private
     */
    async _loadDepartments() {
        try {
            const response = await $.ajax({
                url: '/api/departments',
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.departments = response.data;
                this._renderDepartmentOptions();
            } else {
                throw new Error(response.message || '加载部门数据失败');
            }
        } catch (error) {
            console.error('加载部门数据失败:', error);
            throw error;
        }
    }

    /**
     * 加载角色数据
     * @private
     */
    async _loadRoles() {
        try {
            const response = await $.ajax({
                url: '/api/roles',
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.roles = response.data;
                this._renderRoleOptions();
            } else {
                throw new Error(response.message || '加载角色数据失败');
            }
        } catch (error) {
            console.error('加载角色数据失败:', error);
            throw error;
        }
    }

    /**
     * 加载用户列表
     * @private
     */
    async _loadUsers() {
        if(this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const params = {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
                ...this.state.filters
            };

            const response = await $.ajax({
                url: '/api/users',
                method: 'GET',
                data: params
            });

            if(response.code === 200) {
                this.state.users = response.data.list;
                this.state.pagination.total = response.data.total;

                this._renderUserList();
                this._updatePagination();
            } else {
                throw new Error(response.message || '加载用户列表失败');
            }
        } catch (error) {
            console.error('加载用户列表失败:', error);
            this._showError('加载用户列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染用户列表
     * @private
     */
    _renderUserList() {
        const html = this.state.users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.realName}</td>
                <td>${this._getRoleName(user.roleId)}</td>
                <td>${this._getDepartmentName(user.departmentId)}</td>
                <td>${user.email}</td>
                <td>
                    <span class="status-badge status-${user.status ? 'active' : 'disabled'}">
                        ${user.status ? '正常' : '禁用'}
                    </span>
                </td>
                <td>${this._formatDate(user.createTime)}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary edit-user" 
                            data-id="${user.id}">
                        编辑
                    </button>
                    <button class="btn btn-sm btn-outline-warning reset-password"
                            data-id="${user.id}">
                        重置密码
                    </button>
                    <button class="btn btn-sm btn-outline-danger toggle-status"
                            data-id="${user.id}"
                            data-status="${user.status}">
                        ${user.status ? '禁用' : '启用'}
                    </button>
                </td>
            </tr>
        `).join('');

        this.$userList.html(html || '<tr><td colspan="8" class="text-center">暂无数据</td></tr>');
        this.$totalCount.text(this.state.pagination.total);
    }

    /**
     * 渲染部门选项
     * @private
     */
    _renderDepartmentOptions() {
        const options = this.state.departments.map(dept =>
            `<option value="${dept.id}">${dept.name}</option>`
        ).join('');

        $('#departmentFilter, #department').html(
            `<option value="">请选择部门</option>${options}`
        );
    }

    /**
     * 渲染角色选项
     * @private
     */
    _renderRoleOptions() {
        const options = this.state.roles.map(role =>
            `<option value="${role.id}">${role.name}</option>`
        ).join('');

        $('#roleFilter, #role').html(
            `<option value="">请选择角色</option>${options}`
        );
    }

    /**
     * 处理搜索
     * @private
     */
    _handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.state.filters = {
            keyword: formData.get('keyword'),
            roleId: formData.get('roleFilter'),
            departmentId: formData.get('departmentFilter'),
            status: formData.get('statusFilter')
        };
        this.state.pagination.current = 1;
        this._loadUsers();
    }

    /**
     * 处理重置
     * @private
     */
    _handleReset() {
        this.$searchForm[0].reset();
        this.state.filters = {
            keyword: '',
            roleId: '',
            departmentId: '',
            status: ''
        };
        this.state.pagination.current = 1;
        this._loadUsers();
    }

    /**
     * 处理创建用户
     * @private
     */
    _handleCreateUser() {
        this.state.mode = 'create';
        this.state.currentUser = null;
        this._resetForm();
        $('#userModal .modal-title').text('新建用户');
        this.userModal.show();
    }

    /**
     * 处理编辑用户
     * @private
     */
    async _handleEditUser(userId) {
        try {
            const response = await $.ajax({
                url: `/api/users/${userId}`,
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.currentUser = response.data;
                this.state.mode = 'edit';
                this._fillForm(response.data);
                $('#userModal .modal-title').text('编辑用户');
                this.userModal.show();
            } else {
                throw new Error(response.message || '加载用户信息失败');
            }
        } catch (error) {
            console.error('加载用户信息失败:', error);
            this._showError('加载用户信息失败');
        }
    }

    /**
     * 处理删除用户
     * @private
     */
    async _handleDeleteUser(userId) {
        if(!confirm('确定要删除此用户吗？此操作不可恢复！')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/${userId}`,
                method: 'DELETE'
            });

            if(response.code === 200) {
                this._showSuccess('删除成功');
                await this._loadUsers();
            } else {
                throw new Error(response.message || '删除失败');
            }
        } catch (error) {
            console.error('删除用户失败:', error);
            this._showError('删除失败：' + error.message);
        }
    }

    /**
     * 处理保存用户
     * @private
     */
    async _handleSaveUser() {
        if (!this._validateForm()) {
            return;
        }

        const formData = this._getFormData();
        const isEdit = this.state.mode === 'edit';

        try {
            this._disableForm(true);

            const response = await $.ajax({
                url: isEdit ? `/api/users/${this.state.currentUser.id}` : '/api/users',
                method: isEdit ? 'PUT' : 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData)
            });

            if(response.code === 200) {
                this._showSuccess(`${isEdit ? '更新' : '创建'}成功`);
                this.userModal.hide();
                await this._loadUsers();
            } else {
                throw new Error(response.message || `${isEdit ? '更新' : '创建'}失败`);
            }
        } catch (error) {
            console.error(`${isEdit ? '更新' : '创建'}用户失败:`, error);
            this._showError(`${isEdit ? '更新' : '创建'}失败：` + error.message);
        } finally {
            this._disableForm(false);
        }
    }

    /**
     * 处理切换用户状态
     * @private
     */
    async _handleToggleStatus(userId, currentStatus) {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const actionText = newStatus === 1 ? '启用' : '禁用';

        if(!confirm(`确定要${actionText}此用户吗？`)) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/${userId}/status`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ status: newStatus })
            });

            if(response.code === 200) {
                this._showSuccess(`${actionText}成功`);
                await this._loadUsers();
            } else {
                throw new Error(response.message || `${actionText}失败`);
            }
        } catch (error) {
            console.error(`${actionText}用户失败:`, error);
            this._showError(`${actionText}失败：` + error.message);
        }
    }

    /**
     * 处理重置密码
     * @private
     */
    async _handleResetPassword(userId) {
        if(!confirm('确定要重置该用户的密码吗？')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/${userId}/reset-password`,
                method: 'POST'
            });

            if(response.code === 200) {
                this._showSuccess('密码重置成功');
            } else {
                throw new Error(response.message || '重置密码失败');
            }
        } catch (error) {
            console.error('重置密码失败:', error);
            this._showError('重置密码失败：' + error.message);
        }
    }

    /**
     * 处理部门变更
     * @private
     */
    _handleDepartmentChange() {
        this._validateField('department');
    }

    /**
     * 验证表单
     * @private
     */
    _validateForm() {
        let isValid = true;
        const formData = this._getFormData();

        // 遍历所有验证规则
        Object.keys(this.validationRules).forEach(field => {
            if (!this._validateField(field, formData[field])) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * 验证单个字段
     * @private
     */
    _validateField(field, value) {
        const rules = this.validationRules[field];
        const $field = $(`#${field}`);
        let isValid = true;
        let errorMessage = '';

        // 获取字段值（如果未传入）
        if (value === undefined) {
            value = $field.val();
        }

        // 必填验证
        if (rules.required && !value) {
            isValid = false;
            errorMessage = rules.message;
        }

        // 长度验证
        if (isValid && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.message;
        }

        if (isValid && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = rules.message;
        }

        // 正则验证
        if (isValid && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }

        // 更新字段状态
        this._updateFieldStatus($field, isValid, errorMessage);
        return isValid;
    }

    /**
     * 更新字段验证状态
     * @private
     */
    _updateFieldStatus($field, isValid, errorMessage = '') {
        const $formGroup = $field.closest('.mb-3');
        $field.toggleClass('is-invalid', !isValid);

        let $feedback = $formGroup.find('.invalid-feedback');
        if (!$feedback.length) {
            $feedback = $('<div class="invalid-feedback"></div>').appendTo($formGroup);
        }
        $feedback.text(errorMessage);
    }

    /**
     * 获取表单数据
     * @private
     */
    _getFormData() {
        return {
            username: $('#username').val().trim(),
            password: $('#password').val(),
            realName: $('#realName').val().trim(),
            email: $('#email').val().trim(),
            roleId: $('#role').val(),
            departmentId: $('#department').val(),
            status: $('#status').prop('checked') ? 1 : 0
        };
    }

    /**
     * 填充表单数据
     * @private
     */
    _fillForm(user) {
        $('#username').val(user.username);
        $('#password').val('').prop('disabled', true);  // 编辑时禁用密码字段
        $('#realName').val(user.realName);
        $('#email').val(user.email);
        $('#role').val(user.roleId);
        $('#department').val(user.departmentId);
        $('#status').prop('checked', user.status === 1);
    }

    /**
     * 重置表单
     * @private
     */
    _resetForm() {
        this.$userForm[0].reset();
        $('#password').prop('disabled', false);  // 新建时启用密码字段
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').remove();
    }

    /**
     * 更新分页
     * @private
     */
    _updatePagination() {
        const { current, pageSize, total } = this.state.pagination;
        const totalPages = Math.ceil(total / pageSize);

        let html = '';

        // 上一页
        html += `
            <li class="page-item ${current === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current - 1}">上一页</a>
            </li>
        `;

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= current - 2 && i <= current + 2)
            ) {
                html += `
                    <li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (
                i === current - 3 ||
                i === current + 3
            ) {
                html += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }

        // 下一页
        html += `
            <li class="page-item ${current === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current + 1}">下一页</a>
            </li>
        `;

        this.$pagination.html(html);
    }

    /**
     * 获取角色名称
     * @private
     */
    _getRoleName(roleId) {
        const role = this.state.roles.find(r => r.id === roleId);
        return role ? role.name : '-';
    }

    /**
     * 获取部门名称
     * @private
     */
    _getDepartmentName(departmentId) {
        const dept = this.state.departments.find(d => d.id === departmentId);
        return dept ? dept.name : '-';
    }

    /**
     * 格式化日期
     * @private
     */
    _formatDate(date) {
        return new Date(date).toLocaleString();
    }

    /**
     * 禁用/启用表单
     * @private
     */
    _disableForm(disabled) {
        this.$userForm.find('input,select,textarea,button').prop('disabled', disabled);
        if (disabled) {
            $('#saveUserBtn').html(
                '<span class="spinner-border spinner-border-sm me-1"></span>保存中...'
            );
        } else {
            $('#saveUserBtn').text('保存');
        }
    }

    /**
     * 显示加载状态
     * @private
     */
    _showLoading() {
        if (!this.loadingEl) {
            this.loadingEl = $('<div class="loading-overlay">')
                .append('<div class="spinner-border text-primary">')
                .appendTo('body');
        }
        this.loadingEl.show();
    }

    /**
     * 隐藏加载状态
     * @private
     */
    _hideLoading() {
        if (this.loadingEl) {
            this.loadingEl.hide();
        }
    }

    /**
     * 显示错误消息
     * @private
     */
    _showError(message) {
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        this.$container.prepend(alertHtml);

        // 3秒后自动关闭
        setTimeout(() => {
            $('.alert').alert('close');
        }, 3000);
    }

    /**
     * 显示成功消息
     * @private
     */
    _showSuccess(message) {
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        this.$container.prepend(alertHtml);

        // 3秒后自动关闭
        setTimeout(() => {
            $('.alert').alert('close');
        }, 3000);
    }

    /**
     * 组件销毁
     * @public
     */
    destroy() {
        // 解绑所有事件
        this.$container.find('button').off('click');
        this.$container.find('input').off('input change');
        this.$userList.off('click');
        this.$searchForm.off('submit');
        this.$pagination.off('click');

        // 销毁模态框
        if (this.userModal) {
            this.userModal.dispose();
        }

        // 清理DOM引用
        if (this.loadingEl) {
            this.loadingEl.remove();
            this.loadingEl = null;
        }

        // 清理状态
        this.state = null;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.userManagement = new UserManagement();
});