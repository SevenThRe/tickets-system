/**
 * DepartmentMembers.js
 * 部门成员管理控制器
 * 实现成员列表管理、绩效分析等功能
 *
 * @author SevenThRe
 * @created 2024-01-06
 */
class DepartmentMembers extends BaseComponent {
    /**
     * 构造函数
     * @constructor
     */
    constructor() {
        super({
            container: '#main',
            events: {
                // 列表相关事件
                'click #searchBtn': '_handleSearch',
                'click #refreshBtn': '_handleRefresh',
                'click #exportBtn': '_handleExport',
                'click .view-member': '_handleViewMember',

                // 筛选事件
                'change #workloadFilter': '_handleFilterChange',
                'change #performanceFilter': '_handleFilterChange',
                'input #searchKeyword': '_handleKeywordSearch',

                // 抽屉事件
                'click #closeDrawerBtn': '_handleCloseDrawer',

                // 图表切换事件
                'click [data-bs-toggle="tab"]': '_handleTabChange'
            }
        });

        // 状态管理
        this.state = {
            loading: false,               // 加载状态
            currentMember: null,          // 当前查看的成员
            members: [],                  // 成员列表数据
            stats: {                      // 统计数据
                overview: {},             // 概览统计
                performance: [],          // 绩效分布
                workload: [],             // 工作量分布
                efficiency: []            // 效率趋势
            },
            pagination: {                 // 分页信息
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {                    // 筛选条件
                keyword: '',              // 搜索关键字
                workload: '',             // 工作量筛选
                performance: '',          // 绩效等级筛选
                startDate: '',            // 开始日期
                endDate: ''               // 结束日期
            }
        };

        // 缓存DOM引用
        this.$memberList = $('#memberTableBody');
        this.$pagination = $('#pagination');
        this.$memberDrawer = $('#memberDrawer');
        this.$totalCount = $('#totalCount');

        // 图表实例
        this.charts = {};

        // 初始化组件
        this.init();
    }

    /**
     * 组件初始化
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // 并行加载数据
            await Promise.all([
                this._loadMembers(),
                this._loadStats()
            ]);

            // 初始化图表
            this._initCharts();

            // 检查URL参数
            this._checkUrlParams();

            // 启动自动刷新
            this._startAutoRefresh();

        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 加载成员列表数据
     * @private
     * @returns {Promise<void>}
     */
    async _loadMembers() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const {current, pageSize} = this.state.pagination;
            const params = {
                pageNum: current,
                pageSize,
                ...this.state.filters
            };

            const response = await window.requestUtil.get(Const.API.DEPT_MEMBER.GET_LIST, params);

            this.state.members = response.data.list;
            this.state.pagination.total = response.data.total;

            this._renderMemberList();
            this._updatePagination();

        } catch (error) {
            console.error('加载成员列表失败:', error);
            this.showError(error.message || '加载成员列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 加载统计数据
     * @private
     * @returns {Promise<void>}
     */
    async _loadStats() {
        try {
            const [overview, performance, workload, efficiency] = await Promise.all([
                window.requestUtil.get(Const.API.DEPT_MEMBER.GET_STATS),
                window.requestUtil.get(Const.API.DEPT_MEMBER.GET_PERFORMANCE),
                window.requestUtil.get(`${Const.API.DEPT_MEMBER.GET_STATS}/workload`),
                window.requestUtil.get(`${Const.API.DEPT_MEMBER.GET_STATS}/efficiency`)
            ]);

            this.state.stats = {
                overview: overview.data,
                performance: performance.data,
                workload: workload.data,
                efficiency: efficiency.data
            };

            this._updateStats();
        } catch (error) {
            console.error('加载统计数据失败:', error);
            this.showError('加载统计数据失败');
        }
    }

    /**
     * 渲染成员列表
     * @private
     * @description 根据当前状态渲染成员列表，包含工作量、效率等指标的可视化
     */
    _renderMemberList() {
        const html = this.state.members.map(member => {
            // 计算工作量等级和样式
            const workloadClass = this._getWorkloadClass(member.workload);
            const workloadText = this._getWorkloadText(member.workload);

            // 计算效率等级
            const efficiencyPercent = this._calculateEfficiency(member);
            const efficiencyClass = this._getEfficiencyClass(efficiencyPercent);

            // 生成绩效等级标签
            const performanceBadge = this._renderPerformanceBadge(member.performance);

            return `
                <tr>
                    <td>${member.employeeId}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <img src="${member.avatar || '/images/default-avatar.png'}" 
                                 class="avatar-sm me-2" alt="头像">
                            <div>
                                <div class="fw-medium">${member.realName}</div>
                                <small class="text-muted">${member.position}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="workload-indicator">
                            <span class="workload-badge ${workloadClass}">
                                ${member.workload}/${Const.BUSINESS.DEPT_TICKET.MAX_MEMBER_WORKLOAD}
                            </span>
                            <small>${workloadText}</small>
                        </div>
                    </td>
                    <td>
                        <div class="efficiency-indicator">
                            <div class="efficiency-bar">
                                <div class="efficiency-progress ${efficiencyClass}"
                                     style="width: ${efficiencyPercent}%"></div>
                            </div>
                            <small>${efficiencyPercent}%</small>
                        </div>
                    </td>
                    <td>${member.avgProcessTime}小时</td>
                    <td>${member.satisfaction.toFixed(1)}</td>
                    <td>${performanceBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary view-member" 
                                data-id="${member.userId}">
                            <i class="bi bi-eye"></i> 详情
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        this.$memberList.html(html || '<tr><td colspan="8" class="text-center">暂无成员数据</td></tr>');
        this.$totalCount.text(this.state.pagination.total);
    }

    /**
     * 获取工作量等级样式
     * @private
     * @param {number} workload - 当前工作量
     * @returns {string} 样式类名
     */
    _getWorkloadClass(workload) {
        const maxWorkload = Const.BUSINESS.DEPT_TICKET.MAX_MEMBER_WORKLOAD;
        const percent = (workload / maxWorkload) * 100;

        if (percent >= 90) return 'workload-high';
        if (percent >= 70) return 'workload-normal';
        return 'workload-low';
    }

    /**
     * 获取工作量描述文本
     * @private
     * @param {number} workload - 当前工作量
     * @returns {string} 描述文本
     */
    _getWorkloadText(workload) {
        const maxWorkload = Const.BUSINESS.DEPT_TICKET.MAX_MEMBER_WORKLOAD;
        const percent = (workload / maxWorkload) * 100;

        if (percent >= 90) return '工作量较重';
        if (percent >= 70) return '工作量适中';
        return '可接收任务';
    }

    /**
     * 计算处理效率
     * @private
     * @param {Object} member - 成员数据
     * @returns {number} 效率百分比
     */
    _calculateEfficiency(member) {
        // 基于平均处理时间、及时率等计算效率分数
        const timeScore = Math.max(0, 100 - (member.avgProcessTime / 24) * 100);
        const rateScore = member.completionRate * 100;

        // 综合评分，时间占比40%，完成率占比60%
        return Math.round((timeScore * 0.4 + rateScore * 0.6) * 100) / 100;
    }

    /**
     * 获取效率等级样式
     * @private
     * @param {number} percent - 效率百分比
     * @returns {string} 样式类名
     */
    _getEfficiencyClass(percent) {
        if (percent >= 90) return 'bg-success';
        if (percent >= 70) return 'bg-primary';
        if (percent >= 50) return 'bg-warning';
        return 'bg-danger';
    }

    /**
     * 渲染绩效等级标签
     * @private
     * @param {string} performance - 绩效等级
     * @returns {string} HTML字符串
     */
    _renderPerformanceBadge(performance) {
        const gradeMap = Const.BUSINESS.DEPT_PERFORMANCE.RATING_MAP;
        return `
            <span class="performance-badge performance-${performance.toLowerCase()}">
                ${performance}
            </span>
            <small class="ms-1 text-muted">${gradeMap.text[performance]}</small>
        `;
    }

    /**
     * 更新统计数据显示
     * @private
     */
    _updateStats() {
        const {overview} = this.state.stats;

        // 更新统计卡片
        $('#totalMembers').text(overview.totalMembers);
        $('#avgWorkload').text(overview.avgWorkload.toFixed(1));
        $('#avgEfficiency').text(overview.avgEfficiency.toFixed(1) + '%');
        $('#avgSatisfaction').text(overview.avgSatisfaction.toFixed(1));

        // 重新渲染图表
        this._updateCharts();
    }

    /**
     * 更新分页器
     * @private
     */
    _updatePagination() {
        const {current, pageSize, total} = this.state.pagination;
        // 使用PaginationUtil工具类生成分页HTML
        const html = PaginationUtil.generateHTML({
            current,
            pageSize,
            total,
            maxButtons: 5,
            firstText: '首页',
            lastText: '末页',
            prevText: '上一页',
            nextText: '下一页'
        });

        this.$pagination.html(html);

        // 绑定分页点击事件
        PaginationUtil.bindEvents(this.$pagination, (page) => {
            this.state.pagination.current = page;
            this._loadMembers();
        });
    }

    /**
     * 初始化图表
     * @private
     * @description 初始化所有统计图表,包括绩效分布、工作量分布和效率趋势图
     */
    _initCharts() {
        // 绩效分布饼图
        this.charts.performance = new Chart(
            document.getElementById('performanceDistChart').getContext('2d'),
            {
                type: 'doughnut',
                data: this._getPerformanceChartData(),
                options: this._getPerformanceChartOptions()
            }
        );

        // 工作量分布柱状图
        this.charts.workload = new Chart(
            document.getElementById('workloadDistChart').getContext('2d'),
            {
                type: 'bar',
                data: this._getWorkloadChartData(),
                options: this._getWorkloadChartOptions()
            }
        );

        // 效率趋势线图
        this.charts.efficiency = new Chart(
            document.getElementById('efficiencyTrendChart').getContext('2d'),
            {
                type: 'line',
                data: this._getEfficiencyChartData(),
                options: this._getEfficiencyChartOptions()
            }
        );
    }

    /**
     * 获取绩效分布图数据
     * @private
     * @returns {Object} Chart.js数据配置对象
     */
    _getPerformanceChartData() {
        const {performance} = this.state.stats;
        return {
            labels: Object.keys(Const.BUSINESS.DEPT_PERFORMANCE.RATING_MAP.text),
            datasets: [{
                data: performance,
                backgroundColor: [
                    '#10b981', // A级-绿色
                    '#3b82f6', // B级-蓝色
                    '#f59e0b', // C级-橙色
                    '#ef4444'  // D级-红色
                ],
                borderWidth: 0
            }]
        };
    }

    /**
     * 获取绩效分布图配置
     * @private
     * @returns {Object} Chart.js配置对象
     */
    _getPerformanceChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        // 自定义图例标签显示
                        generateLabels: (chart) => {
                            const data = chart.data;
                            const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);

                            return data.labels.map((label, index) => ({
                                text: `${label} - ${data.datasets[0].data[index]}人 (${
                                    ((data.datasets[0].data[index] / total) * 100).toFixed(1)
                                }%)`,
                                fillStyle: data.datasets[0].backgroundColor[index],
                                hidden: false,
                                index: index
                            }));
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value}人 (${percentage}%)`;
                        }
                    }
                }
            }
        };
    }

    /**
     * 获取工作量分布图数据
     * @private
     * @returns {Object} Chart.js数据配置对象
     */
    _getWorkloadChartData() {
        const {workload} = this.state.stats;
        return {
            labels: ['1-2', '3-4', '>=5'],
            datasets: [{
                label: '人数',
                data: workload,
                backgroundColor: [
                    'rgba(16, 185, 129, 0.6)',  // 低工作量-浅绿
                    'rgba(59, 130, 246, 0.6)',  // 中等工作量-浅蓝
                    'rgba(239, 68, 68, 0.6)'    // 高工作量-浅红
                ],
                borderColor: [
                    '#10b981',  // 低工作量-深绿
                    '#3b82f6',  // 中等工作量-深蓝
                    '#ef4444'   // 高工作量-深红
                ],
                borderWidth: 1
            }]
        };
    }

    /**
     * 获取工作量分布图配置
     * @private
     * @returns {Object} Chart.js配置对象
     */
    _getWorkloadChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.raw}人`
                    }
                }
            }
        };
    }

    /**
     * 获取效率趋势图数据
     * @private
     * @returns {Object} Chart.js数据配置对象
     */
    _getEfficiencyChartData() {
        const {efficiency} = this.state.stats;
        return {
            labels: efficiency.map(item => item.date),
            datasets: [
                {
                    label: '平均处理时长(小时)',
                    data: efficiency.map(item => item.avgProcessTime),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    yAxisID: 'y1'
                },
                {
                    label: '及时完成率(%)',
                    data: efficiency.map(item => item.completionRate * 100),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'y2'
                }
            ]
        };
    }

    /**
     * 获取效率趋势图配置
     * @private
     * @returns {Object} Chart.js配置对象
     */
    _getEfficiencyChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '平均处理时长(小时)'
                    }
                },
                y2: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: '及时完成率(%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        };
    }

    /**
     * 更新统计图表
     * @private
     * @description 根据最新的统计数据更新所有图表的显示
     */
    _updateCharts() {
        // 更新绩效分布图
        this.charts.performance.data = this._getPerformanceChartData();
        this.charts.performance.update();

        // 更新工作量分布图
        this.charts.workload.data = this._getWorkloadChartData();
        this.charts.workload.update();

        // 更新效率趋势图
        this.charts.efficiency.data = this._getEfficiencyChartData();
        this.charts.efficiency.update();
    }

    //TODO: 事件处理和组件清理相关的实现。
}