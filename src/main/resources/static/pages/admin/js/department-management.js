/**
 * DepartmentManagement.js
 * 部门管理页面控制器
 * 实现部门的增删改查和人员管理等功能
 *
 * @author SevenThRe
 * @created 2024-01-06
 */
class DepartmentManagement extends BaseComponent {
    /**
     * 构造函数
     * 初始化组件状态和事件绑定
     */
    constructor() {
        super({
            container: '#main',
            events: {
                'click #addDepartmentBtn': '_handleAddDepartment',
                'click #saveDepartmentBtn': '_handleSaveDepartment',
                'click #deleteDepartmentBtn': '_handleDeleteDepartment',
                'click #addMemberBtn': '_handleAddMember',
                'click #confirmAddMemberBtn': '_handleConfirmAddMember',
                'submit #departmentForm': '_handleSubmitDepartment',
                'click .remove-member': '_handleRemoveMember',
                'input #memberSearch': '_handleMemberSearch'
            }
        });

        // 状态管理
        this.state = {
            loading: false,           // 加载状态
            departments: [],          // 部门列表数据
            currentDepartment: null,  // 当前选中的部门
            members: [],             // 当前部门成员
            searchResults: [],       // 成员搜索结果
            selectedMembers: new Set(), // 选中待添加的成员
            isEdit: false            // 是否处理编辑状态
        };

        // 缓存DOM引用
        this.$departmentTree = $('#departmentTree');
        this.$membersList = $('#membersList');
        this.$searchResults = $('#memberSearchResults');
        this.$departmentForm = $('#departmentForm');

        // 初始化模态框
        this.departmentModal = new bootstrap.Modal('#departmentModal');
        this.addMemberModal = new bootstrap.Modal('#addMemberModal');

        // 初始化表单验证
        this.validator = window.validatorUtil;

        // 初始化组件
        this.init();
    }

    /**
     * 组件初始化
     * @returns {Promise<void>}
     */
    async init() {
        try {
            await this._loadDepartments();
            this._renderDepartmentTree();
            this._initTreeEvents();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面加载失败，请刷新重试');
        }
    }

    /**
     * 加载部门数据
     * @private
     */
    async _loadDepartments() {
        try {
            this.state.loading = true;
            this._showLoading();

            const response = await window.requestUtil.get(Const.API.DEPARTMENT.GET_TREE);
            this.state.departments = response.data;

        } catch (error) {
            console.error('加载部门数据失败:', error);
            throw error;
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染部门树
     * @private
     */
    _renderDepartmentTree() {
        const buildTreeHtml = (departments) => {
            return departments.map(dept => `
                <div class="department-node" data-id="${dept.departmentId}">
                    <div class="department-node-header">
                        <i class="bi ${dept.children?.length ? 'bi-chevron-right' : 'bi-dash'}"></i>
                        <span class="department-name">${dept.departmentName}</span>
                    </div>
                    ${dept.children?.length ? `
                        <div class="department-children">
                            ${buildTreeHtml(dept.children)}
                        </div>
                    ` : ''}
                </div>
            `).join('');
        };

        this.$departmentTree.html(buildTreeHtml(this.state.departments));
    }

    /**
     * 初始化树形结构事件
     * @private
     */
    _initTreeEvents() {
        // 展开/收起节点
        this.$departmentTree.on('click', '.department-node-header i', (e) => {
            e.stopPropagation();
            const $icon = $(e.currentTarget);
            const $node = $icon.closest('.department-node');
            $icon.toggleClass('bi-chevron-right bi-chevron-down');
            $node.find('> .department-children').slideToggle();
        });

        // 选择部门节点
        this.$departmentTree.on('click', '.department-node-header', async (e) => {
            const $node = $(e.currentTarget).closest('.department-node');
            const deptId = $node.data('id');
            await this._selectDepartment(deptId);
        });
    }

    /**
     * 选择部门
     * @param {string} departmentId - 部门ID
     * @private
     */
    async _selectDepartment(departmentId) {
        try {
            // 加载部门详情
            const response = await window.requestUtil.get(
                Const.API.DEPARTMENT.GET_DETAIL(departmentId)
            );

            this.state.currentDepartment = response.data;

            // 更新UI
            this._updateDepartmentForm();
            await this._loadDepartmentMembers();

            // 更新选中状态样式
            $('.department-node').removeClass('active');
            $(`.department-node[data-id="${departmentId}"]`).addClass('active');

        } catch (error) {
            console.error('加载部门详情失败:', error);
            this.showError('加载部门详情失败');
        }
    }

    /**
     * 更新部门表单
     * @private
     */
    _updateDepartmentForm() {
        const dept = this.state.currentDepartment;
        if (!dept) return;

        $('#departmentName').val(dept.departmentName);
        $('#departmentCode').val(dept.departmentCode);
        $('#departmentManager').val(dept.managerId);
        $('#departmentOrder').val(dept.orderNum);
        $('#departmentDesc').val(dept.description);

        // 设置父部门选项
        this._updateParentOptions();
        $('#parentDepartment').val(dept.parentId || '');
    }

    /**
     * 更新父部门选项
     * @private
     */
    _updateParentOptions() {
        const buildOptions = (departments, level = 0) => {
            return departments.reduce((options, dept) => {
                // 排除当前部门及其子部门
                if (this.state.currentDepartment &&
                    (dept.departmentId === this.state.currentDepartment.departmentId ||
                        this._isChildDepartment(dept, this.state.currentDepartment.departmentId))) {
                    return options;
                }

                options.push(`
                    <option value="${dept.departmentId}">
                        ${'　'.repeat(level)}${dept.departmentName}
                    </option>
                `);

                if (dept.children?.length) {
                    options.push(buildOptions(dept.children, level + 1));
                }

                return options;
            }, []).join('');
        };

        const options = ['<option value="">无上级部门</option>'];
        options.push(buildOptions(this.state.departments));

        $('#parentDepartment').html(options.join(''));
    }

    /**
     * 判断是否是子部门
     * @param {Object} department - 部门对象
     * @param {string} targetId - 目标部门ID
     * @returns {boolean}
     * @private
     */
    _isChildDepartment(department, targetId) {
        if (!department.children?.length) return false;
        return department.children.some(child =>
            child.departmentId === targetId ||
            this._isChildDepartment(child, targetId)
        );
    }

    /**
     * 加载部门成员
     * @private
     */
    async _loadDepartmentMembers() {
        if (!this.state.currentDepartment) return;

        try {
            const response = await window.requestUtil.get(
                Const.API.DEPARTMENT.GET_MEMBERS(this.state.currentDepartment.departmentId)
            );

            this.state.members = response.data;
            this._renderMembersList();

        } catch (error) {
            console.error('加载部门成员失败:', error);
            this.showError('加载部门成员失败');
        }
    }

    /**
     * 渲染成员列表
     * @private
     */
    _renderMembersList() {
        const html = this.state.members.map(member => `
            <tr>
                <td>${member.realName}</td>
                <td>${member.username}</td>
                <td>${member.position || '-'}</td>
                <td>${member.email || '-'}</td>
                <td>
                    <span class="status-badge ${member.status ? 'enabled' : 'disabled'}">
                        ${member.status ? '在职' : '离职'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-danger remove-member" 
                            data-id="${member.userId}">
                        <i class="bi bi-person-dash"></i> 移除
                    </button>
                </td>
            </tr>
        `).join('');

        this.$membersList.html(html || '<tr><td colspan="6" class="text-center">暂无成员</td></tr>');
    }

    /**
     * 处理添加部门按钮点击
     * @param {Event} e - 事件对象
     * @private
     */
    _handleAddDepartment(e) {
        e.preventDefault();

        // 重置表单
        this.$departmentForm[0].reset();
        $('#departmentId').val('');

        // 更新父部门选项
        this._updateParentOptions();

        // 设置默认值
        $('#departmentOrder').val(0);

        this.state.isEdit = false;
        $('#departmentModalTitle').text('新建部门');
        this.departmentModal.show();
    }

    /**
     * 处理部门表单提交
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleSubmitDepartment(e) {
        e.preventDefault();

        if (!this._validateDepartmentForm()) {
            return;
        }

        const formData = this._getDepartmentFormData();

        try {
            this._disableForm(true);

            const isEdit = !!formData.departmentId;
            const url = isEdit ?
                Const.API.DEPARTMENT.PUT_UPDATE(formData.departmentId) :
                Const.API.DEPARTMENT.POST_CREATE;

            const response = await window.requestUtil[isEdit ? 'put' : 'post'](url, formData);

            this.showSuccess(`${isEdit ? '更新' : '创建'}部门成功`);
            await this._refreshDepartments();

            if (isEdit && this.state.currentDepartment?.departmentId === formData.departmentId) {
                await this._selectDepartment(formData.departmentId);
            }

            this.departmentModal.hide();

        } catch (error) {
            console.error(`${isEdit ? '更新' : '创建'}部门失败:`, error);
            this.showError(error.message || `${isEdit ? '更新' : '创建'}部门失败`);
        } finally {
            this._disableForm(false);
        }
    }

    /**
     * 处理删除部门
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleDeleteDepartment(e) {
        e.preventDefault();

        if (!this.state.currentDepartment) return;

        if (!confirm('确定要删除该部门吗？删除后无法恢复。')) {
            return;
        }

        try {
            await window.requestUtil.delete(
                Const.API.DEPARTMENT.DELETE(this.state.currentDepartment.departmentId)
            );

            this.showSuccess('删除部门成功');
            this.state.currentDepartment = null;
            await this._refreshDepartments();

            // 清空表单
            this.$departmentForm[0].reset();
            this.$membersList.empty();

        } catch (error) {
            console.error('删除部门失败:', error);
            this.showError(error.message || '删除部门失败');
        }
    }

    /**
     * 处理添加成员
     * @param {Event} e - 事件对象
     * @private
     */
    _handleAddMember(e) {
        e.preventDefault();

        if (!this.state.currentDepartment) {
            this.showError('请先选择部门');
            return;
        }

        // 重置搜索和选择状态
        $('#memberSearch').val('');
        this.state.searchResults = [];
        this.state.selectedMembers.clear();
        this._renderSearchResults();

        this.addMemberModal.show();
    }

    /**
     * 处理成员搜索
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleMemberSearch(e) {
        const keyword = e.target.value.trim();
        if (!keyword) {
            this.state.searchResults = [];
            this._renderSearchResults();
            return;
        }

        try {
            const response = await window.requestUtil.get('/api/users/search', {
                keyword,
                excludeDepartmentId: this.state.currentDepartment.departmentId
            });

            this.state.searchResults = response.data;
            this._renderSearchResults();

        } catch (error) {
            console.error('搜索用户失败:', error);
        }
    }

    /**
     * 渲染搜索结果
     * @private
     */
    _renderSearchResults() {
        const html = this.state.searchResults.map(user => `
            <div class="search-result-item">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" 
                           id="user_${user.userId}"
                           value="${user.userId}"
                           ${this.state.selectedMembers.has(user.userId) ? 'checked' : ''}>
                    <label class="form-check-label" for="user_${user.userId}">
                        ${user.realName} (${user.username})
                        <small class="text-muted">${user.email || ''}</small>
                    </label>
                </div>
            </div>
        `).join('');

        this.$searchResults.html(html || '<div class="text-center">无搜索结果</div>');

        // 绑定选择事件
        this.$searchResults.find('input[type="checkbox"]').change((e) => {
            const userId = $(e.target).val();
            if (e.target.checked) {
                this.state.selectedMembers.add(userId);
            } else {
                this.state.selectedMembers.delete(userId);
            }
        });
    }

    /**
     * 处理确认添加成员
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleConfirmAddMember(e) {
        e.preventDefault();

        if (!this.state.selectedMembers.size) {
            this.showError('请选择要添加的成员');
            return;
        }

        try {
            const userIds = Array.from(this.state.selectedMembers);
            await window.requestUtil.post(
                Const.API.DEPARTMENT.POST_ADD_MEMBER(this.state.currentDepartment.departmentId),
                { userIds }
            );

            this.showSuccess('添加成员成功');
            await this._loadDepartmentMembers();
            this.addMemberModal.hide();

        } catch (error) {
            console.error('添加成员失败:', error);
            this.showError(error.message || '添加成员失败');
        }
    }

    /**
     * 处理移除成员
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleRemoveMember(e) {
        e.preventDefault();

        const userId = $(e.currentTarget).data('id');
        if (!confirm('确定要移除该成员吗？')) {
            return;
        }

        try {
            await window.requestUtil.delete(
                Const.API.DEPARTMENT.DELETE_MEMBER(
                    this.state.currentDepartment.departmentId,
                    userId
                )
            );

            this.showSuccess('移除成员成功');
            await this._loadDepartmentMembers();

        } catch (error) {
            console.error('移除成员失败:', error);
            this.showError(error.message || '移除成员失败');
        }
    }

    /**
     * 验证部门表单
     * @returns {boolean} 验证结果
     * @private
     */
    _validateDepartmentForm() {
        const form = this.$departmentForm[0];
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return false;
        }

        const formData = this._getDepartmentFormData();

        // 部门名称验证
        if (formData.departmentName.length < 2 || formData.departmentName.length > 50) {
            this.showError('部门名称长度必须在2-50个字符之间');
            return false;
        }

        // 部门编码验证
        if (!/^[A-Z0-9]{2,10}$/.test(formData.departmentCode)) {
            this.showError('部门编码必须为2-10位大写字母或数字');
            return false;
        }

        // 排序号验证
        if (!Number.isInteger(Number(formData.orderNum)) || Number(formData.orderNum) < 0) {
            this.showError('排序号必须是非负整数');
            return false;
        }

        return true;
    }

    /**
     * 获取部门表单数据
     * @returns {Object} 表单数据
     * @private
     */
    _getDepartmentFormData() {
        return {
            departmentId: this.state.isEdit ? this.state.currentDepartment.departmentId : null,
            departmentName: $('#departmentName').val().trim(),
            departmentCode: $('#departmentCode').val().trim(),
            parentId: $('#parentDepartment').val() || null,
            managerId: $('#departmentManager').val() || null,
            orderNum: Number($('#departmentOrder').val()),
            description: $('#departmentDesc').val().trim()
        };
    }

    /**
     * 刷新部门树
     * @returns {Promise<void>}
     * @private
     */
    async _refreshDepartments() {
        await this._loadDepartments();
        this._renderDepartmentTree();
    }

    /**
     * 禁用/启用表单
     * @param {boolean} disabled - 是否禁用
     * @private
     */
    _disableForm(disabled) {
        this.$departmentForm.find('input,select,textarea,button').prop('disabled', disabled);
        if (disabled) {
            $('#saveDepartmentBtn').html(
                '<span class="spinner-border spinner-border-sm me-1"></span>保存中...'
            );
        } else {
            $('#saveDepartmentBtn').text('保存');
        }
    }

    /**
     * 组件销毁
     * @public
     */
    destroy() {
        // 解绑事件
        this.$departmentTree.off();
        this.$departmentForm.off();
        this.$searchResults.off();

        // 销毁模态框
        if (this.departmentModal) {
            this.departmentModal.dispose();
        }
        if (this.addMemberModal) {
            this.addMemberModal.dispose();
        }

        // 清理DOM引用
        this.$departmentTree = null;
        this.$membersList = null;
        this.$searchResults = null;
        this.$departmentForm = null;

        // 清理状态
        this.state = null;

        // 调用父类销毁方法
        super.destroy();
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.departmentManagement = new DepartmentManagement();
});