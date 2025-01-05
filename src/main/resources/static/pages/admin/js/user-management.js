/**
 * UserManagement.js
 * 用户管理页面控制器
 */
class UserManagement extends BaseComponent {
    constructor() {
        super({
            container: '#main',
            events: {
                'submit #searchForm': '_handleSearch',
                'click #createUserBtn': '_handleCreateUser',
                'click .edit-user': '_handleEditUser',
                'click .delete-user': '_handleDeleteUser',
                'click #saveUserBtn': '_handleSaveUser',
                'change #department': '_handleDepartmentChange',
                'change #role': '_handleRoleChange'
            }
        });

        // 组件状态
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

        // 模态框实例
        this.userModal = null;

        // 表单验证规则
        this.validationRules = {
            username: {
                required: true,
                pattern: /^[a-zA-Z0-9_]{3,20}$/,
                message: '用户名必须为3-20位字母、数字或下划线'
            },
            password: {
                required: function(state) {
                    return state.mode === 'create';
                },
                minLength: 6,
                message: '密码长度不能少于6位'
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

        // 初始化组件
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            this.state.loading = true;
            await Promise.all([
                this._loadDepartments(),
                this._loadRoles(),
                this._loadUsers()
            ]);
            this._initModal();
            this.render();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('加载数据失败，请刷新页面重试');
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 加载部门数据
     */
    async _loadDepartments() {
        const response = await window.requestUtil.get('/api/departments');
        this.state.departments = response.data;
        this._renderDepartmentOptions();
    }

    /**
     * 加载角色数据
     */
    async _loadRoles() {
        const response = await window.requestUtil.get('/api/roles');
        this.state.roles = response.data;
        this._renderRoleOptions();
    }

    /**
     * 加载用户列表
     */
    async _loadUsers() {
        const params = {
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
            ...this.state.filters
        };

        const response = await window.requestUtil.get('/api/users', params);
        this.state.users = response.data.list;
        this.state.pagination.total = response.data.total;

        this._renderUserList();
        this._renderPagination();
    }

    /**
     * 初始化模态框
     */
    _initModal() {
        this.userModal = new bootstrap.Modal(document.getElementById('userModal'));
    }

    /**
     * 渲染部门选项
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
     * 渲染用户列表
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
                <td>${window.utils.formatDate(user.createTime)}</td>
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

        $('#userList').html(html);
    }

    /**
     * 渲染分页
     */
    _renderPagination() {
        const { current, pageSize, total } = this.state.pagination;
        const totalPages = Math.ceil(total / pageSize);

        $('#totalCount').text(total);

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${i === current ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        $('#pagination').html(html);
    }

    /**
     * 处理搜索
     */
    async _handleSearch(e) {
        e.preventDefault();

        this.state.filters = {
            keyword: $('#keyword').val().trim(),
            roleId: $('#roleFilter').val(),
            departmentId: $('#departmentFilter').val(),
            status: $('#statusFilter').val()
        };

        this.state.pagination.current = 1;
        await this._loadUsers();
    }

    /**
     * 处理创建用户
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
     */
    async _handleEditUser(e) {
        const userId = $(e.currentTarget).data('id');
        this.state.mode = 'edit';

        try {
            const response = await window.requestUtil.get(`/api/users/${userId}`);
            this.state.currentUser = response.data;
            this._fillForm(response.data);
            $('#userModal .modal-title').text('编辑用户');
            this.userModal.show();
        } catch (error) {
            this.showError('加载用户信息失败');
        }
    }

    /**
     * 处理删除用户
     * @param {Event} e - 事件对象
     */
    async _handleDeleteUser(e) {
        const userId = $(e.currentTarget).data('id');

        // 显示确认对话框
        if (!confirm('确定要删除此用户吗？此操作不可恢复！')) {
            return;
        }

        try {
            await window.requestUtil.delete(`/api/users/${userId}`);
            this.showSuccess('删除成功');
            await this._loadUsers(); // 重新加载用户列表
        } catch (error) {
            this.showError('删除失败：' + error.message);
        }
    }

    /**
     * 处理保存用户
     */
    async _handleSaveUser() {
        if (!this._validateForm()) {
            return;
        }

        const formData = this._getFormData();

        try {
            if (this.state.mode === 'create') {
                await window.requestUtil.post('/api/users', formData);
                this.showSuccess('创建成功');
            } else {
                await window.requestUtil.put(`/api/users/${this.state.currentUser.id}`, formData);
                this.showSuccess('更新成功');
            }

            this.userModal.hide();
            await this._loadUsers(); // 重新加载用户列表
        } catch (error) {
            this.showError('保存失败：' + error.message);
        }
    }

    /**
     * 处理部门变更
     * @param {Event} e - 事件对象
     */
    _handleDepartmentChange(e) {
        const departmentId = $(e.target).val();
        // 可以在这里添加部门联动逻辑
        this._validateField('department');
    }

    /**
     * 处理角色变更
     * @param {Event} e - 事件对象
     */
    _handleRoleChange(e) {
        const roleId = $(e.target).val();
        // 可以在这里添加角色权限联动逻辑
        this._validateField('role');
    }

    /**
     * 验证表单
     * @returns {boolean} 验证结果
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
     * @param {string} field - 字段名
     * @param {*} value - 字段值
     * @returns {boolean} 验证结果
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
        if (rules.required) {
            const required = typeof rules.required === 'function' ?
                rules.required(this.state) : rules.required;

            if (required && !value) {
                isValid = false;
                errorMessage = rules.message;
            }
        }

        // 长度验证
        if (isValid && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `最小长度为${rules.minLength}个字符`;
        }

        if (isValid && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `最大长度为${rules.maxLength}个字符`;
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
     * @param {jQuery} $field - 字段jQuery对象
     * @param {boolean} isValid - 是否有效
     * @param {string} errorMessage - 错误信息
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
     * @returns {Object} 表单数据对象
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
     * @param {Object} user - 用户数据
     */
    _fillForm(user) {
        $('#username').val(user.username);
        $('#password').val(''); // 编辑时不显示密码
        $('#realName').val(user.realName);
        $('#email').val(user.email);
        $('#role').val(user.roleId);
        $('#department').val(user.departmentId);
        $('#status').prop('checked', user.status === 1);

        // 清除所有验证状态
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').remove();
    }

    /**
     * 重置表单
     */
    _resetForm() {
        $('#userForm')[0].reset();
        $('.is-invalid').removeClass('is-invalid');
        $('.invalid-feedback').remove();
        $('#status').prop('checked', true); // 默认启用账号
    }

    /**
     * 组件销毁
     */
    destroy() {
        // 清除事件监听
        super.destroy();

        // 销毁模态框
        if (this.userModal) {
            this.userModal.dispose();
        }
    }
}

// 页面加载完成后初始化用户管理组件
$(document).ready(() => {
    window.userManagement = new UserManagement();
});