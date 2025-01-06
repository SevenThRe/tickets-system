/*
/pages/user/js/dashboard.js
*/
/**
 * UserDashboard.js
 * 用户工作台页面控制器
 * 实现工作台的数据加载、统计和展示功能
 */
class UserDashboard extends BaseComponent {
    constructor() {
        super({
            container: '#main',
            events: {
                'click .view-ticket': '_handleViewTicket',
                'click .process-ticket': '_handleProcessTicket'
            }
        });

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

        // 初始化组件
        this.init();
    }

    /**
     * 初始化
     * @returns {Promise<void>}
     */
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
            this.showError('页面加载失败，请刷新重试');
        }
    }

    /**
     * 加载用户信息
     * @private
     */
    async _loadUserInfo() {
        try {
            const response = await window.requestUtil.get(Const.API.USER.GET_CURRENT);
            this.state.userInfo = response.data;
        } catch (error) {
            console.error('加载用户信息失败:', error);
            throw error;
        }
    }

    /**
     * 加载待办工单
     * @private
     */
    async _loadTodoTickets() {
        try {
            const response = await window.requestUtil.get('/api/tickets/todos', {
                pageSize: 5,  // 只加载前5条
                sortField: 'createTime',
                sortOrder: 'desc'
            });
            this.state.todoTickets = response.data;
        } catch (error) {
            console.error('加载待办工单失败:', error);
            throw error;
        }
    }

    /**
     * 加载最近工单
     * @private
     */
    async _loadRecentTickets() {
        try {
            const response = await window.requestUtil.get('/api/tickets/recent', {
                pageSize: 5,  // 只加载前5条
                sortField: 'updateTime',
                sortOrder: 'desc'
            });
            this.state.recentTickets = response.data;
        } catch (error) {
            console.error('加载最近工单失败:', error);
            throw error;
        }
    }

    /**
     * 加载统计数据
     * @private
     */
    async _loadStatistics() {
        try {
            const response = await window.requestUtil.get('/api/tickets/statistics');
            this.state.statistics = response.data;
        } catch (error) {
            console.error('加载统计数据失败:', error);
            throw error;
        }
    }

    /**
     * 更新页面显示
     * @private
     */
    _updateUI() {
        // 更新用户名显示
        $('#userName').text(this.state.userInfo?.realName || '');

        // 更新统计数字
        $('#todoCount').text(this.state.statistics.todoCount);
        $('#totalTickets').text(this.state.statistics.totalTickets);

        // 渲染待办工单列表
        this._renderTodoList();

        // 渲染最近工单列表
        this._renderRecentList();
    }

    /**
     * 渲染待办工单列表
     * @private
     */
    _renderTodoList() {
        const html = this.state.todoTickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                        ${ticket.title}
                    </div>
                </td>
                <td>${Const.BUSINESS.TICKET.PRIORITY_MAP.text[ticket.priority]}</td>
                <td>${window.utils.formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-primary process-ticket" 
                            data-id="${ticket.ticketId}">
                        立即处理
                    </button>
                </td>
            </tr>
        `).join('');

        $('#todoList').html(html || '<tr><td colspan="5" class="text-center">暂无待办工单</td></tr>');
    }

    /**
     * 渲染最近工单列表
     * @private
     */
    _renderRecentList() {
        const html = this.state.recentTickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>${ticket.title}</td>
                <td>
                    <span class="status-badge status-${ticket.status.toLowerCase()}">
                        ${Const.BUSINESS.TICKET.STATUS_MAP.text[ticket.status]}
                    </span>
                </td>
                <td>${window.utils.formatDate(ticket.updateTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" 
                            data-id="${ticket.ticketId}">
                        查看
                    </button>
                </td>
            </tr>
        `).join('');

        $('#recentList').html(html || '<tr><td colspan="5" class="text-center">暂无工单记录</td></tr>');
    }

    /**
     * 处理查看工单
     * @param {Event} e - 事件对象
     * @private
     */
    _handleViewTicket(e) {
        const ticketId = $(e.currentTarget).data('id');
        window.location.href = `/pages/user/my-tickets.html?id=${ticketId}`;
    }

    /**
     * 处理处理工单
     * @param {Event} e - 事件对象
     * @private
     */
    _handleProcessTicket(e) {
        const ticketId = $(e.currentTarget).data('id');
        window.location.href = `/pages/user/todos.html?id=${ticketId}`;
    }

    /**
     * 更新当前时间显示
     * @private
     */
    _updateCurrentTime() {
        const updateTime = () => {
            const now = new Date();
            $('#currentTime').text(window.utils.formatDate(now, 'YYYY年MM月DD日 HH:mm:ss'));
        };

        // 立即更新一次
        updateTime();

        // 每秒更新一次
        setInterval(updateTime, 1000);
    }

    /**
     * 启动自动刷新
     * @private
     */
    _startAutoRefresh() {
        // 每5分钟刷新一次数据
        setInterval(async () => {
            await Promise.all([
                this._loadTodoTickets(),
                this._loadRecentTickets(),
                this._loadStatistics()
            ]);
            this._updateUI();
        }, 5 * 60 * 1000);
    }

    /**
     * 清理组件
     * @public
     */
    destroy() {
        // 清理定时器
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        // 调用父类销毁方法
        super.destroy();
    }
}


// 页面加载完成后初始化
$(document).ready(() => {
    window.userDashboard = new UserDashboard();
});