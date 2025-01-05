/**
 * MyTickets.js
 * 我的工单页面控制器
 */
class MyTickets extends BaseComponent {
    constructor() {
        super({
            container: '#main',
            events: {
                'submit #searchForm': '_handleSearch',
                'click #resetBtn': '_handleReset',
                'click #createTicketBtn': '_showCreateTicketModal',
                'click #saveTicketBtn': '_handleSaveTicket',
                'click .view-ticket': '_handleViewTicket',
                'click #closeDetailBtn': '_closeTicketDetail',
                'click #addNoteBtn': '_handleAddNote',
                'click #closeTicketBtn': '_handleCloseTicket',
                'click .rating-star': '_handleRatingClick',
                'click #submitEvaluationBtn': '_handleSubmitEvaluation'
            }
        });

        // 状态管理
        this.state = {
            loading: false,
            tickets: [],
            currentTicket: null,
            selectedRating: 0,
            pagination: {
                current: Const.UI.PAGINATION.DEFAULT_CURRENT,
                pageSize: Const.UI.PAGINATION.DEFAULT_PAGE_SIZE,
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

        // 初始化模态框
        this.ticketModal = new bootstrap.Modal('#ticketModal', {
            backdrop: 'static',
            keyboard: false
        });

        // 初始化
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            await Promise.all([
                this._loadDepartments(),
                this._loadTickets()
            ]);
            this._render();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError(Const.MESSAGES.ERROR.UNKNOWN);
        }
    }

    /**
     * 加载部门数据
     */
    async _loadDepartments() {
        try {
            const response = await window.requestUtil.get(Const.API.SYSTEM.GET_DEPARTMENT_LIST);
            this._renderDepartmentOptions(response.data);
        } catch (error) {
            console.error('加载部门失败:', error);
            throw error;
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

            const { current, pageSize } = this.state.pagination;
            const params = {
                pageNum: current,
                pageSize,
                ...this.state.filters
            };

            const response = await window.requestUtil.get(`${Const.API.TICKET.GET_LIST}/my`, params);

            this.state.tickets = response.data.list;
            this.state.pagination.total = response.data.total;

            this._renderTicketList();
            this._updatePagination();

        } catch (error) {
            console.error('加载工单列表失败:', error);
            this.showError(Const.MESSAGES.ERROR.TICKET.LOAD_FAILED);
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染工单列表
     */
    _renderTicketList() {
        const { STATUS_MAP, PRIORITY_MAP } = Const.BUSINESS.TICKET;

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
                        ${STATUS_MAP.text[ticket.status]}
                    </span>
                </td>
                <td>${PRIORITY_MAP.text[ticket.priority]}</td>
                <td>${window.utils.formatDate(ticket.createTime, Const.TIME_FORMAT.DATETIME)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" data-id="${ticket.id}">
                        <i class="bi bi-eye"></i> 查看
                    </button>
                </td>
            </tr>
        `).join('');

        $('#ticketList').html(html);
        $('#totalCount').text(this.state.pagination.total);
    }

    /**
     * 处理工单查看
     */
    async _handleViewTicket(e) {
        const ticketId = $(e.currentTarget).data('id');
        try {
            const response = await window.requestUtil.get(Const.API.TICKET.GET_DETAIL(ticketId));
            this.state.currentTicket = response.data;
            this._updateTicketDetail();
            $('.ticket-detail-panel').addClass('show');
        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError(Const.MESSAGES.ERROR.TICKET.DETAIL_FAILED);
        }
    }

    /**
     * 更新工单详情显示
     */
    _updateTicketDetail() {
        const ticket = this.state.currentTicket;
        if (!ticket) return;

        const { STATUS_MAP } = Const.BUSINESS.TICKET;

        // 更新基本信息
        $('#ticketCode').text(ticket.code);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(window.utils.formatDate(ticket.createTime, Const.TIME_FORMAT.DATETIME));
        $('#ticketStatus').html(`
            <span class="ticket-status status-${ticket.status.toLowerCase()}">
                ${STATUS_MAP.text[ticket.status]}
            </span>
        `);

        // 渲染附件和时间线
        this._renderAttachments(ticket.attachments);
        this._renderTimeline(ticket.records);

        // 根据状态控制评价表单显示
        const showEvaluation = ticket.status === Const.BUSINESS.TICKET.STATUS.COMPLETED && !ticket.evaluation;
        $('#evaluationForm').toggle(showEvaluation);

        // 控制操作按钮
        const closeBtn = $('#closeTicketBtn');
        closeBtn.prop('disabled', ticket.status === Const.BUSINESS.TICKET.STATUS.CLOSED);
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

        this.state.pagination.current = Const.UI.PAGINATION.DEFAULT_CURRENT;
        this._loadTickets();
    }

    /**
     * 处理重置
     */
    _handleReset() {
        $('#searchForm')[0].reset();
        this.state.filters = {
            keyword: '',
            status: '',
            priority: '',
            startDate: '',
            endDate: ''
        };
        this.state.pagination.current = Const.UI.PAGINATION.DEFAULT_CURRENT;
        this._loadTickets();
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
            this.showError('请选择评分');
            return;
        }

        const content = $('#evaluationContent').val().trim();
        if (!content) {
            this.showError('请输入评价内容');
            return;
        }

        try {
            await window.requestUtil.post(
                `${Const.API.TICKET.GET_DETAIL(this.state.currentTicket.id)}/evaluate`,
                {
                    score: this.state.selectedRating,
                    content: content
                }
            );

            this.showSuccess(Const.MESSAGES.SUCCESS.TICKET.EVALUATE);
            $('#evaluationForm').hide();
            await this._loadTickets();

        } catch (error) {
            console.error('提交评价失败:', error);
            this.showError(Const.MESSAGES.ERROR.TICKET.EVALUATE_FAILED);
        }
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
                <a href="${Const.API.TICKET.GET_ATTACHMENT(file.id)}" target="_blank">
                    ${file.fileName}
                </a>
                <span class="text-muted ms-2">(${this._formatFileSize(file.fileSize)})</span>
            </div>
        `).join('');

        $('#ticketAttachments').html(html);
    }

    /**
     * 格式化文件大小
     */
    _formatFileSize(bytes) {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
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
                        ${window.utils.formatDate(record.createTime, Const.TIME_FORMAT.DATETIME)}
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
     * 获取操作文本
     */
    _getOperationText(operation) {
        const operationMap = {
            'CREATE': '创建了工单',
            'PROCESS': '开始处理',
            'NOTE': '添加了备注',
            'TRANSFER': '转交工单',
            'RESOLVE': '完成处理',
            'CLOSE': '关闭工单',
            'EVALUATE': '评价了工单'
        };
        return operationMap[operation] || operation;
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

    /**
     * 显示加载状态
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
     */
    _hideLoading() {
        if (this.loadingEl) {
            this.loadingEl.hide();
        }
    }
}

// 初始化
$(document).ready(() => {
    window.myTickets = new MyTickets();
});