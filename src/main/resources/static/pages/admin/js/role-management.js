/**
 * RoleManagement.js
 * 角色权限管理页面控制器
 * 实现角色的创建、编辑、删除及权限配置等功能
 */
class RoleManagement extends BaseComponent {
    /**
     * 构造函数
     * 初始化组件状态和事件绑定
     */
    constructor() {
        super({
            container: '#main',
            events: {
                'click #createRoleBtn': '_handleCreateRole',
                'click #editRoleBtn': '_handleEditRole',
                'click #deleteRoleBtn': '_handleDeleteRole',
                'click #saveRoleBtn': '_handleSaveRole',
                'click #confirmDeleteBtn': '_handleConfirmDelete',
                'click #savePermissionsBtn': '_handleSavePermissions',
                'click #refreshBtn': '_handleRefresh',
                'input #roleSearch': '_handleRoleSearch',
                'click #expandAllBtn': '_handleExpandAll',
                'click #collapseAllBtn': '_handleCollapseAll',
                'click #cancelBtn': '_handleCancelEdit'
            }
        });
        // 检查权限
        if (!window.permissionUtil.hasPermission('PERMISSION_MANAGE')) {
            // window.location.href = '/403.html';
            return;
        }

        this._initPermissionControl();

        // 状态管理
        this.state = {
            loading: false,            // 加载状态
            roles: [],                // 角色列表
            permissions: [],          // 权限列表
            currentRole: null,        // 当前选中角色
            permissionChanged: false, // 权限是否已修改
            editMode: false,         // 是否处于编辑模式
            searchKeyword: ''        // 搜索关键字
        };

        // 缓存DOM引用
        this._cacheDOMReferences();

        // 初始化模态框
        this._initModals();

        // 初始化组件
        this.init();
    }

    /**
     * 初始化权限控制
     * @private
     */
    _initPermissionControl() {
        const permUtil = window.permissionUtil;

        // 控制创建权限
        permUtil.handlePermissionElement('ROLE_CREATE', $('#createRoleBtn'));

        // 控制编辑和删除权限
        permUtil.handlePermissionElement(
            ['ROLE_UPDATE', 'ROLE_DELETE'],
            $('.role-actions')
        );

        // 控制权限分配
        permUtil.handlePermissionElement(
            'PERMISSION_ASSIGN',
            $('#savePermissionsBtn')
        );
    }

    /**
     * 缓存重要的DOM元素引用
     * @private
     */
    _cacheDOMReferences() {
        this.$roleList = $('#roleList');
        this.$permissionTree = $('#permissionTree');
        this.$roleForm = $('#roleForm');
        this.$roleSearch = $('#roleSearch');
        this.$currentRoleTitle = $('#currentRoleTitle');
        this.$permissionActions = $('.permission-actions');
        this.$roleActions = $('.role-actions');
    }

    /**
     * 初始化Bootstrap模态框
     * @private
     */
    _initModals() {
        this.roleModal = new bootstrap.Modal('#roleModal');
        this.deleteModal = new bootstrap.Modal('#deleteModal');
    }

    /**
     * 组件初始化
     * @returns {Promise<void>}
     */
    async init() {
        try {
            await Promise.all([
                this._loadRoles(),
                this._loadPermissions()
            ]);
            this._render();
            this._initValidation();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 加载角色列表数据
     * @private
     * @returns {Promise<void>}
     */
    async _loadRoles() {
        try {
            const response = await window.requestUtil.get(Const.API.ROLE.GET_LIST);
            this.state.roles = response.data;
        } catch (error) {
            console.error('加载角色列表失败:', error);
            throw error;
        }
    }

    /**
     * 加载权限树数据
     * @private
     * @returns {Promise<void>}
     */
    async _loadPermissions() {
        try {
            const response = await window.requestUtil.get(Const.API.PERMISSION.GET_TREE);
            this.state.permissions = response.data;
        } catch (error) {
            console.error('加载权限列表失败:', error);
            throw error;
        }
    }

    /**
     * 初始化表单验证
     * @private
     */
    _initValidation() {
        this.validator = window.validatorUtil;

        // 添加自定义验证规则
        this.validator.addValidator('roleCode', {
            validate: value => Const.BUSINESS.ROLE.CODE_PATTERN.test(value),
            message: Const.MESSAGES.ERROR.ROLE.CODE_FORMAT
        });
    }

    /**
     * 渲染角色列表
     * @private
     */
    _renderRoleList() {
        let roles = this.state.roles;

        // 处理搜索过滤
        if (this.state.searchKeyword) {
            const keyword = this.state.searchKeyword.toLowerCase();
            roles = roles.filter(role =>
                role.roleName.toLowerCase().includes(keyword) ||
                role.roleCode.toLowerCase().includes(keyword)
            );
        }

        const html = roles.map(role => `
            <div class="role-list-item ${this.state.currentRole?.roleId === role.roleId ? 'active' : ''}" 
                 data-role-id="${role.roleId}">
                <div class="role-info">
                    <div class="role-name">${this._escapeHtml(role.roleName)}</div>
                    <div class="role-code">${role.roleCode}</div>
                </div>
                <span class="status-badge ${role.status ? 'enabled' : 'disabled'}">
                    ${role.status ? '启用' : '禁用'}
                </span>
            </div>
        `).join('');

        this.$roleList.html(html);

        // 绑定角色点击事件
        this.$roleList.find('.role-list-item').click(e => {
            const roleId = $(e.currentTarget).data('roleId');
            this._handleRoleSelect(roleId);
        });
    }

    /**
     * 渲染权限树
     * @private
     * @param {Array} permissions - 权限树数据
     * @param {Array} checkedPermissions - 已选中的权限编码列表
     * @returns {string} 生成的HTML字符串
     */
    _renderPermissionTree(permissions, checkedPermissions = []) {
        return permissions.map(permission => {
            const checked = checkedPermissions.includes(permission.code);
            const hasChildren = permission.children?.length > 0;

            return `
                <div class="permission-node" data-code="${permission.code}">
                    <div class="permission-node-header">
                        <div class="form-check">
                            <input type="checkbox" class="form-check-input permission-checkbox" 
                                   id="perm_${permission.code}" 
                                   value="${permission.code}"
                                   ${checked ? 'checked' : ''}
                                   ${this.state.editMode ? '' : 'disabled'}>
                            <label class="form-check-label" for="perm_${permission.code}">
                                ${permission.name}
                            </label>
                        </div>
                        ${hasChildren ? `
                            <button class="btn btn-link btn-sm p-0 ms-2 toggle-btn">
                                <i class="bi bi-chevron-down"></i>
                            </button>
                        ` : ''}
                    </div>
                    ${hasChildren ? `
                        <div class="permission-node-content">
                            ${this._renderPermissionTree(permission.children, checkedPermissions)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * 处理角色选择
     * @private
     * @param {string} roleId - 角色ID
     */
    async _handleRoleSelect(roleId) {
        if (this.state.permissionChanged) {
            if (!confirm('当前修改尚未保存，确定要切换角色吗？')) {
                return;
            }
        }

        try {
            this._showLoading();

            // 加载角色权限
            const response = await window.requestUtil.get(
                Const.API.ROLE.GET_PERMISSIONS(roleId)
            );

            this.state.currentRole = this.state.roles.find(r => r.roleId === roleId);
            this.state.currentPermissions = response.data;
            this.state.permissionChanged = false;
            this.state.editMode = false;

            this._updateUI();
        } catch (error) {
            console.error('加载角色权限失败:', error);
            this.showError('加载角色权限失败');
        } finally {
            this._hideLoading();
        }
    }

    /**
     * 更新UI显示
     * @private
     */
    _updateUI() {
        const role = this.state.currentRole;

        // 更新角色列表选中状态
        this._renderRoleList();

        // 更新权限配置区域
        if (role) {
            this.$currentRoleTitle.text(role.roleName);
            $('#roleCode').text(role.roleCode);
            $('#baseRole').text(Const.BASE_ROLE.MAP[role.baseRoleCode]);
            $('#roleStatus').html(`
                <span class="status-badge ${role.status ? 'enabled' : 'disabled'}">
                    ${role.status ? '启用' : '禁用'}
                </span>
            `);
            $('#roleDescription').text(role.description || '无');

            // 渲染权限树
            this.$permissionTree.html(
                this._renderPermissionTree(
                    this.state.permissions,
                    this.state.currentPermissions
                )
            );

            // 显示操作按钮
            this.$roleActions.show();
        } else {
            this.$currentRoleTitle.text('选择角色查看权限');
            this.$permissionTree.empty();
            this.$roleActions.hide();
        }

        // 更新权限操作区域显示
        this.$permissionActions.toggle(this.state.editMode);
    }
    /**
     * 处理新建角色
     * @private
     * @param {Event} e - 事件对象
     */
    _handleCreateRole(e) {
        e.preventDefault();

        // 重置表单状态
        this.$roleForm[0].reset();
        this.$roleForm.removeClass('was-validated');
        $('#roleModalTitle').text('新建角色');
        $('#roleId').val('');

        // 启用角色编码输入
        $('#roleCodeInput').prop('readonly', false);

        this.roleModal.show();
    }

    /**
     * 处理编辑角色
     * @private
     * @param {Event} e - 事件对象
     */
    _handleEditRole(e) {
        e.preventDefault();

        if (!this.state.currentRole) return;

        const role = this.state.currentRole;

        // 填充表单数据
        $('#roleModalTitle').text('编辑角色');
        $('#roleId').val(role.roleId);
        $('#baseRoleSelect').val(role.baseRoleCode);
        $('#roleCodeInput').val(role.roleCode).prop('readonly', true);
        $('#roleName').val(role.roleName);
        $('#description').val(role.description);
        $('#status').prop('checked', role.status === 1);

        this.roleModal.show();
    }

    /**
     * 处理角色保存
     * @private
     * @param {Event} e - 事件对象
     */
    async _handleSaveRole(e) {
        e.preventDefault();

        if (!this._validateRoleForm()) {
            return;
        }

        const formData = this._getFormData();
        const isEdit = !!formData.roleId;

        try {
            this._disableForm(true);

            const response = await window.requestUtil[isEdit ? 'put' : 'post'](
                isEdit ? Const.API.ROLE.PUT_UPDATE(formData.roleId) : Const.API.ROLE.POST_CREATE,
                formData
            );

            // 更新本地数据
            if (isEdit) {
                this.state.roles = this.state.roles.map(role =>
                    role.roleId === formData.roleId ? {...role, ...response.data} : role
                );
                if (this.state.currentRole?.roleId === formData.roleId) {
                    this.state.currentRole = response.data;
                }
            } else {
                this.state.roles.push(response.data);
            }

            this.showSuccess(`角色${isEdit ? '更新' : '创建'}成功`);
            this.roleModal.hide();
            this._updateUI();

        } catch (error) {
            console.error(`${isEdit ? '更新' : '创建'}角色失败:`, error);
            this.showError(error.message || `角色${isEdit ? '更新' : '创建'}失败`);
        } finally {
            this._disableForm(false);
        }
    }

    /**
     * 处理角色删除
     * @private
     * @param {Event} e - 事件对象
     */
    _handleDeleteRole(e) {
        e.preventDefault();

        if (!this.state.currentRole) return;

        // 更新确认框信息
        $('#deleteRoleName').text(this.state.currentRole.roleName);
        this.deleteModal.show();
    }

    /**
     * 处理删除确认
     * @private
     * @param {Event} e - 事件对象
     */
    async _handleConfirmDelete(e) {
        e.preventDefault();

        if (!this.state.currentRole) return;

        try {
            const roleId = this.state.currentRole.roleId;

            await window.requestUtil.delete(Const.API.ROLE.DELETE(roleId));

            // 更新本地数据
            this.state.roles = this.state.roles.filter(role => role.roleId !== roleId);
            if (this.state.currentRole.roleId === roleId) {
                this.state.currentRole = null;
                this.state.currentPermissions = [];
            }

            this.showSuccess('角色删除成功');
            this.deleteModal.hide();
            this._updateUI();

        } catch (error) {
            console.error('删除角色失败:', error);
            this.showError('删除角色失败');
        }
    }

    /**
     * 处理权限保存
     * @private
     * @param {Event} e - 事件对象
     */
    async _handleSavePermissions(e) {
        e.preventDefault();

        if (!this.state.currentRole || !this.state.permissionChanged) return;

        try {
            const permissions = [];
            this.$permissionTree.find('.permission-checkbox:checked').each((_, el) => {
                permissions.push($(el).val());
            });

            await window.requestUtil.put(
                Const.API.ROLE.PUT_PERMISSIONS(this.state.currentRole.roleId),
                { permissions }
            );

            this.state.currentPermissions = permissions;
            this.state.permissionChanged = false;
            this.state.editMode = false;

            this.showSuccess('权限更新成功');
            this._updateUI();

        } catch (error) {
            console.error('更新权限失败:', error);
            this.showError('更新权限失败');
        }
    }

    /**
     * 处理权限修改取消
     * @private
     * @param {Event} e - 事件对象
     */
    _handleCancelEdit(e) {
        e.preventDefault();

        if (this.state.permissionChanged) {
            if (!confirm('确定要放弃当前的修改吗？')) {
                return;
            }
        }

        this.state.editMode = false;
        this.state.permissionChanged = false;
        this._updateUI();
    }

    /**
     * 校验角色表单
     * @private
     * @returns {boolean} 校验是否通过
     */
    _validateRoleForm() {
        const form = this.$roleForm[0];

        // 触发浏览器原生验证
        if (!form.checkValidity()) {
            this.$roleForm.addClass('was-validated');
            return false;
        }

        // 自定义验证规则
        const formData = this._getFormData();

        // 角色编码验证
        if (!formData.roleId && !this.validator.validate('roleCode', formData.roleCode)) {
            this.showError(Const.MESSAGES.ERROR.ROLE.CODE_FORMAT);
            return false;
        }

        // 角色名称长度验证
        if (formData.roleName.length < 2 || formData.roleName.length > 50) {
            this.showError(Const.MESSAGES.ERROR.ROLE.NAME_LENGTH);
            return false;
        }

        // 描述长度验证
        if (formData.description && formData.description.length > 200) {
            this.showError(Const.MESSAGES.ERROR.ROLE.DESCRIPTION_LENGTH);
            return false;
        }

        return true;
    }

    /**
     * 获取表单数据
     * @private
     * @returns {Object} 表单数据对象
     */
    _getFormData() {
        const formData = new FormData(this.$roleForm[0]);
        return {
            roleId: formData.get('roleId') || null,
            baseRoleCode: formData.get('baseRoleCode'),
            roleCode: formData.get('roleCode'),
            roleName: formData.get('roleName'),
            description: formData.get('description'),
            status: formData.get('status') ? 1 : 0
        };
    }

    /**
     * 禁用/启用表单
     * @private
     * @param {boolean} disabled - 是否禁用
     */
    _disableForm(disabled) {
        const $btn = $('#saveRoleBtn');
        $btn.prop('disabled', disabled);
        if (disabled) {
            $btn.html('<span class="spinner-border spinner-border-sm me-1"></span>保存中...');
        } else {
            $btn.html('保存');
        }
        this.$roleForm.find('input,select,textarea').prop('disabled', disabled);
    }

    /**
     * HTML转义
     * @private
     * @param {string} str - 需要转义的字符串
     * @returns {string} 转义后的字符串
     */
    _escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * 显示加载状态
     * @private
     */
    _showLoading() {
        this.state.loading = true;
        this.$roleList.addClass('loading');
        this.$permissionTree.addClass('loading');
    }

    /**
     * 隐藏加载状态
     * @private
     */
    _hideLoading() {
        this.state.loading = false;
        this.$roleList.removeClass('loading');
        this.$permissionTree.removeClass('loading');
    }

    /**
     * 销毁组件
     * @public
     */
    destroy() {
        // 清理事件监听
        this.$roleList.off();
        this.$permissionTree.off();

        // 销毁模态框实例
        this.roleModal.dispose();
        this.deleteModal.dispose();

        // 调用父类销毁方法
        super.destroy();
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.roleManagement = new RoleManagement();
});