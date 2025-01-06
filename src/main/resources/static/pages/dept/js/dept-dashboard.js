/**
 * DepartmentDashboard.js
 * 部门主管工作台页面控制器
 * 实现部门数据概览、工单统计、成员工作量展示等功能
 *
 * @author SeventhRe
 * @created 2024-01-06
 */
class DepartmentDashboard extends BaseComponent {
    /**
     * 构造函数
     * 初始化组件状态和事件绑定
     */
    constructor() {
        super({
            container: '#main',
            events: {
                'click #refreshBtn': '_handleRefresh',
                'click #assignTicketBtn': '_showAssignModal',
                'click #confirmAssignBtn': '_handleAssignSubmit',
                'click [data-range]': '_handleRangeChange',
                'change #selectAllTickets': '_handleSelectAll',
                'click .view-ticket': '_handleViewTicket'
            }
        });

        // 状态管理
        this.state = {
            loading: false,           // 加载状态
            department: null,         // 部门信息
            statistics: null,         // 统计数据
            members: [],             // 部门成员
            recentTickets: [],       // 最近工单
            unassignedTickets: [],   // 待分配工单
            selectedTickets: new Set(), // 选中的工单
            dateRange: 'week'        // 时间范围：week/month
        };

        // 图表实例
        this.trendChart = null;

        // 初始化模态框
        this.assignModal = new bootstrap.Modal('#assignModal');

        // 初始化组件
        this.init();
    }

    /**
     * 组件初始化
     */
    async init() {
        try {
            // 初始化加载所需数据
            await Promise.all([
                this._loadDepartmentInfo(),
                this._loadDashboardData(),
                this._loadUnassignedTickets()
            ]);

            // 初始化图表
            this._initTrendChart();

            // 渲染页面
            this._updateUI();

            // 启动自动刷新
            this._startAutoRefresh();

        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面加载失败，请刷新重试');
        }
    }

    /**
     * 加载部门基本信息
     * @private
     */
    async _loadDepartmentInfo() {
        try {
            const response = await window.requestUtil.get('/api/departments/current');
            this.state.department = response.data;
        } catch (error) {
            console.error('加载部门信息失败:', error);
            throw error;
        }
    }

    /**
     * 加载仪表盘数据
     * @private
     */
    async _loadDashboardData() {
        try {
            this.state.loading = true;
            this._showLoading();

            // 并行加载各项数据
            const [statsRes, membersRes, ticketsRes] = await Promise.all([
                window.requestUtil.get('/api/departments/statistics'),
                window.requestUtil.get('/api/departments/members/workload'),
                window.requestUtil.get('/api/departments/tickets/recent')
            ]);

            this.state.statistics = statsRes.data;
            this.state.members = membersRes.data;
            this.state.recentTickets = ticketsRes.data;

        } catch (error) {
            console.error('加载仪表盘数据失败:', error);
            throw error;
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 加载待分配工单
     * @private
     */
    async _loadUnassignedTickets() {
        try {
            const response = await window.requestUtil.get('/api/departments/tickets/unassigned');
            this.state.unassignedTickets = response.data;
        } catch (error) {
            console.error('加载待分配工单失败:', error);
            throw error;
        }
    }

    /**
     * 初始化工单趋势图表
     * @private
     */
    _initTrendChart() {
        const ctx = document.getElementById('ticketTrendChart').getContext('2d');

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: this._getTrendChartData(),
            options: {
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
            }
        });
    }

    /**
     * 获取趋势图表数据
     * @private
     * @returns {Object} 图表数据配置
     */
    _getTrendChartData() {
        const { trends } = this.state.statistics;

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
     * 更新UI显示
     * @private
     */
    _updateUI() {
        this._updateDepartmentInfo();
        this._updateStatistics();
        this._updateMemberWorkload();
        this._updateRecentTickets();
        this._updateTrendChart();
    }

    /**
     * 更新部门信息显示
     * @private
     */
    _updateDepartmentInfo() {
        const dept = this.state.department;
        if (!dept) return;

        $('#deptName').text(dept.departmentName);
        $('#managerName').text(dept.managerName);
        $('#memberCount').text(`${dept.memberCount}名成员`);
    }

    /**
     * 更新统计数据显示
     * @private
     */
    _updateStatistics() {
        const stats = this.state.statistics;
        if (!stats) return;

        $('#pendingCount').text(stats.pendingCount);
        $('#processingCount').text(stats.processingCount);
        $('#completedCount').text(stats.completedCount);
        $('#avgHandleTime').text(
            stats.avgHandleTime < 24 ?
                `${stats.avgHandleTime}h` :
                `${(stats.avgHandleTime/24).toFixed(1)}d`
        );
    }

    /**
     * 更新成员工作量显示
     * @private
     */
    _updateMemberWorkload() {
        const html = this.state.members.slice(0, 5).map(member => `
            <div class="member-workload-item">
                <div class="member-avatar">
                    ${member.realName.substring(0, 1)}
                </div>
                <div class="member-info">
                    <div class="member-name">${member.realName}</div>
                    <div class="workload-stats">
                        <small class="text-muted">处理中: ${member.processingCount} | 已完成: ${member.completedCount}</small>
                    </div>
                    <div class="workload-progress mt-1">
                        <div class="progress-bar" style="width: ${member.completionRate}%"></div>
                    </div>
                </div>
            </div>
        `).join('');

        $('#memberWorkloadList').html(html);
    }

    /**
     * 更新最近工单列表
     * @private
     */
    _updateRecentTickets() {
        const html = this.state.recentTickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                        ${ticket.title}
                    </div>
                </td>
                <td>${ticket.processor || '-'}</td>
                <td>
                    <span class="ticket-status status-${ticket.status.toLowerCase()}">
                        ${window.Const.BUSINESS.TICKET.STATUS_MAP.text[ticket.status]}
                    </span>
                </td>
                <td>${window.Const.BUSINESS.TICKET.PRIORITY_MAP.text[ticket.priority]}</td>
                <td>${window.utils.formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" 
                            data-id="${ticket.ticketId}">
                        查看
                    </button>
                </td>
            </tr>
        `).join('');

        $('#recentTicketsList').html(html);
    }

    /**
     * 更新趋势图表
     * @private
     */
    _updateTrendChart() {
        if (!this.trendChart) return;

        this.trendChart.data = this._getTrendChartData();
        this.trendChart.update();
    }

    /**
     * 处理时间范围切换
     * @param {Event} e - 事件对象
     * @private
     */
    async _handleRangeChange(e) {
        const range = $(e.currentTarget).data('range');
        if (range === this.state.dateRange) return;

        $(e.currentTarget)
            .addClass('active')
            .siblings()
            .removeClass('active');

        this.state.dateRange = range;
        await this._loadDashboardData();
        this._updateTrendChart();
    }

    /**
     * 显示工单分配模态框
     * @private
     */
    _showAssignModal() {
        // 重置选择状态
        this.state.selectedTickets.clear();
        $('#selectAllTickets').prop('checked', false);

        // 渲染待分配工单列表
        this._renderUnassignedTickets();

        // 渲染处理人选项
        this._renderAssigneeOptions();

        this.assignModal.show();
    }

    /**
     * 渲染待分配工单列表
     * @private
     */
    _renderUnassignedTickets() {
        const html = this.state.unassignedTickets.map(ticket => `
            <tr>
                <td>
                    <input type="checkbox" class="form-check-input ticket-checkbox" 
                           value="${ticket.ticketId}"
                           ${this.state.selectedTickets.has(ticket.ticketId) ? 'checked' : ''}>
                </td>
                <td>${ticket.code}</td>
                <td>${ticket.title}</td>
                <td>${window.Const.BUSINESS.TICKET.PRIORITY_MAP.text[ticket.priority]}</td>
                <td>${window.utils.formatDate(ticket.createTime)}</td>
            </tr>
        `).join('');

        $('#unassignedTicketsTable tbody').html(html);

        // 绑定复选框事件
        $('.ticket-checkbox').change(e => {
            const ticketId = e.target.value;
            if (e.target.checked) {
                this.state.selectedTickets.add(ticketId);
            } else {
                this.state.selectedTickets.delete(ticketId);
            }
        });
    }

    /**
     * 渲染处理人选项
     * @private
     */
    _renderAssigneeOptions() {
        const options = this.state.members
            .filter(member => member.processingCount < 5)  // 过滤掉工作量过大的成员
            .map(member => `
                <option value="${member.userId}">
                    ${member.realName} (处理中: ${member.processingCount})
                </option>
            `);

        $('#assigneeSelect')
            .html('<option value="">请选择处理人</option>' + options.join(''));
    }

    /**
     * 处理全选/取消全选
     * @param {Event} e - 事件对象
     * @private
     */
    _handleSelectAll(e) {
        const checked = e.target.checked;
        $('.ticket-checkbox').prop('checked', checked);

        if (checked) {
            this.state.selectedTickets = new Set(
                this.state.unassignedTickets.map(t => t.ticketId)
            );
        } else {
            this.state.selectedTickets.clear();
        }
    }

    /**
     * 处理工单分配提交
     * @private
     */
    async _handleAssignSubmit() {
        if (!this.state.selectedTickets.size) {
            this.showError('请选择要分配的工单');
            return;
        }

        const assigneeId = $('#assigneeSelect').val();
        if (!assigneeId) {
            this.showError('请选择处理人');
            return;
        }

        try {
            const data = {
                ticketIds: Array.from(this.state.selectedTickets),
                assigneeId: assigneeId,
                expectFinishTime: $('#expectFinishTime').val() || null,
                note: $('#assignNote').val().trim()
            };

            await window.requestUtil.post('/api/departments/tickets/assign', data);

            this.showSuccess('工单分配成功');
            this.assignModal.hide();

            // 重新加载数据
            await Promise.all([
                this._loadDashboardData(),
                this._loadUnassignedTickets()
            ]);
            this._updateUI();

        } catch (error) {
            console.error('分配工单失败:', error);
            this.showError(error.message || '分配失败，请重试');
        }
    }

    /**
     * 处理工单查看
     * @param {Event} e - 事件对象
     * @private
     */
    _handleViewTicket(e) {
        const ticketId = $(e.currentTarget).data('id');
        window.location.href = `/dept/tickets.html?id=${ticketId}`;
    }

    /**
     * 启动自动刷新
     * @private
     */
    _startAutoRefresh() {
        // 每5分钟刷新一次数据
        this.refreshInterval = setInterval(() => {
            this._loadDashboardData().then(() => {
                this._updateUI();
            });
        }, 5 * 60 * 1000);
    }

    /**
     * 处理手动刷新
     * @private
     */
    async _handleRefresh() {
        try {
            await Promise.all([
                this._loadDepartmentInfo(),
                this._loadDashboardData(),
                this._loadUnassignedTickets()
            ]);
            this._updateUI();
            this.showSuccess('数据刷新成功');
        } catch (error) {
            console.error('刷新数据失败:', error);
            this.showError('刷新失败，请重试');
        }
    }

    /**
     * 销毁组件
     * 清理定时器、事件监听等资源
     * @public
     */
    destroy() {
        // 清除定时刷新
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        // 销毁图表实例
        if (this.trendChart) {
            this.trendChart.destroy();
            this.trendChart = null;
        }

        // 销毁模态框
        if (this.assignModal) {
            this.assignModal.dispose();
            this.assignModal = null;
        }

        // 清理状态
        this.state = null;

        // 调用父类销毁方法
        super.destroy();
    }

    /**
     * 获取刷新间隔时间
     * 根据用户角色返回不同的刷新间隔
     * @private
     * @returns {number} 刷新间隔(毫秒)
     */
    _getRefreshInterval() {
        const { role } = this.state.department;
        switch (role) {
            case window.Const.BASE_ROLE.ADMIN:
                return 3 * 60 * 1000;  // 管理员 3分钟
            case window.Const.BASE_ROLE.DEPT:
                return 5 * 60 * 1000;  // 部门主管 5分钟
            default:
                return 10 * 60 * 1000; // 其他角色 10分钟
        }
    }

    /**
     * 检查工作量是否超限
     * 检查处理人当前工作量是否超过上限
     * @param {string} userId - 用户ID
     * @returns {boolean} 是否超限
     * @private
     */
    _checkWorkloadLimit(userId) {
        const member = this.state.members.find(m => m.userId === userId);
        if (!member) return false;
        return member.processingCount >= window.Const.BUSINESS.TICKET.MAX_PROCESSING_COUNT;
    }

    /**
     * 格式化处理时间
     * 将小时数转换为可读的时间格式
     * @param {number} hours - 小时数
     * @returns {string} 格式化后的时间
     * @private
     */
    _formatHandleTime(hours) {
        if (hours < 24) {
            return `${hours}小时`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return remainingHours > 0 ?
                `${days}天${remainingHours}小时` :
                `${days}天`;
        }
    }

    /**
     * 计算完成率
     * 计算工单完成进度百分比
     * @param {Object} member - 成员数据
     * @returns {number} 完成率百分比
     * @private
     */
    _calculateCompletionRate(member) {
        const total = member.processingCount + member.completedCount;
        if (total === 0) return 0;
        return Math.round((member.completedCount / total) * 100);
    }

    /**
     * 验证分配表单
     * 验证工单分配时的表单数据
     * @returns {boolean} 验证结果
     * @private
     */
    _validateAssignForm() {
        // 验证是否选择了工单
        if (!this.state.selectedTickets.size) {
            this.showError('请选择要分配的工单');
            return false;
        }

        // 验证处理人选择
        const assigneeId = $('#assigneeSelect').val();
        if (!assigneeId) {
            this.showError('请选择处理人');
            return false;
        }

        // 验证工作量
        if (this._checkWorkloadLimit(assigneeId)) {
            this.showError('该处理人当前工作量已达上限');
            return false;
        }

        // 验证期望完成时间
        const expectFinishTime = $('#expectFinishTime').val();
        if (expectFinishTime) {
            const expectDate = new Date(expectFinishTime);
            if (expectDate <= new Date()) {
                this.showError('期望完成时间必须大于当前时间');
                return false;
            }
        }

        return true;
    }

    /**
     * 获取工单分配数据
     * 收集工单分配所需的表单数据
     * @returns {Object} 分配数据
     * @private
     */
    _getAssignFormData() {
        return {
            ticketIds: Array.from(this.state.selectedTickets),
            assigneeId: $('#assigneeSelect').val(),
            expectFinishTime: $('#expectFinishTime').val() || null,
            note: $('#assignNote').val().trim()
        };
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.departmentDashboard = new DepartmentDashboard();
});