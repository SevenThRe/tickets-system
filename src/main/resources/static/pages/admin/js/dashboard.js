/**
 * Dashboard.js
 * 管理员仪表板页面控制器
 */
class Dashboard {
    constructor() {
        // 缓存DOM元素

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

        this.$userInfoCard = $(`
        <div class="user-info-card">
            <div class="user-info-header">
                <div class="user-info-avatar">
                    <img src="/images/default-avatar.png" alt="avatar">
                </div>
                <div class="user-info-name">
                    <h6></h6>
                    <small></small>
                </div>
            </div>
            <div class="user-info-content">
                <div class="user-info-item">
                    <div class="user-info-label">用户名</div>
                    <div class="user-info-value username"></div>
                </div>
                <div class="user-info-item">
                    <div class="user-info-label">部门</div>
                    <div class="user-info-value department"></div>
                </div>
                <div class="user-info-item">
                    <div class="user-info-label">角色</div>
                    <div class="user-info-value role"></div>
                </div>
                <div class="user-info-item">
                    <div class="user-info-label">状态</div>
                    <div class="user-info-value status"></div>
                </div>
            </div>
        </div>
    `).appendTo('body');

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
            this._bindHoverEvents();
        } catch (error) {
            console.error('仪表板初始化失败:', error);
            NotifyUtil.error('加载数据失败，请刷新页面重试');
        }finally {
            this.state.loading = false;
            this._debugData();
        }
    }

    _bindHoverEvents() {
        const showDelay = 300;
        let hoverTimer;
        let hideTimer;

        // 移入用户链接时显示卡片
        this.$ticketList.on('mouseenter', '.user-link', (e) => {
            const userId = $(e.currentTarget).data('userid');
            const $target = $(e.currentTarget);

            clearTimeout(hideTimer);
            clearTimeout(hoverTimer);

            hoverTimer = setTimeout(async () => {
                if(userId) {  // 确保有userId
                    const userInfo = await this._loadUserInfo(userId);
                    if(userInfo) {
                        this._showUserInfoCard(userInfo, $target);
                    }
                }
            }, showDelay);
        });

        // 移出用户链接时延迟隐藏卡片
        this.$ticketList.on('mouseleave', '.user-link', () => {
            clearTimeout(hoverTimer);
            hideTimer = setTimeout(() => {
                this._hideUserInfoCard();
            }, showDelay);
        });

        // 移入卡片时取消隐藏
        this.$userInfoCard.on('mouseenter', () => {
            clearTimeout(hideTimer);
        });

        // 移出卡片时隐藏
        this.$userInfoCard.on('mouseleave', () => {
            this._hideUserInfoCard();
        });
    }

    _showUserInfoCard(userInfo, $target) {
        if(!userInfo || !userInfo.userId || userInfo.userId == -1) {
            return;
        }


        const offset = $target.offset();
        const windowWidth = $(window).width();
        const cardWidth = this.$userInfoCard.outerWidth();

        // 计算最佳显示位置
        let left = offset.left;
        if (left + cardWidth > windowWidth) {
            left = windowWidth - cardWidth - 20; // 20px的安全边距
        }

        this.$userInfoCard.find('.user-info-name h6').text(userInfo.realName);
        this.$userInfoCard.find('.user-info-name small').text(userInfo.roleName);
        this.$userInfoCard.find('.username').text(userInfo.username);
        this.$userInfoCard.find('.department').text(userInfo.departmentName || '-');
        this.$userInfoCard.find('.role').text(userInfo.roleName);
        this.$userInfoCard.find('.status').html(`
        <span class="badge ${userInfo.status === 1 ? 'bg-success' : 'bg-danger'}">
            ${userInfo.status === 1 ? '正常' : '禁用'}
        </span>
    `);

        // 设置位置并显示
        this.$userInfoCard.css({
            top: offset.top + $target.outerHeight() + 5,
            left: left
        }).addClass('show');
    }
    _hideUserInfoCard() {
        this.$userInfoCard.removeClass('show');
    }

    async _loadUserInfo(userId) {
        try {
            const response = await $.ajax({
                url: `/api/users/${userId}/info`,
                method: 'GET'
            });

            if(response.code === 200) {
                return response.data;
            }
            return null;
        } catch(error) {
            console.error('加载用户信息失败:', error);
            return null;
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

            this.updateStats();
            this.renderTicketList();
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
        const days = 7;
        const dates = [];
        const newCount = [];  // 改为newCount
        const completedCount = []; // 改为completedCount

        // 生成日期和数据
        for(let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toLocaleDateString());

            const trend = trends.find(t =>
                new Date(t.date).toLocaleDateString() === date.toLocaleDateString()
            );
            newCount.push(trend?.newCount || 0);
            completedCount.push(trend?.completedCount || 0);
        }

        return {
            labels: dates,
            datasets: [
                {
                    label: '新建工单',
                    data: newCount,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: '完成工单',
                    data: completedCount,
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
        const types = this.state.stats?.types || [];

        return {
            labels: types.map(item => item.typeName),
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
     * 渲染满意度星星
     * @param {number} score 评分(0-5)
     * @returns {string} 星星HTML
     */
    _renderStars(score) {
        const fullStar = '<i class="bi bi-star-fill star"></i>';
        const halfStar = '<i class="bi bi-star-half star"></i>';
        const emptyStar = '<i class="bi bi-star star star-empty"></i>';

        let stars = '';
        const totalStars = 5;

        for(let i = 1; i <= totalStars; i++) {
            if(i <= Math.floor(score)) {
                stars += fullStar;
            } else if(i - 0.5 <= score) {
                stars += halfStar;
            } else {
                stars += emptyStar;
            }
        }

        return stars;
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

        // 更新满意度星星显示
        const satisfaction = stats.avgSatisfaction || 0;
        $('#avgSatisfactionStars').html(this._renderStars(satisfaction));

        // 更新工单列表中的优先级显示
        if(this.state.recentTickets) {
            this.renderTicketList();
        }
    }

    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * 渲染工单列表
     */
    renderTicketList() {
        const html = this.state.recentTickets.map(ticket => `
        <tr>
            <td>${ticket.ticketId}</td>
            <td>${this._escapeHtml(ticket.title)}</td>
            <td>
                <span class="badge bg-secondary">${ticket.typeName || '-'}</span>
            </td>
            <td>
                <a href="javascript:void(0)" 
                   class="user-link" 
                   data-userid="${ticket.creatorId}"
                   onclick="window.location.href='/pages/admin/user-management.html?id=${ticket.creatorId}'">
                    ${this._escapeHtml(ticket.creatorName)}
                </a>
            </td>
            <td>
                <span class="status-badge status-${this.getStatusClass(ticket.status)}">
                    ${this.getStatusText(ticket.status)}
                </span>
            </td>
            <td>${ticket.departmentName || '-'}</td>
             <td>
              ${ticket.processorId ?
                    `<a href="javascript:void(0)" 
                    class="user-link" 
                    data-userid="${ticket.processorId}">
                    ${this._escapeHtml(ticket.processorName)}
                 </a>` :
                    '未分配'
                }
            </td>
            <td>
                <span class="priority-badge priority-${this.getPriorityClass(ticket.priority)}">
                    ${this.getPriorityText(ticket.priority)}
                </span>
            </td>
            <td>${this._formatDate(ticket.createTime)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-ticket" 
                        data-id="${ticket.ticketId}">
                    查看
                </button>
            </td>
        </tr>
    `).join('');

        this.$ticketList.html(html || '<tr><td colspan="9" class="text-center">暂无数据</td></tr>');
    }

    getPriorityClass(priority) {
        const map = {
            '0': 'normal',
            '1': 'urgent',
            '2': 'extremely-urgent',
            'NORMAL': 'normal',
            'URGENT': 'urgent',
            'EXTREMELY_URGENT': 'extremely-urgent'
        };
        return map[priority] || 'normal';
    }

    getStatusClass(status) {
        const map = {
            '0': 'pending',
            '1': 'processing',
            '2': 'completed',
            '3': 'closed',
            'PENDING': 'pending',
            'PROCESSING': 'processing',
            'COMPLETED': 'completed',
            'CLOSED': 'closed'
        };
        return map[status] || 'pending';
    }

    /**
     * 调试工具，输出数据到控制台
     */
    _debugData() {
        console.group('Dashboard State');
        console.log('Stats:', this.state.stats);
        console.log('Recent Tickets:', this.state.recentTickets);
        console.log('Loading:', this.state.loading);
        console.groupEnd();
    }

    /**
     * 刷新数据
     */
    async refreshData() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            NotifyUtil.loading('正在刷新数据...');

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
            NotifyUtil.closeLoading();
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
        window.location.href = '/pages/admin/ticket-management.html';
    }

    /**
     * 处理工单查看
     */
    handleViewTicket(ticketId) {
        window.location.href = `/pages/admin/ticket-management.html?ticketId=${ticketId}`;
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

    _handleError(error, message) {
        console.error(message, error);
        NotifyUtil.error(message);
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
        if(this.$userInfoCard) {
            this.$userInfoCard.remove();
            this.$userInfoCard = null;
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