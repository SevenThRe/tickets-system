/**
 * DepartmentTickets.js
 * 部门工单管理页面控制器
 * 实现工单列表展示、分配、处理等核心功能
 *
 * @author SeventhRe
 * @created 2024-01-06
 */
class DepartmentTickets extends BaseComponent {
    /**
     * 构造函数
     * 初始化组件状态和事件绑定
     */
    constructor() {
        super({
            container: '#main',
            events: {
                'submit #searchForm': '_handleSearch',
                'click #resetBtn': '_handleReset',
                'click #exportBtn': '_handleExport',
                'click #refreshBtn': '_handleRefresh',
                'click #assignTicketBtn': '_showAssignModal',
                'click #confirmAssignBtn': '_handleAssignSubmit',
                'click [data-view]': '_handleViewChange',
                'click .view-ticket': '_handleViewTicket',
                'click #closeDrawerBtn': '_handleCloseDrawer',
                'click #processBtn': '_handleProcess',
                'click #completeBtn': '_handleComplete',
                'click #transferBtn': '_handleTransfer',
                'click #closeBtn': '_handleClose'
            }
        });

        // 状态管理
        this.state = {
            loading: false,           // 加载状态
            currentView: 'list',      // 当前视图模式: list/board
            tickets: [],              // 工单列表数据
            currentTicket: null,      // 当前选中工单
            processors: [],           // 可选处理人列表
            selectedTickets: new Set(),// 选中待分配的工单
            pagination: {             // 分页信息
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {                // 筛选条件
                keyword: '',
                status: '',
                priority: '',
                processorId: '',
                startDate: '',
                endDate: ''
            }
        };

        // 缓存DOM引用
        this._cacheDOMReferences();

        // 初始化模态框
        this.assignModal = new bootstrap.Modal('#assignModal');

        // 初始化组件
        this.init();
    }

    /**
     * 缓存重要的DOM元素引用
     * @private
     */
    _cacheDOMReferences() {
        // 视图容器
        this.$listView = $('#listView');
        this.$boardView = $('#boardView');
        this.$ticketList = $('#ticketList');
        this.$ticketDrawer = $('#ticketDrawer');

        // 看板列容器
        this.$pendingList = $('#pendingList');
        this.$processingList = $('#processingList');
        this.$completedList = $('#completedList');

        // 表单元素
        this.$searchForm = $('#searchForm');
        this.$processorFilter = $('#processorFilter');
    }

    /**
     * 组件初始化
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // 初始化数据加载
            await Promise.all([
                this._loadProcessors(),
                this._loadTickets()
            ]);

            // 初始化处理人下拉选项
            this._renderProcessorOptions();

            // 检查URL参数
            this._checkUrlParams();

            // 监听浏览器历史状态变化
            this._initHistoryListener();

        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面加载失败，请刷新重试');
        }
    }

    /**
     * 加载处理人列表
     * @private
     */
    async _loadProcessors() {
        try {
            const response = await window.requestUtil.get('/api/departments/processors');
            this.state.processors = response.data;
        } catch (error) {
            console.error('加载处理人列表失败:', error);
            throw error;
        }
    }

    /**
     * 加载工单列表
     * @private
     */
    async _loadTickets() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const {current, pageSize} = this.state.pagination;
            // 构建查询参数
            const params = {
                pageNum: current,
                pageSize,
                ...this.state.filters
            };

            // 请求数据
            const response = await window.requestUtil.get('/api/departments/tickets', params);

            // 更新状态
            this.state.tickets = response.data.list;
            this.state.pagination.total = response.data.total;

            // 更新界面
            this._updateTicketsView();
            this._updatePagination();

        } catch (error) {
            console.error('加载工单列表失败:', error);
            this.showError(error.message || '加载工单列表失败，请重试');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染处理人下拉选项
     * @private
     */
    _renderProcessorOptions() {
        const options = this.state.processors.map(user => `
            <option value="${user.userId}">
                ${user.realName} (处理中: ${user.processingCount})
            </option>
        `);

        this.$processorFilter
            .html('<option value="">所有处理人</option>' + options.join(''));
    }

    /**
     * 检查URL参数
     * @private
     */
    _checkUrlParams() {
        const params = new URLSearchParams(window.location.search);

        // 检查工单ID
        const ticketId = params.get('id');
        if (ticketId) {
            this._showTicketDetail(ticketId);
        }

        // 检查视图模式
        const view = params.get('view');
        if (view && (view === 'list' || view === 'board')) {
            this._switchView(view);
        }

        // 检查筛选条件
        this._applyUrlFilters(params);
    }
}