/**
 * UserDashboard.js
 * 用户工作台页面控制器
 */
class UserDashboard {
    constructor() {
        // 缓存DOM引用
        this.$container = $('#main');
        this.$todoList = $('#todoList');
        this.$recentList = $('#recentList');
        this.$statsCards = {
            todoCount: $('#todoCount'),
            totalTickets: $('#totalTickets')
        };

        // 状态管理
        this.state = {
            loading: false,
            userInfo: null,
            todoTickets: [],     // 待办工单列表
            recentTickets: [],   // 最近工单列表
            statistics: {        // 统计数据
                todoCount: 0,    // 待办数量
                totalTickets: 0  // 总工单数
            }
        };

        // 绑定事件
        this._bindEvents();

        // 初始化
        this.init();
    }

    // 事件绑定
    _bindEvents() {
        const self = this;

        // 查看工单
        this.$container.on('click', '.view-ticket', function() {
            const ticketId = $(this).data('id');
            self._handleViewTicket(ticketId);
        });

        // 处理工单
        this.$container.on('click', '.process-ticket', function() {
            const ticketId = $(this).data('id');
            self._handleProcessTicket(ticketId);
        });

        // 快捷操作区点击
        this.$container.on('click', '.quick-action-card', function() {
            const action = $(this).data('action');
            self._handleQuickAction(action);
        });
    }

    // 初始化
    async init() {
        try {
            // 并行加载数据
            await Promise.all([
                this._loadUserInfo(),
                this._loadTodoTickets(),
                this._loadRecentTickets(),
                this._loadStatistics()
            ]);

            // 更新页面显示
            this._updateUI();

            // 启动自动刷新
            this._startAutoRefresh();

            // 更新时间显示
            this._updateCurrentTime();
        } catch (error) {
            console.error('初始化失败:', error);
            this._showError('页面加载失败，请刷新重试');
        }
    }

    // 加载用户信息
    async _loadUserInfo() {
        try {
            const response = await $.ajax({
                url: '/api/users/current',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if(response.code === 200) {
                this.state.userInfo = response.data;
            } else {
                throw new Error(response.message || '加载用户信息失败');
            }
        } catch(error) {
            console.error('加载用户信息失败:', error);
            throw error;
        }
    }

    // 加载待办工单
    async _loadTodoTickets() {
        try {
            const response = await $.ajax({
                url: '/api/tickets/todos',
                method: 'GET',
                data: {
                    pageSize: 5, // 只加载前5条
                    sortField: 'createTime',
                    sortOrder: 'desc'
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if(response.code === 200) {
                this.state.todoTickets = response.data;
            } else {
                throw new Error(response.message || '加载待办工单失败');
            }
        } catch(error) {
            console.error('加载待办工单失败:', error);
            throw error;
        }
    }

    // 加载最近工单
    async _loadRecentTickets() {
        try {
            const response = await $.ajax({
                url: '/api/tickets/recent',
                method: 'GET',
                data: {
                    pageSize: 5,
                    sortField: 'updateTime',
                    sortOrder: 'desc'
                },
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if(response.code === 200) {
                this.state.recentTickets = response.data;
            } else {
                throw new Error(response.message || '加载最近工单失败');
            }
        } catch(error) {
            console.error('加载最近工单失败:', error);
            throw error;
        }
    }

    // 加载统计数据
    async _loadStatistics() {
        try {
            const response = await $.ajax({
                url: '/api/tickets/statistics',
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            if(response.code === 200) {
                this.state.statistics = response.data;
            } else {
                throw new Error(response.message || '加载统计数据失败');
            }
        } catch(error) {
            console.error('加载统计数据失败:', error);
            throw error;
        }
    }

    // 更新页面显示
    _updateUI() {
        // 更新用户名显示
        $('#userName').text(this.state.userInfo?.realName || '');

        // 更新统计数字
        this.$statsCards.todoCount.text(this.state.statistics.todoCount);
        this.$statsCards.totalTickets.text(this.state.statistics.totalTickets);

        // 渲染待办工单列表
        this._renderTodoList();

        // 渲染最近工单列表
        this._renderRecentList();
    }

    // 渲染待办工单列表
    _renderTodoList() {
        const html = this.state.todoTickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                        ${this._escapeHtml(ticket.title)}
                    </div>
                </td>
                <td>${this._getPriorityText(ticket.priority)}</td>
                <td>${this._formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-primary process-ticket" 
                            data-id="${ticket.id}">
                        立即处理
                    </button>
                </td>
            </tr>
        `).join('');

        this.$todoList.html(html || '<tr><td colspan="5" class="text-center">暂无待办工单</td></tr>');
    }

    // 渲染最近工单列表
    _renderRecentList() {
        const html = this.state.recentTickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>${this._escapeHtml(ticket.title)}</td>
                <td>
                    <span class="status-badge status-${ticket.status.toLowerCase()}">
                        ${this._getStatusText(ticket.status)}
                    </span>
                </td>
                <td>${this._formatDate(ticket.updateTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" 
                            data-id="${ticket.id}">
                        查看
                    </button>
                </td>
            </tr>
        `).join('');

        this.$recentList.html(html || '<tr><td colspan="5" class="text-center">暂无工单记录</td></tr>');
    }

    // 处理查看工单
    _handleViewTicket(ticketId) {
        window.location.href = `/pages/user/my-tickets.html?id=${ticketId}`;
    }

    // 处理处理工单
    _handleProcessTicket(ticketId) {
        window.location.href = `/pages/user/todos.html?id=${ticketId}`;
    }

    // 处理快捷操作
    _handleQuickAction(action) {
        switch(action) {
            case 'todos':
                window.location.href = '/pages/user/todos.html';
                break;
            case 'tickets':
                window.location.href = '/pages/user/my-tickets.html';
                break;
            case 'create':
                window.location.href = '/pages/user/create-ticket.html';
                break;
            case 'profile':
                window.location.href = '/pages/user/profile.html';
                break;
        }
    }

    // 更新当前时间显示
    _updateCurrentTime() {
        const updateTime = () => {
            const now = new Date();
            $('#currentTime').text(this._formatDate(now));
        };

        // 立即更新一次
        updateTime();

        // 每秒更新一次
        this.timeInterval = setInterval(updateTime, 1000);
    }

    // 启动自动刷新
    _startAutoRefresh() {
        // 每5分钟刷新一次数据
        this.refreshInterval = setInterval(async () => {
            await Promise.all([
                this._loadTodoTickets(),
                this._loadRecentTickets(),
                this._loadStatistics()
            ]);
            this._updateUI();
        }, 5 * 60 * 1000);
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
        return {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭'
        }[status] || status;
    }

    // 获取优先级文本
    _getPriorityText(priority) {
        return {
            'HIGH': '高',
            'MEDIUM': '中',
            'LOW': '低'
        }[priority] || priority;
    }

    // HTML内容转义
    _escapeHtml(str) {
        if(!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // 显示错误信息
    _showError(message) {
        $.notify({
            title: '<strong>错误</strong>',
            message: message
        },{
            type: 'danger',
            placement: {
                from: "top",
                align: "center"
            },
            delay: 3000
        });
    }

    // 销毁组件
    destroy() {
        // 清理定时器
        if(this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        if(this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // 解绑事件
        this.$container.off();
    }
}

// 页面加载完成后初始化
$(document).ready(function() {
    window.userDashboard = new UserDashboard();
});