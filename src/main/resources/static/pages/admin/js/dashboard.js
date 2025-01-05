/**
 * dashboard.js
 * 管理员仪表板页面控制器
 */
class Dashboard extends BaseComponent {
    constructor() {
        // 传递必要的配置给父类BaseComponent
        super({
            container: '#main',  // 指定组件容器
            events: {
                'click #refreshBtn': 'refreshData',
                'click #viewAllBtn': 'navigateToTickets',
                'click .view-ticket': 'handleViewTicket'
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
                avgSatisfaction: $('#avgSatisfaction')
            },
            charts: {
                trend: $('#ticketTrendChart'),
                type: $('#ticketTypeChart')
            },
            ticketList: $('#recentTicketsList')
        };

        // 图表实例
        this.charts = {};

        // 初始化导航栏
        this.initNavbar();

        // 初始化组件
        this.init();
    }

    /**
     * 初始化导航栏
     */
    initNavbar() {
        const navbar = new Navbar({
            container: '#navbar'  // 指定导航栏容器
        });
        navbar.init();
    }
    /**
     * 初始化
     */
    async init() {
        try {
            await this.loadInitialData();
            this.setupCharts();
            this.render();

            // 设置自动刷新
            this.startAutoRefresh();
        } catch (error) {
            console.error('仪表板初始化失败:', error);
            this.showError('加载数据失败，请刷新页面重试');
        }
    }

    /**
     * 开始自动刷新
     */
    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshData();
        }, 60000); // 每分钟刷新一次
    }

    /**
     * 加载初始数据
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
     */
    async loadStats() {
        const response = await window.requestUtil.get('/api/admin/dashboard/stats');
        return response.data;
    }

    /**
     * 加载最近工单
     */
    async loadRecentTickets() {
        const response = await window.requestUtil.get('/api/admin/dashboard/recent-tickets', {
            limit: 10
        });
        return response.data;
    }

    /**
     * 设置图表
     */
    setupCharts() {
        // 工单趋势图
        this.charts.trend = new Chart(this.elements.charts.trend.get(0).getContext('2d'), {
            type: 'line',
            data: this.getTrendChartData(),
            options: this.getTrendChartOptions()
        });

        // 工单类型分布图
        this.charts.type = new Chart(this.elements.charts.type.get(0).getContext('2d'), {
            type: 'doughnut',
            data: this.getTypeChartData(),
            options: this.getTypeChartOptions()
        });
    }

    /**
     * 获取趋势图数据
     */
    getTrendChartData() {
        // 从统计数据中提取趋势数据
        const { trends } = this.state.stats;

        return {
            labels: trends.map(item => item.date),
            datasets: [
                {
                    label: '新建工单',
                    data: trends.map(item => item.created),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4
                },
                {
                    label: '完成工单',
                    data: trends.map(item => item.completed),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                }
            ]
        };
    }

    /**
     * 获取趋势图配置
     */
    getTrendChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        };
    }

    /**
     * 获取类型图数据
     */
    getTypeChartData() {
        const { types } = this.state.stats;

        return {
            labels: types.map(item => item.name),
            datasets: [{
                data: types.map(item => item.count),
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        };
    }

    /**
     * 获取类型图配置
     */
    getTypeChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        };
    }

    /**
     * 更新统计卡片
     */
    updateStats() {
        const { stats } = this.state;

        // 更新数值
        Object.entries(this.elements.statsCards).forEach(([key, element]) => {
            const value = stats[key];
            element.text(typeof value === 'number' ?
                value.toLocaleString() : value);
        });

        // 更新图表
        this.charts.trend.data = this.getTrendChartData();
        this.charts.trend.update();

        this.charts.type.data = this.getTypeChartData();
        this.charts.type.update();
    }

    /**
     * 渲染工单列表
     */
    renderTicketList() {
        const html = this.state.recentTickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                        ${ticket.title}
                    </div>
                </td>
                <td>${ticket.creator}</td>
                <td>
                    <span class="status-badge status-${ticket.status.toLowerCase()}">
                        ${this.getStatusText(ticket.status)}
                    </span>
                </td>
                <td>${this.getPriorityText(ticket.priority)}</td>
                <td>${window.utils.formatDate(ticket.createTime)}</td>
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
     */
    async refreshData() {
        if (this.state.loading) return;

        try {
            await this.loadInitialData();
            this.updateStats();
            this.renderTicketList();
        } catch (error) {
            console.error('刷新数据失败:', error);
            this.showError('刷新数据失败，请重试');
        }
    }

    /**
     * 跳转到工单列表
     */
    navigateToTickets() {
        window.location.href = '/admin/ticket-management.html';
    }

    /**
     * 处理工单查看
     */
    handleViewTicket(e) {
        const ticketId = $(e.currentTarget).data('ticket-id');
        window.location.href = `/admin/ticket-management.html?id=${ticketId}`;
    }

    /**
     * 获取状态文本
     */
    getStatusText(status) {
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
    getPriorityText(priority) {
        const priorityMap = {
            'HIGH': '高',
            'MEDIUM': '中',
            'LOW': '低'
        };
        return priorityMap[priority] || priority;
    }

    /**
     * 组件销毁
     */
    destroy() {
        // 清除自动刷新
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // 销毁图表实例
        Object.values(this.charts).forEach(chart => {
            chart.destroy();
        });

        // 调用父类销毁方法
        super.destroy();
    }
}

// 页面加载完成后初始化仪表板
$(document).ready(() => {
    window.dashboard = new Dashboard();
});