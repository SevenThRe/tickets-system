/**
 * TodoList 类 - 待办工单管理
 */
class TodoList {
    constructor() {
        // 状态管理
        this.state = {
            loading: false,
            todos: [],
            currentTicket: null,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {
                keyword: '',
                priority: '',
                startTime: '',
                endTime: ''
            }


        };

        // DOM 元素缓存
        this.elements = {
            todoList: $('#todoList'),
            searchForm: $('#searchForm'),
            pagination: $('#pagination'),
            totalCount: $('#totalCount'),
            processModal: new bootstrap.Modal($('#processModal')[0])
        };

        // 用户信息
        this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        // 初始化
        this.init();
    }

    PRIORITY = {
        NORMAL: 'NORMAL',
        URGENT: 'URGENT',
        EXTREMELY_URGENT: 'EXTREMELY_URGENT'
    };

    // 状态常量
    TICKET_STATUS = {
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        COMPLETED: 'COMPLETED',
        CLOSED: 'CLOSED'
    };


    /**
     * 更新工单状态
     * @param {number} ticketId - 工单ID
     * @param {number} status - 目标状态
     * @returns {Promise<void>}
     * @private
     */
    async _updateTicketStatus(ticketId, status) {
        try {
            const response = await $.ajax({
                url: '/api/tickets/status',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    ticketId: ticketId,
                    status: status,
                    operatorId: this.userInfo.userId,
                    content: '更新工单状态'
                })
            });

            if (response.code === 200) {
                this.showSuccess('状态更新成功');
                await this._loadTodos();
                await this._refreshStatistics();
            } else {
                this.showError(response.msg || '状态更新失败');
            }
        } catch (error) {
            console.error('更新状态失败:', error);
            this.showError('更新状态失败，请重试');
        }
    }


    /**
     * 初始化方法
     */
    async init() {
        try {
            this._bindEvents();
            await Promise.all([
                this._loadTodos(),     // 加载工单列表
                this._loadStatistics() // 加载统计数据
            ]);
        } catch(error) {
            console.error('初始化失败:', error);
            this.showError('加载失败，请刷新重试');
        }
    }

    /**
     * 绑定事件处理
     */
    _bindEvents() {
        // 搜索表单提交
        this.elements.searchForm.on('submit', (e) => this._handleSearch(e));

        // 重置按钮点击
        $('#resetBtn').on('click', () => this._handleReset());

        // 处理按钮点击
        this.elements.todoList.on('click', '.process-btn', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this._showProcessModal(ticketId);
        });
        // 快速开始处理按钮点击
        this.elements.todoList.on('click', '.quick-start', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this._handleQuickStart(ticketId);
        });

        // 查看详情按钮点击
        this.elements.todoList.on('click', '.view-detail', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this._showTicketDetail(ticketId);
        });


        // 提交处理按钮点击
        $('#submitProcessBtn').on('click', () => this._handleProcessSubmit());
        // 优先级筛选变化
        $('#priorityFilter').on('change', (e) => {
            const priorityValue = $(e.target).val();
            // 转换为数字类型
            this.state.filters.priority = priorityValue ? parseInt(priorityValue) : '';
            this._loadTodos();
        });

        // 日期范围选择变化
        $('#startDate, #endDate').on('change', (e) => {
            const field = e.target.id === 'startDate' ? 'startTime' : 'endTime';
            this.state.filters[field] = e.target.value;
        });
    }
    /**
     * 加载统计数据
     * @private
     */
    async _loadStatistics() {
        try {
            const response = await $.ajax({
                url: '/api/tickets/todo/stats',
                method: 'GET',
                data: { userId: this.userInfo.userId }
            });

            if(response.code === 200) {
                const stats = response.data;
                // 更新统计卡片
                $('#pendingCount').text(stats.pendingCount || 0);
                $('#processingCount').text(stats.processingCount || 0);
                $('#todayCompletedCount').text(stats.todayCompletedCount || 0);

                // 如果有待办数大于0，添加提醒样式
                if(stats.pendingCount > 0) {
                    $('#pendingCount').parent().addClass('bg-warning text-dark');
                }
            }
        } catch(error) {
            console.error('加载统计数据失败:', error);
        }
    }

    /**
     * 在工单状态更新后刷新统计
     * @private
     */
    async _refreshStatistics() {
        await this._loadStatistics();
    }

    /**
     * 快速开始处理
     * @param {number} ticketId - 工单ID
     * @private
     */
    async _handleQuickStart(ticketId) {
        try {
            await this._updateTicketStatus(ticketId, this.TICKET_STATUS.PROCESSING);
            this.showSuccess('已开始处理');
        } catch (error) {
            console.error('快速开始失败:', error);
            this.showError('操作失败，请重试');
        }
    }


    /**
     * 格式化日期
     * @param {string} dateString - 日期字符串
     * @returns {string} 格式化后的日期字符串
     * @private
     */
    _formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return '-';
        }
    }

    /**
     * 判断是否临近截止时间(10小时内)
     * @param {string} deadline - 截止时间
     * @returns {boolean}
     * @private
     */
    _isDeadlineNear(deadline) {
        if (!deadline) return false;
        const deadlineDate = new Date(deadline);
        const now = new Date();
        const diffHours = (deadlineDate - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours < 10;
    }

    /**
     * 处理搜索事件
     */
    _handleSearch(e) {
        e.preventDefault();
        this.state.filters = {
            keyword: $('#keyword').val().trim(),
            status: $('#statusFilter').val(),
            priority: $('#priorityFilter').val(),
            startTime: $('#startDate').val(),
            endTime: $('#endDate').val()
        };

        this.state.pagination.current = 1;
        this._loadTodos();
    }

    /**
     * 渲染工单列表
     */
    _renderTodoList() {
        if (!Array.isArray(this.state.todos) || this.state.todos.length === 0) {
            this.elements.todoList.html('<tr><td colspan="7" class="text-center">暂无待办工单</td></tr>');
            return;
        }

        const html = this.state.todos.map(ticket => `
            <tr>
                <td>${ticket.ticketId}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${this._getPriorityClass(ticket.priority)}"></span>
                        <span class="ticket-title">${this._escapeHtml(ticket.title)}</span>
                    </div>
                </td>
                <td>${this._escapeHtml(ticket.departmentName) || '-'}</td>
                <td>
                    <span class="badge todo-badge ${this._getPriorityBadgeClass(ticket.priority)}">
                        ${this._getPriorityText(parseInt(ticket.priority))}
                    </span>
                </td>
                <td>
                    <div class="${this._isDeadlineNear(ticket.expectFinishTime) ? 'deadline-warning' : ''}">
                        ${this._formatDate(ticket.expectFinishTime)}
                    </div>
                </td>
                <td>${this._formatDate(ticket.createTime)}</td>
                <td>
                    <div class="btn-group">
                        ${ticket.status === 'PENDING' ? `
                            <button class="btn btn-sm btn-outline-success quick-start" data-id="${ticket.ticketId}">
                                <i class="bi bi-play-fill"></i> 快速开始
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-primary process-btn" data-id="${ticket.ticketId}">
                            <i class="bi bi-tools"></i> 处理
                        </button>
                        <button class="btn btn-sm btn-outline-secondary view-detail" data-id="${ticket.ticketId}">
                            <i class="bi bi-eye"></i> 详情
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');


        this.elements.todoList.html(html);
        this.elements.totalCount.text(this.state.pagination.total);

        // 更新顶部统计数据
        this._updateStats();
    }

    /**
     * 加载待办工单列表
     */
    async _loadTodos() {
        if(this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const params = {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
                processorId: this.userInfo.userId,
                status: ['PENDING', 'PROCESSING'],
                ...this.state.filters
            };

            const response = await $.ajax({
                url: '/api/tickets/todos',
                method: 'GET',
                data: params
            });

            if(response.code === 200) {
                this.state.todos = response.data.list;
                this.state.pagination.total = response.data.total;
                this._renderTodoList();
                this._updatePagination();
            }

        } catch(error) {
            console.error('加载待办工单失败:', error);
            this.showError('加载待办工单失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 处理工单提交
     * @private
     */
    async _handleProcessSubmit() {
        const processNote = $('#processNote').val().trim();
        const processStatus = $('#processStatus').val();
        const files = $('#processAttachments')[0].files;

        if (!processNote) {
            this.showError('请输入处理说明');
            return;
        }

        try {
            // 1. 如果有附件，先上传附件
            if (files.length > 0) {
                const formData = new FormData();
                Array.from(files).forEach(file => {
                    formData.append('files', file);
                });
                formData.append('ticketId', this.state.currentTicket.ticketId);

                const uploadResponse = await $.ajax({
                    url: `/api/tickets/${this.state.currentTicket.ticketId}/attachments`,
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false
                });

                // 检查上传结果
                if (uploadResponse.code !== 200) {
                    this.showError(uploadResponse.msg || '附件上传失败');
                    return;
                }
            }

            // 2. 更新工单状态
            const response = await $.ajax({
                url: '/api/tickets/status',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    ticketId: this.state.currentTicket.ticketId,
                    status: processStatus,
                    operatorId: this.userInfo.userId,
                    content: processNote
                })
            });

            if (response.code === 200) {
                this.showSuccess('处理成功');
                this.elements.processModal.hide();
                await this._loadTodos();
                await this._refreshStatistics();
            } else {
                this.showError(response.msg || '处理失败');
            }

        } catch (error) {
            console.error('处理工单失败:', error);
            this.showError('处理失败，请重试');
        }
    }

    /**
     * 显示工单处理模态框
     * @param {number} ticketId - 工单ID
     * @private
     */
    async _showProcessModal(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET'
            });

            if (response.code === 200) {
                this.state.currentTicket = response.data;
                this._renderTicketDetail();
                this.elements.processModal.show();
            }
        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError('加载详情失败');
        }
    }

    /**
     * 渲染工单详情
     * @private
     */
    _renderTicketDetail() {
        const ticket = this.state.currentTicket;
        if (!ticket) return;

        $('#ticketCode').text(ticket.ticketId);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(this._formatDate(ticket.createTime));
        $('#expectFinishTime').text(this._formatDate(ticket.expectFinishTime));
        $('#ticketPriority').html(`
            <span class="badge ${this._getPriorityBadgeClass(ticket.priority)}">
                ${this._getPriorityText(ticket.priority)}
            </span>
        `);

        // 重置表单
        $('#processForm')[0].reset();
        $('#processStatus').val(ticket.status === 'PENDING' ? 'PROCESSING' : 'COMPLETED');
    }

    /**
     * 更新统计数据
     * @private
     */
    async _updateStats() {
        try {
            const response = await $.ajax({
                url: '/api/tickets/statistics',
                method: 'GET',
                data: { userId: this.userInfo.userId }
            });

            if (response.code === 200) {
                const stats = response.data;
                $('#pendingCount').text(stats.statusCount?.PENDING || 0);
                $('#processingCount').text(stats.statusCount?.PROCESSING || 0);
                $('#todayCompletedCount').text(stats.todayCompleted || 0);
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
        }
    }

    /**
     * 格式化日期时间为后端接受的格式
     * @param {string} dateString - 日期字符串
     * @returns {string} ISO格式的日期时间字符串
     * @private
     */
    _formatDateForBackend(dateString) {
        if (!dateString) return null;
        // 将日期格式化为ISO格式，确保时区正确
        const date = new Date(dateString);
        return date.toISOString();
    }


    /**
     * 处理重置事件
     * @private
     */
    _handleReset() {
        // 重置表单
        this.elements.searchForm[0].reset();

        // 重置状态
        this.state.filters = {
            keyword: '',
            status: '',
            priority: '',
            startTime: '',
            endTime: ''
        };
        this.state.pagination.current = 1;

        // 重新加载数据
        this._loadTodos();
    }


    /**
     * 获取优先级样式类
     * @param {string} priority - 优先级
     * @returns {string} 样式类名
     * @private
     */
    _getPriorityBadgeClass(priority) {
        const classMap = {
            'HIGH': 'priority-high',
            'MEDIUM': 'priority-medium',
            'LOW': 'priority-low'
        };
        return classMap[priority] || 'priority-low';
    }

    /**
     * 获取优先级文本
     * @param {string} priority - 优先级
     * @returns {string} 显示文本
     * @private
     */
    _getPriorityText(priority) {
        const textMap = {
            'HIGH': '高优先级',
            'MEDIUM': '中等优先级',
            'LOW': '低优先级'
        };
        return textMap[priority] || '普通';
    }

    /**
     * 显示加载状态
     * @private
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

    /**
     * 隐藏加载状态
     * @private
     */
    _hideLoading() {
        if (this.$loading) {
            this.$loading.hide();
        }
    }

    /**
     * 显示成功提示
     * @param {string} message - 提示信息
     */
    showSuccess(message) {
        NotifyUtil.success(message);
    }

    /**
     * 显示错误提示
     * @param {string} message - 提示信息
     */
    showError(message) {
        NotifyUtil.error(message);
    }

    /**
     * HTML转义
     * @param {string} str - 需要转义的字符串
     * @returns {string} 转义后的字符串
     * @private
     */
    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * 更新分页
     * @private
     */
    _updatePagination() {
        const { current, pageSize, total } = this.state.pagination;
        const totalPages = Math.ceil(total / pageSize);

        // 构建分页HTML
        let html = '';

        // 上一页
        html += `
            <li class="page-item ${current <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current - 1}">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `;

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 || // 第一页
                i === totalPages || // 最后一页
                (i >= current - 2 && i <= current + 2) // 当前页附近的页码
            ) {
                html += `
                    <li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (
                (i === 2 && current - 2 > 2) || // 前面的省略号
                (i === totalPages - 1 && current + 2 < totalPages - 1) // 后面的省略号
            ) {
                html += `
                    <li class="page-item disabled">
                        <a class="page-link" href="#">...</a>
                    </li>
                `;
                // 跳过中间的页码
                if (i === 2) {
                    i = current - 3;
                } else {
                    i = totalPages - 1;
                }
            }
        }

        // 下一页
        html += `
            <li class="page-item ${current >= totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current + 1}">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;

        this.elements.pagination.html(html);

        // 绑定点击事件
        this.elements.pagination.find('.page-link').on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (!page || page === current) return;

            this.state.pagination.current = page;
            this._loadTodos();
        });
    }

    /**
     * 获取优先级样式类
     * @param {string} priority - 优先级
     * @returns {string} 样式类名
     * @private
     */
    _getPriorityClass(priority) {
        switch(priority) {
            case 'HIGH':
                return 'high';
            case 'MEDIUM':
                return 'medium';
            case 'LOW':
                return 'low';
            default:
                return 'low';
        }
    }

    /**
     * 显示工单详情
     * @param {number} ticketId - 工单ID
     * @private
     */
    async _showTicketDetail(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET'
            });

            if (response.code === 200) {
                const ticket = response.data;
                // 使用Bootstrap Modal显示详情
                const modalHtml = `
                    <div class="modal fade" id="detailModal" tabindex="-1">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">工单详情</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="row mb-3">
                                        <div class="col-6">
                                            <label class="form-label">工单编号</label>
                                            <div class="fw-bold">${ticket.ticketId}</div>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label">当前状态</label>
                                            <div>${this._getStatusText(ticket.status)}</div>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">标题</label>
                                        <div class="fw-bold">${ticket.title}</div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">内容</label>
                                        <div>${ticket.content}</div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-6">
                                            <label class="form-label">创建时间</label>
                                            <div>${this._formatDate(ticket.createTime)}</div>
                                        </div>
                                        <div class="col-6">
                                            <label class="form-label">期望完成时间</label>
                                            <div class="${this._isDeadlineNear(ticket.expectFinishTime) ? 'deadline-warning' : ''}">
                                                ${this._formatDate(ticket.expectFinishTime)}
                                            </div>
                                        </div>
                                    </div>
                                    <!-- 添加处理记录显示等其他内容 -->
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                                    <button type="button" class="btn btn-primary process-btn" data-id="${ticket.ticketId}">
                                        处理工单
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // 移除可能存在的旧模态框
                $('#detailModal').remove();

                // 添加新模态框并显示
                $(modalHtml).appendTo('body').modal('show');
            }
        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError('加载详情失败');
        }
    }

    /**
     * 获取状态文本
     * @param {string} status - 状态
     * @returns {string} 状态文本
     * @private
     */
    _getStatusText(status) {
        const statusMap = {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭'
        };
        return statusMap[status] || '未知状态';
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.todoList = new TodoList();
});