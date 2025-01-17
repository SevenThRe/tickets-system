/**
 * DepartmentMembers.js
 * 部门成员管理控制器
 * 实现成员列表管理、绩效分析等功能
 *
 * @author SevenThRe
 * @created 2024-01-06
 */
class DepartmentManagement {
    constructor() {
        // 缓存DOM元素引用
        this.$container = $('#main');
        this.$departmentTree = $('#departmentTree');
        this.$membersList = $('#membersList');
        this.$departmentForm = $('#departmentForm');
        this.$searchResults = $('#memberSearchResults')
        this.$memberBody = $('#memberBody');
        this.iconModal = new bootstrap.Modal('#iconModal');
        this.departmentModal = new bootstrap.Modal('#departmentModal');
        this.$parentDepartment = $('#parentDepartment');
        this.formMode = 'view'; // 'view', 'add', 'edit'
        this.availableIcons = [
            'fa-folder', 'fa-building', 'fa-users', 'fa-cog', 'fa-briefcase',
            'fa-chart-bar', 'fa-sitemap', 'fa-archive', 'fa-layer-group',
            'fa-shield-alt', 'fa-cube', 'fa-cubes'
        ];

        this.validationRules = {
            departmentName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                message: '部门名称长度必须在2-50个字符之间'
            },
            managerId: {
                required: false,
                message: '请选择部门负责人'
            },
            deptLevel: {
                required: true,
                validator: (value) => Number(value) >= 1 && Number(value) <= 5,
                message: '部门层级必须在1-5之间'
            },
            description: {
                required: false,
                maxLength: 200,
                message: '部门描述不能超过200个字符'
            },
            status: {
                required: true,
                validator: (value) => value === '0' || value === '1',
                message: '状态值无效'
            },
            orderNum: {
                required: true,
                validator: (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
                message: '排序号必须是非负整数'
            }
        };

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
        this._bindFormValidation();
        this.$departmentTree.on('click', '.department-node', (e) => {
            this._handleDepartmentNodeClick(e);
        });

        // 定义表单验证规则
        this.validationRules = {
            name: [
                {type: 'required'},
                {type: 'departmentName'}
            ],
            code: [
                {type: 'required'},
                {type: 'departmentCode'}
            ],
            orderNum: [
                {type: 'departmentOrder'}
            ],
            deptLevel: [
                {type: 'min', param: 1},
                {type: 'max', param: 5}
            ],
            managerId: [
                {type: 'required'}
            ]
        };

        // 初始化模态框
        this.validator = new ValidatorUtil(this.validationRules);
        this.departmentModal = new bootstrap.Modal('#departmentModal');
        this.addMemberModal = new bootstrap.Modal('#addMemberModal');
        this._initIconSelector();
        // 绑定事件
        this._bindEvents();

        // 初始化
        this.init();
    }

    async init() {
        try {
            await this._loadDepartments();
            await this._loadDepartmentTrees();
            // 在这里缓存 DOM 元素，确保它们已经加载
            this.$departmentTree = $('#departmentTree');
            this._renderDepartmentTree(this.state.departmentsTrees);
            this._updateParentOptions(this.state.currentDepartment);
        } catch (error) {
            NotifyUtil.error('页面初始化失败，请刷新重试', error);
        }
    }


    /**
     * 验证单个字段
     * @param {string} fieldName - 字段名称
     * @returns {boolean} - 验证结果
     * @private
     */
    _validateField(fieldName) {
        const rules = this.validationRules[fieldName];
        if (!rules) return true;

        // 如果是编辑状态且该字段不需要在编辑时验证，则直接返回true
        if (this.state.currentDepartment && rules.validateOnEdit === false) {
            return true;
        }

        const $field = this.$departmentForm.find(`[name="${fieldName}"]`);
        const value = $field.val()?.trim() || '';

        // 必填验证
        if (rules.required && !value) {
            this._setFieldInvalid($field, rules.message || '此项不能为空');
            return false;
        }

        // 长度验证
        if (rules.minLength && value.length < rules.minLength) {
            this._setFieldInvalid($field, `最小长度为${rules.minLength}个字符`);
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            this._setFieldInvalid($field, `最大长度为${rules.maxLength}个字符`);
            return false;
        }

        // 正则验证
        if (rules.pattern && !rules.pattern.test(value)) {
            this._setFieldInvalid($field, rules.message);
            return false;
        }

        // 自定义验证
        if (rules.validator && !rules.validator(value)) {
            this._setFieldInvalid($field, rules.message);
            return false;
        }

        // 验证通过，设置成功状态
        this._setFieldValid($field);
        return true;
    }

    /**
     * 处理保存部门
     */
    async _handleSaveDepartment(e) {
        e.preventDefault();

        if (!this._validateForm()) {
            return;
        }

        const formData = this._getDepartmentFormData();
        const isEdit = !!this.state.currentDepartment;

        try {
            this._disableForm(true);
            const response = await $.ajax({
                url: isEdit ?
                    '/api/departments/update' :
                    '/api/departments/add',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData)
            });

            if (response.code === 200) {
                this._showSuccess(isEdit ? '更新部门成功' : '创建部门成功');
                // 重新加载树结构
                await this._loadDepartmentTrees();
                // 重新渲染树
                this._renderDepartmentTree(this.state.departmentsTrees);

                if (isEdit) {
                    await this._selectDepartment(this.state.currentDepartment.departmentId);
                }
                this.departmentModal.hide();
            }
        } catch (error) {
            NotifyUtil.error(error.message || '保存失败');
        } finally {
            this._disableForm(false);
        }
    }


    /**
     * 绑定表单验证事件
     * @private
     */
    _bindFormValidation() {
        // 为每个需要验证的字段绑定blur事件
        Object.keys(this.validationRules).forEach(fieldName => {
            const $field = this.$departmentForm.find(`[name="${fieldName}"]`);

            // 绑定失去焦点事件
            $field.on('blur', (e) => {
                this._validateField(fieldName);
            });

            // 对于select元素，同时绑定change事件
            if ($field.is('select')) {
                $field.on('change', (e) => {
                    this._validateField(fieldName);
                });
            }

            // 对于input元素，绑定input事件进行实时验证
            if ($field.is('input:not([type="number"])')) {
                $field.on('input', (e) => {
                    // 使用防抖避免频繁验证
                    clearTimeout(this.validateTimer);
                    this.validateTimer = setTimeout(() => {
                        this._validateField(fieldName);
                    }, 300);
                });
            }
        });

        // 绑定表单提交事件
        this.$departmentForm.on('submit', (e) => {
            e.preventDefault();
            if (this._validateForm()) {
                this._handleSaveDepartment(e);
            }
        });
    }


    /**
     * 绑定事件处理
     * @private
     */
    _bindEvents() {

        // 添加成员相关事件
        $('#addMemberBtn').on('click', () => this._handleAddMember());
        $('#confirmAddMemberBtn').on('click', () => this._handleConfirmAddMember());
        $('#memberSearch').on('input', (e) => this._handleMemberSearch(e));

        // 模态框底部的保存按钮(新增时用)
        $('#saveDepartmentModalBtn').on('click', () => {
            if(this.formMode === 'add') {
                this._handleFormSubmit();
            }
        });

        // 表单内的保存按钮(修改时用)
        $('#saveDepartmentBtn').on('click', (e) => {
            if(this.formMode === 'edit' || this.formMode === 'view') {
                this._handleSaveDepartment(e);
            }
        });

        $('[data-bs-dismiss="modal"]').on('click', () => {
            // 关闭时将表单移回原处
            const $form = this.$departmentForm.detach();
            // 还原表单

            $('.department-detail-card .card-body').append($form);
            this.formMode = 'view';
        });
        // 部门相关事件
        $('#deleteDepartmentBtn').on('click', () => this._handleDeleteDepartment());
        // 部门树事件
        this.$departmentTree.on('click', '.department-node-header i', (e) => {
            e.stopPropagation();
            const $icon = $(e.currentTarget);
            const $node = $icon.closest('.department-node');
            $icon.toggleClass('bi-chevron-right bi-chevron-down');
            $node.find('> .department-children').slideToggle();
        })

        // 添加部门按钮
        $('#addDepartmentBtn').on('click', () => this._handleAddDepartment());

        // 保存按钮
        $('#saveModalBtn').on('click', (e) => this._handleFormSubmit(e));

        // 模态框关闭事件
        $('#departmentModal').on('hidden.bs.modal', () => {
            // 如果是添加模式，将表单移回原位置
            if (this.formMode === 'add') {
                const $form = this.$departmentForm.detach();
                $('.department-detail-card .card-body').append($form);

                // 移除表单事件绑定
                this.$departmentForm.off('submit');

                // 重新绑定原有表单事件
                this.$departmentForm.on('submit', (e) => this._handleSaveDepartment(e));
            }
            this.formMode = 'view';
        });

        this.$departmentTree.on('click', '.department-node-header', async (e) => {
            const $node = $(e.currentTarget).closest('.department-node');
            const deptId = $node.data('id');
            await this._selectDepartment(deptId);
        });

        // 表单提交事件
        this.$departmentForm.on('submit', (e) => this._handleSubmitDepartment(e));
        this.$departmentForm.find('input, select').on('blur', (e) => {
            const fieldName = $(e.target).attr('name');
            this._validateField(fieldName);
        });

        // 成员移除事件
        this.$memberBody.on('click', '.remove-member', (e) => {
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
     * 加载部门数据
     * @private
     */
    async _loadDepartments() {
        try {
            this.state.loading = true;
            this._showLoading();

            const response = await $.ajax({
                url: '/api/departments/list',
                method: 'GET'
            });

            if (response.code === 200) {
                this.state.departments = response.data;
            } else {
                throw new Error(response.message || '加载部门数据失败');
            }

        } catch (error) {
            NotifyUtil.error('加载部门数据失败:', error);
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

            if (response.code === 200) {
                this.state.departmentsTrees = response.data;
            } else {
                throw new Error(response.message || '加载部门数据失败');
            }

        } catch (error) {
            NotifyUtil.error('加载部门数据失败:', error);
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
        // 绑定选择事件
        this.$departmentTree.on('select_node.jstree', (e, data) => {
            const departmentId = data.node.id;
            this._selectDepartment(departmentId);
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
                'state': {'opened': true},
                'li_attr': {'data-id': node.id.toString()}
            };
        };
        return data.map(dept => prepareNode(dept, null));
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
                url: `/api/departments/members/${this.state.currentDepartment.departmentId}`,
                method: 'GET'
            });

            if (response.code === 200) {
                this.state.members = response.data;
                this._renderMembersList();
            } else {
                throw new Error(response.message || '加载部门成员失败');
            }
        } catch (error) {
            NotifyUtil.error('加载部门成员失败:', error);
            NotifyUtil.error('加载部门成员失败');
        }
    }


    async _getAvatarUrl(member) {
        const avatarUrl = `/images/${member.username}_${member.userId}_avatar.png`;
        try {
            const response = await fetch(avatarUrl, {method: 'HEAD'});
            if (response.ok) {
                return avatarUrl; // 文件存在，返回该 URL
            } else {
                return '/images/default-avatar.png'; // 文件不存在，返回默认 URL
            }
        } catch (error) {
            return '/images/default-avatar.png'; // 请求出错，返回默认 URL
        }
    }


    /**
     * 处理添加成员按钮点击
     * @private
     */
    _handleAddMember() {
        if (!this.state.currentDepartment) {
            NotifyUtil.error('请先选择部门');
            return;
        }

        // 重置搜索和选择状态
        $('#memberSearch').val('');
        this.state.searchResults = [];
        this.state.selectedMembers = new Set();

        // 加载无部门用户
        this._loadAvailableUsers();

        // 显示模态框
        this.addMemberModal.show();
    }


    async _loadAvailableUsers() {
        try {
            const response = await $.ajax({
                url: '/api/users/search',
                method: 'GET',
                data: {
                    keyword: '',
                }
            });

            if (response.code === 200) {
                // 填充部门负责人下拉框
                const html = response.data.map(user => `
                <option value="${user.userId}">${user.realName}</option>
            `).join('');
                $('#managerId').html('<option value="">请选择部门负责人</option>' + html);
            }
        } catch (e) {
            NotifyUtil.error('加载可用用户失败', e);
        }
    }



    /**
     * 处理成员搜索
     * @param {Event} e - 输入事件
     * @private
     */
    _handleMemberSearch(e) {
        clearTimeout(this.searchTimer);

        const keyword = e.target.value.trim();

        this.searchTimer = setTimeout(async () => {
            try {
                const response = await $.ajax({
                    url: '/api/users/search',
                    method: 'GET',
                    data: {
                        keyword: keyword,
                        
                    }
                });

                if (response.code === 200) {
                    this.state.searchResults = response.data;
                    this._renderSearchResults();
                }
            } catch (error) {
                NotifyUtil.error('搜索用户失败');
            }
        }, 300); // 300ms防抖
    }

    /**
     * 渲染搜索结果
     * @private
     */
    _renderSearchResults() {
        const html = `
        <div class="search-results-header">
            <div class="form-check">
                <input type="checkbox" class="form-check-input" id="selectAll"
                    ${this._isAllSelected() ? 'checked' : ''}>
                <label class="form-check-label" for="selectAll">全选</label>
            </div>
        </div>
        <div class="search-results-list">
            ${this.state.searchResults.map(user => `
                <div class="search-result-item">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input user-checkbox" 
                            id="user_${user.userId}"
                            value="${user.userId}"
                            ${this.state.selectedMembers.has(user.userId) ? 'checked' : ''}>
                        <label class="form-check-label" for="user_${user.userId}">
                            <div class="user-info">
                                <span class="user-name">${user.realName}</span>
                                <span class="user-role">${user.roleName || ''}</span>
                                <span class="user-email">${user.email || ''}</span>
                            </div>
                        </label>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

        this.$searchResults.html(html || '<div class="text-center py-3">无可添加的用户</div>');

        // 绑定全选事件
        $('#selectAll').on('change', (e) => {
            const checked = e.target.checked;
            $('.user-checkbox').prop('checked', checked);
            if (checked) {
                this.state.selectedMembers = new Set(
                    this.state.searchResults.map(user => user.userId)
                );
            } else {
                this.state.selectedMembers.clear();
            }
        });

        // 绑定单个选择事件
        $('.user-checkbox').on('change', (e) => {
            const userId = $(e.target).val();
            if (e.target.checked) {
                this.state.selectedMembers.add(userId);
            } else {
                this.state.selectedMembers.delete(userId);
            }
            // 更新全选状态
            $('#selectAll').prop('checked', this._isAllSelected());
        });
    }

    /**
     * 检查是否全部选中
     * @returns {boolean}
     * @private
     */
    _isAllSelected() {
        return this.state.searchResults.length > 0 &&
            this.state.searchResults.every(user =>
                this.state.selectedMembers.has(user.userId)
            );
    }

    /**
     * 处理确认添加成员
     * @private
     */
    async _handleConfirmAddMember() {
        if (!this.state.selectedMembers.size) {
            NotifyUtil.warning('请选择要添加的成员');
            return;
        }

        try {
            const response = await $.ajax({
                url: '/api/departments/addMembers',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    departmentId: this.state.currentDepartment.departmentId,
                    userIds: Array.from(this.state.selectedMembers)
                })
            });

            if (response.code === 200) {
                NotifyUtil.success('添加成员成功');
                this.addMemberModal.hide();
                await this._loadDepartmentMembers(); // 重新加载成员列表
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            NotifyUtil.error(error.message || '添加成员失败');
        }
    }



    async _renderMembersList() {
        const avatarUrls = await Promise.all(this.state.members.map(member => this._getAvatarUrl(member)));
        // 使用 map 生成 HTML 字符串
        const cardHtml = this.state.members.map((member, index) => {
            const avatarUrl = avatarUrls[index];
            return `
            <div class="col-md-4 mb-3">
                <div class="card member-card">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-2">
                            <div class="member-avatar me-2" style="background-image: url(${avatarUrl});">
                               
                            </div>
                            <div>
                                <h6 class="card-title mb-0">${member.realName}</h6>
                                <small class="text-muted">${member.userId}</small>
                            </div>
                        </div>
                        <div class="member-info">
                            <p class="mb-1"><i class="bi bi-briefcase me-2"></i>${member.roleName || '-'}</p>
                            <p class="mb-1"><i class="bi bi-envelope me-2"></i>${member.email || '-'}</p>
                            <p class="mb-2">
                                <span class="badge ${member.status ? 'bg-success' : 'bg-secondary'}">
                                    ${member.status ? '在职' : '离职'}
                                </span>
                            </p>
                        </div>
                        <button class="btn btn-sm btn-outline-danger remove-member w-100" 
                                data-id="${member.userId}">
                            <i class="bi bi-person-dash"></i> 移除
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        const containerHtml = `
            <div class="member-section mt-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">部门成员</h6>
                        <button class="btn btn-sm btn-primary" id="addMemberBtn">
                            <i class="bi bi-person-plus"></i> 添加成员
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            ${cardHtml || '<div class="col-12 text-center py-3">暂无成员</div>'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 清空并重新插入成员列表区域
        $('.member-section').remove();
        this.$memberBody.append(containerHtml);

        // 重新绑定添加成员按钮事件
        $('#addMemberBtn').on('click', () => this._handleAddMember());


    }





    /**
     * 更新表单按钮状态
     * @private
     */
    _updateFormButtons() {
        const $deleteBtn = $('#deleteDepartmentBtn');
        const $saveBtn = $('#saveDepartmentBtn');

        if (this.formMode === 'add') {
            $deleteBtn.hide(); // 新增模式下隐藏删除按钮
            $saveBtn.text('创建');
        } else if (this.formMode === 'edit') {
            $deleteBtn.show(); // 编辑模式下显示删除按钮
            $saveBtn.text('保存');
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
            NotifyUtil.error('移除成员失败:', error);
            NotifyUtil.error(error.message || '移除成员失败');
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
            NotifyUtil.error('部门名称长度必须在2-50个字符之间');
            return false;
        }

        // 排序号验证
        if (!Number.isInteger(Number(formData.orderNum)) || Number(formData.orderNum) < 0) {
            NotifyUtil.error('排序号必须是非负整数');
            return false;
        }

        return true;
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

    /**
     *  回显部门树节点
     * @param e - 点击事件
     * @private
     */
    _handleDepartmentNodeClick(e) {
        const selectedNode = $('#departmentTree').jstree('get_selected', true)[0];
        if (!selectedNode) return;

        const departmentId = selectedNode.id;
        this._selectDepartment(departmentId); // 加载部门详情和成员
        this._updateParentOptions(this.state.currentDepartment);
    }

    /**
     * 失去焦点时验证字段
     * @private
     */
    _bindFieldValidation() {
        this.$departmentForm.find('input,select').on('blur', (e) => {
            const $field = $(e.target);
            const fieldName = $field.attr('name');
            this._validateField(fieldName);
        });
    }


    /**
     * 选择部门
     * @param {string} departmentId - 部门ID
     * @private
     */
    async _selectDepartment(departmentId) {
        try {
            this._showLoading();
            this.$departmentForm.find('.form-actions').show();
            $('.modal-footer').hide();
            const response = await $.ajax({
                url: `/api/departments/detail/${departmentId}`,
                method: 'GET'
            });
            if(response.code === 200) {
                this.state.currentDepartment = response.data.department;

                // 更新上级部门选择器
                await this._loadDepartments(); // 确保部门列表已加载
                this._updateParentOptions(this.state.currentDepartment);

                // 填充表单数据
                this._fillDepartmentForm(response.data);

                // 加载部门成员
                await this._loadDepartmentMembers();
            } else {
                throw new Error(response.message);
            }

        } catch(error) {
            NotifyUtil.error('加载部门信息失败:' + error.message);
            throw error;
        } finally {
            this._hideLoading();
        }
    }



    /**
     * 更新上级部门选项
     * @param {Object} currentDepartment - 当前部门信息
     * @private
     */
    _updateParentOptions(currentDepartment) {
        if (!this.state.departments || !Array.isArray(this.state.departments)) {
            return;
        }

        const buildOptions = (departments, level = 0) => {
            return departments.reduce((options, dept) => {
                // 排除当前部门及其子部门作为父部门选项
                if (currentDepartment &&
                    (dept.departmentId === currentDepartment.departmentId ||
                        this._isChildDepartment(dept, currentDepartment.departmentId))) {
                    return options;
                }

                options.push(`
                <option value="${dept.departmentId}" 
                    ${currentDepartment && currentDepartment.parentId === dept.departmentId ? 'selected' : ''}>
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

        const $parentDepartment = $('#parentDepartment');
        $parentDepartment.html(options.join(''));
    }




    /**
     * 处理删除部门
     * @private
     */
    async _handleDeleteDepartment() {
        if(!this.state.currentDepartment) {
            NotifyUtil.error('请先选择部门');
            return;
        }

        // 二次确认
        if(!confirm('确认要删除该部门吗?删除后不可恢复!')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/departments/del/${this.state.currentDepartment.departmentId}`,
                method: 'DELETE'
            });

            if(response.code === 200) {
                this._showSuccess('删除成功');
                this.state.currentDepartment = null;
                // 清空表单
                this.$departmentForm[0].reset();
                // 重新加载并渲染树
                await this._loadDepartmentTrees();
                this._renderDepartmentTree(this.state.departmentsTrees);
            } else {
                throw new Error(response.message);
            }

        } catch(error) {
            NotifyUtil.error('删除失败:' + error.message);
        }
    }


    /**
     * 处理模态框表单提交(新增/修改)
     * @private
     */
    async _handleFormSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        // 获取表单数据
        const formData = {
            departmentName: $('#departmentName').val().trim(),
            departmentId: $('#departmentId').val().trim(),
            parentId: $('#parentDepartment').val() || null,
            managerId: $('#managerId').val() || null,
            deptLevel: Number($('#deptLevel').val()),
            description: $('#description').val()?.trim(),
            status: $('#status').prop('checked') ? 1 : 0,
            orderNum: Number($('#orderNum').val())
        };

        // 如果是编辑模式,添加部门ID
        if(this.isSubmitting) return;
        this.isSubmitting = true;

        try {
            // 获取表单数据
            const formData = this._getDepartmentFormData();

            // 验证表单
            if (!this._validateForm()) {
                this.isSubmitting = false;
                return;
            }
            // 表单验证
            if (!formData.departmentName) {
                NotifyUtil.warning('部门名称不能为空');
                return;
            }

            if (formData.deptLevel < 1 || formData.deptLevel > 5) {
                NotifyUtil.warning('部门层级必须在1-5之间');
                return;
            }

            const response = await $.ajax({
                url: '/api/departments/add',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData)
            });

            if (response.code === 200) {
                NotifyUtil.success('添加部门成功');

                // 关闭模态框
                this.departmentModal.hide();

                // 重新加载部门树并刷新
                await this._loadDepartmentTrees();
                this._renderDepartmentTree(this.state.departmentsTrees);

                // 还原表单到原位置
                const $form = this.$departmentForm.detach();
                $('.department-detail-card .card-body').append($form);
            } else {
                throw new Error(response.msg || '添加部门失败');
            }
        } catch (error) {
            NotifyUtil.error(error.message || '添加部门失败');
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * 设置字段有效状态
     * @param {jQuery} $field - 字段jQuery对象
     * @private
     */
    _setFieldValid($field) {
        $field
            .removeClass('is-invalid')
            .addClass('is-valid')
            .closest('.form-group')
            .find('.invalid-feedback')
            .remove();
    }

    /**
     * 验证整个表单
     * @returns {boolean} - 验证结果
     * @private
     */
    _validateForm() {
        let isValid = true;
        Object.keys(this.validationRules).forEach(fieldName => {
            if (!this._validateField(fieldName)) {
                isValid = false;
            }
        });
        return isValid;
    }


    /**
     * 初始化图标选择器
     * @private
     */
    _initIconSelector() {
        const iconGrid = $('.icon-grid');
        this.availableIcons.forEach(icon => {
            iconGrid.append(`
                <div class="icon-item" data-icon="${icon}">
                    <i class="fas ${icon}"></i>
                </div>
            `);
        });

        // 绑定图标选择事件
        $('.icon-item').on('click', (e) => {
            const selectedIcon = $(e.currentTarget).data('icon');
            $('#selectedIcon').attr('class', `fas ${selectedIcon}`);
            this.iconModal.hide();
        });

        // 绑定图标选择按钮事件
        $('#iconSelectBtn').on('click', () => {
            this.iconModal.show();
        });
    }

    /**
     * 重置表单
     * @private
     */
    _resetForm() {
        this.$departmentForm[0].reset();

        // 重置所有字段
        $('#departmentName').val('');
        $('#departmentId').val('').closest('.row').toggle(this.formMode !== 'add'); // 控制部门ID的显示
        $('#deptLevel').val(1);
        $('#description').val('');
        $('#orderNum').val(0);
        $('#status').prop('checked', true);
        $('#selectedIcon').attr('class', 'fas fa-folder'); // 重置图标

        // 重置上级部门选择器
        this._updateParentOptions(null);

        // 重置部门负责人选择器
        $('#managerId').html('<option value="">请选择部门负责人</option>');

        // 移除验证状态
        this.$departmentForm.find('.is-invalid, .is-valid')
            .removeClass('is-invalid is-valid');
        this.$departmentForm.find('.invalid-feedback').remove();

        // 控制按钮显示
        this._updateFormButtons();
    }

    /**
     * 获取表单数据
     * @returns {Object} 表单数据
     * @private
     */
    _getDepartmentFormData() {
        const selectedIcon = $('#selectedIcon').attr('class').split(' ')[1];

        return {
            departmentId: this.formMode === 'edit' ? $('#departmentId').val() : undefined,
            departmentName: $('#departmentName').val().trim(),
            managerId: $('#managerId').val() || null,
            parentId: $('#parentDepartment').val() || null,
            deptLevel: Number($('#deptLevel').val()),
            description: $('#description').val()?.trim() || null,
            status: $('#status').prop('checked') ? 1 : 0,
            orderNum: Number($('#orderNum').val()),
            iconClass: selectedIcon || 'fa-folder'
        };
    }

    /**
     * 处理表单提交
     * @private
     */
    async _handleSubmitDepartment(e) {
        e.preventDefault();

        // 防止重复提交
        if (this.isSubmitting) return;
        this.isSubmitting = true;

        try {
            if (!this._validateForm()) {
                return;
            }

            let formData = this._getDepartmentFormData();
            const isEdit = this.formMode === 'edit';

            const response = await $.ajax({
                url: isEdit ? '/api/departments/update' : '/api/departments/add',
                method: isEdit ? 'PUT' : 'POST',
                contentType: 'application/json',
                data: JSON.stringify(formData)
            });

            if (response.code === 200) {
                NotifyUtil.success(`${isEdit ? '更新' : '创建'}部门成功`);
                await this._loadDepartmentTrees();
                await this._renderDepartmentTree(this.state.departmentsTrees);

                if (isEdit && this.state.currentDepartment?.departmentId === formData.departmentId) {
                    await this._selectDepartment(formData.departmentId);
                }
                this.departmentModal.hide();
            } else {
                throw new Error(response.message || `${isEdit ? '更新' : '创建'}部门失败`);
            }
        } catch (error) {
            NotifyUtil.error(error.message || '操作失败');
        } finally {
            this.isSubmitting = false;
            this._disableForm(false);
        }
    }

    /**
     * 处理添加部门按钮点击
     * @private
     */
    _handleAddDepartment() {
        this.formMode = 'add';


        // 移除已有的submit事件监听
        this.$departmentForm.off('submit');

        // 重新绑定submit事件
        this.$departmentForm.on('submit', (e) => this._handleFormSubmit(e));

        // 重置表单
        this._resetForm();

        // 移动表单到模态框
        const $form = this.$departmentForm.detach();
        $('#modalFormContainer').append($form);

        // 更新模态框标题和按钮状态
        $('#departmentModal .modal-title').text('新增部门');
        this._updateFormButtons();

        // 隐藏部门ID字段
        $('#departmentId').closest('.row').hide();

        // 显示模态框
        this.departmentModal.show();
    }

    /**
     * 填充部门表单
     * @param {Object} data - 部门信息和负责人信息
     * @private
     */
    _fillDepartmentForm(data) {
        const department = data.department;
        const charge = data.charge && data.charge.length > 0 ? data.charge[0] : null;

        // 显示部门ID字段
        $('#departmentId').closest('.row').show();

        // 填充表单字段
        $('#departmentId').val(department.departmentId);
        $('#departmentName').val(department.departmentName);
        $('#deptLevel').val(department.deptLevel);
        $('#description').val(department.description);
        $('#status').prop('checked', department.status === 1);
        $('#orderNum').val(department.orderNum);
        $('#selectedIcon').attr('class', `fas ${department.iconClass || 'fa-folder'}`);

        // 处理部门负责人
        const $managerId = $('#managerId');
        $managerId.empty();
        $managerId.append('<option value="">请选择部门负责人</option>');

        if (charge) {
            $managerId.append(`<option value="${charge.userId}" selected>${charge.realName}</option>`);
        }

        // 处理上级部门
        $('#parentDepartment').val(department.parentId || '');
    }




}

// 页面加载完成后初始化
$(document).ready(() => {
    window.departmentManagement = new DepartmentManagement();
});