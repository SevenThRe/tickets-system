/**
 * Dashboard.js
 * 工作台页面控制器
 */
class Dashboard {
    constructor() {
        // 缓存DOM引用
        this.elements = {
            userName: $('#userName'),
            currentTime: $('#currentTime'),
            todoList: $('#todoList'),
            recentList: $('#recentList'),
            // 统计数字
            todoCount: $('#todoCount'),
            totalTickets: $('#totalTickets'),
            // 当日统计
            todayCreated: $('#todayCreated'),
            todayCompleted: $('#todayCompleted'),
            processingCount: $('#processingCount')
        };

        // 状态管理
        this.state = {
            loading: false,
            userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
            statistics: {
                todoCount: 0,
                totalTickets: 0,
                todayCreated: 0,
                todayCompleted: 0,
                processingCount: 0
            },
            todoTickets: [],
            recentTickets: []
        };

        // 初始化
        this.init();
    }

    /**
     * 初始化方法
     */
    async init() {
        try {
            // 显示用户名
            this.elements.userName.text(this.state.userInfo.realName || '用户');

            // 加载数据
            await Promise.all([
                this._loadStatistics(),
                this._loadTodoTickets(),
                this._loadRecentTickets()
            ]);

            // 更新时间显示
            this._updateCurrentTime();

            // 移除页面自身的onclick事件
            // 我没有直接删除页面的onclick，这样哪怕不走js也能跳转
            $('.quick-action-card').each(function() {
                $(this).removeAttr('onclick');
            });

            // 绑定事件
            this._bindEvents();

            // 启动自动刷新
            this._startAutoRefresh();

            // 加载未读通知
            this._loadNotifications();

        } catch(error) {
            console.error('初始化失败:', error);
            NotifyUtil.error('加载数据失败，请刷新重试');
        }
    }

    /**
     * 绑定事件处理
     */
    _bindEvents() {
        // 快捷操作卡片点击
        $('.quick-action-card').on('click', (e) => {
            const action = $(e.currentTarget).data('action');
            this._handleQuickAction(action);
        });

        // 工单查看点击
        $('#todoList, #recentList').on('click', '.view-ticket', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this._viewTicket(ticketId);
        });

        // 处理按钮点击
        $('#todoList').on('click', '.process-ticket', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this._processTicket(ticketId);
        });
    }

    /**
     * 加载统计数据
     */
    async _loadStatistics() {
        try {
            // 加载总体统计
            const statsResponse = await $.ajax({
                url: '/api/tickets/statistics',
                method: 'GET',
                data: { userId: this.state.userInfo.userId }
            });

            // 加载待办统计
            const todoStatsResponse = await $.ajax({
                url: '/api/tickets/todo/stats',
                method: 'GET',
                data: { userId: this.state.userInfo.userId }
            });

            if (statsResponse.code === 200 && todoStatsResponse.code === 200) {
                this.state.statistics = {
                    ...statsResponse.data,
                    ...todoStatsResponse.data,  // 合并两个接口的数据
                };
                this._updateStatistics();
            }
        } catch (error) {
            console.error('加载统计数据失败:', error);
            throw error;
        }
    }

    /**
     * 加载待办工单
     */
    async _loadTodoTickets() {
        try {
            const response = await $.ajax({
                url: '/api/tickets/todos',
                method: 'GET',
                data: {
                    pageNum: 1,
                    pageSize: 5,
                    processorId: this.state.userInfo.userId,
                    status: ['PENDING', 'PROCESSING']
                }
            });

            if (response.code === 200) {
                this.state.todoTickets = response.data.list;
                this._renderTodoList();
            }
        } catch (error) {
            console.error('加载待办工单失败:', error);
            throw error;
        }
    }

    /**
     * 加载最近工单
     */
    async _loadRecentTickets() {
        try {
            const response = await $.ajax({
                url: '/api/tickets/my',
                method: 'GET',
                data: {
                    pageSize: 5,
                    userId: this.state.userInfo.userId,
                    sortField: 'updateTime',
                    sortOrder: 'desc'
                }
            });

            if (response.code === 200) {
                this.state.recentTickets = response.data.list;
                this._renderRecentList();
            }
        } catch (error) {
            console.error('加载最近工单失败:', error);
            throw error;
        }
    }

    /**
     * 加载未读通知
     */
    async _loadNotifications() {
        try {
            const response = await $.ajax({
                url: '/api/notifications/unread',
                method: 'GET'
            });

            if (response.code === 200 && response.data?.length > 0) {
                response.data.forEach(notification => {
                    NotifyUtil.info(notification.content);
                });
            }
        } catch (error) {
            console.error('加载通知失败:', error);
        }
    }

    /**
     * 更新统计数据显示
     */
    _updateStatistics() {
        const { statistics } = this.state;

        // 更新数量显示
        this.elements.todoCount.text(statistics.pendingCount || 0);
        this.elements.totalTickets.text(statistics.totalCount || 0);
        this.elements.processingCount.text(statistics.processingCount || 0);
        this.elements.todayCompleted.text(statistics.todayCompleted || 0);

        // 添加醒目提示
        if (statistics.pendingCount > 0) {
            this.elements.todoCount.parent().addClass('text-danger');
        }
    }

    /**
     * 渲染待办工单列表
     */
    _renderTodoList() {
        if (!this.state.todoTickets.length) {
            this.elements.todoList.html(
                '<tr><td colspan="5" class="text-center">暂无待办工单</td></tr>'
            );
            return;
        }

        const html = this.state.todoTickets.map(ticket => `
            <tr>
                <td>${ticket.ticketId}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${this._getPriorityClass(ticket.priority)}"></span>
                        ${this._escapeHtml(ticket.title)}
                    </div>
                </td>
                <td>
                    <span class="badge bg-${this._getPriorityClass(ticket.priority)}">
                        ${this._getPriorityText(ticket.priority)}
                    </span>
                </td>
                <td>${this._formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-primary process-ticket" data-id="${ticket.ticketId}">
                        立即处理
                    </button>
                </td>
            </tr>
        `).join('');

        this.elements.todoList.html(html);
    }

    /**
     * 渲染最近工单列表
     */
    _renderRecentList() {
        if (!this.state.recentTickets.length) {
            this.elements.recentList.html(
                '<tr><td colspan="5" class="text-center">暂无工单记录</td></tr>'
            );
            return;
        }

        const html = this.state.recentTickets.map(ticket => `
            <tr>
                <td>${ticket.ticketId}</td>
                <td>${this._escapeHtml(ticket.title)}</td>
                <td>
                    <span class="badge bg-${this._getStatusClass(ticket.status)}">
                        ${this._getStatusText(ticket.status)}
                    </span>
                </td>
                <td>${this._formatDate(ticket.updateTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" data-id="${ticket.ticketId}">
                        查看详情
                    </button>
                </td>
            </tr>
        `).join('');

        this.elements.recentList.html(html);
    }

    /**
     * 更新时间显示
     */
    _updateCurrentTime() {
        const updateTime = () => {
            const now = new Date();
            this.elements.currentTime.text(
                now.toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            );
        };

        // 立即更新一次
        updateTime();
        // 每秒更新
        this.timeInterval = setInterval(updateTime, 1000);
    }

    /**
     * 启动自动刷新
     */
    _startAutoRefresh() {
        // 每5分钟刷新一次数据
        this.refreshInterval = setInterval(async () => {
            await Promise.all([
                this._loadStatistics(),
                this._loadTodoTickets(),
                this._loadRecentTickets()
            ]);
        }, 5 * 60 * 1000);
    }

    /**
     * 处理快捷操作
     */
    _handleQuickAction(action) {
        switch(action) {
            case 'todos':
                window.location.href = '/pages/user/todos.html';
                break;
            case 'tickets':
                window.location.href = '/pages/user/my-tickets.html';
                break;
            case 'create':
                window.location.href = '/pages/user/my-tickets.html?action=create';
                break;
            case 'profile':
                window.location.href = '/pages/user/profile.html';
                break;
        }
    }

    /**
     * 查看工单详情
     */
    _viewTicket(ticketId) {
        window.location.href = `/pages/user/my-tickets.html?ticketId=${ticketId}`;
    }

    /**
     * 处理工单
     */
    _processTicket(ticketId) {
        window.location.href = `/pages/user/todos.html?ticketId=${ticketId}`;
    }

    /**
     * 工具方法
     */
    _getPriorityClass(priority) {
        const map = {
            'HIGH': 'high',
            'MEDIUM': 'medium',
            'LOW': 'low'
        };
        return map[priority] || 'low';
    }

    _getPriorityText(priority) {
        const map = {
            'HIGH': '高优先级',
            'MEDIUM': '中等优先级',
            'LOW': '低优先级'
        };
        return map[priority] || '普通';
    }

    _getStatusClass(status) {
        const map = {
            'PENDING': 'warning',
            'PROCESSING': 'info',
            'COMPLETED': 'success',
            'CLOSED': 'secondary'
        };
        return map[status] || 'secondary';
    }

    _getStatusText(status) {
        const map = {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭'
        };
        return map[status] || status;
    }

    _formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * 销毁实例
     */
    destroy() {
        // 清理定时器
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // 解绑事件
        $('.quick-action-card').off();
        $('#todoList, #recentList').off();
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.dashboard = new Dashboard();
});