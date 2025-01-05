/**
 * department-management.js
 * 部门管理页面控制器
 */
class DepartmentManagement extends BaseComponent {
    constructor() {
        super({
            container: '#main',
            events: {
                'click #addDepartmentBtn': 'handleAddDepartment',
                'submit #departmentForm': 'handleSaveDepartment',
                'click #deleteDepartmentBtn': 'handleDeleteDepartment',
                'click #addMemberBtn': 'handleAddMember',
                'click .remove-member': 'handleRemoveMember',
                'input #memberSearch': 'handleMemberSearch',
                'click #confirmAddMemberBtn': 'handleConfirmAddMember'
            }
        });

        // 状态管理
        this.state = {
            loading: false,
            departments: [],         // 部门树数据
            currentDepartment: null, // 当前选中的部门
            members: [],            // 当前部门成员
            selectedMembers: new Set(), // 选中待添加的成员
        };

        // 缓存DOM引用
        this.elements = {
            tree: $('#departmentTree'),
            form: $('#departmentForm'),
            membersList: $('#membersList'),
            searchResults: $('#memberSearchResults'),
            addMemberModal: new bootstrap.Modal('#addMemberModal')
        };

        // 初始化组件
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            await this.loadInitialData();
            this.renderDepartmentTree();
            this.bindTreeEvents();
        } catch (error) {
            console.error('部门管理初始化失败:', error);
            this.showError('加载数据失败，请刷新页面重试');
        }
    }

    /**
     * 加载初始数据
     */
    async loadInitialData() {
        this.state.loading = true;
        try {
            // 并行加载数据
            const [departments] = await Promise.all([
                this.loadDepartments()
            ]);
            this.state.departments = this.formatDepartmentTree(departments);
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 加载部门数据
     */
    async loadDepartments() {
        const response = await window.requestUtil.get('/api/departments');
        return response.data;
    }

    /**
     * 格式化部门树数据
     */
    formatDepartmentTree(departments) {
        // 构建部门树结构
        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parentId === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };

        return buildTree(departments);
    }

    /**
     * 渲染部门树
     */
    renderDepartmentTree() {
        const buildTreeHtml = (nodes, level = 0) => {
            return nodes.map(node => `
                <div class="tree-node" data-id="${node.id}" style="padding-left: ${level * 1.5}rem">
                    <div class="tree-node-content">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-${node.children?.length ? 'folder' : 'file-earmark'} me-2"></i>
                            <span>${node.name}</span>
                        </div>
                        <div class="tree-node-actions">
                            <button class="btn btn-sm btn-link" data-action="add">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
                ${node.children?.length ? buildTreeHtml(node.children, level + 1) : ''}
            `).join('');
        };

        this.elements.tree.html(buildTreeHtml(this.state.departments));
    }

    /**
     * 绑定树节点事件
     */
    bindTreeEvents() {
        this.elements.tree.on('click', '.tree-node', (e) => {
            const $node = $(e.currentTarget);
            const departmentId = $node.data('id');

            // 如果点击的是操作按钮，不触发选中
            if ($(e.target).closest('[data-action]').length) {
                return;
            }

            this.selectDepartment(departmentId);
        });

        // 树节点操作按钮事件
        this.elements.tree.on('click', '[data-action]', (e) => {
            e.stopPropagation();
            const $btn = $(e.currentTarget);
            const action = $btn.data('action');
            const departmentId = $btn.closest('.tree-node').data('id');

            switch (action) {
                case 'add':
                    this.showAddDepartmentModal(departmentId);
                    break;
                // 可以添加更多操作
            }
        });
    }

    /**
     * 选择部门
     */
    async selectDepartment(departmentId) {
        if (this.state.loading) return;

        try {
            this.state.loading = true;

            // 更新选中状态样式
            this.elements.tree.find('.tree-node').removeClass('active');
            this.elements.tree.find(`[data-id="${departmentId}"]`).addClass('active');

            // 加载部门详情
            const [department, members] = await Promise.all([
                this.loadDepartmentDetail(departmentId),
                this.loadDepartmentMembers(departmentId)
            ]);

            this.state.currentDepartment = department;
            this.state.members = members;

            // 更新界面
            this.updateDepartmentForm();
            this.renderMembersList();

        } catch (error) {
            console.error('加载部门详情失败:', error);
            this.showError('加载部门详情失败');
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 加载部门详情
     */
    async loadDepartmentDetail(departmentId) {
        const response = await window.requestUtil.get(`/api/departments/${departmentId}`);
        return response.data;
    }

    /**
     * 加载部门成员
     */
    async loadDepartmentMembers(departmentId) {
        const response = await window.requestUtil.get(`/api/departments/${departmentId}/members`);
        return response.data;
    }

    /**
     * 更新部门表单
     */
    updateDepartmentForm() {
        const { currentDepartment } = this.state;
        if (!currentDepartment) return;

        // 填充表单数据
        Object.entries(currentDepartment).forEach(([key, value]) => {
            const $field = this.elements.form.find(`[name="${key}"]`);
            if ($field.length) {
                $field.val(value);
            }
        });

        // 更新标题
        $('#departmentTitle').text(currentDepartment.name);

        // 更新按钮状态
        $('#deleteDepartmentBtn').prop('disabled', currentDepartment.children?.length > 0);
    }

    /**
     * 渲染成员列表
     */
    renderMembersList() {
        const html = this.state.members.map(member => `
            <tr>
                <td>${member.realName}</td>
                <td>${member.employeeId}</td>
                <td>${member.position || '-'}</td>
                <td>${member.email}</td>
                <td>
                    <span class="status-badge status-${member.status ? 'active' : 'inactive'}">
                        ${member.status ? '在职' : '离职'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-link text-danger remove-member" 
                            data-id="${member.id}">
                        移除
                    </button>
                </td>
            </tr>
        `).join('');

        this.elements.membersList.html(html);
    }

    // ... 其他方法实现 ...

    /**
     * 处理添加部门
     */
    handleAddDepartment(e) {
        e.preventDefault();
        const modal = new bootstrap.Modal('#departmentModal');

        // 重置表单
        $('#departmentModalForm')[0].reset();

        // 如果当前有选中部门，设置为上级部门
        if (this.state.currentDepartment) {
            $('#parentDepartment').val(this.state.currentDepartment.id);
        }

        // 更新模态框标题
        $('#departmentModal .modal-title').text('新增部门');

        // 绑定保存按钮事件
        $('#saveDepartmentModalBtn').one('click', () => this.handleSaveDepartmentModal());

        modal.show();
    }

    /**
     * 处理模态框中的部门保存
     */
    async handleSaveDepartmentModal() {
        const formData = new FormData($('#departmentModalForm')[0]);
        const data = Object.fromEntries(formData.entries());

        try {
            await window.requestUtil.post(window.Const.API.DEPARTMENT.POST_CREATE, data);

            // 关闭模态框
            bootstrap.Modal.getInstance('#departmentModal').hide();

            // 刷新部门树
            await this.loadInitialData();
            this.renderDepartmentTree();

            this.showSuccess('部门创建成功');
        } catch (error) {
            console.error('创建部门失败:', error);
            this.showError(error.message || '创建部门失败');
        }
    }

    /**
     * 处理保存部门
     */
    async handleSaveDepartment(e) {
        e.preventDefault();

        if (!this.state.currentDepartment) {
            this.showError('请先选择部门');
            return;
        }

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            this.state.loading = true;
            await window.requestUtil.put(
                window.Const.API.DEPARTMENT.PUT_UPDATE(this.state.currentDepartment.id),
                data
            );

            // 刷新数据
            await this.loadInitialData();
            this.renderDepartmentTree();

            this.showSuccess('部门信息保存成功');
        } catch (error) {
            console.error('保存部门失败:', error);
            this.showError(error.message || '保存失败');
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 处理删除部门
     */
    async handleDeleteDepartment(e) {
        e.preventDefault();

        if (!this.state.currentDepartment) {
            this.showError('请先选择部门');
            return;
        }

        // 检查是否有子部门
        if (this.state.currentDepartment.children?.length) {
            this.showError('请先删除子部门');
            return;
        }

        // 确认删除
        if (!confirm('确定要删除该部门吗？此操作无法恢复。')) {
            return;
        }

        try {
            this.state.loading = true;
            await window.requestUtil.delete(
                window.Const.API.DEPARTMENT.DELETE(this.state.currentDepartment.id)
            );

            // 刷新数据
            await this.loadInitialData();
            this.renderDepartmentTree();

            // 清除当前选中部门
            this.state.currentDepartment = null;
            this.updateDepartmentForm();

            this.showSuccess('部门删除成功');
        } catch (error) {
            console.error('删除部门失败:', error);
            this.showError(error.message || '删除失败');
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 处理添加成员
     */
    handleAddMember(e) {
        e.preventDefault();

        if (!this.state.currentDepartment) {
            this.showError('请先选择部门');
            return;
        }

        // 清空搜索和选择状态
        $('#memberSearch').val('');
        this.state.selectedMembers.clear();
        this.elements.searchResults.empty();

        this.elements.addMemberModal.show();
    }

    /**
     * 处理成员搜索
     */
    async handleMemberSearch(e) {
        const keyword = e.target.value.trim();
        if (!keyword) {
            this.elements.searchResults.empty();
            return;
        }

        try {
            const response = await window.requestUtil.get('/api/users/search', { keyword });
            const users = response.data;

            const html = users.map(user => `
                <div class="member-item ${this.state.selectedMembers.has(user.id) ? 'selected' : ''}" 
                     data-id="${user.id}">
                    <div class="member-info">
                        <div class="member-name">${user.realName}</div>
                        <div class="member-email">${user.email}</div>
                    </div>
                </div>
            `).join('');

            this.elements.searchResults.html(html);

            // 绑定选择事件
            this.elements.searchResults.find('.member-item').on('click', (e) => {
                const $item = $(e.currentTarget);
                const userId = $item.data('id');

                if (this.state.selectedMembers.has(userId)) {
                    this.state.selectedMembers.delete(userId);
                    $item.removeClass('selected');
                } else {
                    this.state.selectedMembers.add(userId);
                    $item.addClass('selected');
                }
            });
        } catch (error) {
            console.error('搜索用户失败:', error);
            this.showError('搜索失败');
        }
    }

    /**
     * 处理确认添加成员
     */
    async handleConfirmAddMember(e) {
        e.preventDefault();

        if (!this.state.selectedMembers.size) {
            this.showError('请选择要添加的成员');
            return;
        }

        try {
            await window.requestUtil.post(
                window.Const.API.DEPARTMENT.POST_ADD_MEMBER(this.state.currentDepartment.id),
                {
                    userIds: Array.from(this.state.selectedMembers)
                }
            );

            // 关闭模态框
            this.elements.addMemberModal.hide();

            // 刷新成员列表
            await this.loadDepartmentMembers(this.state.currentDepartment.id);
            this.renderMembersList();

            this.showSuccess('成员添加成功');
        } catch (error) {
            console.error('添加成员失败:', error);
            this.showError(error.message || '添加失败');
        }
    }

    /**
     * 处理移除成员
     */
    async handleRemoveMember(e) {
        e.preventDefault();
        const userId = $(e.currentTarget).data('id');

        if (!confirm('确定要移除该成员吗？')) {
            return;
        }

        try {
            await window.requestUtil.delete(
                window.Const.API.DEPARTMENT.DELETE_MEMBER(
                    this.state.currentDepartment.id,
                    userId
                )
            );

            // 刷新成员列表
            await this.loadDepartmentMembers(this.state.currentDepartment.id);
            this.renderMembersList();

            this.showSuccess('成员移除成功');
        } catch (error) {
            console.error('移除成员失败:', error);
            this.showError(error.message || '移除失败');
        }
    }

    /**
     * 加载部门主管选项
     */
    async loadManagerOptions() {
        try {
            const response = await window.requestUtil.get(
                window.Const.API.DEPARTMENT.GET_AVAILABLE_MANAGERS
            );
            const managers = response.data;

            const html = managers.map(manager => `
                <option value="${manager.id}">${manager.realName}</option>
            `).join('');

            $('#departmentManager').html(
                `<option value="">请选择部门主管</option>${html}`
            );
        } catch (error) {
            console.error('加载部门主管选项失败:', error);
            this.showError('加载部门主管选项失败');
        }
    }
    /**
     * 销毁组件
     */
    destroy() {
        // 清除事件监听
        this.elements.tree.off();
        // 销毁模态框实例
        this.elements.addMemberModal.dispose();
        // 调用父类销毁方法
        super.destroy();
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.departmentManagement = new DepartmentManagement();
});