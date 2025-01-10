/**
 * TodoList类 - 待办工单管理
 * 负责工单的展示、搜索和状态处理
 */
class TodoList {
    /**
     * 构造函数 - 初始化实例属性和状态
     * @throws {Error} 当用户未登录时抛出异常
     */
    constructor() {
        // 验证并获取用户信息
        this.userInfo = this.validateUserLogin();
        if (!this.userInfo) {
            window.location.href = '/login.html';
            return;
        }

        // 缓存DOM元素引用
        this.$todoList = $('#todoList');
        this.$searchForm = $('#searchForm');
        this.$pagination = $('#pagination');
        this.$totalCount = $('#totalCount');
        this.departmentMap = null;
        // 状态管理
        this.state = {
            loading: false,
            currentPage: 1,
            pageSize: 10,
            total: 0,
            filters: {
                userId: this.userInfo.userId,  // 始终携带用户ID
                keyword: '',
                priority: '',
                startDate: '',
                endDate: ''
            }
        };

        this.initEventHandlers();
        this.loadTodoList();
        this.initSearchForm();
    }

    /**
     * 验证用户登录状态
     * @returns {Object|null} 返回用户信息对象，未登录则返回null
     * @private
     */
    validateUserLogin() {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo?.userId) {
                return null;
            }
            return userInfo;
        } catch (error) {
            console.error('解析用户信息失败:', error);
            return null;
        }
    }

    /**
     * 加载待办工单列表
     * 请求参数携带用户身份和筛选条件
     */
    async loadTodoList() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;

            // 构造请求参数，确保携带用户ID
            const params = {
                userId: this.userInfo.userId,
                pageNum: this.state.currentPage,
                pageSize: this.state.pageSize,
                ...this.state.filters
            };

            const response = await $.ajax({
                url: '/api/tickets/todos',
                method: 'GET',
                data: params,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-User-Id': this.userInfo.userId
                }
            });

            if (response.code === 200) {
                this.renderTodoList(response.data);
            } else {
                throw new Error(response.msg || '加载失败');
            }
        } catch (error) {
            console.error('加载待办工单失败:', error);
            this.handleError(error);
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 处理搜索请求
     * 收集表单数据并保留用户标识
     */
    handleSearch() {
        const formData = new FormData(this.$searchForm[0]);

        // 更新筛选条件，保留用户ID
        this.state.filters = {
            userId: this.userInfo.userId,  // 保持用户ID
            keyword: formData.get('keyword') || '',
            priority: formData.get('priorityFilter') || '',
            startDate: formData.get('startDate') || '',
            endDate: formData.get('endDate') || ''
        };

        this.state.currentPage = 1;
        this.loadTodoList();
    }

    /**
     * 处理重置操作
     * 重置筛选条件但保留用户标识
     */
    handleReset() {
        this.$searchForm[0].reset();

        // 重置筛选条件，保留用户ID
        this.state.filters = {
            userId: this.userInfo.userId,  // 保持用户ID
            keyword: '',
            priority: '',
            startDate: '',
            endDate: ''
        };

        this.state.currentPage = 1;
        this.loadTodoList();
    }

    /**
     * 处理工单操作
     * @param {string} ticketId - 工单ID
     * @param {string} action - 操作类型(process/complete/transfer)
     */
    async handleTicketAction(ticketId, action) {
        try {
            await $.ajax({
                url: `/api/tickets/${ticketId}/${action}`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'X-User-Id': this.userInfo.userId
                },
                data: JSON.stringify({
                    userId: this.userInfo.userId,
                    ticketId: ticketId,
                    action: action
                }),
                contentType: 'application/json'
            });

            this.showSuccess('操作成功');
            this.loadTodoList();
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * 初始化事件处理器
     * 绑定各种DOM事件监听
     * @private
     */
    initEventHandlers() {
        // 搜索表单提交
        this.$searchForm.on('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // 重置按钮点击
        $('#resetBtn').on('click', () => {
            this.handleReset();
        });

        // 处理按钮点击
        this.$todoList.on('click', '.process-btn', (e) => {
            const ticketId = $(e.currentTarget).data('ticket-id');
            this.handleProcess(ticketId);
        });

        // 完成按钮点击
        this.$todoList.on('click', '.complete-btn', (e) => {
            const ticketId = $(e.currentTarget).data('ticket-id');
            this.handleComplete(ticketId);
        });

        // 转交按钮点击
        this.$todoList.on('click', '.transfer-btn', (e) => {
            const ticketId = $(e.currentTarget).data('ticket-id');
            this.handleTransfer(ticketId);
        });

        // 详情按钮点击
        this.$todoList.on('click', '.detail-btn', (e) => {
            const ticketId = $(e.currentTarget).data('ticket-id');
            this.showTicketDetail(ticketId);
        });
    }


    /**
     * 获取部门列表
     * 从后端获取部门数据并构建映射表
     * @returns {Promise<Object>} 部门ID到部门名称的映射表
     * @private
     */
    async getDepartmentList() {
        // 如果已有缓存，直接返回
        if (this.departmentMap) {
            return this.departmentMap;
        }

        try {
            // 调用后端接口获取部门列表
            const response = await $.ajax({
                url: '/api/departments/selectAll',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                // 构建部门ID到名称的映射关系
                this.departmentMap = response.data.reduce((map, dept) => {
                    map[dept.departmentId] = dept.departmentName;
                    // 处理子部门信息（如果有）
                    if (dept.subDepartments) {
                        dept.subDepartments.forEach(subDept => {
                            map[subDept.departmentId] = subDept.departmentName;
                        });
                    }
                    return map;
                }, {});

                return this.departmentMap;
            } else {
                throw new Error(response.msg || '获取部门列表失败');
            }
        } catch (error) {
            console.error('获取部门列表失败:', error);
            return {};
        }
    }

    /**
     * 获取部门名称
     * @param {number} departmentId - 部门ID
     * @returns {Promise<string>} 部门名称
     * @private
     */
    async getDepartmentName(departmentId) {
        if (!departmentId) {
            return '-';
        }

        const departmentMap = await this.getDepartmentList();
        return departmentMap[departmentId] || '未知部门';
    }

    /**
     * 显示工单详情
     * 展示工单的详细信息和操作界面
     * @param {string} ticketId - 工单ID
     * @private
     */
    async showTicketDetail(ticketId) {
        try {
            this.showLoading();
            // 获取工单详情
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                // 缓存当前工单信息
                this.currentTicket = response.data;

                // 更新模态框内容
                const departmentName = await this.getDepartmentName(response.data.departmentId);

                // 填充基本信息
                $('#ticketCode').text(`TK${String(ticketId).padStart(6, '0')}`);
                $('#ticketTitle').text(this.escapeHtml(response.data.title));
                $('#ticketContent').text(this.escapeHtml(response.data.content));
                $('#createTime').text(this.formatDateTime(response.data.createTime));
                $('#ticketDepartment').text(departmentName);
                $('#ticketPriority').html(this.renderPriorityBadge(response.data.priority));
                $('#ticketStatus').html(this.renderStatusBadge(response.data.status));

                if (response.data.expectFinishTime) {
                    $('#expectFinishTime').text(this.formatDateTime(response.data.expectFinishTime));
                } else {
                    $('#expectFinishTime').text('-');
                }

                // 根据工单状态控制操作按钮
                this.updateDetailButtons(response.data.status);

                // 显示模态框
                const modal = new bootstrap.Modal('#processModal');
                modal.show();
            } else {
                throw new Error(response.msg || '获取工单详情失败');
            }
        } catch (error) {
            console.error('加载工单详情失败:', error);
            NotifyUtil.error(error.message || '加载工单详情失败');
        } finally {
            this.hideLoading();
        }
    }

    renderPriorityBadge(priority) {
        const priorityClass = {
            1: 'danger',
            2: 'warning',
            3: 'success'
        }[priority] || 'secondary';

        return `<span class="badge bg-${priorityClass}">${this.getPriorityText(priority)}</span>`;
    }


    /**
     * 处理工单处理操作
     * @param {string} ticketId - 工单ID
     * @private
     */
    async handleProcess(ticketId) {
        try {
            await $.ajax({
                url: `/api/tickets/${ticketId}/process`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            this.showSuccess('开始处理工单');
            this.loadTodoList();
        } catch (error) {
            this.showError('处理失败，请重试');
        }
    }


    /**
     * 渲染操作按钮
     * @param {Object} ticket - 工单对象
     */
    renderOperationButtons(ticket) {
        const buttons = [];

        switch(ticket.status) {
            case 'PENDING':
                buttons.push(`
                    <button class="btn btn-sm btn-primary process-btn" 
                            data-ticket-id="${ticket.ticketId}">
                        处理
                    </button>
                `);
                break;
            case 'PROCESSING':
                buttons.push(`
                    <button class="btn btn-sm btn-success me-1 complete-btn" 
                            data-ticket-id="${ticket.ticketId}">
                        完成
                    </button>
                    <button class="btn btn-sm btn-warning transfer-btn" 
                            data-ticket-id="${ticket.ticketId}">
                        转交
                    </button>
                `);
                break;
            case 'COMPLETED':
                buttons.push(`
                    <button class="btn btn-sm btn-outline-secondary view-btn" 
                            data-ticket-id="${ticket.ticketId}">
                        查看
                    </button>
                `);
                break;
        }

        // 添加详情按钮
        buttons.push(`
            <button class="btn btn-sm btn-outline-primary ms-1 detail-btn" 
                    data-ticket-id="${ticket.ticketId}">
                详情
            </button>
        `);

        return buttons.join('');
    }

    /**
     * 获取优先级文本
     * @param {number} priority - 优先级值
     */
    getPriorityText(priority) {
        return {
            1: '高优先级',
            2: '中优先级',
            3: '低优先级'
        }[priority] || '未知优先级';
    }


    /**
     * 渲染工单列表
     * @param {Array} tickets - 工单数据数组
     */
    async renderTodoList(tickets) {
        if (!tickets || tickets.length === 0) {
            this.$todoList.html(`
           <tr>
               <td colspan="7" class="text-center text-muted">
                   <i class="bi bi-inbox me-2"></i>暂无待办工单
               </td>
           </tr>
       `);
            return;
        }
        await this.getDepartmentList();

        const html = await Promise.all(tickets.map(async ticket => `
       <tr>
           <td>TK${String(ticket.ticketId).padStart(6, '0')}</td>
           <td>
               <div class="d-flex align-items-center">
                   ${this.renderPriorityIndicator(ticket.priority)}
                   ${this.escapeHtml(ticket.title)}
               </div>
           </td>
           <td>${await this.getDepartmentName(ticket.departmentId)}</td>
           <td>${this.getPriorityText(ticket.priority)}</td>
           <td>${ticket.expectFinishTime ? this.formatDateTime(ticket.expectFinishTime) : '-'}</td>
           <td>${this.formatDateTime(ticket.createTime)}</td>
           <td>${this.renderOperationButtons(ticket)}</td>
       </tr>
   `));

        this.$todoList.html(html.join(''));
    }



    /**
     * 更新详情模态框按钮状态
     * @param {string} status - 工单状态
     * @private
     */
    updateDetailButtons(status) {
        const $processBtn = $('#submitProcessBtn');
        const $completeBtn = $('#completeBtn');
        const $transferBtn = $('#transferBtn');

        switch(status) {
            case 'PENDING':
                $processBtn.show().prop('disabled', false);
                $completeBtn.hide();
                $transferBtn.show().prop('disabled', false);
                break;
            case 'PROCESSING':
                $processBtn.hide();
                $completeBtn.show().prop('disabled', false);
                $transferBtn.show().prop('disabled', false);
                break;
            case 'COMPLETED':
            case 'CLOSED':
                $processBtn.hide();
                $completeBtn.hide();
                $transferBtn.hide();
                break;
        }
    }


    /**
     * 格式化日期时间
     * @param {string} dateTime - ISO日期时间字符串
     */
    formatDateTime(dateTime) {
        if (!dateTime) return '-';
        const date = new Date(dateTime);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    /**
     * 统一错误处理
     * @param {Error} error - 错误对象
     * @private
     */
    handleError(error) {
        if (error.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('userInfo');
            window.location.href = '/login.html';
            return;
        }

        const message = error.responseJSON?.msg || error.message || '操作失败';
        this.showError(message);
    }

    showSuccess(message) {
        NotifyUtil.success(message);
    }

    showError(message) {
        NotifyUtil.error(message);
    }

    /**
     * 转义HTML
     * @param {string} str - 需要转义的字符串
     */
    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * 初始化搜索表单相关功能
     * 实现表单内容变更的自动触发和手动搜索
     * @private
     */
    initSearchForm() {
        // 缓存表单元素
        const $form = this.$searchForm;
        const $inputs = $form.find('input, select');

        // 使用防抖函数包装搜索请求
        const debouncedSearch = _.debounce(() => {
            this.silentSearch();  // 静默搜索
        }, 1000);  // 1秒延迟

        /**
         * 监听表单内容变更
         * 包括：文本输入、下拉选择、日期选择等
         */
        $inputs.on('input change', (e) => {
            const $target = $(e.target);

            // 日期输入特殊处理
            if ($target.attr('type') === 'date') {
                const startDate = $('#startDate').val();
                const endDate = $('#endDate').val();

                // 确保日期范围有效
                if (startDate && endDate && startDate > endDate) {
                    this.showError('开始日期不能大于结束日期');
                    return;
                }
            }

            debouncedSearch();
        });

        /**
         * 处理表单提交（手动搜索）
         */
        $form.on('submit', (e) => {
            e.preventDefault();
            this.handleManualSearch();
        });

        /**
         * 处理表单重置
         */
        $('#resetBtn').on('click', () => {
            $form[0].reset();
            this.handleManualSearch();
        });
    }

    /**
     * 静默搜索
     * 不显示loading状态，静默刷新数据
     * @private
     */
    async silentSearch() {
        try {
            // 构建搜索参数
            const params = {
                userId: this.userInfo.userId,
                pageNum: this.state.currentPage,
                pageSize: this.state.pageSize,
                ...this.collectSearchParams()
            };

            // 发送请求
            const response = await $.ajax({
                url: '/api/tickets/todos',
                method: 'GET',
                data: params,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                // 更新数据和视图
                this.renderTodoList(response.data);
            } else {
                throw new Error(response.msg || '搜索失败');
            }
        } catch (error) {
            console.error('静默搜索失败:', error);
            // 静默搜索失败不显示错误提示
        }
    }

    /**
     * 手动搜索处理
     * 显示loading状态，展示搜索结果
     * @private
     */
    async handleManualSearch() {
        try {
            this.showLoading();

            const params = {
                userId: this.userInfo.userId,
                pageNum: 1,  // 手动搜索重置页码
                pageSize: this.state.pageSize,
                ...this.collectSearchParams()
            };

            const response = await $.ajax({
                url: '/api/tickets/todos',
                method: 'GET',
                data: params,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                this.state.currentPage = 1;  // 重置页码
                this.renderTodoList(response.data);
                this.showSuccess('搜索完成');
            } else {
                throw new Error(response.msg || '搜索失败');
            }
        } catch (error) {
            console.error('搜索失败:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 收集搜索参数
     * @returns {Object} 搜索参数对象
     * @private
     */
    collectSearchParams() {
        const formData = new FormData(this.$searchForm[0]);

        return {
            keyword: formData.get('keyword')?.trim() || '',
            priority: formData.get('priorityFilter') || '',
            startDate: formData.get('startDate') || '',
            endDate: formData.get('endDate') || '',
            _t: new Date().getTime()  // 防止缓存
        };
    }
}

// 初始化
$(document).ready(() => {
    window.todoList = new TodoList();
});