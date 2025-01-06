/**
 * DepartmentWorkspace.js
 * 部门工作台控制器
 * 实现工作台统计视图和工单管理的统一集成
 * @author SevenThRe
 * @created 2024-01-06
 */
class DepartmentWorkspace extends BaseComponent {
    /**
     * 构造函数 - 初始化组件状态和事件绑定
     * @constructor
     */
    constructor() {
        super({
            container: '#main',
            events: {
                // 视图切换事件
                'click [data-view]': '_handleViewChange',
                'click [data-bs-toggle="view"]': '_handleTicketViewChange',

                // 统计视图事件
                'click #refreshWorkloadBtn': '_handleRefreshWorkload',

                // 工单管理事件
                'submit #searchForm': '_handleSearch',
                'click #resetBtn': '_handleReset',
                'click #exportBtn': '_handleExport',
                'click #refreshBtn': '_handleRefresh',
                'click #assignTicketBtn': '_showAssignModal',
                'click #confirmAssignBtn': '_handleAssignSubmit',
                'click .view-ticket': '_handleViewTicket',
                'click #closeDrawerBtn': '_handleCloseDrawer',

                // 工单操作事件
                'click #processBtn': '_handleProcess',
                'click #completeBtn': '_handleComplete',
                'click #transferBtn': '_handleTransfer',
                'click #closeBtn': '_handleClose'
            }
        });

        // 状态管理
        this.state = {
            loading: false,               // 加载状态
            currentView: 'stats',         // 当前主视图模式: stats/tickets
            ticketView: 'list',           // 工单视图模式: list/board
            departmentInfo: null,         // 部门信息
            stats: {                      // 统计数据
                overview: {},             // 概览统计
                trends: [],               // 趋势数据
                types: [],                // 类型分布
                workloads: [],            // 工作量数据
                efficiency: []            // 效率数据
            },
            tickets: [],                  // 工单列表数据
            currentTicket: null,          // 当前选中工单
            processors: [],               // 可选处理人列表
            selectedProcessorId: null,    // 选中的处理人ID
            pagination: {                 // 分页信息
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {                    // 筛选条件
                keyword: '',
                status: '',
                priority: '',
                processorId: '',
                startDate: '',
                endDate: ''
            }
        };

        // 缓存DOM引用
        this._cacheDOMReferences();

        // 初始化图表实例
        this.charts = {};

        // 初始化模态框
        this.assignModal = new bootstrap.Modal('#assignModal');

        this._loadTicketsOptimized = _.throttle(this._loadTicketsRaw.bind(this), 300)

        // 初始化组件
        this.init();
    }

    /**
     * 缓存重要的DOM元素引用
     * @private
     */
    _cacheDOMReferences() {
        // 主要视图容器
        this.$statsView = $('#statsView');
        this.$ticketsView = $('#ticketsView');

        // 工单视图容器
        this.$listView = $('#listView');
        this.$boardView = $('#boardView');
        this.$ticketList = $('#ticketList');
        this.$ticketDrawer = $('#ticketDrawer');

        // 看板列容器
        this.$pendingList = $('#pendingList');
        this.$processingList = $('#processingList');
        this.$completedList = $('#completedList');

        // 表单元素
        this.$searchForm = $('#searchForm');
        this.$processorFilter = $('#processorFilter');

        // 图表容器
        this.$trendChart = $('#ticketTrendChart');
        this.$typeChart = $('#ticketTypeChart');
    }
    /**
     * 显示工单详情
     * @param {string} ticketId - 工单ID
     * @private
     */
    async _showTicketDetail(ticketId) {
        try {
            const response = await window.requestUtil.get(
                Const.API.DEPT.GET_TICKET_DETAIL(ticketId)
            );

            this.state.currentTicket = response.data;
            this._updateTicketDetail();
            this.$ticketDrawer.addClass('show');

            // 更新URL参数
            this._updateUrlParam('id', ticketId);
        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError('加载工单详情失败');
        }
    }

    /**
     * 更新工单详情显示
     * @private
     */
    _updateTicketDetail() {
        const ticket = this.state.currentTicket;
        if (!ticket) return;

        // 更新基本信息
        $('#ticketCode').text(ticket.code);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(window.utils.formatDate(ticket.createTime));
        $('#ticketStatus').html(`
        <span class="ticket-status status-${ticket.status.toLowerCase()}">
            ${Const.BUSINESS.TICKET.STATUS_MAP.text[ticket.status]}
        </span>
    `);

        // 渲染处理记录时间线
        this._renderTimeline(ticket.records);

        // 更新操作按钮状态
        this._updateOperationButtons(ticket.status);
    }

    /**
     * 渲染看板视图
     * @private
     */
    _renderBoardView() {
        // 按状态分组工单
        const groups = {
            PENDING: [],
            PROCESSING: [],
            COMPLETED: []
        };

        this.state.tickets.forEach(ticket => {
            if (ticket.status in groups) {
                groups[ticket.status].push(ticket);
            }
        });

        // 更新各状态计数
        $('#pendingBadge').text(groups.PENDING.length);
        $('#processingBadge').text(groups.PROCESSING.length);
        $('#completedBadge').text(groups.COMPLETED.length);

        // 渲染各列工单卡片
        const renderCard = (ticket) => `
        <div class="kanban-card" data-id="${ticket.ticketId}">
            <div class="card-title">
                <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                ${ticket.title}
            </div>
            <div class="card-meta">
                <span class="ticket-code">${ticket.code}</span>
                <span class="processor">${ticket.processorName || '待分配'}</span>
            </div>
            ${ticket.expectFinishTime ? `
                <div class="deadline mt-2 text-muted">
                    <small>
                        <i class="bi bi-clock"></i>
                        ${window.utils.formatDate(ticket.expectFinishTime)}
                    </small>
                </div>
            ` : ''}
        </div>
    `;

        // 更新各列内容
        this.$pendingList.html(groups.PENDING.map(renderCard).join(''));
        this.$processingList.html(groups.PROCESSING.map(renderCard).join(''));
        this.$completedList.html(groups.COMPLETED.map(renderCard).join(''));

        // 绑定卡片点击事件
        $('.kanban-card').click(e => {
            const ticketId = $(e.currentTarget).data('id');
            this._showTicketDetail(ticketId);
        });
    }


    /**
     * 组件初始化
     * @returns {Promise<void>}
     */
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
            this._renderProcessorOptions();
            this._checkUrlParams();
            this._initHistoryListener();
            this._startAutoRefresh();

        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面加载失败，请刷新重试');
        }
    }

    /**
     * 加载部门信息
     * @private
     */
    async _loadDepartmentInfo() {
        const response = await window.requestUtil.get(Const.API.DEPT.GET_CURRENT);
        this.state.departmentInfo = response.data;
        this._updateDepartmentInfo();
    }

    /**
     * 加载统计数据
     * @private
     */
    async _loadStats() {
        const [overview, trends, types, workloads, efficiency] = await Promise.all([
            window.requestUtil.get(Const.API.DEPT.GET_STATS.OVERVIEW),
            window.requestUtil.get(Const.API.DEPT.GET_STATS.TRENDS),
            window.requestUtil.get(Const.API.DEPT.GET_STATS.TYPES),
            window.requestUtil.get(Const.API.DEPT.GET_STATS.WORKLOADS),
            window.requestUtil.get(Const.API.DEPT.GET_STATS.EFFICIENCY)
        ]);

        this.state.stats = {
            overview: overview.data,
            trends: trends.data,
            types: types.data,
            workloads: workloads.data,
            efficiency: efficiency.data
        };

        this._updateStats();
    }

    /**
     * 加载处理人列表
     * @private
     */
    async _loadProcessors() {
        const response = await window.requestUtil.get(Const.API.DEPT.GET_PROCESSORS);
        this.state.processors = response.data;
    }

    /**
     * 加载工单列表
     * @private
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

            const response = await window.requestUtil.get(
                Const.API.DEPT.GET_TICKET_LIST,
                params
            );

            this.state.tickets = response.data.list;
            this.state.pagination.total = response.data.total;

            this._updateTicketsView();
            this._updatePagination();

        } catch (error) {
            console.error('加载工单列表失败:', error);
            this.showError(error.message || '加载工单列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 初始化图表
     * @private
     */
    _initCharts() {
        // 工单趋势图
        this.charts.trend = new Chart(this.$trendChart[0].getContext('2d'), {
            type: 'line',
            data: this._getTrendChartData(),
            options: this._getTrendChartOptions()
        });

        // 工单类型分布图
        this.charts.type = new Chart(this.$typeChart[0].getContext('2d'), {
            type: 'doughnut',
            data: this._getTypeChartData(),
            options: this._getTypeChartOptions()
        });
    }

    /**
     * 渲染处理人选项
     * @private
     */
    _renderProcessorOptions() {
        const options = this.state.processors.map(user => `
            <option value="${user.userId}">
                ${user.realName} (处理中: ${user.processingCount})
            </option>
        `);

        this.$processorFilter
            .html('<option value="">所有处理人</option>' + options.join(''));
    }

    /**
     * 更新工单视图
     * @private
     */
    _updateTicketsView() {
        if (this.state.ticketView === 'list') {
            this._renderListView();
        } else {
            this._renderBoardView();
        }
    }

    /**
     * 更新分页
     * @private
     */
    _updatePagination() {
        // 使用分页工具类
        const html = PaginationUtil.generateHTML(this.state.pagination);
        $('#pagination').html(html);

        PaginationUtil.bindEvents('#pagination', (page) => {
            this.state.pagination.current = page;
            this._loadTickets();
        });

        $('#totalCount').text(this.state.pagination.total);
    }

    /**
     * 处理视图切换
     * @private
     */
    _handleViewChange(e) {
        const view = $(e.currentTarget).data('view');
        if (view === this.state.currentView) return;

        this.state.currentView = view;
        $('[data-view]').removeClass('active');
        $(`[data-view="${view}"]`).addClass('active');

        this.$statsView.toggle(view === 'stats');
        this.$ticketsView.toggle(view === 'tickets');

        this._updateUrlParam('view', view);

        if (view === 'tickets') {
            this._loadTickets();
        } else {
            this._loadStats();
        }
    }

    /**
     * 处理工单视图切换
     * @private
     */
    _handleTicketViewChange(e) {
        const view = $(e.currentTarget).data('view');
        if (view === this.state.ticketView) return;

        this.state.ticketView = view;

        $('[data-bs-toggle="view"]').removeClass('active');
        $(e.currentTarget).addClass('active');

        this.$listView.toggle(view === 'list');
        this.$boardView.toggle(view === 'board');

        this._updateUrlParam('ticketView', view);
        this._updateTicketsView();
    }

    /**
     * 处理搜索
     * @private
     */
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
        this._updateUrlFilters();
        this._loadTickets();
    }

    /**
     * 处理重置
     * @private
     */
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
        this._updateUrlFilters();
        this._loadTickets();
    }

    /**
     * 处理导出
     * @private
     */
    async _handleExport() {
        try {
            this._showLoading('正在导出数据...');

            const response = await window.requestUtil.get(
                Const.API.DEPT.EXPORT_TICKETS,
                this.state.filters,
                { responseType: 'blob' }
            );

            // 创建下载链接
            const url = window.URL.createObjectURL(response);
            const link = document.createElement('a');
            link.href = url;
            link.download = `工单列表_${window.utils.formatDate(new Date(), 'YYYYMMDD')}.xlsx`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.showSuccess('导出成功');
        } catch (error) {
            console.error('导出失败:', error);
            this.showError('导出失败，请重试');
        } finally {
            this._hideLoading();
        }
    }

    /**
     * 获取趋势图配置
     * @private
     * @returns {Object} Chart.js配置对象
     */
    _getTrendChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        // 优化提示框显示
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: ${value}件`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0,
                        // 优化Y轴标签显示
                        callback: (value) => {
                            return value + '件';
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };
    }

    /**
     * 渲染工作量列表
     * @private
     * @description 展示每个处理人的工作量和处理进度
     */
    _renderWorkloadList() {
        const { workloads } = this.state.stats;
        // 按工作量排序
        const sortedWorkloads = [...workloads].sort((a, b) =>
            b.processingCount - a.processingCount
        );

        const html = sortedWorkloads.map(member => {
            // 计算工作量百分比
            const percent = Math.min(
                (member.processingCount / Const.BUSINESS.DEPT_TICKET.MAX_MEMBER_WORKLOAD) * 100,
                100
            );

            // 确定工作量等级
            const levelClass = this._getWorkloadLevelClass(percent);

            return `
                <div class="member-workload-item">
                    <div class="member-info">
                        <div class="d-flex justify-content-between mb-1">
                            <span class="member-name">${member.realName}</span>
                            <span class="workload-count ${levelClass}">
                                ${member.processingCount}/${Const.BUSINESS.DEPT_TICKET.MAX_MEMBER_WORKLOAD}
                            </span>
                        </div>
                        <div class="workload-progress">
                            <div class="progress-bar ${levelClass}" 
                                 style="width: ${percent}%"
                                 title="${percent.toFixed(1)}%">
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $('#memberWorkloadList').html(html || '<div class="text-center text-muted">暂无数据</div>');
    }

    /**
     * 获取工作量等级样式
     * @private
     * @param {number} percent - 工作量百分比
     * @returns {string} CSS类名
     */
    _getWorkloadLevelClass(percent) {
        if (percent >= 90) return 'level-danger';
        if (percent >= 70) return 'level-warning';
        if (percent >= 30) return 'level-primary';
        return 'level-success';
    }

    /**
     * 处理刷新工作量
     * @private
     * @returns {Promise<void>}
     */
    async _loadTicketsRaw() {
        const cacheKey = JSON.stringify({
            pagination: this.state.pagination,
            filters: this.state.filters
        });

        // 检查缓存
        const cached = this.ticketCache?.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < 30000) {
            this.state.tickets = cached.data;
            this._updateTicketsView();
            return;
        }

        try {
            await this._loadTickets();
            // 更新缓存
            this.ticketCache = this.ticketCache || new Map();
            this.ticketCache.set(cacheKey, {
                data: this.state.tickets,
                timestamp: Date.now()
            });
        } catch (error) {
            this._handleError(error);
        }
    }

    /**
     * 统一错误处理
     * @private
     * @param {Error} error - 错误对象
     * @param {string} [customMessage] - 自定义错误消息
     */
    _handleError(error, customMessage) {
        console.error('操作失败:', error);

        // 处理特定错误类型
        if (error.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (error.status === 403) {
            this.showError('您没有相应的操作权限');
            return;
        }

        // 处理网络错误
        if (error.name === 'NetworkError') {
            this.showError('网络连接失败，请检查网络后重试');
            return;
        }

        // 默认错误提示
        this.showError(customMessage || error.message || '操作失败，请重试');
    }

    /**
     * 性能优化 - 使用虚拟滚动处理大量数据
     * @private
     */
    _initVirtualScroll() {
        if (this.state.tickets.length > 100) {
            const options = {
                container: this.$ticketList[0],
                itemHeight: 60, // 每个工单项的高度
                buffer: 5, // 上下缓冲区数量
                renderItem: (ticket) => this._renderTicketItem(ticket)
            };

            this.virtualScroll = new VirtualScroll(options);
            this.virtualScroll.setItems(this.state.tickets);
        } else {
            this._renderTicketList();
        }
    }

    /**
     * 资源清理
     * @override
     * @public
     */
    destroy() {
        // 清理图表实例
        Object.values(this.charts).forEach(chart => {
            chart.destroy();
        });

        // 清理缓存
        this.ticketCache?.clear();

        // 清理虚拟滚动
        this.virtualScroll?.destroy();

        // 移除事件监听
        window.removeEventListener('resize', this._handleResize);

        // 清理定时器
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // 移除历史监听
        window.removeEventListener('popstate', this._historyListener);

        // 销毁图表实例
        Object.values(this.charts).forEach(chart => {
            chart.destroy();
        });

        // 销毁模态框
        if (this.assignModal) {
            this.assignModal.dispose();
        }

        // 清理DOM绑定
        $('#pagination').off('click');
        this.container.find('button').off('click');
        this.container.find('input').off('input change');

        // 清理定时器
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        super.destroy();
    }


}

// 页面加载完成后初始化
$(document).ready(() => {
    window.deptWorkspace = new DepartmentWorkspace();
});