/**
 * 工单管理类
 * 负责处理工单的CRUD操作、状态管理、数据加载等核心功能
 */
class TicketManagement {
    /**
     * 构造函数
     * 初始化组件的状态和配置
     */
    constructor() {
        // DOM元素缓存
        this.elements = {
            container: $('#main'),
            ticketList: $('#ticketList'),
            searchForm: $('#searchForm'),
            pagination: $('#pagination'),
            totalCount: $('#totalCount'),
            ticketDetail: $('#ticketDetail'),
            modal: new bootstrap.Modal($('#ticketModal')[0])
        };

        // 状态管理
        this.state = {
            loading: false,          // 加载状态标记
            tickets: [],            // 工单列表数据
            currentTicket: null,    // 当前选中的工单
            pagination: {           // 分页信息
                current: 1,
                pageSize: 3,
                total: 0
            },
            filters: {              // 过滤条件
                keyword: '',
                status: '',
                priority: '',
                departmentId: '',
                assigneeId: '',
                startDate: '',
                endDate: ''
            },
            departments: [],
            assignees: [],
        };

        // 工单状态映射
        this.STATUS_MAP = {
            PENDING: '待处理',
            PROCESSING: '处理中',
            COMPLETED: '已完成',
            CLOSED: '已关闭'
        };
        // 初始化
        this.init();
        this.initPagination();
    }

    /**
     * 组件初始化
     */
    async init() {
        try {
            // 绑定事件处理器
            this.bindEvents();

            // 加载初始数据
            await this.loadTickets();

            // 加载下拉列表
            this._initSearchFrom();


            // 检查URL参数是否需要打开特定工单
            this.checkUrlParams();
        } catch(error) {
            console.error('初始化失败:', error);
            this.showError('页面加载失败，请刷新重试');
        }
    }


    /**
     * 绑定事件处理器
     */
    bindEvents() {
        // 搜索表单提交
        this.elements.searchForm.on('submit', (e) => this.handleSearch(e));

        // 重置按钮点击
        $('#resetBtn').on('click', () => this.handleReset());

        // 创建工单按钮点击
        $('#createTicketBtn').on('click', () => this.showCreateModal());

        // 工单列表点击事件
        this.elements.ticketList.on('click', '.view-ticket', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this.showTicketDetail(ticketId);
        });

        // 分页点击事件
        this.elements.pagination.on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if(page && page !== this.state.pagination.current) {
                this.state.pagination.current = page;
                this.loadTickets();
            }
        });

        // 详情面板关闭按钮
        $('#closeDetailBtn').on('click', () => {
            this.elements.ticketDetail.removeClass('show');
            this.state.currentTicket = null;
        });

        // 工单操作按钮事件
        $('#processBtn').on('click', () => this.handleProcess());
        $('#resolveBtn').on('click', () => this.handleResolve());
        $('#transferBtn').on('click', () => this.handleTransfer());
        $('#closeBtn').on('click', () => this.handleClose());

        // 保存工单按钮点击
        $('#saveTicketBtn').on('click', () => this.handleSaveTicket());
    }

    /**
     * 初始化搜索表单
     * @private
     * @description 初始化搜索表单的部门和处理人下拉框,并处理它们之间的联动关系
     */
    async _initSearchFrom() {
        // 加载部门数据
        await this._loadDepartments();

        // 绑定部门切换事件
        $('#departmentFilter').on('change', async (e) => {
            const departmentId = e.target.value;
            // 将部门ID保存到过滤条件
            this.state.filters.departmentId = departmentId;

            // 清空并重新加载处理人列表
            $('#assigneeFilter').html('<option value="">所有处理人</option>');
            if(departmentId) {
                await this._loadAssignees(departmentId);
            }
        });

        // 绑定处理人切换事件
        $('#assigneeFilter').on('change', (e) => {
            // 将处理人ID保存到过滤条件
            this.state.filters.processorId = e.target.value;
        });

        // 绑定状态切换事件
        $('#statusFilter').on('change', (e) => {
            this.state.filters.status = e.target.value;
        });

        // 绑定优先级切换事件
        $('#priorityFilter').on('change', (e) => {
            this.state.filters.priority = e.target.value;
        });

        // 绑定日期选择事件
        $('#startDate, #endDate').on('change', (e) => {
            const field = e.target.id === 'startDate' ? 'startTime' : 'endTime';
            this.state.filters[field] = e.target.value;
        });
    }

    /**
     * 加载部门列表
     * @private
     * @description 从服务器获取部门列表并渲染到下拉框
     */
    async _loadDepartments() {
        try {
            const response = await $.ajax({
                url: '/api/departments/list',
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.departments = response.data;
                const options = response.data.map(dept =>
                    `<option value="${dept.departmentId}">${dept.departmentName}</option>`
                ).join('');

                // 保存初始选项以供重置使用
                this.defaultDepartmentOptions = '<option value="">所有部门</option>' + options;

                // 渲染下拉框
                $('#departmentFilter').html(this.defaultDepartmentOptions);

                // 如果存在过滤条件中的部门ID，则设置选中状态
                if(this.state.filters.departmentId) {
                    $('#departmentFilter').val(this.state.filters.departmentId);
                    // 加载该部门的处理人列表
                    await this._loadAssignees(this.state.filters.departmentId);
                }
            }
        } catch(error) {
            console.error('加载部门列表失败:', error);
            this.showError('加载部门列表失败');
        }
    }

    /**
     * 加载处理人列表
     * @private
     * @param {string} departmentId - 部门ID
     * @description 根据部门ID加载处理人列表并渲染到下拉框
     */
    async _loadAssignees(departmentId) {
        try {
            const response = await $.ajax({
                url: `/api/users/selectByDepartmentId/${departmentId}`,
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.assignees = response.data;
                const options = response.data.map(user =>
                    `<option value="${user.userId}">${user.username}</option>`
                ).join('');

                // 保存初始选项以供重置使用
                this.defaultAssigneeOptions = '<option value="">所有处理人</option>' + options;

                // 渲染下拉框
                $('#assigneeFilter').html(this.defaultAssigneeOptions);

                // 如果存在过滤条件中的处理人ID，则设置选中状态
                if(this.state.filters.processorId) {
                    $('#assigneeFilter').val(this.state.filters.processorId);
                }
            }
        } catch(error) {
            console.error('加载处理人列表失败:', error);
            this.showError('加载处理人列表失败');
        }
    }

    /**
     * 处理搜索
     * @param {Event} e - 提交事件对象
     * @description 处理搜索表单提交，收集所有过滤条件并触发搜索
     */
    handleSearch(e) {
        e.preventDefault();

        // 获取文本搜索关键词
        this.state.filters.keyword = $('#keyword').val();

        // 重置分页到第一页
        this.state.pagination.current = 1;

        // 加载过滤后的数据
        this.loadTickets();
    }

    /**
     * 处理重置
     * @description 重置所有过滤条件，恢复表单初始状态
     */
    handleReset() {
        // 重置表单元素
        this.elements.searchForm[0].reset();

        // 重置下拉框到初始状态
        $('#departmentFilter').html(this.defaultDepartmentOptions);
        $('#assigneeFilter').html('<option value="">所有处理人</option>');

        // 重置过滤条件
        this.state.filters = {
            keyword: '',
            status: '',
            priority: '',
            departmentId: '',
            processorId: '',
            startTime: '',
            endTime: ''
        };

        // 重置分页
        this.state.pagination.current = 1;

        // 重新加载数据
        this.loadTickets();
    }


    /**
     * 检查URL参数
     */
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const ticketId = urlParams.get('ticketId');
        if(ticketId) {
            this.showTicketDetail(ticketId);
        }
    }
    /**
     * 加载工单列表
     */
    async loadTickets() {
        if(this.state.loading) return;

        try {
            this.state.loading = true;
            this.showLoading();

            const params = {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
                ...this.state.filters
            };

            const response = await $.ajax({
                url: '/api/tickets/list',
                method: 'GET',
                data: params
            });

            if(response.code === 200) {
                this.state.tickets = response.data.list;
                this.state.pagination.total = response.data.total;
                this.renderTicketList();
                this.updatePagination();
            }

        } catch(error) {
            console.error('加载工单列表失败:', error);
            this.showError('加载工单列表失败');
        } finally {
            this.state.loading = false;
            this.hideLoading();
        }
    }

    /**
     * 渲染工单列表
     * @description 将工单数据渲染到表格中，包括工单编号、标题、处理部门、处理人、状态、优先级等信息
     */
    renderTicketList() {
        const html = this.state.tickets.map(ticket => `
        <tr>
            <td>${ticket.ticketId}</td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="priority-indicator priority-${this.getPriorityClass(ticket.priority)}"></span>
                    ${ticket.title}
                </div>
            </td>
            <td>${ticket.departmentName || '-'}</td>
            <td>${ticket.processorName || '-'}</td>
            <td>
                <span class="ticket-status status-${ticket.status.toLowerCase()}">
                    ${this.STATUS_MAP[ticket.status]}
                </span>
            </td>
            <td>${this.getPriorityText(ticket.priority)}</td>
            <td>${this.formatDate(ticket.createTime)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary view-ticket" data-id="${ticket.ticketId}">
                    <i class="bi bi-eye"></i> 查看
                </button>
            </td>
        </tr>
    `).join('');

        this.elements.ticketList.html(html);
        this.elements.totalCount.text(this.state.pagination.total);
    }

    /**
     * 获取优先级样式类名
     * @param {number} priority - 优先级数值(0:低, 1:中, 2:高)
     * @returns {string} 对应的样式类名
     */
    getPriorityClass(priority) {
        const map = {
            0: 'low',
            1: 'medium',
            2: 'high'
        };
        return map[priority] || 'low';
    }

    /**
     * 获取优先级显示文本
     * @param {number} priority - 优先级数值
     * @returns {string} 优先级描述文本
     */
    getPriorityText(priority) {
        const map = {
            0: '低',
            1: '中',
            2: '高'
        };
        return map[priority] || '低';
    }

    /**
     * 格式化日期时间
     * @param {string} dateString - ISO格式的日期字符串
     * @returns {string} 格式化后的日期时间字符串
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }


    /**
     * 显示工单详情
     */
    async showTicketDetail(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.currentTicket = response.data;
                this.renderTicketDetail();
                this.elements.ticketDetail.addClass('show');
            }
        } catch(error) {
            console.error('加载工单详情失败:', error);
            this.showError('加载详情失败');
        }
    }


    /**
     * 渲染处理记录时间线
     */
    renderTimeline(records) {
        if(!records?.length) {
            $('#ticketTimeline').html('<div class="text-muted">暂无处理记录</div>');
            return;
        }

        const html = records.map(record => `
       <div class="timeline-item">
           <div class="timeline-content">
               <div class="timeline-time">${this.formatDate(record.createTime)}</div>
               <div class="timeline-title">
                   <strong>${record.operator}</strong> ${this.getOperationText(record.operation)}
               </div>
               ${record.content ? `
                   <div class="timeline-body">${record.content}</div>
               ` : ''}
           </div>
       </div>
   `).join('');

        $('#ticketTimeline').html(html);
    }




    /**
     * 显示工单详情
     * @param {number} ticketId - 工单ID
     * @returns {Promise<void>}
     */
    async showTicketDetail(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET'
            });

            if (response.code === 200) {
                this.state.currentTicket = response.data;
                this.renderTicketDetail(response.data);
                this.elements.ticketDetail.addClass('show');
            }
        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError('加载详情失败');
        }
    }

    /**
     * 渲染工单详情
     * @param {Object} ticket - 工单详情数据
     */
    renderTicketDetail(ticket) {
        if (!ticket) return;

        // 基本信息渲染
        $('#ticketCode').text(ticket.ticketCode || '-');
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(this.formatDate(ticket.createTime));
        $('#expectFinishTime').text(this.formatDate(ticket.expectFinishTime));
        $('#departmentName').text(ticket.departmentName || '-');
        $('#processorName').text(ticket.processorName || '-');

        // 状态渲染
        $('#ticketStatus').html(`
            <span class="ticket-status status-${ticket.status.toLowerCase()}">
                ${this.STATUS_MAP[ticket.status]}
            </span>
        `);

        // 优先级渲染
        $('#ticketPriority').html(`
            <span class="priority-badge priority-${this.getPriorityClass(ticket.priority)}">
                ${this.getPriorityText(ticket.priority)}
            </span>
        `);

        // 处理记录渲染
        this.renderProcessRecords(ticket.records || []);

        // 更新操作按钮状态
        this.updateActionButtons(ticket.status);
    }

    /**
     * 渲染处理记录时间线
     * @param {Array} records - 处理记录列表
     */
    renderProcessRecords(records) {
        const html = records.length ? records.map(record => `
            <div class="timeline-item">
                <div class="timeline-marker ${this.getTimelineMarkerClass(record.operation)}"></div>
                <div class="timeline-content">
                    <div class="timeline-time">${this.formatDate(record.createTime)}</div>
                    <div class="timeline-title">
                        <strong>${record.operatorName}</strong> 
                        <span class="operation-text">${this.getOperationText(record.operation)}</span>
                    </div>
                    ${record.content ? `
                        <div class="timeline-body">${record.content}</div>
                    ` : ''}
                    ${record.transferInfo ? `
                        <div class="transfer-info">
                            <span class="text-muted">转交至：</span>
                            ${record.transferInfo.departmentName} - ${record.transferInfo.processorName}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('') : '<div class="text-muted">暂无处理记录</div>';

        $('#ticketTimeline').html(html);
    }

    /**
     * 处理工单转交
     * @returns {Promise<void>}
     */
    async handleTransfer() {
        if (!this.state.currentTicket) {
            this.showError('请先选择工单');
            return;
        }

        // 显示转交模态框
        const modalHtml = await this.createTransferModal();
        const $modal = $(modalHtml).appendTo('body');
        const modal = new bootstrap.Modal($modal[0]);

        // 初始化模态框事件
        this.initTransferModalEvents($modal, modal);

        modal.show();

        // 监听模态框关闭事件，清理DOM
        $modal.on('hidden.bs.modal', () => {
            $modal.remove();
        });
    }

    /**
     * 创建转交模态框
     * @returns {Promise<string>} 模态框HTML
     */
    async createTransferModal() {
        // 获取部门列表
        const departments = await this.loadDepartments();

        return `
            <div class="modal fade" id="transferModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">转交工单</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="transferForm">
                                <div class="mb-3">
                                    <label class="form-label required">转交部门</label>
                                    <select class="form-select" id="transferDepartment" required>
                                        <option value="">请选择部门</option>
                                        ${departments.map(dept => `
                                            <option value="${dept.departmentId}">${dept.departmentName}</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label required">处理人</label>
                                    <select class="form-select" id="transferProcessor" required disabled>
                                        <option value="">请先选择部门</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">转交说明</label>
                                    <textarea class="form-control" id="transferNote" 
                                        rows="3" placeholder="请输入转交说明..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" id="confirmTransferBtn">确认转交</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 初始化转交模态框事件
     * @param {JQuery} $modal - 模态框jQuery对象
     * @param {bootstrap.Modal} modal - Bootstrap模态框实例
     */
    initTransferModalEvents($modal, modal) {
        // 部门切换事件
        $modal.find('#transferDepartment').on('change', async (e) => {
            const departmentId = e.target.value;
            const $processorSelect = $modal.find('#transferProcessor');

            if (departmentId) {
                await this.loadTransferProcessors(departmentId, $processorSelect);
                $processorSelect.prop('disabled', false);
            } else {
                $processorSelect.html('<option value="">请先选择部门</option>').prop('disabled', true);
            }
        });

        // 确认转交事件
        $modal.find('#confirmTransferBtn').on('click', async () => {
            const departmentId = $modal.find('#transferDepartment').val();
            const processorId = $modal.find('#transferProcessor').val();
            const note = $modal.find('#transferNote').val().trim();

            if (!departmentId || !processorId) {
                this.showError('请选择转交部门和处理人');
                return;
            }

            try {
                const response = await $.ajax({
                    url: `/api/tickets/${this.state.currentTicket.ticketId}/transfer`,
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        departmentId,
                        processorId,
                        note: note || '工单转交'  // 默认转交说明
                    })
                });

                if (response.code === 200) {
                    this.showSuccess('工单转交成功');
                    modal.hide();
                    // 刷新工单详情和列表
                    await this.showTicketDetail(this.state.currentTicket.ticketId);
                    await this.loadTickets();
                }
            } catch (error) {
                console.error('工单转交失败:', error);
                this.showError('工单转交失败，请重试');
            }
        });
    }

    /**
     * 加载转交处理人列表
     * @param {string} departmentId - 部门ID
     * @param {JQuery} $select - 处理人下拉框jQuery对象
     */
    async loadTransferProcessors(departmentId, $select) {
        try {
            const response = await $.ajax({
                url: `/api/users/selectByDepartmentId/${departmentId}`,
                method: 'GET'
            });

            if (response.code === 200) {
                const options = response.data.map(user =>
                    `<option value="${user.userId}">${user.username}</option>`
                ).join('');

                $select.html('<option value="">请选择处理人</option>' + options);
            } else {
                this.showError('加载处理人列表失败');
            }
        } catch (error) {
            console.error('加载处理人列表失败:', error);
            this.showError('加载处理人列表失败');
            $select.html('<option value="">加载失败</option>');
        }
    }


    /**
     * 处理工单状态变更
     */
    async handleStatusTransition(operation, data) {
        if(!this.state.currentTicket) return;

        const operations = {
            process: {
                url: `/api/tickets/${this.state.currentTicket.id}/process`,
                successMsg: '工单已开始处理'
            },
            resolve: {
                url: `/api/tickets/${this.state.currentTicket.id}/resolve`,
                successMsg: '工单已完成处理'
            },
            transfer: {
                url: `/api/tickets/${this.state.currentTicket.id}/transfer`,
                successMsg: '工单已转交'
            },
            close: {
                url: `/api/tickets/${this.state.currentTicket.id}/close`,
                successMsg: '工单已关闭'
            }
        };

        const config = operations[operation];
        if(!config) return;

        try {
            const response = await $.ajax({
                url: config.url,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });

            if(response.code === 200) {
                this.showSuccess(config.successMsg);
                await this.showTicketDetail(this.state.currentTicket.id);
                await this.loadTickets();
            }
        } catch(error) {
            console.error('操作失败:', error);
            this.showError('操作失败，请重试');
        }
    }

    /**
     * 更新操作按钮状态
     */
    updateActionButtons(status) {
        const $processBtn = $('#processBtn');
        const $resolveBtn = $('#resolveBtn');
        const $transferBtn = $('#transferBtn');
        const $closeBtn = $('#closeBtn');

        switch(status) {
            case 'PENDING':
                $processBtn.prop('disabled', false);
                $resolveBtn.prop('disabled', true);
                $transferBtn.prop('disabled', false);
                $closeBtn.prop('disabled', false);
                break;
            case 'PROCESSING':
                $processBtn.prop('disabled', true);
                $resolveBtn.prop('disabled', false);
                $transferBtn.prop('disabled', false);
                $closeBtn.prop('disabled', false);
                break;
            case 'COMPLETED':
            case 'CLOSED':
                $processBtn.prop('disabled', true);
                $resolveBtn.prop('disabled', true);
                $transferBtn.prop('disabled', true);
                $closeBtn.prop('disabled', true);
                break;
        }
    }


    getOperationText(operation) {
        const map = {
            CREATE: '创建了工单',
            PROCESS: '开始处理',
            NOTE: '添加了备注',
            TRANSFER: '转交工单',
            COMPLETE: '完成处理',
            CLOSE: '关闭工单'
        };
        return map[operation] || operation;
    }

    showLoading() {
        if(!this.$loading) {
            this.$loading = $(`
           <div class="loading-overlay">
               <div class="spinner-border text-primary"></div>
               <div class="loading-text">加载中...</div>
           </div>
       `).appendTo('body');
        }
        this.$loading.show();
    }

    hideLoading() {
        if(this.$loading) {
            this.$loading.hide();
        }
    }

    /**
     * 工具方法 - 显示Toast提示
     * @param {string} message - 提示信息
     * @param {string} type - 提示类型(success/danger/warning)
     */
    showToast(message, type = 'success') {
        const toastHtml = `
        <div class="toast align-items-center text-white bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

        // 创建toast容器
        if(!$('#toastContainer').length) {
            $('body').append(`
            <div id="toastContainer" class="toast-container position-fixed bottom-0 end-0 p-3">
            </div>
        `);
        }

        // 显示toast
        const $toast = $(toastHtml).appendTo('#toastContainer');
        const toast = new bootstrap.Toast($toast[0], {
            delay: 3000
        });
        toast.show();

        // 监听隐藏事件移除DOM
        $toast.on('hidden.bs.toast', () => {
            $toast.remove();
        });
    }

    /**
     * 显示成功提示
     * @param {string} message - 提示信息
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * 显示错误提示
     * @param {string} message - 提示信息
     */
    showError(message) {
        this.showToast(message, 'danger');
    }
    /**
     * 初始化分页组件
     * @private
     */
    initPagination() {
        this.pagination = new Pagination({
            container: '#pagination',
            pageSize: this.state.pagination.pageSize,
            onChange: (page) => {
                this.state.pagination.current = page;
                this.loadTickets();
            }
        });
    }

    /**
     * 更新分页数据
     * @private
     */
    updatePagination() {
        this.pagination.update(
            this.state.pagination.total,
            this.state.pagination.current
        );
    }


    /**
     * 销毁组件
     */
    destroy() {
        // 解绑事件
        this.elements.container.off();
        this.elements.searchForm.off();
        this.elements.ticketList.off();
        this.elements.pagination.off();

        // 清理DOM引用
        if(this.$loading) {
            this.$loading.remove();
        }

        // 清理状态
        this.state = null;
    }

}

// 初始化
$(document).ready(() => {
    window.ticketManagement = new TicketManagement();
});