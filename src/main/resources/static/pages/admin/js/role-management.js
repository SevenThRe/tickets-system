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

            if (response.code === 200) {
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

            if (response.code === 200) {
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
        if (this.state.loading) return;

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

            if (response.code === 200) {
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

            if (response.code === 200) {
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
        if (!confirm('确定要删除此用户吗？此操作不可恢复！')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/${userId}`,
                method: 'DELETE'
            });

            if (response.code === 200) {
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

            if (response.code === 200) {
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

        if (!confirm(`确定要${actionText}此用户吗？`)) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/${userId}/status`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({status: newStatus})
            });

            if (response.code === 200) {
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

    /// 处理重置密码
    /**
     * 处理重置密码
     * @private
     */
    async _handleResetPassword(userId) {
        if (!confirm('确定要重置此用户的密码吗？')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/${userId}/password`,
                method: 'PUT'
            });

            if (response.code === 200) {
                this._showSuccess('重置密码成功');
            } else {
                throw new Error(response.message || '重置密码失败');
            }
        } catch (error) {
            console.error('重置密码失��:', error);
            this._showError('重置密码失败：' + error.message);
        }
    }

    /**
     * 处理部门联动
     * @private
     */
    _handleDepartmentChange() {
        const deptId = $('#department').val();
        this.state.filters.departmentId = deptId;
        this.state.pagination.current = 1;
        this._loadUsers();
    }

    /**
     * 格式化日期
     * @private
     */
    _formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }

    /**
     * 获取角色名称
     * @private
     */
    _getRoleName(roleId) {
        const role = this.state.roles.find(role => role.id === roleId);
        return role ? role.name : '';
    }

    /**
     * 获取部门名称
     * @private
     */
    _getDepartmentName(deptId) {
        const dept = this.state.departments.find(dept => dept.id === deptId);
        return dept ? dept.name : '';
    }

    /**
     * 显示成功消息
     * @private
     */
    _showSuccess(message) {
        $.toast({
            heading: '成功',
            text: message,
            icon: 'success',
            showHideTransition: 'fade',
            allowToastClose: true,
            hideAfter: 3000,
            position: 'top-right'
        });
    }

    /**
     * 显示错误消息
     * @private
     */
    _showError(message) {
        $.toast({
            heading: '错误',
            text: message,
            icon: 'error',
            showHideTransition: 'fade',
            allowToastClose: true,
            hideAfter: 3000,
            position: 'top-right'
        });
    }

    /**
     * 显示加载中提示
     * @private
     */
    _showLoading() {
        this.$container.loading();
    }

    /**
     * 隐藏加载中提示
     * @private
     */
    _hideLoading() {
        this.$container.loading('stop');
    }

    /**
     * 重置表单
     * @private
     */
    _resetForm() {
        this.$userForm[0].reset();
        this._clearValidation();
    }

    /**
     * 填充表单
     * @private
     */
    _fillForm(user) {
        this.$userForm.find('input[name="username"]').val(user.username);
        this.$userForm.find('input[name="password"]').val(user.password);
        this.$userForm.find('input[name="realName"]').val(user.realName);
        this.$userForm.find('input[name="email"]').val(user.email);
        $('#role').val(user.roleId);
        $('#department').val(user.departmentId);
        $('#status').val(user.status);
    }

}

$(() => {
    new RoleManagement();
});