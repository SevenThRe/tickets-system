/**
 * DepartmentMembers.js
 * 部门成员管理控制器
 * 实现成员列表管理、绩效分析等功能
 *
 * @author SevenThRe
 * @created 2024-01-06
 */
/**
 * DepartmentManagement.js
 * 部门管理页面控制器
 * 实现部门的增删改查和人员管理等功能
 */
class DepartmentManagement {
    constructor() {
        // 缓存DOM元素引用
        this.$container = $('#main');
        this.$departmentTree = $('#departmentTree');
        this.$membersList = $('#membersList');
        this.$departmentForm = $('#departmentForm');
        this.$searchResults = $('#memberSearchResults');

        // 状态管理
        this.state = {
            loading: false,
            departmentsTrees: [],  // 部门树数据
            departments: [],          // 部门列表数据
            currentDepartment: null,  // 当前选中的部门
            members: [],              // 当前部门成员
            searchResults: [],        // 成员搜索结果
            selectedMembers: new Set(), // 选中待添加的成员
            isEdit: false            // 是否处理编辑状态
        };

        this.$departmentTree.on('click', '.department-node', (e) => {
            this._handleDepartmentNodeClick(e);
        });

        // 定义表单验证规则
        this.validationRules = {
            name: [
                { type: 'required' },
                { type: 'departmentName' }
            ],
            code: [
                { type: 'required' },
                { type: 'departmentCode' }
            ],
            orderNum: [
                { type: 'departmentOrder' }
            ],
            deptLevel: [
                { type: 'min', param: 1 },
                { type: 'max', param: 5 }
            ],
            managerId: [
                { type: 'required' }
            ]
        };

        // 初始化模态框
        this.validator = new ValidatorUtil(this.validationRules);
        this.departmentModal = new bootstrap.Modal('#departmentModal');
        this.addMemberModal = new bootstrap.Modal('#addMemberModal');

        // 绑定事件
        this._bindEvents();

        // 初始化
        this.init();
    }

    async init() {
        try {
            // await this._loadDepartments(); 废弃
            await this._loadDepartmentTrees();
            // 在这里缓存 DOM 元素，确保它们已经加载
            this.$departmentTree = $('#departmentTree');
            this._renderDepartmentTree(this.state.departmentsTrees);
        } catch (error) {
            console.error('初始化失败:', error);
            this._showError('页面初始化失败，请刷新重试');
        }
    }




    /**
     * 绑定事件处理
     * @private
     */
    _bindEvents() {
        // 部门相关事件
        $('#addDepartmentBtn').on('click', () => this._handleAddDepartment());
        $('#saveDepartmentBtn').on('click', () => this._handleSaveDepartment());
        $('#deleteDepartmentBtn').on('click', () => this._handleDeleteDepartment());
        // 部门树事件
        this.$departmentTree.on('click', '.department-node-header i', (e) => {
            e.stopPropagation();
            const $icon = $(e.currentTarget);
            const $node = $icon.closest('.department-node');
            $icon.toggleClass('bi-chevron-right bi-chevron-down');
            $node.find('> .department-children').slideToggle();
        });

        this.$departmentTree.on('click', '.department-node-header', async (e) => {
            const $node = $(e.currentTarget).closest('.department-node');
            const deptId = $node.data('id');
            await this._selectDepartment(deptId);
        });

        // 成员相关事件
        $('#addMemberBtn').on('click', () => this._handleAddMember());
        $('#confirmAddMemberBtn').on('click', () => this._handleConfirmAddMember());
        $('#memberSearch').on('input', (e) => this._handleMemberSearch(e));

        // 表单提交事件
        this.$departmentForm.on('submit', (e) => this._handleSubmitDepartment(e));

        // 成员移除事件
        this.$membersList.on('click', '.remove-member', (e) => {
            const userId = $(e.currentTarget).data('id');
            this._handleRemoveMember(userId);
        });

        // 部门选择联动
        $('#department').on('change', () => this._validateField('department'));

        // 其他表单字段验证
        this.$departmentForm.find('input, select').on('blur', (e) => {
            this._validateField($(e.target).attr('name'));
        });
    }

    /**
     * 验证表单字段
     * @param {string} field - 字段名
     * @private
     */
    _validateField(field) {
        const $field = $(`#${field}`);
        const value = $field.val();
        const rules = this.validationRules[field];
        if (!rules) return;

        const isValid = rules.required ? value.trim() : true;
        const message = isValid ? '' : rules.message;

        $field.removeClass('is-invalid').removeClass('is-valid');
        if (!isValid) {
            $field.addClass('is-invalid');
        } else {
            $field.addClass('is-valid');
        }

        $field.next('.invalid-feedback').text(message);
    }

    /**
     * 加载部门数据
     * @private
     */
    async _loadDepartments() {
        try {
            this.state.loading = true;
            this._showLoading();

            const response = await $.ajax({
                url: '/api/departments',
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.departments = response.data;
            } else {
                throw new Error(response.message || '加载部门数据失败');
            }

        } catch (error) {
            console.error('加载部门数据失败:', error);
            throw error;
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }
    /**
     * 获取部门树
     * @private
     */
    async _loadDepartmentTrees() {
        try {
            this.state.loading = true;
            this._showLoading();

            const response = await $.ajax({
                url: '/api/departments/trees',
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.departmentsTrees = response.data;
            } else {
                throw new Error(response.message || '加载部门数据失败');
            }

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
     * @param {Array} data - 部门数据
     * @private
     */
    _renderDepartmentTree(data) {
        this.$departmentTree.jstree({
            'core': {
                'data': this._prepareDataForJsTree(data), // 准备数据
                'check_callback': true, // 允许所有操作
            },
            'plugins': ['wholerow', 'default', 'types'], // 使用整行选择和默认插件
            'types': {
                'default': {
                    'icon': 'fa',
                }
            }
        });

        // 默认展开所有节点
        this.$departmentTree.jstree('open_all');
    }

    /**
     * 准备数据以供jsTree使用
     * @param {Array} data - 原始部门数据
     * @returns {Array} - jsTree格式的数据
     * @private
     */
    _prepareDataForJsTree(data) {
        const prepareNode = (node) => {
            return {
                'text': node.label,
                'id': node.id.toString(),
                'icon': 'fas ' + node.icon,
                'children': node.children ? node.children.map(child => prepareNode(child)) : null,
                'state': { 'opened': true },
                'li_attr': { 'data-id': node.id.toString() }
            };
        };
        return data.map(dept => prepareNode(dept, null));
    }
    /**
     * 选择部门
     * @param {string} departmentId - 部门ID
     * @private
     */
    async _selectDepartment(departmentId) {
        try {
            const response = await $.ajax({
                url: `/api/departments/${departmentId}`,
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.currentDepartment = response.data;
                this._updateDepartmentForm();
                await this._loadDepartmentMembers();

                // 更新选中状态样式
                $('.department-node').removeClass('active');
                $(`.department-node[data-id="${departmentId}"]`).addClass('active');
            } else {
                throw new Error(response.message || '加载部门详情失败');
            }

        } catch (error) {
            console.error('加载部门详情失败:', error);
            this._showError('加载部门详情失败');
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
            const response = await $.ajax({
                url: `/api/departments/${this.state.currentDepartment.departmentId}/members`,
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.members = response.data;
                this._renderMembersList();
            } else {
                throw new Error(response.message || '加载部门成员失败');
            }
        } catch (error) {
            console.error('加载部门成员失败:', error);
            this._showError('加载部门成员失败');
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
     * @private
     */
    _handleAddDepartment() {
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
                `/api/departments/${formData.departmentId}` :
                '/api/departments';

            const response = await $.ajax({
                url: url,
                method: isEdit ? 'PUT' : 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData)
            });

            if(response.code === 200) {
                this._showSuccess(`${isEdit ? '更新' : '创建'}部门成功`);
                await this._refreshDepartments();

                if (isEdit && this.state.currentDepartment?.departmentId === formData.departmentId) {
                    await this._selectDepartment(formData.departmentId);
                }

                this.departmentModal.hide();
            } else {
                throw new Error(response.message || `${isEdit ? '更新' : '创建'}部门失败`);
            }

        } catch (error) {
            console.error(`${isEdit ? '更新' : '创建'}部门失败:`, error);
            this._showError(error.message);
        } finally {
            this._disableForm(false);
        }
    }

    /**
     * 处理删除部门
     * @private
     */
    async _handleDeleteDepartment() {
        if (!this.state.currentDepartment) return;

        if (!confirm('确定要删除该部门吗？删除后无法恢复。')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/departments/${this.state.currentDepartment.departmentId}`,
                method: 'DELETE'
            });

            if(response.code === 200) {
                this._showSuccess('删除部门成功');
                this.state.currentDepartment = null;
                await this._refreshDepartments();

                // 清空表单
                this.$departmentForm[0].reset();
                this.$membersList.empty();
            } else {
                throw new Error(response.message || '删除部门失败');
            }

        } catch (error) {
            console.error('删除部门失败:', error);
            this._showError(error.message || '删除部门失败');
        }
    }

    /**
     * 处理添加成员
     * @private
     */
    _handleAddMember() {
        if (!this.state.currentDepartment) {
            this._showError('请先选择部门');
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
            const response = await $.ajax({
                url: '/api/users/search',
                method: 'GET',
                data: {
                    keyword,
                    excludeDepartmentId: this.state.currentDepartment.departmentId
                }
            });

            if(response.code === 200) {
                this.state.searchResults = response.data;
                this._renderSearchResults();
            } else {
                throw new Error(response.message || '搜索用户失败');
            }
        } catch (error) {
            console.error('搜索用户失败:', error);
            this._showError(error.message || '搜索用户失败');
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
        this.$searchResults.find('input[type="checkbox"]').on('change', (e) => {
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
     * @private
     */
    async _handleConfirmAddMember() {
        if (!this.state.selectedMembers.size) {
            this._showError('请选择要添加的成员');
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/departments/${this.state.currentDepartment.departmentId}/members`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    userIds: Array.from(this.state.selectedMembers)
                })
            });

            if(response.code === 200) {
                this._showSuccess('添加成员成功');
                await this._loadDepartmentMembers();
                this.addMemberModal.hide();
            } else {
                throw new Error(response.message || '添加成员失败');
            }

        } catch (error) {
            console.error('添加成员失败:', error);
            this._showError(error.message || '添加成员失败');
        }
    }

    /**
     * 处理移除成员
     * @private
     */
    async _handleRemoveMember(userId) {
        if (!confirm('确定要移除该成员吗？')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/departments/${this.state.currentDepartment.departmentId}/members/${userId}`,
                method: 'DELETE'
            });

            if(response.code === 200) {
                this._showSuccess('移除成员成功');
                await this._loadDepartmentMembers();
            } else {
                throw new Error(response.message || '移除成员失败');
            }

        } catch (error) {
            console.error('移除成员失败:', error);
            this._showError(error.message || '移除成员失败');
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
            this._showError('部门名称长度必须在2-50个字符之间');
            return false;
        }

        // 部门编码验证
        if (!/^[A-Z0-9]{2,10}$/.test(formData.departmentCode)) {
            this._showError('部门编码必须为2-10位大写字母或数字');
            return false;
        }

        // 排序号验证
        if (!Number.isInteger(Number(formData.orderNum)) || Number(formData.orderNum) < 0) {
            this._showError('排序号必须是非负整数');
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
        const formData = new FormData(this.$departmentForm[0]);
        return {
            departmentId: this.state.isEdit ? this.state.currentDepartment.departmentId : null,
            departmentName: formData.get('name').trim(),
            departmentCode: formData.get('code').trim(),
            parentId: formData.get('parentId') || null,
            managerId: formData.get('managerId') || null,
            orderNum: Number(formData.get('orderNum')),
            description: formData.get('description').trim(),
            deptLevel: Number(formData.get('deptLevel'))
        };
    }

    /**
     * 刷新部门树
     * @returns {Promise<void>}
     * @private
     */
    async _refreshDepartments() {
        await this._loadDepartments();
        this._renderDepartmentTree(this.state.departments);
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
     * 显示错误信息
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
    }

    /**
     * 显示成功信息
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
    }

    /**
     * 销毁组件
     * @public
     */
    destroy() {
        // 解绑所有事件监听
        this.$container.find('button').off('click');
        this.$container.find('input').off('input change');
        this.$departmentTree.off('click');
        this.$membersList.off('click');

        // 销毁模态框
        if (this.departmentModal) {
            this.departmentModal.dispose();
        }
        if (this.addMemberModal) {
            this.addMemberModal.dispose();
        }

        // 清理DOM引用
        if (this.loadingEl) {
            this.loadingEl.remove();
            this.loadingEl = null;
        }

        // 清理状态
        this.state = null;
    }

    _handleDepartmentNodeClick(e) {
        const $node = $(e.currentTarget);
        const departmentId = $node.data('id');

        // 执行查询操作
        this._selectDepartment(departmentId);
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.departmentManagement = new DepartmentManagement();
});