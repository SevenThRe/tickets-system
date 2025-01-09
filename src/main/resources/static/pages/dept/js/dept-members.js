/**
 * DepartmentMembers.js
 * 部门成员管理控制器
 * 实现成员列表管理、绩效分析等功能
 *
 * @author SevenThRe
 * @created 2024-01-06
 */
/**
 * DepartmentWorkspace
 * 部门工作台控制器
 * 用于部门工单管理和统计展示
 */
class DepartmentWorkspace {
    constructor() {
        this.container = $('#main');

        // 初始化状态
        this.state = {
            loading: false,
            currentView: 'stats',    // 当前视图:stats/tickets
            ticketView: 'list',      // 工单视图:list/board
            departmentInfo: null,    // 部门信息
            stats: {                 // 统计数据
                overview: {},        // 概览统计
                trends: [],          // 趋势数据
                types: [],           // 类型分布
                workloads: [],       // 工作量数据
                efficiency: []       // 效率数据
            },
            tickets: [],            // 工单列表
            currentTicket: null,    // 当前选中工单
            processors: [],         // 可选处理人
            selectedProcessorId: null,  // 选中处理人ID
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {             // 筛选条件
                keyword: '',
                status: '',
                priority: '',
                processorId: '',
                startDate: '',
                endDate: ''
            }
        };

        // 初始化Modal
        this.assignModal = new bootstrap.Modal('#assignModal');

        // 缓存DOM引用
        this._initDomRefs();

        // 绑定事件
        this._bindEvents();

        // 初始化
        this.init();
    }

    // 缓存DOM引用
    _initDomRefs() {
        this.$statsView = $('#statsView');
        this.$ticketsView = $('#ticketsView');
        this.$listView = $('#listView');
        this.$boardView = $('#boardView');
        this.$ticketList = $('#ticketList');
        this.$ticketDrawer = $('#ticketDrawer');
        this.$pendingList = $('#pendingList');
        this.$processingList = $('#processingList');
        this.$completedList = $('#completedList');
        this.$searchForm = $('#searchForm');
        this.$processorFilter = $('#processorFilter');
        this.$trendChart = $('#ticketTrendChart');
        this.$typeChart = $('#ticketTypeChart');
    }

    // 事件绑定
    _bindEvents() {
        // 视图切换
        this.container.on('click', '[data-view]', (e) => this._handleViewChange(e));
        this.container.on('click', '[data-bs-toggle="view"]', (e) => this._handleTicketViewChange(e));

        // 统计视图事件
        this.container.on('click', '#refreshWorkloadBtn', () => this._handleRefreshWorkload());

        // 工单管理事件
        this.$searchForm.on('submit', (e) => this._handleSearch(e));
        this.container.on('click', '#resetBtn', () => this._handleReset());
        this.container.on('click', '#exportBtn', () => this._handleExport());
        this.container.on('click', '#refreshBtn', () => this._handleRefresh());
        this.container.on('click', '#assignTicketBtn', () => this._showAssignModal());
        this.container.on('click', '#confirmAssignBtn', () => this._handleAssignSubmit());
        this.container.on('click', '.view-ticket', (e) => this._handleViewTicket(e));
        this.container.on('click', '#closeDrawerBtn', () => this._handleCloseDrawer());

        // 工单操作事件
        this.container.on('click', '#processBtn', () => this._handleProcess());
        this.container.on('click', '#completeBtn', () => this._handleComplete());
        this.container.on('click', '#transferBtn', () => this._handleTransfer());
        this.container.on('click', '#closeBtn', () => this._handleClose());
    }

    // 初始化
    async init() {
        try {
            await this._loadDepartmentInfo();

            // 并行加载数据
            await Promise.all([
                this._loadStats(),
                this._loadProcessors(),
                this._loadTickets()
            ]);

            this._initCharts();
            this._checkUrlParams();
            this._startAutoRefresh();

        } catch (error) {
            console.error('初始化失败:', error);
            this._showError('页面加载失败，请刷新重试');
        }
    }
    // 加载部门信息
    async _loadDepartmentInfo() {
        try {
            const response = await $.ajax({
                url: '/api/departments/current',
                method: 'GET'
            });
            if(response.code === 200) {
                this.state.departmentInfo = response.data;
                this._updateDepartmentInfo();
            }
        } catch(error) {
            console.error('加载部门信息失败:', error);
            throw error;
        }
    }

    // 加载统计数据
    async _loadStats() {
        try {
            // 并行请求各项统计数据
            const [overview, trends, types, workloads, efficiency] = await Promise.all([
                $.ajax({url: '/api/departments/stats/overview'}),
                $.ajax({url: '/api/departments/stats/trends'}),
                $.ajax({url: '/api/departments/stats/types'}),
                $.ajax({url: '/api/departments/stats/workloads'}),
                $.ajax({url: '/api/departments/stats/efficiency'})
            ]);

            // 更新状态
            this.state.stats = {
                overview: overview.data,
                trends: trends.data,
                types: types.data,
                workloads: workloads.data,
                efficiency: efficiency.data
            };

            this._updateStats();
        } catch(error) {
            console.error('加载统计数据失败:', error);
            throw error;
        }
    }

    // 加载处理人列表
    async _loadProcessors() {
        try {
            const response = await $.ajax({
                url: '/api/departments/processors',
                method: 'GET'
            });
            if(response.code === 200) {
                this.state.processors = response.data;
                this._renderProcessorOptions();
            }
        } catch(error) {
            console.error('加载处理人失败:', error);
            throw error;
        }
    }

    // 加载工单列表
    async _loadTickets() {
        if(this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const params = {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
                ...this.state.filters
            };

            const response = await $.ajax({
                url: '/api/departments/tickets',
                method: 'GET',
                data: params
            });

            if(response.code === 200) {
                this.state.tickets = response.data.list;
                this.state.pagination.total = response.data.total;
                this._updateTicketsView();
                this._updatePagination();
            }

        } catch(error) {
            console.error('加载工单列表失败:', error);
            this._showError('加载工单列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    // 更新工单视图
    _updateTicketsView() {
        if(this.state.ticketView === 'list') {
            this._renderListView();
        } else {
            this._renderBoardView();
        }
    }

    // 渲染列表视图
    _renderListView() {
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
                <td>${ticket.assignee || '-'}</td>
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

        this.$ticketList.html(html);
    }

    // 渲染看板视图
    _renderBoardView() {
        // 按状态分组工单
        const groups = {
            PENDING: [],
            PROCESSING: [],
            COMPLETED: []
        };

        this.state.tickets.forEach(ticket => {
            if(groups[ticket.status]) {
                groups[ticket.status].push(ticket);
            }
        });

        // 渲染各状态列
        this._renderStatusColumn(this.$pendingList, groups.PENDING, 'PENDING');
        this._renderStatusColumn(this.$processingList, groups.PROCESSING, 'PROCESSING');
        this._renderStatusColumn(this.$completedList, groups.COMPLETED, 'COMPLETED');

        // 更新数量标记
        $('#pendingBadge').text(groups.PENDING.length);
        $('#processingBadge').text(groups.PROCESSING.length);
        $('#completedBadge').text(groups.COMPLETED.length);
    }

    // 处理视图切换
    _handleViewChange(e) {
        const view = $(e.currentTarget).data('view');
        if(view === this.state.currentView) return;

        this.state.currentView = view;
        $('[data-view]').removeClass('active');
        $(`[data-view="${view}"]`).addClass('active');

        this.$statsView.toggle(view === 'stats');
        this.$ticketsView.toggle(view === 'tickets');

        if(view === 'tickets') {
            this._loadTickets();
        } else {
            this._loadStats();
        }
    }

    // 处理工单视图切换
    _handleTicketViewChange(e) {
        const view = $(e.currentTarget).data('view');
        if(view === this.state.ticketView) return;

        this.state.ticketView = view;
        $('[data-bs-toggle="view"]').removeClass('active');
        $(e.currentTarget).addClass('active');

        this.$listView.toggle(view === 'list');
        this.$boardView.toggle(view === 'board');

        this._updateTicketsView();
    }

    // 处理搜索
    _handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        this.state.filters = {
            keyword: formData.get('keyword'),
            status: formData.get('statusFilter'),
            priority: formData.get('priorityFilter'),
            processorId: formData.get('processorFilter'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate')
        };

        this.state.pagination.current = 1;
        this._loadTickets();
    }

    // 处理重置
    _handleReset() {
        this.$searchForm[0].reset();
        this.state.filters = {
            keyword: '',
            status: '',
            priority: '',
            processorId: '',
            startDate: '',
            endDate: ''
        };
        this.state.pagination.current = 1;
        this._loadTickets();
    }

    // 处理导出
    async _handleExport() {
        try {
            this._showLoading('正在导出数据...');

            const response = await $.ajax({
                url: '/api/departments/tickets/export',
                method: 'GET',
                data: this.state.filters,
                xhrFields: {
                    responseType: 'blob'
                }
            });

            // 创建下载链接
            const blob = new Blob([response], {type: 'application/vnd.ms-excel'});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `工单列表_${this._formatDate(new Date(), 'YYYYMMDD')}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this._showSuccess('导出成功');
        } catch(error) {
            console.error('导出失败:', error);
            this._showError('导出失败，请重试');
        } finally {
            this._hideLoading();
        }
    }

    // 显示工单详情
    async _handleViewTicket(e) {
        const ticketId = $(e.currentTarget).data('id');

        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.currentTicket = response.data;
                this._updateTicketDetail();
                this.$ticketDrawer.addClass('show');
            }
        } catch(error) {
            console.error('加载工单详情失败:', error);
            this._showError('加载工单详情失败');
        }
    }

    // 处理工单处理
    async _handleProcess() {
        const note = $('#processingNote').val().trim();
        if(!note) {
            this._showError('请输入处理说明');
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.id}/process`,
                method: 'PUT',
                data: JSON.stringify({note}),
                contentType: 'application/json'
            });

            if(response.code === 200) {
                this._showSuccess('工单已开始处理');
                await this._loadTickets();
                this._updateTicketDetail();
            }
        } catch(error) {
            console.error('处理工单失败:', error);
            this._showError('处理工单失败');
        }
    }

    // 处理工单完成
    async _handleComplete() {
        const note = $('#processingNote').val().trim();
        if(!note) {
            this._showError('请输入完成说明');
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.id}/complete`,
                method: 'PUT',
                data: JSON.stringify({note}),
                contentType: 'application/json'
            });

            if(response.code === 200) {
                this._showSuccess('工单已完成处理');
                await this._loadTickets();
                this._updateTicketDetail();
            }
        } catch(error) {
            console.error('完成工单失败:', error);
            this._showError('完成工单失败');
        }
    }

    // 处理工单转交
    _handleTransfer() {
        if(!this.state.currentTicket) {
            this._showError('请先选择工单');
            return;
        }
        this._showTransferModal();
    }

    // 显示转交模态框
    _showTransferModal() {
        const html = `
            <div class="modal fade" id="transferModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">转交工单</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="transferForm">
                                <div class="mb-3">
                                    <label class="form-label required">转交说明</label>
                                    <textarea class="form-control" id="transferNote" rows="3" required></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label required">转交给</label>
                                    <select class="form-select" id="transferTo" required>
                                        ${this._renderProcessorOptions()}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" id="confirmTransferBtn">确认转交</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加到body并显示
        $('body').append(html);
        const modal = new bootstrap.Modal('#transferModal');
        modal.show();

        // 绑定确认事件
        $('#confirmTransferBtn').on('click', () => this._handleConfirmTransfer(modal));

        // 模态框关闭时移除
        $('#transferModal').on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }

    // 处理转交确认
    async _handleConfirmTransfer(modal) {
        const note = $('#transferNote').val().trim();
        const transferToId = $('#transferTo').val();

        if(!note || !transferToId) {
            this._showError('请填写完整信息');
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.id}/transfer`,
                method: 'POST',
                data: JSON.stringify({
                    processorId: transferToId,
                    note: note
                }),
                contentType: 'application/json'
            });

            if(response.code === 200) {
                modal.hide();
                this._showSuccess('工单转交成功');
                await this._loadTickets();
                this._updateTicketDetail();
            }
        } catch(error) {
            console.error('转交工单失败:', error);
            this._showError('转交工单失败');
        }
    }

    // 处理工单关闭
    async _handleClose() {
        const note = $('#processingNote').val().trim();
        if(!note) {
            this._showError('请输入关闭原因');
            return;
        }

        if(!confirm('确定要关闭此工单吗？')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.id}/close`,
                method: 'PUT',
                data: JSON.stringify({note}),
                contentType: 'application/json'
            });

            if(response.code === 200) {
                this._showSuccess('工单已关闭');
                await this._loadTickets();
                this._updateTicketDetail();
            }
        } catch(error) {
            console.error('关闭工单失败:', error);
            this._showError('关闭工单失败');
        }
    }

    // 更新工单详情
    _updateTicketDetail() {
        const ticket = this.state.currentTicket;
        if(!ticket) return;

        $('#ticketCode').text(ticket.code);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(this._formatDate(ticket.createTime));
        $('#ticketStatus').html(`
            <span class="ticket-status status-${ticket.status.toLowerCase()}">
                ${this._getStatusText(ticket.status)}
            </span>
        `);

        // 渲染处理记录
        this._renderTimeline(ticket.records);

        // 更新操作按钮状态
        this._updateActionButtons(ticket.status);
    }

    // 渲染时间线
    _renderTimeline(records) {
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
                    <div class="timeline-body">
                        ${record.content || ''}
                    </div>
                </div>
            </div>
        `).join('');

        $('#ticketTimeline').html(html);
    }

    // 更新按钮状态
    _updateActionButtons(status) {
        const buttons = {
            processBtn: $('#processBtn'),
            resolveBtn: $('#resolveBtn'),
            transferBtn: $('#transferBtn'),
            closeBtn: $('#closeBtn')
        };

        // 根据状态启用/禁用按钮
        switch(status) {
            case 'PENDING':
                buttons.processBtn.prop('disabled', false);
                buttons.resolveBtn.prop('disabled', true);
                buttons.transferBtn.prop('disabled', false);
                buttons.closeBtn.prop('disabled', false);
                break;
            case 'PROCESSING':
                buttons.processBtn.prop('disabled', true);
                buttons.resolveBtn.prop('disabled', false);
                buttons.transferBtn.prop('disabled', false);
                buttons.closeBtn.prop('disabled', false);
                break;
            case 'COMPLETED':
                buttons.processBtn.prop('disabled', true);
                buttons.resolveBtn.prop('disabled', true);
                buttons.transferBtn.prop('disabled', true);
                buttons.closeBtn.prop('disabled', false);
                break;
            case 'CLOSED':
                Object.values(buttons).forEach(btn => btn.prop('disabled', true));
                break;
        }
    }

    // 格式化日期
    _formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
        const d = new Date(date);
        const map = {
            YYYY: d.getFullYear(),
            MM: String(d.getMonth() + 1).padStart(2, '0'),
            DD: String(d.getDate()).padStart(2, '0'),
            HH: String(d.getHours()).padStart(2, '0'),
            mm: String(d.getMinutes()).padStart(2, '0'),
            ss: String(d.getSeconds()).padStart(2, '0')
        };

        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, matched => map[matched]);
    }

    // 获取状态文本
    _getStatusText(status) {
        const statusMap = {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭'
        };
        return statusMap[status] || status;
    }

    // 获取优先级文本
    _getPriorityText(priority) {
        const priorityMap = {
            'HIGH': '高优先级',
            'MEDIUM': '中等优先级',
            'LOW': '低优先级'
        };
        return priorityMap[priority] || priority;
    }

    // 获取操作文本
    _getOperationText(operation) {
        const operationMap = {
            'CREATE': '创建了工单',
            'PROCESS': '开始处理',
            'NOTE': '添加了备注',
            'TRANSFER': '转交工单',
            'COMPLETE': '完成处理',
            'CLOSE': '关闭工单'
        };
        return operationMap[operation] || operation;
    }

    // 启动自动刷新
    _startAutoRefresh() {
        // 每5分钟刷新一次数据
        setInterval(() => {
            if(this.state.currentView === 'stats') {
                this._loadStats();
            } else {
                this._loadTickets();
            }
        }, 5 * 60 * 1000);
    }

    // 显示加载状态
    _showLoading(text = '加载中...') {
        if(!this.$loading) {
            this.$loading = $(`
                <div class="loading-overlay">
                    <div class="spinner-border text-primary"></div>
                    <div class="loading-text mt-2">${text}</div>
                </div>
            `).appendTo('body');
        }
        this.$loading.find('.loading-text').text(text);
        this.$loading.show();
    }

    // 隐藏加载状态
    _hideLoading() {
        if(this.$loading) {
            this.$loading.hide();
        }
    }

    // 显示成功提示
    _showSuccess(message) {
        $.notify({
            message: message,
            type: 'success',
            placement: {
                from: 'top',
                align: 'center'
            },
            delay: 2000
        });
    }

    // 显示错误提示
    _showError(message) {
        $.notify({
            message: message,
            type: 'danger',
            placement: {
                from: 'top',
                align: 'center'
            },
            delay: 3000
        });
    }

    // 更新分页
    _updatePagination() {
        const { current, pageSize, total } = this.state.pagination;
        const totalPages = Math.ceil(total / pageSize);

        let html = `
            <li class="page-item ${current === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current - 1}">上一页</a>
            </li>
        `;

        for(let i = 1; i <= totalPages; i++) {
            if(i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
                html += `
                    <li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if(i === current - 3 || i === current + 3) {
                html += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }

        html += `
            <li class="page-item ${current === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current + 1}">下一页</a>
            </li>
        `;

        $('#pagination').html(html).on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if(page && page !== current) {
                this.state.pagination.current = page;
                this._loadTickets();
            }
        });
    }

    // 销毁组件
    destroy() {
        // 清理事件监听
        this.container.off();
        $('#pagination').off();

        // 清理定时器
        if(this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        // 销毁模态框
        if(this.assignModal) {
            this.assignModal.dispose();
        }

        // 清理DOM引用
        if(this.$loading) {
            this.$loading.remove();
        }
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.deptWorkspace = new DepartmentWorkspace();
});