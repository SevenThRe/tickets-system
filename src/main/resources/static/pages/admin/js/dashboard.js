/**
 * 管理员仪表盘页面控制器
 * 负责处理管理员控制台的数据展示、图表渲染和交互逻辑
 * @author SeventhRe
 */
class Dashboard extends BaseComponent {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        super({
            events: {
                'click .refresh-btn': 'refreshData',
                'click .view-all-btn': 'navigateToTickets'
            }
        });

        // 状态管理
        this.state = {
            loading: false,
            stats: null,
            recentTickets: []
        };

        // DOM元素缓存
        this.elements = {
            statsCards: {
                pending: $('#pendingTickets'),
                processing: $('#processingTickets'),
                completed: $('#completedTickets'),
                total: $('#totalTickets')
            },
            charts: {
                trend: $('#ticketTrendChart'),
                type: $('#ticketTypeChart')
            },
            ticketList: $('#recentTicketsList')
        };

        // 初始化图表实例
        this.charts = {};

        // 初始化组件
        this.init();
    }

    /**
     * 组件初始化
     * @override
     */
    async init() {
        try {
            await this.loadInitialData();
            this.setupCharts();
            this.render();
        } catch (error) {
            console.error('仪表盘初始化失败:', error);
            this.showError('加载数据失败，请刷新页面重试');
        }
    }


    /**
     * 加载初始数据
     * @private
     */
    async loadInitialData() {
        this.state.loading = true;
        try {
            // 并行加载数据
            const [stats, tickets] = await Promise.all([
                this.loadStats(),
                this.loadRecentTickets()
            ]);

            this.state.stats = stats;
            this.state.recentTickets = tickets;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 加载统计数据
     * @private
     * @returns {Promise<Object>} 统计数据
     */
    async loadStats() {
        const response = await request.get('/api/admin/dashboard/stats');
        return response.data;
    }

    /**
     * 加载最近工单
     * @private
     * @returns {Promise<Array>} 工单列表
     */
    async loadRecentTickets() {
        const response = await request.get('/api/admin/dashboard/recent-tickets');
        return response.data;
    }

    /**
     * 设置图表
     * @private
     */
    setupCharts() {
        // 工单趋势图
        this.charts.trend = new Chart(this.elements.charts.trend, {
            type: 'line',
            data: this.getTrendChartData(),
            options: this.getTrendChartOptions()
        });

        // 工单类型分布图
        this.charts.type = new Chart(this.elements.charts.type, {
            type: 'doughnut',
            data: this.getTypeChartData(),
            options: this.getTypeChartOptions()
        });
    }

    /**
     * 获取趋势图数据
     * @private
     * @returns {Object} 图表数据配置
     */
    getTrendChartData() {
        // 处理趋势数据
    }

    /**
     * 获取趋势图配置
     * @private
     * @returns {Object} 图表配置选项
     */
    getTrendChartOptions() {
        // 图表配置
    }

    /**
     * 渲染统计卡片
     * @private
     */
    renderStats() {
        const { stats } = this.state;
        Object.entries(this.elements.statsCards).forEach(([key, element]) => {
            element.text(stats[key].toLocaleString());
        });
    }

    /**
     * 渲染最近工单列表
     * @private
     */
    renderTicketList() {
        const html = this.state.recentTickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-dot priority-${ticket.priority}"></span>
                        ${ticket.title}
                    </div>
                </td>
                <td>${ticket.creator}</td>
                <td>
                    <span class="badge bg-${this.getStatusBadgeClass(ticket.status)}">
                        ${this.getStatusText(ticket.status)}
                    </span>
                </td>
                <td>${this.formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" 
                            data-ticket-id="${ticket.id}">
                        查看
                    </button>
                </td>
            </tr>
        `).join('');

        this.elements.ticketList.html(html);
    }

    /**
     * 刷新数据
     * @param {Event} e - 事件对象
     */
    async refreshData(e) {
        e?.preventDefault();
        await this.loadInitialData();
        this.render();
    }

    /**
     * 导航到工单列表
     * @param {Event} e - 事件对象
     */
    navigateToTickets(e) {
        e.preventDefault();
        window.location.href = '/pages/admin/ticket-management.html';
    }

    /**
     * 获取状态对应的样式类
     * @param {string} status - 工单状态
     * @returns {string} Bootstrap样式类
     */
    getStatusBadgeClass(status) {
        const statusMap = {
            'PENDING': 'warning',
            'PROCESSING': 'info',
            'COMPLETED': 'success',
            'CLOSED': 'secondary'
        };
        return statusMap[status] || 'primary';
    }

    /**
     * 获取状态文本
     * @param {string} status - 工单状态
     * @returns {string} 状态文本
     */
    getStatusText(status) {
        const textMap = {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭'
        };
        return textMap[status] || status;
    }

    /**
     * 格式化日期
     * @param {string} date - 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate(date) {
        return new Date(date).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// 页面加载完成后初始化
$(() => {
    const dashboard = new Dashboard();
});