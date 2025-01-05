/**
 * DepartmentManagement.js
 * 部门管理页面控制器
 */
class DepartmentManagement extends BaseComponent {
    constructor() {
        super({
            container: '#main',
            events: {
                'click #addDepartmentBtn': '_handleAddDepartment',
                'click #saveDepartmentBtn': '_handleSaveDepartment',
                'click #deleteDepartmentBtn': '_handleDeleteDepartment',
                'click #addMemberBtn': '_handleAddMember',
                'click #confirmAddMemberBtn': '_handleConfirmAddMember',
                'submit #departmentForm': '_handleSaveDepartment'
            }
        });

        // 状态管理
        this.state = {
            loading: false,
            departments: [], // 部门树数据
            currentDepartment: null, // 当前选中部门
            members: [], // 当前部门成员
            managers: [], // 可选的部门主管
            searchKeyword: ''
        };

        // 初始化模态框
        this.departmentModal = new bootstrap.Modal('#departmentModal');
        this.addMemberModal = new bootstrap.Modal('#addMemberModal');

        // 初始化验证器
        this.validator = window.validatorUtil;

        // 初始化组件
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            await Promise.all([
                this._loadDepartments(),
                this._loadManagers()
            ]);

            // 渲染部门树
            this._renderDepartmentTree();

            // 绑定事件
            this._bindTreeEvents();

        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 加载部门树数据
     */
    async _loadDepartments() {
        try {
            const response = await window.requestUtil.get(Const.API.DEPARTMENT.GET_TREE);
            this.state.departments = response.data;
        } catch (error) {
            console.error('加载部门数据失败:', error);
            throw error;
        }
    }

    /**
     * 加载可选部门主管
     */
    async _loadManagers() {
        try {
            const response = await window.requestUtil.get(Const.API.DEPARTMENT.GET_AVAILABLE_MANAGERS);
            this.state.managers = response.data;
            this._renderManagerOptions();
        } catch (error) {
            console.error('加载部门主管失败:', error);
            throw error;
        }
    }

    /**
     * 渲染部门主管下拉选项
     */
    _renderManagerOptions() {
        const options = this.state.managers.map(manager => `
           <option value="${manager.userId}">${manager.realName}</option>
       `).join('');

        $('#departmentManager').html(`
           <option value="">请选择部门主管</option>
           ${options}
       `);
    }

    /**
     * 渲染部门树
     */
    _renderDepartmentTree() {
        const buildTreeHtml = (departments, level = 0) => {
            return departments.map(dept => {
                const hasChildren = dept.children && dept.children.length > 0;
                const padding = level * 20;
                return `
                   <div class="department-node" data-id="${dept.departmentId}" style="padding-left: ${padding}px">
                       <div class="department-node-content">
                           <span class="toggle-icon ${hasChildren ? '' : 'hidden'}">
                               <i class="bi bi-chevron-right"></i>
                           </span>
                           <span class="department-name">${this._escapeHtml(dept.departmentName)}</span>
                           ${dept.status === 0 ? '<span class="badge bg-danger ms-2">已禁用</span>' : ''}
                       </div>
                       ${hasChildren ? buildTreeHtml(dept.children, level + 1) : ''}
                   </div>
               `;
            }).join('');
        };

        $('#departmentTree').html(buildTreeHtml(this.state.departments));
    }

    /**
     * 绑定树形结构事件
     */
    _bindTreeEvents() {
        // 切换展开/收起
        $('#departmentTree').on('click', '.toggle-icon', (e) => {
            e.stopPropagation();
            $(e.currentTarget)
                .find('i')
                .toggleClass('bi-chevron-right bi-chevron-down')
                .closest('.department-node')
                .toggleClass('expanded');
        });

        // 选择部门
        $('#departmentTree').on('click', '.department-node', async (e) => {
            e.stopPropagation();
            const $node = $(e.currentTarget);
            const deptId = $node.data('id');

            $('.department-node').removeClass('active');
            $node.addClass('active');

            await this._handleDepartmentSelect(deptId);
        });
    }

    /**
     * 处理部门选择
     */
    async _handleDepartmentSelect(departmentId) {
        try {
            const response = await window.requestUtil.get(Const.API.DEPARTMENT.GET_DETAIL(departmentId));
            this.state.currentDepartment = response.data;

            // 加载部门成员
            await this._loadDepartmentMembers(departmentId);

            // 更新表单
            this._updateDepartmentForm();

        } catch (error) {
            console.error('加载部门详情失败:', error);
            this.showError('加载部门详情失败');
        }
    }

    /**
     * 加载部门成员
     */
    async _loadDepartmentMembers(departmentId) {
        try {
            const response = await window.requestUtil.get(Const.API.DEPARTMENT.GET_MEMBERS(departmentId));
            this.state.members = response.data;
            this._renderMemberList();
        } catch (error) {
            console.error('加载部门成员失败:', error);
            throw error;
        }
    }

    /**
     * 渲染成员列表
     */
    _renderMemberList() {
        const html = this.state.members.map(member => `
           <tr>
               <td>${member.realName}</td>
               <td>${member.username}</td>
               <td>${member.position || '-'}</td>
               <td>${member.email || '-'}</td>
               <td>
                   <span class="badge ${member.status ? 'bg-success' : 'bg-danger'}">
                       ${member.status ? '正常' : '已禁用'}
                   </span>
               </td>
               <td>
                   <button class="btn btn-sm btn-outline-danger remove-member" 
                           data-id="${member.userId}">
                       移除
                   </button>
               </td>
           </tr>
       `).join('');

        $('#membersList').html(html);
    }

    /**
     * 更新部门表单
     */
    _updateDepartmentForm() {
        const dept = this.state.currentDepartment;
        if (!dept) return;

        $('#departmentName').val(dept.departmentName);
        $('#departmentCode').val(dept.departmentCode);
        $('#parentDepartment').val(dept.parentId || '');
        $('#departmentManager').val(dept.managerId || '');
        $('#departmentLevel').val(dept.deptLevel);
        $('#departmentOrder').val(dept.orderNum);
        $('#departmentDesc').val(dept.description);
    }

    /**
     * 处理部门保存
     */
    async _handleSaveDepartment(e) {
        e.preventDefault();

        if (!this._validateDepartmentForm()) {
            return;
        }

        const formData = this._getDepartmentFormData();
        const isEdit = this.state.currentDepartment?.departmentId;

        try {
            this._disableForm(true);

            const response = await window.requestUtil[isEdit ? 'put' : 'post'](
                isEdit ?
                    Const.API.DEPARTMENT.PUT_UPDATE(this.state.currentDepartment.departmentId) :
                    Const.API.DEPARTMENT.POST_CREATE,
                formData
            );

            // 重新加载部门树
            await this._loadDepartments();
            this._renderDepartmentTree();

            this.showSuccess(`部门${isEdit ? '更新' : '创建'}成功`);

            if(!isEdit) {
                this.departmentModal.hide();
            }

        } catch (error) {
            console.error('保存部门失败:', error);
            this.showError(error.message || '保存部门失败');
        } finally {
            this._disableForm(false);
        }
    }

    /**
     * 处理部门删除
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

            // 重新加载部门树
            await this._loadDepartments();
            this._renderDepartmentTree();

            // 清空当前选中部门
            this.state.currentDepartment = null;
            this._updateDepartmentForm();

            this.showSuccess('部门删除成功');

        } catch (error) {
            console.error('删除部门失败:', error);
            this.showError('删除部门失败');
        }
    }

    /**
     * 处理添加成员
     */
    _handleAddMember() {
        if (!this.state.currentDepartment) {
            this.showError('请先选择部门');
            return;
        }
        this.addMemberModal.show();
    }

    /**
     * 处理确认添加成员
     */
    async _handleConfirmAddMember() {
        const selectedUsers = [];
        $('#memberSearchResults .member-item.selected').each((_, el) => {
            selectedUsers.push($(el).data('id'));
        });

        if (selectedUsers.length === 0) {
            this.showError('请选择要添加的成员');
            return;
        }

        try {
            await window.requestUtil.post(
                Const.API.DEPARTMENT.POST_ADD_MEMBER(this.state.currentDepartment.departmentId),
                {
                    userIds: selectedUsers
                }
            );

            // 重新加载部门成员
            await this._loadDepartmentMembers(this.state.currentDepartment.departmentId);

            this.addMemberModal.hide();
            this.showSuccess('添加成员成功');

        } catch (error) {
            console.error('添加成员失败:', error);
            this.showError('添加成员失败');
        }
    }

    /**
     * 校验部门表单
     */
    _validateDepartmentForm() {
        const form = $('#departmentForm')[0];
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return false;
        }

        return true;
    }

    /**
     * 获取表单数据
     */
    _getDepartmentFormData() {
        const formData = new FormData($('#departmentForm')[0]);
        return {
            departmentName: formData.get('name'),
            departmentCode: formData.get('code'),
            parentId: formData.get('parentId') || null,
            managerId: formData.get('managerId') || null,
            deptLevel: parseInt(formData.get('deptLevel')),
            orderNum: parseInt(formData.get('orderNum')),
            description: formData.get('description')
        };
    }

    /**
     * 禁用/启用表单
     */
    _disableForm(disabled) {
        const $btn = $('#saveDepartmentBtn');
        $btn.prop('disabled', disabled);
        if (disabled) {
            $btn.html('<span class="spinner-border spinner-border-sm"></span> 保存中...');
        } else {
            $btn.text('保存');
        }
        $('#departmentForm').find('input,select,textarea').prop('disabled', disabled);
    }

    /**
     * HTML转义
     */
    _escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.departmentManagement = new DepartmentManagement();
});