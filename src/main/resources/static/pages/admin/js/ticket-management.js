/**
 * 工单管理类
 * 负责工单的CRUD操作、状态管理和数据加载等核心功能
 */
class TicketManagement {
    constructor() {
        // 初始化状态
        this.state = {
            loading: false,
            tickets: [],
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
                departmentId: '',
                startTime: '',
                endTime: ''
            },
            userInfo: JSON.parse(localStorage.getItem('userInfo') || '{}')

        };

        // DOM元素缓存
        this.elements = {
            container: $('#main'),
            ticketList: $('#ticketList'),
            searchForm: $('#searchForm'),
            pagination: $('#pagination'),
            totalCount: $('#totalCount'),
            ticketDetail: $('.ticket-detail-panel'),
            // processModal: new bootstrap.Modal($('#processModal')[0])

        };



        this.modals = {
            ticketModal: null,
            processModal: null,
            transferModal: null
        };


        $(document).ready(() => {
            const transferModalEl = document.getElementById('transferModal');
            if (transferModalEl) {
                this.modals.transferModal = new bootstrap.Modal(transferModalEl);
            }
        });

        // 用户信息
        this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        // 初始化组件
        this.init();
        this._initModals()
        this._initActionButtons();
    }

    /**
     * 工单状态常量
     * @type {{PENDING: string, PROCESSING: string, COMPLETED: string, CLOSED: string}}
     */
    TICKET_STATUS = {
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        COMPLETED: 'COMPLETED',
        CLOSED: 'CLOSED'
    };

    /**
     *  工单优先级常量
     * @type {{NORMAL: {text: string, class: string}, URGENT: {text: string, class: string}, EXTREMELY_URGENT: {text: string, class: string}, "0": {text: string, class: string}, "1": {text: string, class: string}, "2": {text: string, class: string}}}
     */
    PRIORITY_MAP = {
        'NORMAL': { text: '普通', class: 'low' },
        'URGENT': { text: '紧急', class: 'medium' },
        'EXTREMELY_URGENT': { text: '非常紧急', class: 'high' },
        '0': { text: '普通', class: 'low' },
        '1': { text: '紧急', class: 'medium' },
        '2': { text: '非常紧急', class: 'high' }
    };

    /**
     * 初始化方法
     */
    async init() {
        try {
            await Promise.all([
                this._loadDepartments(),  // 加载部门数据
                this._loadTicketTypes()   // 加载工单类型
            ]);

            this._bindEvents();           // 绑定事件
            await this._loadTickets();    // 加载工单列表

            // 检查URL参数是否需要打开特定工单
            const urlParams = new URLSearchParams(window.location.search);
            const ticketId = urlParams.get('ticketId');
            if(ticketId) {
                this._loadTicketDetail(ticketId);
            }

            // 文件上传预览
            $('#attachments').on('change', (e) => {
                const files = e.target.files;
                this._updateFileList(files);
            });

            // 保存工单按钮
            $('#saveTicketBtn').on('click', () => this._handleCreateTicket());

            // 绑定转交相关事件
            this._bindTransferEvents();



        } catch(error) {
            console.error('初始化失败:', error);
            NotifyUtil.error('加载失败，请刷新重试');
        }
    }

    /**
     * 不知道为什么在bindEvents中绑定的事件无法触发，所以在这里重新绑定一次
     * @private
     */
    _initActionButtons() {
        $('#processBtn').off('click').on('click', () => {
            if (this._canProcess()) {
                this._handleProcess();
            }
        });

        $('#resolveBtn').off('click').on('click', () => {
            if (this._canResolve()) {
                this._handleResolve();
            }
        });

        $('#transferBtn').off('click').on('click', () => {
            if (this._canTransfer()) {
                this._handleTransfer();
            }
        });

        $('#closeBtn').off('click').on('click', () => {
            if (this._canClose()) {
                this._handleClose();
            }
        });
    }

    /**
     * 初始化模态框
     * @private
     */
    _initModals() {
        // 等待 DOM 加载完成后再初始化 Modal
        $(document).ready(() => {
            const ticketModalEl = document.getElementById('ticketModal');
            const processModalEl = document.getElementById('processModal');

            if (ticketModalEl) {
                this.modals.ticketModal = new bootstrap.Modal(ticketModalEl, {
                    keyboard: false
                });
            }

            if (processModalEl) {
                this.modals.processModal = new bootstrap.Modal(processModalEl, {
                    keyboard: false
                });
            }
        });
    }

    // 展示模态框的方法
    _showCreateModal() {
        if (this.modals.ticketModal) {
            // 重置表单
            $('#ticketForm')[0].reset();
            // 显示模态框
            this.modals.ticketModal.show();
        }
    }

    _showProcessModal() {
        if (this.modals.processModal) {
            this.modals.processModal.show();
        }
    }

    _updateFileList(files) {
        const $fileList = $('#fileList');
        $fileList.empty();

        if (!files || !files.length) {
            return;
        }

        Array.from(files).forEach(file => {
            const fileExt = file.name.split('.').pop().toLowerCase();
            const iconClass = this._getFileIconClass(fileExt);

            $fileList.append(`
            <div class="file-item d-flex align-items-center mb-2">
                <i class="bi ${iconClass} me-2"></i>
                <div class="flex-grow-1">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta text-muted small">
                        ${this._formatFileSize(file.size)}
                    </div>
                </div>
            </div>
        `);
        });
    }

    /**
     * 绑定事件处理
     */
    _bindEvents() {
        // 搜索表单提交
        this.elements.searchForm.on('submit', (e) => this._handleSearch(e));

        // 重置按钮
        $('#resetBtn').on('click', () => this._handleReset());

        // 创建工单按钮
        $('#createTicketBtn').on('click', () => this._showCreateModal());

        // 工单列表操作
        this.elements.ticketList.on('click', '.view-ticket', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this._loadTicketDetail(ticketId);
        });

        this.elements.searchForm.find('select, input').on('change keyup', (e) => {
            if (this.searchTimer) {
                clearTimeout(this.searchTimer);
            }
            this.searchTimer = setTimeout(() => {
                this._handleSearch(e);
            }, 500);
        });
        // 部门选择联动处理人
        $('#departmentFilter').on('change', async (e) => {
            const departmentId = $(e.target).val();
            await this._loadProcessors(departmentId);
        });

        // 工单操作按钮
        $(document).on('click', '#processBtn', () => {
            if (this._canProcess()) {
                this._handleProcess();
            }
        });

        $(document).on('click', '#resolveBtn', () => {
            if (this._canResolve()) {
                this._handleResolve();
            }
        });

        $(document).on('click', '#closeBtn', () => {
            if (this._canClose()) {
                this._handleClose();
            }
        });

        $(document).on('click', '#transferBtn', () => {
            if (this._canTransfer()) {
                this._handleTransfer();
            }
        });


        // 关闭详情面板
        $('#closeDetailBtn').on('click', () => {
            this.elements.ticketDetail.removeClass('show');
            this.state.currentTicket = null;
        });

        // 导出按钮
        $('#exportBtn').on('click', () => this._handleExport());
    }

    /**
     * 绑定转交模态框事件
     * @private
     */
    _bindTransferEvents() {
        // 部门选择联动处理人
        $('#transferDepartment').on('change', async (e) => {
            const departmentId = $(e.target).val();
            await this._loadTransferProcessors(departmentId);
        });

        // 确认转交按钮点击事件
        $('#confirmTransferBtn').on('click', () => this._confirmTransfer());
    }
    /**
     * 加载工单列表
     */
    async _loadTickets() {
        if(this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

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
                this._renderTicketList();
                this._updatePagination();
            }

        } catch(error) {
            console.error('加载工单列表失败:', error);
            NotifyUtil.error('加载工单列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    _formatFileSize(bytes) {
        if(bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    /**
     * 显示转交模态框
     */
    async _handleTransfer() {
        if (!this._canTransfer()) return;

        try {
            // 加载部门列表
            const response = await $.ajax({
                url: '/api/departments/list',
                method: 'GET'
            });

            if (response.code === 200) {
                const options = response.data.map(dept =>
                    `<option value="${dept.departmentId}">${dept.departmentName}</option>`
                ).join('');

                $('#transferDepartment')
                    .html('<option value="">请选择部门</option>' + options);

                // 重置处理人选择和说明
                $('#transferProcessor').html('<option value="">请先选择部门</option>').prop('disabled', true);
                $('#transferNote').val('');

                // 显示模态框
                if (this.modals.transferModal) {
                    this.modals.transferModal.show();
                }
            }
        } catch (error) {
            console.error('加载部门列表失败:', error);
            NotifyUtil.error('加载部门列表失败');
        }
    }

    /**
     * 加载转交处理人列表
     */
    async _loadTransferProcessors(departmentId) {
        if (!departmentId) {
            $('#transferProcessor').html('<option value="">请先选择部门</option>').prop('disabled', true);
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/selectByDepartmentId/${departmentId}`,
                method: 'GET'
            });

            if (response.code === 200) {
                const options = response.data.map(user =>
                    `<option value="${user.userId}">${user.realName}(${user.roleName})</option>`
                ).join('');

                $('#transferProcessor')
                    .html('<option value="">请选择处理人</option>' + options)
                    .prop('disabled', false);
            }
        } catch (error) {
            console.error('加载处理人失败:', error);
            NotifyUtil.error('加载处理人列表失败');
        }
    }

    /**
     * 确认转交
     */
    async _confirmTransfer() {
        const departmentId = $('#transferDepartment').val();
        const note = $('#transferNote').val().trim();

        if (!departmentId) {
            NotifyUtil.warning('请选择转交部门');
            return;
        }

        if (!note) {
            NotifyUtil.warning('请输入转交说明');
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.ticketId}/transfer`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    departmentId: departmentId,
                    updateBy: this.userInfo.userId,
                    note: note,
                    ticketId: this.state.currentTicket.ticketId
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                NotifyUtil.success('工单转交成功');
                if (this.modals.transferModal) {
                    this.modals.transferModal.hide();
                }
                await this._loadTicketDetail(this.state.currentTicket.ticketId);
                await this._loadTickets();
            }
        } catch (error) {
            console.error('转交工单失败:', error);
            NotifyUtil.error('转交失败，请重试');
        }
    }


    /**
     * 加载处理人列表
     */
    async _loadProcessors(departmentId) {
        if (!departmentId) {
            $('#processorFilter').html('<option value="">请选择处理人</option>').prop('disabled', true);
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/users/selectByDepartmentId/${departmentId}`,
                method: 'GET'
            });

            if (response.code === 200 && response.data) {
                const options = response.data.map(user =>
                    `<option value="${user.userId}">${user.realName}(${user.roleName})</option>`
                ).join('');

                $('#processorFilter')
                    .html('<option value="">请选择处理人</option>' + options)
                    .prop('disabled', false);

                // 触发一下搜索，更新列表
                this._handleSearch();
            }
        } catch (error) {
            console.error('加载处理人失败:', error);
            NotifyUtil.error('加载处理人列表失败');
            $('#processorFilter').prop('disabled', true);
        }
    }

    /**
     * 状态检查方法
     */
    async _checkOperation(operation, ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/check-operation/${ticketId}`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    operation: operation,
                    userId: this.userInfo.userId
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.code === 200;
        } catch(error) {
            console.error(`Check ${operation} permission failed:`, error);
            return false;
        }
    }

    async _canProcess() {
        if (!this.state.currentTicket) return false;
        return await this._checkOperation('PROCESS', this.state.currentTicket.ticketId);
    }

    async _canResolve() {
        if (!this.state.currentTicket) return false;
        return await this._checkOperation('RESOLVE', this.state.currentTicket.ticketId);
    }

    async _canClose() {
        if (!this.state.currentTicket) return false;
        return await this._checkOperation('CLOSE', this.state.currentTicket.ticketId);
    }

    async _canTransfer() {
        if (!this.state.currentTicket) return false;
        return await this._checkOperation('TRANSFER', this.state.currentTicket.ticketId);
    }



    /**
     * 更新操作按钮状态
     */
    _updateActionButtons(status) {
        const $processBtn = $('#processBtn');
        const $resolveBtn = $('#resolveBtn');
        const $transferBtn = $('#transferBtn');
        const $closeBtn = $('#closeBtn');

        // 重置所有按钮状态
        $processBtn.prop('disabled', true).removeClass('btn-primary').addClass('btn-secondary');
        $resolveBtn.prop('disabled', true).removeClass('btn-success').addClass('btn-secondary');
        $transferBtn.prop('disabled', true).removeClass('btn-warning').addClass('btn-secondary');
        $closeBtn.prop('disabled', true).removeClass('btn-danger').addClass('btn-secondary');

        // 根据状态启用相应按钮
        const numericStatus = typeof status === 'string' ?
            Object.keys(this.TICKET_STATUS).indexOf(status) : status;

        switch(String(numericStatus)) {
            case '0':
            case 'PENDING':
                $processBtn.prop('disabled', false).removeClass('btn-secondary').addClass('btn-primary');
                $transferBtn.prop('disabled', false).removeClass('btn-secondary').addClass('btn-warning');
                $closeBtn.prop('disabled', false).removeClass('btn-secondary').addClass('btn-danger');
                break;

            case '1':
            case 'PROCESSING':
                $resolveBtn.prop('disabled', false).removeClass('btn-secondary').addClass('btn-success');
                $transferBtn.prop('disabled', false).removeClass('btn-secondary').addClass('btn-warning');
                $closeBtn.prop('disabled', false).removeClass('btn-secondary').addClass('btn-danger');
                break;

            case '2':
            case '3':
            case 'COMPLETED':
            case 'CLOSED':
                // 所有按钮保持禁用状态
                break;
        }
    }


    /**
     * 渲染工单列表
     */
    _renderTicketList() {
        if(!this.state.tickets.length) {
            this.elements.ticketList.html(
                '<tr><td colspan="8" class="text-center">暂无工单数据</td></tr>'
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
                        ${this._escapeHtml(ticket.title)}
                    </div>
                </td>
                <td>${this._escapeHtml(ticket.departmentName) || '-'}</td>
                <td>${this._escapeHtml(ticket.processorName) || '-'}</td>
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
     * 加载工单详情
     */
    async _loadTicketDetail(ticketId) {

        // 清理之前的预览和附件列表
        $('#filePreviewContainer').remove();
        $('#ticketAttachments').empty();
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET'
            });

            if(response.code === 200) {
                this.state.currentTicket = response.data;
                this._renderTicketDetail();
                // 加载附件信息
                await this._loadTicketAttachments(ticketId);
                this.elements.ticketDetail.addClass('show');


            }
        } catch(error) {
            console.error('加载工单详情失败:', error);
            NotifyUtil.error('加载详情失败');
        }
    }

    /**
     * 渲染工单详情
     */
    _renderTicketDetail() {
        const ticket = this.state.currentTicket;
        if(!ticket) return;

        // 基本信息渲染
        $('#ticketCode').text(ticket.ticketId);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(this._formatDate(ticket.createTime));
        $('#expectFinishTime').text(this._formatDate(ticket.expectFinishTime));

        // 状态和优先级渲染
        $('#ticketStatus').html(`
        <span class="badge bg-${this._getStatusClass(ticket.status)}">
            ${this._getStatusText(ticket.status)}
        </span>
    `);

        $('#ticketPriority').html(`
        <span class="priority-badge priority-${this._getPriorityClass(ticket.priority)}">
            ${this._getPriorityText(ticket.priority)}
        </span>
    `);

        const attachmentsArea = `
        <div class="mb-3">
            <label class="form-label">附件列表</label>
            <div id="ticketAttachments" class="attachments-list"></div>
        </div>
    `;

        // 处理记录渲染
        this._renderTicketRecords(ticket.records);

        // 将附件区域插入到指定位置
        $('#ticketContent').parent().after(attachmentsArea);

        // 更新操作按钮状态

        this._updateActionButtons(ticket.status);

        // 重新初始化按钮事件
        this._initActionButtons();
    }

    /**
     * 渲染处理记录
     */
    _renderTicketRecords(records) {
        if(!records || !records.length) {
            $('#ticketTimeline').html('<div class="text-muted">暂无处理记录</div>');
            return;
        }

        const html = records.map(record => `
        <div class="timeline-item">
            <div class="timeline-content">
                <div class="timeline-time">${this._formatDate(record.createTime)}</div>
                <div class="timeline-title">
                    <strong>${record.operatorName}</strong> 
                    ${this._getOperationText(record.operationType)}
                </div>
                ${record.operationContent ? `
                    <div class="timeline-body">${record.operationContent}</div>
                ` : ''}
                ${record.evaluationScore ? `
                    <div class="evaluation-content">
                        <div class="rating-display">
                            ${this._renderStars(record.evaluationScore)}
                        </div>
                        ${record.evaluationContent ? `
                            <div class="evaluation-text">
                                ${record.evaluationContent}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

        $('#ticketTimeline').html(html);
    }

    /**
     * 创建工单
     */
    async _handleCreateTicket() {
        const form = $('#ticketForm');
        if(!form[0].checkValidity()) {
            form[0].reportValidity();
            return;
        }

        try {
            const formData = new FormData();


            formData.append('typeId', $('#typeId').val());
            formData.append('title', $('#title').val());
            formData.append('content', $('#content').val());
            formData.append('departmentId', $('#department').val());
            formData.append('priority', $('#priority').val());
            formData.append('expectFinishTime', $('#expectFinishTime').val());
            formData.append('currentUserId', this.userInfo.userId);


            // 处理文件上传
            const filesInput = $('#attachments')[0];
            if(filesInput.files && filesInput.files.length > 0) {
                Array.from(filesInput.files).forEach(file => {
                    formData.append('attachments', file);
                });
            }

            const response = await $.ajax({
                url: '/api/tickets/create',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(response.code === 200) {
                NotifyUtil.success('工单创建成功');
                if(this.modals.ticketModal) {
                    this.modals.ticketModal.hide();
                }
                await this._loadTickets();
            }
        } catch(error) {
            console.error('创建工单失败:', error);
            NotifyUtil.error('创建工单失败，请重试');
        }
    }
    /**
     * 加载部门列表
     */
    async _loadDepartments() {
        try {
            const response = await $.ajax({
                url: '/api/departments/list',
                method: 'GET'
            });

            if(response.code === 200) {
                const options = response.data.filter(dept => dept.departmentId !== 0)
                    .map(dept =>
                    `<option value="${dept.departmentId}">${dept.departmentName}</option>`
                ).join('');

                const defaultOption = '<option value="">请选择部门</option>';

                // 同时更新搜索表单和新建工单表单的部门选择
                $('#departmentFilter, #department, #transferDept').each(function() {
                    $(this).html(defaultOption + options);
                });
            }
            return response.data || [];
        } catch(error) {
            console.error('加载部门列表失败:', error);
            NotifyUtil.error('加载部门列表失败');
            return [];
        }
    }

    /**
     * 加载工单类型
     */
    async _loadTicketTypes() {
        try {
            const response = await $.ajax({
                url: '/api/tickets/type/list',
                method: 'GET'
            });

            if(response.code === 200) {
                const options = response.data.map(type =>
                    `<option value="${type.typeId}">${type.typeName}</option>`
                ).join('');

                $('#typeId').html('<option value="">请选择工单类型</option>' + options);
            }
        } catch(error) {
            console.error('加载工单类型失败:', error);
            NotifyUtil.error('加载工单类型失败');
        }
    }

    /**
     * 处理搜索
     */
    _handleSearch(e) {
        if (e) {
            e.preventDefault();
        }


        // 更新过滤条件
        this.state.filters = {
            keyword: $('#keyword').val() || '',
            status: $('#statusFilter').val() || '',
            priority: $('#priorityFilter').val() || '',
            departmentId: $('#departmentFilter').val() || '',
            processorId: $('#processorFilter').val() || '',
            startTime: $('#startDate').val() || '',
            endTime: $('#endDate').val() || ''
        };

        if (this.state.filters.startTime > this.state.filters.endTime) {
            NotifyUtil.warning('开始时间不能晚于结束时间');
            let temp = this.state.filters.startTime;
            $('#startDate').val(this.state.filters.endTime);
            $('#endDate').val(temp);
            return;
        }
        if(this.state.filters.startTime){
            this.state.filters.startTime = `${this.state.filters.startTime}T00:00:00`;
        }
        if(this.state.filters.endTime){
            this.state.filters.endTime = `${this.state.filters.endTime}T23:59:59`;
        }

        // 重置分页到第一页
        this.state.pagination.current = 1;

        // 重新加载数据
        this._loadTickets();
    }

    /**
     * 处理重置
     */
    _handleReset() {
        // 清空定时器
        if (this.searchTimer) {
            clearTimeout(this.searchTimer);
        }

        // 重置表单
        this.elements.searchForm[0].reset();
        $('#processorFilter').html('<option value="">请选择处理人</option>').prop('disabled', true);

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
        this._loadTickets();
    }

    async _handleProcess() {
        if (!await this._canProcess()) {
            NotifyUtil.warning('您没有处理该工单的权限');
            return;
        }
        try {
            const response = await $.ajax({
                url: '/api/tickets/status',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    ticketId: this.state.currentTicket.ticketId,
                    status: 'PROCESSING',
                    operatorId: this.userInfo.userId,
                    content: content
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(response.code === 200) {
                NotifyUtil.success('已开始处理');
                await this._loadTicketDetail(this.state.currentTicket.ticketId);
                await this._loadTickets();
            }
        } catch(error) {
            console.error('处理失败:', error);
            NotifyUtil.error('处理失败');
        }
    }

    async _handleResolve() {
        const content = $('#processNote').val().trim();
        if(!content) {
            NotifyUtil.warning('请输入完成说明');
            return;
        }

        try {
            const response = await $.ajax({
                url: '/api/tickets/status',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    ticketId: this.state.currentTicket.ticketId,
                    status: 'COMPLETED',
                    operatorId: this.userInfo.userId,
                    content: content
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(response.code === 200) {
                NotifyUtil.success('工单已完成');
                await this._loadTicketDetail(this.state.currentTicket.ticketId);
                await this._loadTickets();
            }
        } catch(error) {
            console.error('完成失败:', error);
            NotifyUtil.error('完成失败');
        }
    }

    async _handleClose() {
        const content = $('#processNote').val().trim();
        if(!content) {
            NotifyUtil.warning('请输入关闭说明');
            return;
        }

        if(!confirm('确定要关闭此工单吗？')) {
            return;
        }

        try {
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.ticketId}/close`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    content: content,
                    operatorId: this.userInfo.userId,
                    ticketId: this.state.currentTicket.ticketId
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(response.code === 200) {
                NotifyUtil.success('工单已关闭');
                await this._loadTicketDetail(this.state.currentTicket.ticketId);
                await this._loadTickets();
            }
        } catch(error) {
            console.error('关闭失败:', error);
            NotifyUtil.error('关闭失败');
        }
    }

    /**
     * 获取状态样式类
     */
    _getStatusClass(status) {
        const statusMap = {
            'PENDING': 'warning',
            'PROCESSING': 'info',
            'COMPLETED': 'success',
            'CLOSED': 'secondary',
            '0': 'warning',
            '1': 'info',
            '2': 'success',
            '3': 'secondary'
        };
        return statusMap[status] || 'secondary';
    }

    /**
     * 获取操作文本
     */
    _getOperationText(operation) {
        const operationMap = {
            'CREATE': '创建了工单',
            'ASSIGN': '分配工单',
            'HANDLE': '处理工单',
            'COMPLETE': '完成处理',
            'CLOSE': '关闭工单',
            'TRANSFER': '转交工单',
            '0': '创建了工单',
            '1': '分配工单',
            '2': '处理工单',
            '3': '完成处理',
            '4': '关闭工单',
            '5': '转交工单'
        };
        return operationMap[operation] || '未知操作';
    }

    /**
     * 渲染评分星星
     */
    _renderStars(score) {
        return Array(5).fill(0).map((_, i) =>
            `<i class="bi bi-star${i < score ? '-fill' : ''} text-warning"></i>`
        ).join('');
    }

    /**
     * 更新分页
     */
    _updatePagination() {
        const { current, pageSize, total } = this.state.pagination;
        const totalPages = Math.ceil(total / pageSize);

        let html = `
            <li class="page-item ${current <= 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current - 1}">上一页</a>
            </li>
        `;

        for(let i = 1; i <= totalPages; i++) {
            if(i === 1 || i === totalPages || (i >= current - 2 && i <= current + 2)) {
                html += `
                    <li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if(i === 2 || i === totalPages - 1) {
                html += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }

        html += `
            <li class="page-item ${current >= totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current + 1}">下一页</a>
            </li>
        `;

        this.elements.pagination.html(html);

        // 绑定分页点击事件
        this.elements.pagination.find('.page-link').on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if(page && page !== current) {
                this.state.pagination.current = page;
                this._loadTickets();
            }
        });
    }

    /**
     * 显示加载状态
     */
    _showLoading() {
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

    /**
     * 隐藏加载状态
     */
    _hideLoading() {
        if(this.$loading) {
            this.$loading.hide();
        }
    }

    /**
     * 处理工单状态变更
     */
    async _handleStatusUpdate(status, content) {
        if(!this.state.currentTicket) return;

        try {
            const response = await $.ajax({
                url: '/api/tickets/status',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    ticketId: this.state.currentTicket.ticketId,
                    status: status,
                    operatorId: this.userInfo.userId,
                    content: content
                })
            });

            if(response.code === 200) {
                NotifyUtil.success('状态更新成功');
                await this._loadTicketDetail(this.state.currentTicket.ticketId);
                await this._loadTickets();
            }
        } catch(error) {
            console.error('更新状态失败:', error);
            NotifyUtil.error('状态更新失败');
        }
    }

    /**
     * 工单转交处理
     */
    // async _handleTransfer() {
    //     if(!this.state.currentTicket) return;
    //
    //     try {
    //         const departmentId = $('#transferDept').val();
    //         const note = $('#transferNote').val().trim();
    //
    //         if(!departmentId) {
    //             NotifyUtil.warning('请选择转交部门');
    //             return;
    //         }
    //
    //         if(!note) {
    //             NotifyUtil.warning('请输入转交说明');
    //             return;
    //         }
    //
    //         const response = await $.ajax({
    //             url: `/api/tickets/${this.state.currentTicket.ticketId}/transfer`,
    //             method: 'POST',
    //             contentType: 'application/json',
    //             data: JSON.stringify({
    //                 departmentId,
    //                 note,
    //                 updateBy: this.userInfo.userId
    //             })
    //         });
    //
    //         if(response.code === 200) {
    //             NotifyUtil.success('工单转交成功');
    //             this.elements.processModal.hide();
    //             await this._loadTicketDetail(this.state.currentTicket.ticketId);
    //             await this._loadTickets();
    //         }
    //     } catch(error) {
    //         console.error('工单转交失败:', error);
    //         NotifyUtil.error('转交失败，请重试');
    //     }
    // }



    /**
     * 附件处理和工单评价相关功能
     */
    async _loadTicketAttachments(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/files/ticket/${ticketId}`,
                method: 'GET'
            });

            if(response.code === 200) {
                const attachments = response.data;
                this._renderAttachments(attachments);
            }
        } catch(error) {
            console.error('加载附件失败:', error);
            NotifyUtil.error('加载附件列表失败');
        }
    }

    /**
     * 渲染附件列表
     */
    _renderAttachments(attachments) {
        if(!attachments || !attachments.length) {
            $('#ticketAttachments').html('<div class="text-muted">暂无附件</div>');
            return;
        }

        const html = attachments.map(attachment => {
            const fileExt = attachment.fileName.split('.').pop().toLowerCase();
            const iconClass = this._getFileIconClass(fileExt);

            return `
            <div class="attachment-item d-flex align-items-center mb-2">
                <i class="bi ${iconClass} me-2"></i>
                <div class="flex-grow-1">
                    <div class="file-name">${this._escapeHtml(attachment.fileName)}</div>
                    <div class="file-meta text-muted small">
                        ${TicketUtil.formatFileSize(attachment.fileSize)} 
                        · ${TicketUtil.formatDate(attachment.createTime)}
                    </div>
                </div>
                <div class="attachment-actions">
                    <button class="btn btn-sm btn-outline-primary me-2" 
                            onclick="window.ticketManagement._downloadAttachment(${attachment.ticketId}, '${attachment.filePath}')">
                        <i class="bi bi-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" 
                            onclick="window.ticketManagement._previewFile('${attachment.filePath}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>
        `;
        }).join('');

        $('#ticketAttachments').html(html);
    }

    /**
     * 处理工单评价
     * 管理员禁用此功能
     */
    async _handleEvaluation() {
        if(!this.state.currentTicket) return;

        const score = parseInt($('#evaluationScore').val());
        const content = $('#evaluationContent').val().trim();

        if(!score) {
            NotifyUtil.warning('请选择评分');
            return;
        }

        if(!content) {
            NotifyUtil.warning('请输入评价内容');
            return;
        }

        try {
            const response = await $.ajax({
                url: '/api/tickets/evaluate',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    ticketId: this.state.currentTicket.ticketId,
                    evaluatorId: this.userInfo.userId,
                    score,
                    content
                })
            });

            if(response.code === 200) {
                NotifyUtil.success('评价提交成功');
                await this._loadTicketDetail(this.state.currentTicket.ticketId);
            }
        } catch(error) {
            console.error('评价提交失败:', error);
            NotifyUtil.error('评价失败，请重试');
        }
    }

    /**
     * 处理工单导出
     */
    async _handleExport() {
        try {
            this._showLoading();

            const params = new URLSearchParams({
                ...this.state.filters,
                pageSize: 1000
            });

            const response = await $.ajax({
                url: `/api/tickets/export?${params.toString()}`,
                method: 'GET',
                xhrFields: {
                    responseType: 'blob'
                },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const blob = new Blob([response], { type: 'application/vnd.ms-excel' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `工单列表_${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            NotifyUtil.success('导出成功');
        } catch(error) {
            console.error('导出失败:', error);
            NotifyUtil.error('导出失败，请重试');
        } finally {
            this._hideLoading();
        }
    }

    /**
     * 处理文件上传
     *
     */
    // async _handleFileUpload(files) {
    //     if(!files || !files.length) return;
    //     修改了 合并到上传工单中
    //     try {
    //         const formData = new FormData();
    //         Array.from(files).forEach(file => {
    //             formData.append('files', file);
    //         });
    //
    //         formData.append('ticketId', this.state.currentTicket.ticketId);
    //
    //         const response = await $.ajax({
    //             url: `/api/tickets/${this.state.currentTicket.ticketId}/attachments`,
    //             method: 'POST',
    //             data: formData,
    //             processData: false,
    //             contentType: false
    //         });
    //
    //         if(response.code === 200) {
    //             NotifyUtil.success('文件上传成功');
    //             await this._loadTicketAttachments(this.state.currentTicket.ticketId);
    //         }
    //     } catch(error) {
    //         console.error('文件上传失败:', error);
    //         NotifyUtil.error('上传失败，请重试');
    //     }
    // }

    /**
     * 文件下载处理
     */
    _downloadAttachment(ticketId, filePath, fileName) {
        $.ajax({
            url: `/api/files/check/${ticketId}/${filePath}`,
            method: 'GET'
        }).done((response) => {
            if (response.code === 200 && response.data) {
                $.ajax({
                    url: `/api/files/download/${ticketId}/${filePath}`,
                    method: 'GET',
                    xhrFields: {
                        responseType: 'blob'
                    }
                }).done((blob) => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }).fail(() => {
                    NotifyUtil.error("下载失败");
                });
            } else {
                NotifyUtil.error("文件已失效");
            }
        }).fail(() => {
            NotifyUtil.error("校验文件失败");
        });
    }

    /**
     * 文件预览处理
     */
    _previewFile(ticketId, filePath, fileName) {
        if (!ticketId || !filePath || !fileName) {
            NotifyUtil.error("文件信息不完整");
            return;
        }

        // 清除之前的预览
        $('#filePreviewContainer').remove();

        const fileExt = fileName.split('.').pop().toLowerCase();
        const $previewContainer = $(`
            <div id="filePreviewContainer" class="preview-container">
                <div class="preview-header">
                    <h5>${fileName}</h5>
                    <button class="btn-close"></button>
                </div>
                <div class="preview-body"></div>
            </div>
        `).appendTo('body');

        $previewContainer.find('.btn-close').on('click', () => {
            $previewContainer.remove();
        });

        if (['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(fileExt)) {
            $.ajax({
                url: `/api/files/preview/${filePath}`,
                type: 'GET',
                xhrFields: {
                    responseType: 'blob'
                }
            }).done((blob) => {
                const url = window.URL.createObjectURL(blob);
                const $previewBody = $previewContainer.find('.preview-body');

                if (fileExt === 'pdf') {
                    $previewBody.html(`<iframe src="${url}" width="100%" height="100%"></iframe>`);
                } else {
                    $previewBody.html(`<img src="${url}" alt="${fileName}" style="max-width: 100%; max-height: 100%;">`);
                }

                $previewContainer.addClass('show');
            }).fail(() => {
                NotifyUtil.error("预览失败");
                $previewContainer.remove();
            });
        } else {
            this._downloadAttachment(ticketId, filePath, fileName);
            $previewContainer.remove();
        }
    }

    // 复用TicketUtil的工具方法
    _formatDate(date) {
        return TicketUtil.formatDate(date);
    }

    _getStatusText(status) {
        return TicketUtil.getStatusText(status);
    }

    _getPriorityClass(priority) {
        return this.PRIORITY_MAP[priority]?.class || 'low';
    }
    _getPriorityText(priority) {
        return this.PRIORITY_MAP[priority]?.text || '普通';
    }

    _getFileIconClass(fileExt) {
        const iconMap = {
            'pdf': 'bi-file-pdf',
            'doc': 'bi-file-word',
            'docx': 'bi-file-word',
            'xls': 'bi-file-excel',
            'xlsx': 'bi-file-excel',
            'png': 'bi-file-image',
            'jpg': 'bi-file-image',
            'jpeg': 'bi-file-image',
            'default': 'bi-file-earmark'
        };
        return iconMap[fileExt] || iconMap.default;
    }

    _escapeHtml(str) {
        if(!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// 初始化实例
$(document).ready(() => {
    window.ticketManagement = new TicketManagement();
});