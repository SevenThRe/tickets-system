/**
 * Dashboard.js
 * 管理员仪表板页面控制器
 */
class Dashboard {
    constructor() {
        // 缓存DOM元素
        this.$container = $('#main');
        this.$statsCards = {
            pending: $('#pendingTickets'),
            processing: $('#processingTickets'),
            completed: $('#completedTickets'),
            avgSatisfaction: $('#avgSatisfaction')
        };
        this.$charts = {
            trend: $('#ticketTrendChart'),
            type: $('#ticketTypeChart')
        };
        this.$ticketList = $('#recentTicketsList');

        // 状态管理
        this.state = {
            loading: false,
            stats: null,
            recentTickets: []
        };

        // 图表实例
        this.charts = {};

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
        $('#refreshBtn').on('click', () => this.refreshData());
        $('#viewAllBtn').on('click', () => this.navigateToTickets());
        this.$ticketList.on('click', '.view-ticket', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this.handleViewTicket(ticketId);
        });
    }

    /**
     * 初始化
     */
    async init() {
        try {
            await this.loadInitialData();
            this.setupCharts();
            this.startAutoRefresh();
            this.updateCurrentTime();
        } catch (error) {
            console.error('仪表板初始化失败:', error);
            NotifyUtil.error('加载数据失败，请刷新页面重试');
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
        try {
            const response = await $.ajax({
                url: '/api/admin/dashboard/stats',
                method: 'GET'
            });

            if(response.code === 200) {
                return response.data;
            } else {
                throw new Error(response.message || '加载统计数据失败');
            }
        } catch (error) {
            console.error('加载统计数据失败:', error);
            throw error;
        }
    }

    /**
     * 加载最近工单
     */
    async loadRecentTickets() {
        try {
            const response = await $.ajax({
                url: '/api/admin/dashboard/recent-tickets',
                method: 'GET',
                data: { limit: 10 }
            });

            if(response.code === 200) {
                return response.data;
            } else {
                throw new Error(response.message || '加载最近工单失败');
            }
        } catch (error) {
            console.error('加载最近工单失败:', error);
            throw error;
        }
    }

    /**
     * 设置图表
     */
    setupCharts() {
        // 工单趋势图
        this.charts.trend = new Chart(this.$charts.trend[0].getContext('2d'), {
            type: 'line',
            data: this.getTrendChartData(),
            options: this.getTrendChartOptions()
        });

        // 工单类型分布图
        this.charts.type = new Chart(this.$charts.type[0].getContext('2d'), {
            type: 'doughnut',
            data: this.getTypeChartData(),
            options: this.getTypeChartOptions()
        });
    }

    /**
     * 获取趋势图数据
     */
    getTrendChartData() {
        const trends = this.state.stats?.trends || [];
        const days = 7; // 显示最近7天
        const dates = [];
        const created = [];
        const completed = [];

        // 生成日期和数据
        for(let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString());

            const trend = trends.find(t =>
                new Date(t.date).toLocaleDateString() === date.toLocaleDateString()
            );
            created.push(trend?.created || 0);
            completed.push(trend?.completed || 0);
        }

        return {
            labels: dates,
            datasets: [
                {
                    label: '新建工单',
                    data: created,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '完成工单',
                    data: completed,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
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
        const types = this.state.stats.types;

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
        if (!stats) return;

        // 更新统计卡片
        this.$statsCards.pending.text(stats.pendingCount || 0);
        this.$statsCards.processing.text(stats.processingCount || 0);
        this.$statsCards.completed.text(stats.completedCount || 0);

        // 格式化满意度显示
        const satisfaction = stats.avgSatisfaction || 0;
        this.$statsCards.avgSatisfaction.text(
            satisfaction.toFixed(1) + ' / 5.0'
        );

        // 更新工单趋势图
        if (this.charts.trend) {
            this.charts.trend.data = this.getTrendChartData();
            this.charts.trend.update();
        }

        // 更新工单类型分布图
        if (this.charts.type) {
            this.charts.type.data = this.getTypeChartData();
            this.charts.type.update();
        }
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
                <td>${this._formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" 
                            data-id="${ticket.id}">
                        查看
                    </button>
                </td>
            </tr>
        `).join('');

        this.$ticketList.html(html || '<tr><td colspan="7" class="text-center">暂无数据</td></tr>');
    }

    /**
     * 刷新数据
     */
    async refreshData() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const [stats, tickets] = await Promise.all([
                this.loadStats(),
                this.loadRecentTickets()
            ]);

            this.state.stats = stats;
            this.state.recentTickets = tickets;

            // 更新UI
            this.updateStats();
            this.renderTicketList();
            this._updateLastUpdateTime();

        } catch (error) {
            console.error('刷新数据失败:', error);
            NotifyUtil.error('刷新数据失败，请重试');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    _updateLastUpdateTime() {
        const now = new Date();
        $('#lastUpdateTime').text(
            `最后更新: ${now.toLocaleTimeString()}`
        );
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
    handleViewTicket(ticketId) {
        window.location.href = `/admin/ticket-management.html?id=${ticketId}`;
    }


    /**
     * 获取状态文本
     */
    getStatusText(status) {
        return TicketUtil.getStatusText(status);
    }

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
        return TicketUtil.getPriorityText(priority);

    }

    /**
     * 格式化日期
     * @private
     */
    _formatDate(date) {
        return new Date(date).toLocaleString();
    }

    /**
     * 更新当前时间显示
     */
    updateCurrentTime() {
        const updateTime = () => {
            const now = new Date();
            $('#currentTime').text(this._formatDate(now));
        };

        // 立即更新一次
        updateTime();

        // 每秒更新一次
        this.timeInterval = setInterval(updateTime, 1000);
    }

    /**
     * 组件销毁
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // 销毁图表实例
        if (this.charts.trend) {
            this.charts.trend.destroy();
        }
        if (this.charts.type) {
            this.charts.type.destroy();
        }

        // 解绑事件
        $('#refreshBtn').off('click');
        $('#viewAllBtn').off('click');
        this.$ticketList.off('click');

        // 清理DOM引用
        this.$statsCards = null;
        this.$charts = null;
        this.$ticketList = null;

        // 清理状态
        this.state = null;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.dashboard = new Dashboard();
});