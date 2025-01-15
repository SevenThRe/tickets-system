/**
 * 用户管理类
 */
class UserManagement {
    constructor() {
        // 状态管理
        this.state = {
            loading: false,
            users: [],
            currentUser: null,
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
            }
        };

        // DOM元素缓存
        this.elements = {
            container: $('#main'),
            userList: $('#userList'),
            searchForm: $('#searchForm'),
            pagination: $('#pagination'),
            totalCount: $('#totalCount'),
            userModal: new bootstrap.Modal($('#userModal')[0])
        };

        // 用户状态常量
        this.USER_STATUS = {
            ENABLED: 1,
            DISABLED: 0
        };

        this.$userInfoCard = $(`
            <div class="user-info-card">
                <div class="user-info-header">
                    <div class="user-info-avatar">
                        <i class="bi bi-person"></i>
                    </div>
                    <div class="user-info-name">
                        <h6></h6>
                        <small></small>
                    </div>
                </div>
                <div class="user-info-content">
                    <div class="user-info-item">
                        <div class="user-info-label">用户名</div>
                        <div class="user-info-value username"></div>
                    </div>
                    <div class="user-info-item">
                        <div class="user-info-label">真实姓名</div>
                           <div class="user-info-value realname"></div>
                    </div>
                    <div class="user-info-item">
                        <div class="user-info-label">部门</div>
                        <div class="user-info-value department"></div>
                    </div>
                    <div class="user-info-item">
                        <div class="user-info-label">手机号</div>
                        <div class="user-info-value phone"></div>
                    </div>
                    <div class="user-info-item">
                        <div class="user-info-label">角色</div>
                        <div class="user-info-value role"></div>
                    </div>
                    <div class="user-info-item">
                        <div class="user-info-label">邮箱</div>
                        <div class="user-info-value email"></div>
                    </div>
                    <div class="user-info-item">
                        <div class="user-info-label">创建时间</div>
                        <div class="user-info-value createtime"></div>
                    </div>
                </div>
            </div>
        `).appendTo('body');

        // 绑定鼠标移入移出事件
        this._bindHoverEvents();

        // 初始化组件
        this.init();
    }

    /**
     * 初始化方法
     */
    async init() {
        try {
            await Promise.all([
                this._loadRoles(), // 加载角色数据
                this._loadDepartments(), // 加载部门数据
                this._loadUsers() // 加载用户列表
            ]);

            // 绑定事件
            this._bindEvents();

            // 检查URL参数
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('userId');
            if (userId) {
                this._loadUserDetail(userId);
            }
        } catch (error) {
            console.error('初始化失败:', error);
            NotifyUtil.error('加载失败，请刷新重试');
        }
    }

    /**
     * 绑定事件处理
     */
    _bindEvents() {

        // 重置按钮
        $('#resetBtn').on('click', () => this._handleReset());

        // 创建用户按钮
        $('#createUserBtn').on('click', () => this._showCreateModal());

        // 用户列表操作
        this.elements.userList.on('click', '.edit-user', (e) => {
            const userId = $(e.currentTarget).data('id');
            this._handleEditUser(userId);
        });

        this.elements.userList.on('click', '.toggle-status', (e) => {
            const userId = $(e.currentTarget).data('id');
            const status = $(e.currentTarget).data('status');
            this._handleToggleStatus(userId, status);
        });

        this.elements.userList.on('click', '.reset-password', (e) => {
            const userId = $(e.currentTarget).data('id');
            this._handleResetPassword(userId);
        });
        let searchTimer;

        // 保存用户按钮
        $('#saveUserBtn').on('click', () => this._handleSaveUser());

        // 表单筛选变化
        $('#roleFilter, #departmentFilter, #statusFilter').on('change', (e) => {
            if (searchTimer) {
                clearTimeout(searchTimer);
            }
            searchTimer = setTimeout(() => {
                this._handleSearch(e);
            }, 500);
        });
        // 搜索表单提交
        this.elements.searchForm.on('submit', (e) => {
            e.preventDefault();
            if (searchTimer) {
                clearTimeout(searchTimer);
            }
            this._handleSearch(e);
        });

        // 输入框值变化时也触发防抖搜索
        $('#keyword').on('input', (e) => {
            if (searchTimer) {
                clearTimeout(searchTimer);
            }
            searchTimer = setTimeout(() => {
                this._handleSearch(e);
            }, 500);
        });
    }

    /**
     * 加载用户列表
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
                url: '/api/users/list',
                method: 'GET',
                data: params
            });

            if (response.code === 200) {
                this.state.users = response.data.list;
                this.state.pagination.total = response.data.total;
                this._renderUserList();
                this._updatePagination();
            }
        } catch (error) {
            console.error('加载用户列表失败:', error);
            NotifyUtil.error('加载用户列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染用户列表
     */
    _renderUserList() {
        this.elements.totalCount.text(this.state.pagination.total || 0);
        if (!this.state.users || !this.state.users.length) {
            this.elements.userList.html(
                '<tr><td colspan="8" class="text-center">暂无用户数据</td></tr>'
            );
            return;
        }
        const getRoleBadgeClass = (baseRoleCode) => {
            switch(baseRoleCode) {
                case 'ADMIN': return 'role-badge role-admin';
                case 'DEPT': return 'role-badge role-dept';
                case 'USER': return 'role-badge role-user';
                default: return 'role-badge role-user';
            }
        };
        const html = this.state.users.map((user,index) => `
        <tr data-index="${index}">
            <td class="col-username"><span>${this._escapeHtml(user.username)}</span></td>
            <td class="col-realname"><span>${this._escapeHtml(user.realName)}</span></td>
            <td class="col-role">
                <span class="${getRoleBadgeClass(user.baseRoleCode)}">
                    ${this._escapeHtml(user.roleName)}
                </span>
            </td>
            <td class="col-department"><span>${this._escapeHtml(user.departmentName)}</span></td>
            <td class="col-email"><span>${this._escapeHtml(user.email)}</span></td>
            <td class="col-status">
                <span class="status-badge ${user.status === 1 ? 'status-enabled' : 'status-disabled'}">
                    ${user.status === 1 ? '正常' : '禁用'}
                </span>
            </td>
            <td class="col-createtime"><span>${this._formatDate(user.createTime)}</span></td>
            <td class="col-actions">
                <button class="btn btn-sm btn-outline-primary me-1 edit-user" data-id="${user.userId}">
                        <i class="bi bi-pencil"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-outline-warning me-1 reset-password" data-id="${user.userId}">
                        <i class="bi bi-key"></i> 重置密码
                    </button>
                    <button class="btn btn-sm btn-outline-${user.status === 1 ? 'danger' : 'success'} toggle-status" 
                            data-id="${user.userId}" 
                            data-status="${user.status}">
                        <i class="bi bi-${user.status === 1 ? 'x-circle' : 'check-circle'}"></i>
                        ${user.status === 1 ? '禁用' : '启用'}
                    </button>
            </td>t_role
        </tr>
    `).join('');

        this.elements.userList.html(html);
        this.elements.totalCount.text(this.state.pagination.total);
    }

    _showUserInfoCard(user, $row) {
        // 更新卡片内容
        const avatarSrc = `/images/${user.username}_${user.userId}_avatar.png`;

        // 创建一个临时Image对象检查头像是否存在
        const img = new Image();
        img.onload = () => {
            // 头像存在,使用用户头像
            this.$userInfoCard.find('.user-info-avatar').html(`
            <img src="${avatarSrc}" alt="avatar" 
                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
        `);
        };
        img.onerror = () => {
            // 头像不存在,使用默认头像
            this.$userInfoCard.find('.user-info-avatar').html(`
            <img src="/images/default-avatar.png" alt="default avatar" 
                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
        `);
        };
        img.src = avatarSrc;
        this.$userInfoCard.find('.user-info-avatar h6').text(user.realName);
        this.$userInfoCard.find('.user-info-name h6').text(user.realName);
        this.$userInfoCard.find('.user-info-name small').text(user.roleName);
        this.$userInfoCard.find('.username').text(user.username);
        this.$userInfoCard.find('.realname').text(user.realName);
        this.$userInfoCard.find('.department').text(user.departmentName || '无部门');
        this.$userInfoCard.find('.role').text(user.roleName);
        this.$userInfoCard.find('.phone').text(user.phone || '未填写');
        this.$userInfoCard.find('.email').text(user.email);
        this.$userInfoCard.find('.createtime').text(this._formatDate(user.createTime));

        // 计算卡片位置
        const rowOffset = $row.offset();
        const rowHeight = $row.outerHeight();
        const cardHeight = this.$userInfoCard.outerHeight();
        const windowHeight = $(window).height();

        // 判断卡片显示位置（上方还是下方）
        let top = rowOffset.top + rowHeight + 5;
        if (top + cardHeight > windowHeight) {
            top = rowOffset.top - cardHeight - 5;
        }

        // 设置位置并显示卡片
        this.$userInfoCard.css({
            top: top,
            left: rowOffset.left + 100
        }).addClass('show');
    }

    _hideUserInfoCard() {
        this.$userInfoCard.removeClass('show');
    }

    /**
     * 处理搜索
     */
    _handleSearch(e) {
        e.preventDefault();

        this.state.filters = {
            keyword: $('#keyword').val() || '',
            roleId: $('#roleFilter').val() || '',
            departmentId: $('#departmentFilter').val() || '',
            status: $('#statusFilter').val() || ''
        };

        this.state.pagination.current = 1;
        this._loadUsers();
    }

    /**
     * 处理重置
     */
    _handleReset() {
        this.elements.searchForm[0].reset();
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
     * 处理保存用户
     */
    async _handleSaveUser() {
        const formData = this._getFormData();
        if (!this._validateForm(formData)) {
            return;
        }

        try {
            const isEdit = this.state.currentUser != null;
            const url = isEdit ? `/api/users/${this.state.currentUser.userId}` : '/api/users';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await $.ajax({
                url,
                method,
                contentType: 'application/json',
                data: JSON.stringify(formData)
            });

            if (response.code === 200) {
                NotifyUtil.success(`${isEdit ? '更新' : '创建'}成功`);
                this.elements.userModal.hide();
                await this._loadUsers();
            }
        } catch (error) {
            console.error('保存用户失败:', error);
            NotifyUtil.error(`${this.state.currentUser ? '更新' : '创建'}失败，请重试`);
        }
    }
    /**
     * 显示创建用户模态框
     */
    _showCreateModal() {
        this.state.currentUser = null;
        this._resetForm();
        $('#userModalTitle').text('新建用户');

        // 重置启用状态为不勾选
        $('#status').prop('checked', false);

        // 启用密码输入
        $('#password').prop('disabled', false).prop('required', true);

        this.elements.userModal.show();
    }

    /**
     * 处理编辑用户
     */
    async _handleEditUser(userId) {
        try {
            const response = await $.ajax({
                url: `/api/users/${userId}/info`,
                method: 'GET'
            });

            if (response.code === 200) {
                this.state.currentUser = response.data;
                this._fillForm(response.data);
                $('#userModalTitle').text('编辑用户');

                // 根据当前状态设置启用复选框
                $('#status').prop('checked', response.data.status === 1);

                // 编辑时禁用密码输入
                $('#password').prop('disabled', true).prop('required', false);

                this.elements.userModal.show();
            }
        } catch (error) {
            console.error('加载用户信息失败:', error);
            NotifyUtil.error('加载用户信息失败');
        }
    }


    /**
     * 填充表单数据
     */
    _fillForm(user) {
        $('#username').val(user.username);
        $('#realName').val(user.realName);
        $('#email').val(user.email);
        $('#phone').val(user.phone || '');
        $('#role').val(user.roleId || '');
        $('#department').val(user.departmentId || '');

        $('#status').prop('checked', user.status === 1);
    }

    /**
     * 获取表单数据
     */
    _getFormData() {
        const formData = {
            username: $('#username').val().trim(),
            realName: $('#realName').val().trim(),
            phone: $('#phone').val().trim() || null,
            email: $('#email').val().trim(),
            status: $('#status').prop('checked') ? 1 : 0
        };

        // 只有当用户选择了角色时才添加roleId
        const roleId = $('#role').val();
        if (roleId) {
            formData.roleId = roleId;
        }

        // 只有当用户选择了部门时才添加departmentId
        const departmentId = $('#department').val();
        if (departmentId) {
            formData.departmentId = departmentId;
        }

        // 创建用户时的密码处理
        if (!this.state.currentUser && $('#password').val()) {
            formData.password = $('#password').val();
        }

        return formData;
    }

    /**
     * 表单验证
     */
    _validateForm(formData) {
        // 用户名验证
        if (!formData.username || formData.username.length < 3) {
            NotifyUtil.warning('用户名至少需要3个字符');
            return false;
        }

        // 真实姓名验证
        if (!formData.realName) {
            NotifyUtil.warning('请输入真实姓名');
            return false;
        }

        // 邮箱格式验证
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            NotifyUtil.warning('请输入有效的邮箱地址');
            return false;
        }

        // 新建用户时的密码验证
        if (!this.state.currentUser) {
            if (!formData.password || formData.password.length < 6) {
                NotifyUtil.warning('密码至少需要6个字符');
                return false;
            }
        }

        if (formData.phone) {
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(formData.phone)) {
                NotifyUtil.warning('请输入有效的手机号');
                return false;
            }
        }

        return true;
    }

    /**
     * 处理重置密码
     */
    async _handleResetPassword(userId) {
        if (!confirm('确定要重置该用户的密码吗？')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/${userId}/reset-password`,
                method: 'POST'
            });

            if (response.code === 200) {
                NotifyUtil.success('密码重置成功');
            }
        } catch (error) {
            console.error('重置密码失败:', error);
            NotifyUtil.error('密码重置失败，请重试');
        }
    }

    /**
     * 处理状态切换
     */
    async _handleToggleStatus(userId, currentStatus) {
        const newStatus = currentStatus === 1 ? 0 : 1;
        const actionText = newStatus === 1 ? '启用' : '禁用';

        if (!confirm(`确定要${actionText}该用户吗？`)) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/${userId}/status`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    status: newStatus
                })
            });

            if (response.code === 200) {
                NotifyUtil.success(`${actionText}成功`);
                await this._loadUsers();
            }
        } catch (error) {
            console.error(`${actionText}用户失败:`, error);
            NotifyUtil.error(`${actionText}失败，请重试`);
        }
    }


    /**
     * 加载角色列表
     */
    async _loadRoles() {
        try {
            const response = await $.ajax({
                url: '/api/roles/list',
                method: 'GET'
            });

            if (response.code === 200) {
                const options = response.data.map(role =>
                    `<option value="${role.roleId}">${role.roleName}</option>`
                ).join('');

                // 不设置默认值,只提供选择项
                const defaultOption = '<option value="">请选择角色</option>';
                $('#roleFilter, #role').html(defaultOption + options);
            }
        } catch (error) {
            console.error('加载角色列表失败:', error);
            NotifyUtil.error('加载角色列表失败');
        }
    }

    /**
     * 加载部门列表
     */
    async _loadDepartments() {
        try {
            const response = await $.ajax({
                url: '/api/departments/list',
                method: 'GET'
            });

            if (response.code === 200) {
                const options = response.data.map(dept =>
                    `<option value="${dept.departmentId}">${dept.departmentName}</option>`
                ).join('');

                // 不设置默认值,只提供选择项
                const defaultOption = '<option value="">请选择部门</option>';
                $('#departmentFilter, #department').html(defaultOption + options);
            }
        } catch (error) {
            console.error('加载部门列表失败:', error);
            NotifyUtil.error('加载部门列表失败');
        }
    }

    _bindHoverEvents() {
        let hoverTimer;
        const showDelay = 300; // 显示延迟，防止鼠标快速划过时频繁显示

        this.elements.userList.on('mouseenter', 'tr', (e) => {
            const $row = $(e.currentTarget);
            const user = this.state.users[parseInt($row.data('index'))];

            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                if (user) {
                    this._showUserInfoCard(user, $row);
                }
            }, showDelay);
        });

        this.elements.userList.on('mouseleave', 'tr', () => {
            clearTimeout(hoverTimer);
            this._hideUserInfoCard();
        });

        // 防止鼠标移入卡片时卡片消失
        this.$userInfoCard.on('mouseenter', () => {
            clearTimeout(hoverTimer);
        }).on('mouseleave', () => {
            this._hideUserInfoCard();
        });
    }



    /**
     * 更新分页
     */
    _updatePagination() {
        const { current, pageSize, total } = this.state.pagination;
        const totalPages = Math.ceil(total / pageSize);

        let html = `
            <li class="page-item ${current <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current - 1}">上一页</a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
                html += `
                    <li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (i === current - 3 || i === current + 3) {
                html += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }

        html += `
            <li class="page-item ${current >= totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current + 1}">下一页</a>
            </li>
        `;

        this.elements.pagination.html(html);

        // 绑定分页点击事件
        this.elements.pagination.find('.page-link').on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && page !== current) {
                this.state.pagination.current = page;
                this._loadUsers();
            }
        });
    }

    /**
     * Loading相关方法
     */
    _showLoading() {
        if (!this.$loading) {
            this.$loading = $(`
                <div class="loading-overlay">
                    <div class="spinner-border text-primary"></div>
                    <div class="loading-text">加载中...</div>
                </div>
            `).appendTo('body');
        }
        this.$loading.show();
    }

    _hideLoading() {
        if (this.$loading) {
            this.$loading.hide();
        }
    }

    /**
     * 工具方法
     */
    _formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    _resetForm() {
        $('#userForm')[0].reset();
        $('.is-invalid').removeClass('is-invalid');
        $('#status').prop('checked', false);
    }

    destroy() {
        if (this.$userInfoCard) {
            this.$userInfoCard.remove();
        }
    }
}

// 初始化实例
$(document).ready(() => {
    window.userManagement = new UserManagement();
});