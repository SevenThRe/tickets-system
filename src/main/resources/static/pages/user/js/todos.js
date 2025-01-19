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
            throw error;
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
            const urlParams = new URLSearchParams(window.location.search);
            const ticketId = urlParams.get('ticketId');
            if (ticketId) {
                setTimeout(() => {
                    //TODO: 判断工单状态，如果是处理中状态，直接打开处理模态框
                    this._showProcessModal(ticketId);
                },30)
            }
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

        $('#statusFilter, #priorityFilter').on('change', () => {
            this._handleSearch({ preventDefault: () => {} });
        });
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

        // 提交处理按钮点击
        $('#submitProcessBtn').on('click', () => this._handleProcessSubmit());


        // 日期范围选择变化
        $('#startDate, #endDate').on('change', (e) => {
            const field = e.target.id === 'startDate' ? 'startTime' : 'endTime';
            this.state.filters[field] = e.target.value;
        });
        $('#processStatus').on('change', (e) => {
            const status = $(e.target).val();
            $('#transferDeptDiv').toggle(status === 'TRANSFER');
            this._loadDepartments();
        });
    }

        async _loadDepartments() {
            try {
                const response = await $.ajax({
                    url: '/api/departments/list',
                    method: 'GET'
                });
                if(response.code === 200) {
                    const options = response.data.map(dept =>
                        `<option value="${dept.departmentId}">${dept.departmentName}</option>`
                    ).join('');
                    $('#transferDept').html(options);
                }
            } catch(error) {
                console.error('加载部门列表失败:', error);
            }
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
                $('#todayCompletedCount').text(stats.todayCompleted || 0);

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
        return  TicketUtil.formatDate(dateString);
    }

    _getStatusText(status) {
        return TicketUtil.getStatusText(status);
    }

    _getPriorityText(priority) {
        return TicketUtil.getPriorityText(priority);
    }

    _getPriorityClass(priority) {
        return TicketUtil.getPriorityClass(priority);
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
        const formData = {
            pageNum: this.state.pagination.current,
            pageSize: this.state.pagination.pageSize,
            processorId: this.userInfo.userId,
            keyword: $('#keyword').val().trim(),
            priority: $('#priorityFilter').val() || null,  // 优先级
            status: $('#statusFilter').val() || null,       // 状态

        };

        const startDate = $('#startDate').val();
        const endDate = $('#endDate').val();
        if (startDate) filters.startTime = startDate;
        if (endDate) filters.endTime = endDate;

        this.state.filters = formData;
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
                    <span class="badge bg-${TicketUtil.getPriorityClass(ticket.priority)}">
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
                        ${ticket.status == '0' ? `
                            <button class="btn btn-sm btn-outline-success quick-start" data-id="${ticket.ticketId}">
                                <i class="bi bi-play-fill"></i> 快速开始
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-primary process-btn" data-id="${ticket.ticketId}">
                            <i class="bi bi-tools"></i> 完成或转交
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
     * 加载工单附件
     * @param ticketId
     * @returns {Promise<void>}
     * @private
     */
    async _loadTicketAttachments(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/files/ticket/${ticketId}`,
                method: 'GET'
            });

            if (response.code === 200) {
                const attachments = response.data;
                let html = '';
                if (attachments.length === 0) {
                    html = '<div class="text-muted">暂无附件</div>';
                } else {
                    html = attachments.map(attachment => {
                        const fileExt = attachment.fileName.split('.').pop().toLowerCase();
                        // 文件图标映射
                        const iconMap = {
                            'pdf': 'bi-file-pdf',
                            'doc': 'bi-file-word',
                            'docx': 'bi-file-word',
                            'xls': 'bi-file-excel',
                            'xlsx': 'bi-file-excel',
                            'png': 'bi-file-image',
                            'jpg': 'bi-file-image',
                            'jpeg': 'bi-file-image',
                            'default': 'bi-file-earmark'
                        };
                        const iconClass = iconMap[fileExt] || iconMap.default;

                        return `
                        <div class="attachment-item d-flex align-items-center mb-2">
                            <i class="bi ${iconClass} me-2"></i>
                            <div class="flex-grow-1">
                                <div class="file-name">${attachment.fileName}</div>
                                <div class="file-meta text-muted small">
                                    ${this._formatFileSize(attachment.fileSize)} 
                                    · ${this._formatDate(attachment.createTime)}
                                </div>
                            </div>
                            <div class="attachment-actions">
                                <button class="btn btn-sm btn-outline-primary me-2" 
                                        onclick="window.todoList._checkAndDownloadFile('${attachment.filePath}', '${attachment.fileName}')">
                                    <i class="bi bi-download"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    }).join('');
                }
                $('#ticketAttachments').html(html);
            }
        } catch (error) {
            console.error('加载附件失败:', error);
            this.showError('加载附件列表失败');
        }
    }

    /**
     * 检查并下载文件
     */
    async _checkAndDownloadFile(filePath, fileName, ticketId) {
        try {
            // 先检查文件是否存在
            const checkResponse = await $.ajax({
                url: `/api/files/check/${ticketId}/${fileName}`,
                method: 'GET'
            });

            if (checkResponse.code === 200 && checkResponse.data) {
                // 文件存在，触发下载
                window.open(`/api/files/download/${ticketId}/${fileName}`, '_blank');
            } else {
                NotifyUtil.error(`文件"${fileName}"已丢失`);
            }
        } catch (error) {
            NotifyUtil.error('文件下载失败，请重试');
        }
    }

    // 文件大小格式化
    _formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                ...this.state.filters
            };

            // 移除空值参数
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined || params[key] === '') {
                    delete params[key];
                }
            });

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

            if (processStatus === 'TRANSFER') {
                const transferDeptId = $('#transferDept').val();
                if (!transferDeptId) {
                    this.showError('请选择转交部门');
                    return;
                }

                // 调用转交接口
                const response = await $.ajax({
                    url: `/api/tickets/${this.state.currentTicket.ticketId}/transfer`,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        ticketId: this.state.currentTicket.ticketId,
                        departmentId: transferDeptId,
                        note: processNote,
                        updateBy: this.userInfo.userId
                    })
                });

                if (response.code === 200) {
                    this.showSuccess('工单转交成功');
                    this.elements.processModal.hide();
                    await this._loadTodos();
                } else {
                    this.showError(response.msg || '转交失败');
                }
            }else {
                // 完成处理逻辑
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
                } else {
                    this.showError(response.msg || '处理失败');
                }
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
                // 加载附件信息
                await this._loadTicketAttachments(ticketId);
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
            <span class="badge bg-${TicketUtil.getPriorityClass(ticket.priority)}">
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
        await this._loadStatistics();
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
        let html = `
            <li class="page-item ${current <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current - 1}"><i class="bi bi-chevron-left"></i></a>
            </li>
        `;

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
                html += `
                    <li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if ((i === 2 && current - 2 > 2) || (i === totalPages - 1 && current + 2 < totalPages - 1)) {
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
                <a class="page-link" href="#" data-page="${current + 1}"><i class="bi bi-chevron-right"></i></a>
            </li>
        `;

        this.elements.pagination.html(html);

        // 绑定点击事件
        this.elements.pagination.find('.page-link').off('click').on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && page !== current) {
                this.state.pagination.current = page;
                this._loadTodos();
            }
        });
    }



}

// 页面加载完成后初始化
$(document).ready(() => {
    window.todoList = new TodoList();
});