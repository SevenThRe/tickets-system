/**
 * 部门工作台管理类
 * 处理部门工单统计、工单管理和成员状态监控
 */
class DepartmentDashboard {
    constructor() {
        // 状态管理
        this.state = {
            loading: false,
            tickets: [],
            members: [],
            currentTicket: null,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {
                keyword: '',
                status: '',
                priority: '',
                processorId: ''
            },
            stats: {
                pendingCount: 0,
                processingCount: 0,
                completedCount: 0,
                avgSatisfaction: 0
            },
            departmentInfo: JSON.parse(localStorage.getItem('departmentInfo') || '{}'),
            userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}'),
            memberWorkload: [],
            workloadStats: null,
            memberOnlineStatus: new Map() // 保存成员在线状态


        };
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        this.heartbeatManager = new HeartbeatManager(userInfo.userId);

        // DOM元素缓存
        this.elements = {
            container: $('#main'),
            ticketList: $('#ticketList'),
            memberList: $('#memberList'),
            searchForm: $('#searchForm'),
            pagination: $('#pagination'),
            totalCount: $('#totalCount'),
            assignModal: new bootstrap.Modal($('#assignModal')[0]),
            ticketDetail: $('.ticket-detail-panel'),
            warningContainer: $('#warningContainer')
        };

        // 常量定义
        this.CONSTANTS = {
            REFRESH_INTERVAL: 300000,
            WORKLOAD_LIMIT: 5,
            HEARTBEAT_INTERVAL: 30000,
            WORKLOAD_CHECK_INTERVAL: 60000,
            WARNING_CHECK_INTERVAL: 120000,
            EFFICIENCY_WEIGHTS: {
                'A': 40,
                'B': 30,
                'C': 20,
                'D': 10
            }
        };



        // 在线状态管理器
        this.heartbeatManager = new HeartbeatManager();

        // 定时器引用
        this.refreshTimer = null;
        this.checkWarningTimer = null;
        this.workloadTimer = null;

        // 初始化组件
        this.init();
    }


    /**
     * 初始化方法
     */
    async init() {
        try {
            // 先加载用户信息和部门信息
            await this._initUserAndDepartmentInfo();

            // 加载主要数据
            await Promise.all([
                this._loadDepartmentStats(),
                this._loadMembers(),
                this._loadTickets(),
                this._loadUserPermissions()
            ]);

            // 启动自动刷新和心跳检测
            this._startAutoRefresh();
            this._startHeartbeat();

            // 绑定事件
            this._bindEvents();

        } catch (error) {
            console.error('初始化失败:', error);
            NotifyUtil.error('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 初始化用户和部门信息
     */
    async _initUserAndDepartmentInfo() {
        // 从localStorage获取基本信息
        this.state.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        this.state.departmentInfo = JSON.parse(localStorage.getItem('departmentInfo') || '{}');

        if (!this.state.departmentInfo.departmentId) {
            // 如果没有部门信息，需要获取用户的部门信息
            try {
                const response = await $.ajax({
                    url: '/api/departments/detail',
                    method: 'GET',
                    data: {
                        userId: this.state.userInfo.userId
                    }
                });

                if (response.code === 200) {
                    this.state.departmentInfo = response.data;
                    localStorage.setItem('departmentInfo', JSON.stringify(response.data));
                } else {
                    throw new Error('获取部门信息失败');
                }
            } catch (error) {
                console.error('获取部门信息失败:', error);
                throw error;
            }
        }
    }

    /**
     * 获取当前用户权限信息
     */
    async _loadUserPermissions() {
        try {
            const response = await $.ajax({
                url: '/api/user/permissions',
                method: 'GET'
            });

            if (response.code === 200) {
                this.state.permissions = response.data;
            }
        } catch (error) {
            console.error('加载用户权限失败:', error);
            NotifyUtil.error('加载权限信息失败');
        }
    }



    /**
     * 绑定事件处理
     */
    _bindEvents() {
        // 搜索表单提交
        this.elements.searchForm.on('submit', (e) => this._handleSearch(e));

        // 刷新按钮
        $('#refreshBtn').on('click', () => this._handleRefresh());

        // 工单列表操作
        this.elements.ticketList
            .on('click', '.view-ticket', (e) => {
                const ticketId = $(e.currentTarget).data('id');
                this._loadTicketDetail(ticketId);
            })
            .on('click', '.assign-ticket', (e) => {
                const ticketId = $(e.currentTarget).data('id');
                this._showAssignModal(ticketId);
            });

        // 表单筛选变化
        this.elements.searchForm.find('select, input').on('change keyup', (e) => {
            if (this.searchTimer) clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this._handleSearch(e), 500);
        });

        // 工单分配确认
        $('#confirmAssignBtn').on('click', () => this._handleAssignTicket());

        // 自动分配按钮
        $('#autoAssignBtn').on('click', () => this._handleAutoAssign());

        // 关闭详情面板
        $('#closeDetailBtn').on('click', () => {
            this.elements.ticketDetail.removeClass('show');
            this.state.currentTicket = null;
        });

        // 工单状态切换
        $('.update-status').on('click', (e) => {
            const status = $(e.currentTarget).data('status');
            const content = $('#statusNote').val().trim();
            if (content && this.state.currentTicket) {
                this._updateTicketStatus(this.state.currentTicket.ticketId, status, content);
            }
        });
    }

    /**
     * 加载部门统计数据
     */
    // 修改加载部门统计数据方法
    async _loadDepartmentStats() {
        if (!this.state.departmentInfo?.departmentId) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/departments/stats`,
                method: 'GET',
                data: {
                    departmentId: this.state.departmentInfo.departmentId
                }
            });

            if (response.code === 200) {
                this.state.stats = response.data;
                this._updateStatsDisplay();
            } else {
                NotifyUtil.error(response.msg || '加载统计数据失败');
            }
        } catch (error) {
            console.error('加载部门统计失败:', error);
            NotifyUtil.error('加载统计数据失败');
        }
    }

    async _loadTickets() {
        if (!this.state.departmentInfo?.departmentId) {
            return;
        }

        try {
            const params = {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
                departmentId: this.state.departmentInfo.departmentId,
                ...this.state.filters
            };

            const response = await $.ajax({
                url: '/api/tickets/department/list',
                method: 'GET',
                data: params
            });

            if (response.code === 200) {
                this.state.tickets = response.data.list;
                this.state.pagination.total = response.data.total;
                this._renderTicketList();
                this._renderPagination();
            }
        } catch (error) {
            console.error('加载工单列表失败:', error);
            NotifyUtil.error('加载工单列表失败');
        }
    }

    _renderTicketList() {
        if (!this.state.tickets.length) {
            this.elements.ticketList.html(
                '<tr><td colspan="7" class="text-center">暂无工单数据</td></tr>'
            );
            this.elements.totalCount.text('0');
            return;
        }

        const html = this.state.tickets.map(ticket => `
        <tr>
            <td>${ticket.ticketId}</td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="priority-indicator priority-${this._getPriorityClass(ticket.priority)}"></span>
                    <div class="ticket-title-wrap">
                        <span class="ticket-title">${this._escapeHtml(ticket.title)}</span>
                        ${ticket.isUrgent ? '<span class="badge bg-danger ms-2">紧急</span>' : ''}
                        ${this._isNearDeadline(ticket) ? '<span class="badge bg-warning ms-2">即将超时</span>' : ''}
                    </div>
                </div>
            </td>
            <td>
                <div class="processor-info" data-id="${ticket.processorId || ''}">
                    ${ticket.processorName || '-'}
                    ${ticket.processorId ? `
                        <span class="status-dot ${this.isOnline(ticket.processorId) ? 'online' : 'offline'}"></span>
                    ` : ''}
                </div>
            </td>
            <td>
                <span class="badge bg-${this._getStatusClass(ticket.status)}">
                    ${this._getStatusText(ticket.status)}
                </span>
            </td>
            <td>
                <span class="priority-badge priority-${this._getPriorityClass(ticket.priority)}">
                    ${this._getPriorityText(ticket.priority)}
                </span>
            </td>
            <td>${this._formatDate(ticket.createTime)}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary view-ticket" 
                            data-id="${ticket.ticketId}">
                        <i class="bi bi-eye"></i> 查看
                    </button>
                    ${!ticket.processorId ? `
                        <button class="btn btn-sm btn-outline-success assign-ticket" 
                                data-id="${ticket.ticketId}">
                            <i class="bi bi-person-plus"></i> 分配
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');

        this.elements.ticketList.html(html);
        this.elements.totalCount.text(this.state.pagination.total);
    }

    _renderPagination() {
        const { current, total, pageSize } = this.state.pagination;
        const totalPages = Math.ceil(total / pageSize);

        if (totalPages <= 1) {
            this.elements.pagination.empty();
            return;
        }

        let html = `
        <li class="page-item ${current === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${current - 1}">上一页</a>
        </li>
    `;

        // 显示页码
        for (let i = Math.max(1, current - 2); i <= Math.min(totalPages, current + 2); i++) {
            html += `
            <li class="page-item ${current === i ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
        }

        html += `
        <li class="page-item ${current === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${current + 1}">下一页</a>
        </li>
    `;

        this.elements.pagination.html(html);

        // 绑定分页事件
        this.elements.pagination.find('.page-link').on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && page !== current && page > 0 && page <= totalPages) {
                this.state.pagination.current = page;
                this._loadTickets();
            }
        });
    }

    /**
     * 更新统计显示
     */
    _updateStatsDisplay() {
        const { pendingCount, processingCount, completedCount, avgSatisfaction } = this.state.stats;

        // 更新数字统计
        $('#pendingCount').text(pendingCount || 0);
        $('#processingCount').text(processingCount || 0);
        $('#completedCount').text(completedCount || 0);
        $('#avgSatisfaction').text((avgSatisfaction || 0).toFixed(1));

        // 更新趋势指示器
        this._updateTrendIndicators();
    }

    /**
     * 更新趋势指示器
     */
    _updateTrendIndicators() {
        const stats = this.state.stats;
        if (!stats || !stats.trends) return;

        // 待处理工单趋势
        const pendingTrend = stats.trends.pending;
        this._updateTrendDisplay('#pendingTrend', pendingTrend, '较昨日');

        // 处理中工单趋势
        const processingTrend = stats.trends.processing;
        this._updateTrendDisplay('#processingTrend', processingTrend, '较昨日');

        // 完成工单趋势
        const completedTrend = stats.trends.completed;
        this._updateTrendDisplay('#completedTrend', completedTrend, '较上月');

        // 满意度趋势
        const satisfactionTrend = stats.trends.satisfaction;
        this._updateTrendDisplay('#satisfactionTrend', satisfactionTrend, '', true);
    }

    /**
     * 更新单个趋势显示
     */
    _updateTrendDisplay(selector, trend, prefix, isPositiveGood = false) {
        const $element = $(selector);
        if (!$element.length || trend === undefined) return;

        const value = trend.toFixed(1);
        const isPositive = trend > 0;
        const isGood = isPositiveGood ? isPositive : !isPositive;

        $element.html(`
        <span class="trend-icon">
            <i class="bi bi-arrow-${isPositive ? 'up' : 'down'}"></i>
        </span>
        <span class="trend-text ${isGood ? 'positive' : 'negative'}">
            ${prefix} ${isPositive ? '+' : ''}${value}%
        </span>
    `);
    }


    /**
     * 加载部门成员列表
     */
    async _loadMembers() {
        try {
            const [membersResponse, workloadResponse] = await Promise.all([
                $.ajax({
                    url: `/api/departments/members`,
                    method: 'GET',
                    data: {
                        departmentId: this.state.departmentInfo.departmentId
                    }
                }),
                $.ajax({
                    url: `/api/departments/member-workload`,
                    method: 'GET',
                    data: {
                        departmentId: this.state.departmentInfo.departmentId
                    }
                })
            ]);

            if (membersResponse.code === 200 && workloadResponse.code === 200) {
                this.state.members = membersResponse.data;
                this.state.memberWorkload = workloadResponse.data;
                this._renderMemberList();
                this._updateProcessorFilter();
            }
        } catch (error) {
            console.error('加载部门成员数据失败:', error);
            NotifyUtil.error('加载成员数据失败');
        }
    }

    _renderMemberList() {
        if (!this.state.members.length) {
            this.elements.memberList.html('<div class="empty-state">暂无成员数据</div>');
            return;
        }

        const html = this.state.members.map(member => {
            const workload = this.state.memberWorkload?.find(w => w.userId === member.userId);
            const isOnline = this.heartbeatManager.isOnline(member.userId);
            return `
            <div class="member-card" data-id="${member.userId}">
                <div class="member-info">
                    <div class="member-name">
                        <span class="status-indicator ${isOnline ? 'online' : 'offline'}"></span>
                        ${member.realName}
                    </div>
                    <div class="member-role">${member.roleName || '-'}</div>
                </div>
                <div class="member-stats">
                    <div class="stat-item">
                        <label>当前工作量</label>
                        <div>${workload?.currentCount || 0}</div>
                    </div>
                    <div class="stat-item">
                        <label>处理效率</label>
                        <div class="efficiency ${member.processingEfficiency?.toLowerCase()}">${member.processingEfficiency || '-'}</div>
                    </div>
                    <div class="stat-item">
                        <label>满意度</label>
                        <div>${this._renderSatisfactionDisplay(member.satisfaction)}</div>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        this.elements.memberList.html(html);
    }

    /**
     * 加载成员工作量数据
     */
    async _loadMemberWorkload() {
        try {
            const response = await $.ajax({
                url: '/api/departments/member-workload',
                method: 'GET',
                data: {
                    departmentId: this.state.departmentInfo.departmentId
                }
            });

            if(response.code === 200) {
                this.state.memberWorkload = response.data;
                this._updateMemberWorkloadDisplay();
            }
        } catch(error) {
            console.error('加载工作量数据失败:', error);
        }
    }



    /**
     * 更新处理人筛选下拉框
     */
    _updateProcessorFilter() {
        const options = this.state.members
            .filter(member => this.heartbeatManager.isOnline(member.userId))
            .map(member => {
                const workload = this.state.memberWorkload?.find(w => w.userId === member.userId);
                const currentWorkload = workload?.currentCount || 0;
                return `
                <option value="${member.userId}">
                    ${member.realName} (当前工作量: ${currentWorkload})
                </option>
            `;
            })
            .join('');

        $('#processorFilter, #assignProcessor').each(function() {
            $(this).html('<option value="">请选择处理人</option>' + options);
        });
    }

    /**
     * 加载工单详情
     */
    async _loadTicketDetail(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/department/${ticketId}/detail`,
                method: 'GET'
            });

            if (response.code === 200) {
                this.state.currentTicket = response.data;
                this._renderTicketDetail();
                await this._loadTicketRecords(ticketId);
                this.elements.ticketDetail.addClass('show');
            }
        } catch (error) {
            console.error('加载工单详情失败:', error);
            NotifyUtil.error('加载详情失败');
        }
    }

    /**
     * 加载工单处理记录
     */
    async _loadTicketRecords(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}/records`,
                method: 'GET'
            });

            if(response.code === 200) {
                this._renderTicketTimeline(response.data);
            }
        } catch(error) {
            console.error('加载处理记录失败:', error);
            NotifyUtil.error('加载处理记录失败');
        }
    }

    /**
     * 渲染工单详情
     */
    _renderTicketDetail() {
        const ticket = this.state.currentTicket;
        if(!ticket) return;

        const detailHtml = `
        <div class="ticket-detail-header">
            <div class="d-flex justify-content-between align-items-center">
                <div class="ticket-badges">
                    <span class="badge bg-${this._getStatusClass(ticket.status)}">
                        ${this._getStatusText(ticket.status)}
                    </span>
                    <span class="badge bg-${this._getPriorityClass(ticket.priority)}">
                        ${this._getPriorityText(ticket.priority)}
                    </span>
                    ${ticket.isUrgent ? '<span class="badge bg-danger">紧急</span>' : ''}
                </div>
                <button class="btn-close" id="closeDetailBtn"></button>
            </div>
            <h5 class="ticket-title mt-3">${this._escapeHtml(ticket.title)}</h5>
        </div>
        
        <div class="ticket-info mt-4">
            <div class="info-grid">
                <div class="info-item">
                    <label>工单编号</label>
                    <div>${ticket.ticketId}</div>
                </div>
                <div class="info-item">
                    <label>创建时间</label>
                    <div>${this._formatDate(ticket.createTime)}</div>
                </div>
                <div class="info-item">
                    <label>处理人</label>
                    <div>${ticket.processorName || '未分配'}</div>
                </div>
                <div class="info-item">
                    <label>期望完成时间</label>
                    <div>${this._formatDate(ticket.expectFinishTime)}</div>
                </div>
            </div>
            
            <div class="ticket-content mt-4">
                <label>工单内容</label>
                <div class="content-box">
                    ${this._escapeHtml(ticket.content)}
                </div>
            </div>

            ${ticket.attachments?.length ? `
                <div class="ticket-attachments mt-4">
                    <label>附件</label>
                    <div class="attachment-list">
                        ${this._renderAttachments(ticket.attachments)}
                    </div>
                </div>
            ` : ''}
        </div>
        
        <div class="ticket-timeline mt-4">
            <h6>处理记录</h6>
            <div id="ticketRecords" class="timeline-container">
                <!-- 处理记录将通过_renderTicketTimeline方法动态加载 -->
            </div>
        </div>
    `;

        this.elements.ticketDetail.html(detailHtml);
    }

    _handleSearch(e) {
        e?.preventDefault();

        const formData = new FormData(this.elements.searchForm[0]);
        this.state.filters = {
            keyword: formData.get('keyword') || '',
            status: formData.get('status') || '',
            priority: formData.get('priority') || '',
            processorId: formData.get('processorId') || ''
        };

        this.state.pagination.current = 1;
        this._loadTickets();
    }

    async _updateTicketStatus(ticketId, status, content) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}/status`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    status,
                    content,
                    operatorId: this.state.userInfo.userId
                })
            });

            if (response.code === 200) {
                NotifyUtil.success('状态更新成功');
                await this._loadTicketDetail(ticketId);
                await this._handleRefresh();
            }
        } catch (error) {
            console.error('更新工单状态失败:', error);
            NotifyUtil.error('更新状态失败');
        }
    }

    _showAssignModal(ticketId) {
        this.state.currentTicket = this.state.tickets.find(t => t.ticketId === ticketId);
        $('#assignNote').val('');
        $('#assignProcessor').val('');
        this.elements.assignModal.show();
    }

    /**
     * 渲染处理记录时间线
     */
    _renderTicketTimeline(records) {
        // 直接使用工具类的渲染方法
        TicketUtil.renderTimeline(records, 'ticketRecords');
    }

    /**
     * 工单分配相关功能
     */
    async _handleAssignTicket() {
        const processorId = $('#assignProcessor').val();
        const note = $('#assignNote').val().trim();

        if(!processorId) {
            NotifyUtil.warning('请选择处理人');
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.ticketId}/assign`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    processorId,
                    note,
                    assignerId: this.state.userInfo.userId
                })
            });

            if(response.code === 200) {
                NotifyUtil.success('工单分配成功');
                this.elements.assignModal.hide();
                await this._handleRefresh();
                await this._loadTicketDetail(this.state.currentTicket.ticketId);
            }
        } catch(error) {
            console.error('分配工单失败:', error);
            NotifyUtil.error('分配失败，请重试');
        }
    }

    /**
     * 智能工单分配
     */
    async _handleAutoAssign() {
        const availableProcessors = this._getAvailableProcessors();
        if(availableProcessors.length === 0) {
            NotifyUtil.warning('当前没有合适的处理人可分配');
            return;
        }

        const bestProcessor = this._getBestProcessor(availableProcessors);

        if(confirm(`系统建议将工单分配给 ${bestProcessor.realName}，是否确认？`)) {
            $('#assignProcessor').val(bestProcessor.userId);
            $('#assignNote').val('系统智能分配');
            await this._handleAssignTicket();
        }
    }

    /**
     * 获取可用处理人列表
     */
    _getAvailableProcessors() {
        return this.state.members.filter(member => {
            if(!this.heartbeatManager.isOnline(member.userId)) return false;

            const workload = this.state.memberWorkload?.find(w => w.userId === member.userId);
            return !workload || workload.currentCount < this.CONSTANTS.WORKLOAD_LIMIT;
        });
    }

    /**
     * 选择最佳处理人
     */
    _getBestProcessor(processors) {
        return processors.map(processor => {
            const workload = this.state.memberWorkload?.find(w => w.userId === processor.userId);
            const score = this._calculateAssignmentScore(processor, workload);
            return { ...processor, score };
        }).sort((a, b) => b.score - a.score)[0];
    }

    /**
     * 计算分配得分
     */
    _calculateAssignmentScore(processor, workload) {
        // 工作量评分（满分40分）
        const workloadScore = workload ?
            Math.max(0, 40 - (workload.currentCount * 8)) : 40;

        // 效率评分（满分40分）
        const efficiencyScore = this.CONSTANTS.EFFICIENCY_WEIGHTS[processor.processingEfficiency] || 20;

        // 满意度评分（满分20分）
        const satisfactionScore = Math.min(20, (workload?.avgSatisfaction || 0) * 4);

        return workloadScore + efficiencyScore + satisfactionScore;
    }

    /**
     * 工单预警检查
     */
    _checkWarningConditions() {
        const warnings = [];

        // 检查积压工单
        const pendingCount = this.state.stats.pendingCount || 0;
        if(pendingCount > 10) {
            warnings.push({
                type: 'warning',
                message: `当前有${pendingCount}个待处理工单，请及时分配`
            });
        }

        // 检查即将超时工单
        const nearDeadlineTickets = this._getNearDeadlineTickets();
        if(nearDeadlineTickets.length > 0) {
            warnings.push({
                type: 'danger',
                message: `有${nearDeadlineTickets.length}个工单即将超时，请优先处理`
            });
        }

        // 检查人员工作量
        const overloadedMembers = this._getOverloadedMembers();
        if(overloadedMembers.length > 0) {
            warnings.push({
                type: 'warning',
                message: `${overloadedMembers.map(m => m.realName).join('、')}等成员工作量过高`
            });
        }

        this._showWarnings(warnings);
    }

    /**
     * 渲染满意度评分
     */
    _renderSatisfactionDisplay(score) {
        if(!score) return 'N/A';
        const displayHtml = Array(5).fill(0)
            .map((_, i) => `
            <i class="bi bi-star${i < score ? '-fill' : ''} text-warning"></i>
        `).join('');
        return `<div class="satisfaction-stars">${displayHtml}</div>`;
    }
    /**
     * 获取时间线节点样式
     */
    _getTimelinePointClass(operationType) {
        const classMap = {
            0: 'create',    // 创建
            1: 'assign',    // 分配
            2: 'process',   // 处理
            3: 'complete',  // 完成
            4: 'close',     // 关闭
            5: 'transfer'   // 转交
        };
        return `timeline-point ${classMap[operationType] || 'default'}`;
    }


    /**
     * 渲染附件列表
     */
    _renderAttachments(attachments) {
        if(!attachments?.length) return '';

        return attachments.map(attachment => `
        <div class="attachment-item">
            <i class="bi ${this._getFileIconClass(attachment.fileName)}"></i>
            <span class="attachment-name">${TicketUtil.escapeHtml(attachment.fileName)}</span>
            <span class="attachment-size">${TicketUtil.formatFileSize(attachment.fileSize)}</span>
            <div class="attachment-actions">
                <button class="btn btn-sm btn-link" onclick="departmentDashboard.downloadAttachment('${attachment.filePath}')">
                    <i class="bi bi-download"></i>
                </button>
                <button class="btn btn-sm btn-link" onclick="departmentDashboard.previewAttachment('${attachment.filePath}')">
                    <i class="bi bi-eye"></i>
                </button>
            </div>
        </div>
    `).join('');
    }

    /**
     * 获取文件图标
     */
    _getFileIconClass(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const iconMap = {
            pdf: 'bi-file-pdf',
            doc: 'bi-file-word',
            docx: 'bi-file-word',
            xls: 'bi-file-excel',
            xlsx: 'bi-file-excel',
            jpg: 'bi-file-image',
            jpeg: 'bi-file-image',
            png: 'bi-file-image'
        };
        return iconMap[ext] || 'bi-file-text';
    }

    /**
     * 处理状态变更回调
     */
    onStatusChange(callback) {
        this.heartbeatManager.subscribe(callback);
    }


    /**
     * 刷新数据
     */
    async _handleRefresh() {
        TicketUtil.showLoading();
        try {
            await Promise.all([
                this._loadDepartmentStats(),
                this._loadMembers(),
                this._loadTickets()
            ]);
            NotifyUtil.success('数据已更新');
        } catch(error) {
            console.error('刷新数据失败:', error);
            NotifyUtil.error('刷新失败，请重试');
        } finally {
            TicketUtil.hideLoading();
        }
    }


    /**
     * 获取工作量过高的成员
     */
    _getOverloadedMembers() {
        const WORKLOAD_THRESHOLD = 5; // 工作量阈值 默认为5
        return this.state.members.filter(member => {
            const workload = this.state.memberWorkload
                ?.find(w => w.userId === member.userId);
            return workload && workload.currentCount > WORKLOAD_THRESHOLD;
        });
    }

    /**
     * 获取即将超时的工单
     */
    _getNearDeadlineTickets() {
        return this.state.tickets.filter(ticket => {
            if(!ticket.expectFinishTime) return false;
            if(ticket.status === 'COMPLETED' || ticket.status === 'CLOSED') return false;

            const remainingHours = (new Date(ticket.expectFinishTime) - new Date()) / (1000 * 60 * 60);
            return remainingHours > 0 && remainingHours < 24;
        });
    }

    /**
     * 启动自动刷新
     */
    _startAutoRefresh() {
        // 清除可能存在的旧定时器
        if(this.refreshTimer) clearInterval(this.refreshTimer);

        // 设置新的自动刷新定时器
        this.refreshTimer = setInterval(() => {
            this._handleRefresh();
        }, this.CONSTANTS.REFRESH_INTERVAL);
    }

    /**
     * 启动心跳检测
     */
    _startHeartbeat() {
        if (!this.state.userInfo?.userId) {
            console.warn('未获取到用户信息，心跳检测未启动');
            return;
        }

        this.heartbeatManager.start();

        // 使用事件订阅方式监听状态变化
        this.heartbeatManager.subscribe((userId, status) => {
            this._updateMemberStatus(userId, status);
        });
    }

    isOnline(userId) {
        return this.heartbeatManager && this.heartbeatManager.getStatus(userId) === 'online';
    }


    /**
     * 更新成员在线状态显示
     */
    _updateMemberStatus(userId, isOnline) {
        // 更新成员列表中的状态指示器
        $(`.member-card[data-id="${userId}"] .status-indicator`)
            .removeClass('online offline')
            .addClass(isOnline ? 'online' : 'offline');

        // 更新工单列表中的处理人状态
        $(`.processor-info[data-id="${userId}"] .status-dot`)
            .removeClass('online offline')
            .addClass(isOnline ? 'online' : 'offline');
    }

    /**
     * 显示预警信息
     */
    _showWarnings(warnings) {
        const warningHtml = warnings.map(warning => `
        <div class="alert alert-${warning.type} alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle me-2"></i>
            ${warning.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `).join('');

        $('#warningContainer').html(warningHtml);
    }

    /**
     * 工具方法
     */
    _formatDate(dateString) {
        if(!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    _escapeHtml(str) {
        if(!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    _isNearDeadline(ticket) {
        if(!ticket.expectFinishTime) return false;
        const remainingHours = (new Date(ticket.expectFinishTime) - new Date()) / (1000 * 60 * 60);
        return remainingHours > 0 && remainingHours < 24;
    }



    _renderSatisfactionStars(score) {
        return Array(5).fill(0).map((_, index) =>
            `<i class="bi bi-star${index < score ? '-fill' : ''} text-warning"></i>`
        ).join('');
    }

    /**
     * Loading状态管理
     */
    _showLoading() {
        TicketUtil.showLoading();
    }

    _hideLoading() {
        TicketUtil.hideLoading();
    }

    /**
     * 资源清理
     */
    destroy() {
        // 清除所有定时器
        if(this.refreshTimer) clearInterval(this.refreshTimer);
        if(this.checkWarningTimer) clearInterval(this.checkWarningTimer);
        if(this.workloadTimer) clearInterval(this.workloadTimer);

        // 停止心跳检测
        this.heartbeatManager.stop();

        // 清除DOM元素
        if(this.$loading) {
            this.$loading.remove();
        }
    }
}

// 初始化实例
$(document).ready(() => {
    window.departmentDashboard = new DepartmentDashboard();

    // 页面关闭时清理资源
    $(window).on('unload', () => {
        if(window.departmentDashboard) {
            window.departmentDashboard.destroy();
        }
    });
});
$.ajaxSetup({
    complete: function(jqXHR, textStatus) {
        if (jqXHR.status === 401) {
            // 未登录或登录过期
            NotifyUtil.error('登录已过期，请重新登录');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }
    }
});