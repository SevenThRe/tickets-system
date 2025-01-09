/**
 * MyTickets.js
 * 我的工单页面控制器
 */
class MyTickets {
    constructor() {
        // 状态管理
        this.state = {
            loading: false,
            tickets: [],
            currentTicket: null,
            selectedRating: 0,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {
                keyword: '',
                status: '',
                priority: '',
                startDate: '',
                endDate: ''
            }
        };

        // DOM元素缓存
        this.$container = $('#main');
        this.$ticketList = $('#ticketList');
        this.$searchForm = $('#searchForm');
        this.$ticketDetail = $('.ticket-detail-panel');
        this.$pagination = $('#pagination');

        // 初始化模态框
        this.ticketModal = new bootstrap.Modal('#ticketModal');

        // 绑定事件
        this._bindEvents();

        // 初始化组件
        this.init();
    }

    /**
     * 绑定事件处理
     * @private
     */
    _bindEvents() {
        // 搜索表单提交
        this.$searchForm.on('submit', (e) => this._handleSearch(e));

        // 重置按钮点击
        $('#resetBtn').on('click', () => this._handleReset());

        // 新建工单按钮
        $('#createTicketBtn').on('click', () => this._showCreateTicketModal());

        // 保存工单按钮
        $('#saveTicketBtn').on('click', () => this._handleSaveTicket());

        // 查看工单
        this.$ticketList.on('click', '.view-ticket', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this._handleViewTicket(ticketId);
        });

        // 关闭详情面板
        $('#closeDetailBtn').on('click', () => this._closeTicketDetail());

        // 添加备注
        $('#addNoteBtn').on('click', () => this._handleAddNote());

        // 关闭工单
        $('#closeTicketBtn').on('click', () => this._handleCloseTicket());

        // 评分点击
        $('.rating-star').on('click', (e) => this._handleRatingClick(e));

        // 提交评价
        $('#submitEvaluationBtn').on('click', () => this._handleSubmitEvaluation());

        // 分页点击
        this.$pagination.on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if(page) {
                this.state.pagination.current = page;
                this._loadTickets();
            }
        });
    }

    /**
     * 初始化
     */
    async init() {
        try {
            await this._loadTickets();
            this._checkUrlParams();
        } catch (error) {
            console.error('初始化失败:', error);
            this._showError('页面加载失败，请刷新重试');
        }
    }

    /**
     * 检查URL参数
     */
    _checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const ticketId = params.get('id');
        if (ticketId) {
            this._handleViewTicket(ticketId);
        }
    }

    /**
     * 加载工单列表
     */
    async _loadTickets() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const params = {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
                ...this.state.filters
            };

            const response = await this._request('GET', '/api/tickets/my', params);

            this.state.tickets = response.data.list;
            this.state.pagination.total = response.data.total;

            this._renderTicketList();
            this._updatePagination();

        } catch (error) {
            console.error('加载工单列表失败:', error);
            this._showError('加载工单列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染工单列表
     */
    _renderTicketList() {
        const html = this.state.tickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                        ${ticket.title}
                    </div>
                </td>
                <td>${ticket.department}</td>
                <td>${ticket.processor || '-'}</td>
                <td>
                    <span class="ticket-status status-${ticket.status.toLowerCase()}">
                        ${this._getStatusText(ticket.status)}
                    </span>
                </td>
                <td>${this._getPriorityText(ticket.priority)}</td>
                <td>${this._formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" data-id="${ticket.id}">
                        <i class="bi bi-eye"></i> 查看
                    </button>
                </td>
            </tr>
        `).join('');

        this.$ticketList.html(html || '<tr><td colspan="8" class="text-center">暂无工单</td></tr>');
    }

    /**
     * 处理工单查看
     * @param {string} ticketId - 工单ID
     */
    async _handleViewTicket(ticketId) {
        try {
            const response = await this._request('GET', `/api/tickets/${ticketId}`);
            this.state.currentTicket = response.data;
            this._updateTicketDetail();
            this.$ticketDetail.addClass('show');
        } catch (error) {
            console.error('加载工单详情失败:', error);
            this._showError('加载工单详情失败');
        }
    }

    /**
     * 更新工单详情显示
     */
    _updateTicketDetail() {
        const ticket = this.state.currentTicket;
        if (!ticket) return;

        // 更新基本信息
        $('#ticketCode').text(ticket.code);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(this._formatDate(ticket.createTime));
        $('#ticketStatus').html(`
            <span class="ticket-status status-${ticket.status.toLowerCase()}">
                ${this._getStatusText(ticket.status)}
            </span>
        `);

        // 渲染附件列表
        this._renderAttachments(ticket.attachments);

        // 渲染处理记录
        this._renderTimeline(ticket.records);

        // 控制评价表单显示
        const showEvaluation = ticket.status === 'COMPLETED' && !ticket.evaluation;
        $('#evaluationForm').toggle(showEvaluation);

        // 控制按钮状态
        $('#closeTicketBtn').prop('disabled', ticket.status === 'CLOSED');
    }

    /**
     * 渲染附件列表
     */
    _renderAttachments(attachments) {
        if (!attachments?.length) {
            $('#ticketAttachments').html('<div class="text-muted">无附件</div>');
            return;
        }

        const html = attachments.map(file => `
            <div class="attachment-item">
                <i class="bi bi-paperclip"></i>
                <a href="/api/attachments/${file.id}" target="_blank">
                    ${file.fileName}
                </a>
                <span class="text-muted ms-2">(${this._formatFileSize(file.fileSize)})</span>
            </div>
        `).join('');

        $('#ticketAttachments').html(html);
    }

    /**
     * 渲染时间线
     */
    _renderTimeline(records) {
        if (!records?.length) {
            $('#ticketTimeline').html('<div class="text-muted">暂无处理记录</div>');
            return;
        }

        const html = records.map(record => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-time">
                        ${this._formatDate(record.createTime)}
                    </div>
                    <div class="timeline-title">
                        <strong>${record.operator}</strong>
                        ${this._getOperationText(record.operation)}
                    </div>
                    ${record.content ? `
                        <div class="timeline-body">${record.content}</div>
                    ` : ''}
                    ${record.evaluation ? `
                        <div class="timeline-evaluation">
                            <div class="rating">
                                ${this._renderStars(record.evaluation.score)}
                            </div>
                            <div class="evaluation-content">
                                ${record.evaluation.content}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        $('#ticketTimeline').html(html);
    }

    /**
     * 处理添加备注
     */
    async _handleAddNote() {
        const note = $('#noteContent').val().trim();
        if (!note) {
            this._showError('请输入备注内容');
            return;
        }

        try {
            await this._request('POST', `/api/tickets/${this.state.currentTicket.id}/notes`, {
                content: note
            });

            $('#noteContent').val('');
            this._showSuccess('添加备注成功');
            await this._handleViewTicket(this.state.currentTicket.id);
        } catch (error) {
            console.error('添加备注失败:', error);
            this._showError('添加备注失败');
        }
    }

    /**
     * 处理工单关闭
     */
    async _handleCloseTicket() {
        const note = $('#noteContent').val().trim();
        if (!note) {
            this._showError('请输入关闭原因');
            return;
        }

        if (!confirm('确定要关闭此工单吗？')) {
            return;
        }

        try {
            await this._request('PUT', `/api/tickets/${this.state.currentTicket.id}/close`, {
                note: note
            });

            this._showSuccess('工单已关闭');
            await this._handleViewTicket(this.state.currentTicket.id);
            await this._loadTickets();
        } catch (error) {
            console.error('关闭工单失败:', error);
            this._showError('关闭工单失败');
        }
    }

    /**
     * 处理评分点击
     */
    _handleRatingClick(e) {
        const rating = $(e.currentTarget).data('rating');
        this.state.selectedRating = rating;

        $('.rating-star').each((index, star) => {
            $(star).toggleClass('active', index < rating);
        });
    }

    /**
     * 处理评价提交
     */
    async _handleSubmitEvaluation() {
        if (!this.state.selectedRating) {
            this._showError('请选择评分');
            return;
        }

        const content = $('#evaluationContent').val().trim();
        if (!content) {
            this._showError('请输入评价内容');
            return;
        }

        try {
            await this._request('POST', `/api/tickets/${this.state.currentTicket.id}/evaluate`, {
                score: this.state.selectedRating,
                content: content
            });

            this._showSuccess('评价提交成功');
            $('#evaluationForm').hide();
            await this._loadTickets();
        } catch (error) {
            console.error('提交评价失败:', error);
            this._showError('评价提交失败');
        }
    }

    /**
     * 处理搜索
     */
    _handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.state.filters = {
            keyword: formData.get('keyword'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate')
        };
        this.state.pagination.current = 1;
        this._loadTickets();
    }

    /**
     * 处理重置
     */
    _handleReset() {
        this.$searchForm[0].reset();
        this.state.filters = {
            keyword: '',
            status: '',
            priority: '',
            startDate: '',
            endDate: ''
        };
        this.state.pagination.current = 1;
        this._loadTickets();
    }

    // 工具方法
    /**
     * Ajax请求封装
     */
    _request(method, url, data = null) {
        return $.ajax({
            url: url,
            method: method,
            data: method === 'GET' ? data : JSON.stringify(data),
            contentType: method === 'GET' ? 'application/x-www-form-urlencoded' : 'application/json',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    /**
     * 显示成功提示
     */
    _showSuccess(message) {
        // 这里可以使用Bootstrap的Toast或者其他提示组件
        alert(message);  // 简单实现
    }

    /**
     * 显示错误提示
     */
    _showError(message) {
        alert(message);  // 简单实现
    }

    /**
     * 显示加载状态
     */
    _showLoading() {
        this.$container.addClass('loading');
    }

    /**
     * 隐藏加载状态
     */
    _hideLoading() {
        this.$container.removeClass('loading');
    }

    /**
     * 格式化日期
     */
    _formatDate(date) {
        return new Date(date).toLocaleString();
    }

    /**
     * 格式化文件大小
     */
    _formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
    }

    /**
     * 获取状态文本
     */
    _getStatusText(status) {
        const statusMap = {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭'
        };
        return statusMap[status] || status;
    }

    /**
     * 获取优先级文本
     */
    _getPriorityText(priority) {
        const priorityMap = {
            'HIGH': '高',
            'MEDIUM': '中',
            'LOW': '低'
        };
        return priorityMap[priority] || priority;
    }

    /**
     * 渲染星级
     */
    _renderStars(score) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<i class="bi bi-star${i <= score ? '-fill' : ''} text-warning"></i>`;
        }
        return html;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.myTickets = new MyTickets();
});