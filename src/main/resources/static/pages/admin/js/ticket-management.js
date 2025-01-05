/**
 * ticket-management.js
 * 工单管理页面控制器
 */
class TicketManagement extends BaseComponent {
    constructor() {
        super({
            container: '#main',
            events: {
                'submit #searchForm': '_handleSearch',
                'click #resetBtn': '_handleReset',
                'click #exportBtn': '_handleExport',
                'click #createTicketBtn': '_showCreateTicketModal',
                'click #saveTicketBtn': '_handleSaveTicket',
                'click .view-ticket': '_handleViewTicket',
                'click #closeDetailBtn': '_closeTicketDetail',
                'click #processTicketBtn': '_handleProcessTicket',
                'click #resolveTicketBtn': '_handleResolveTicket',
                'click #transferTicketBtn': '_showTransferModal',
                'click #confirmTransferBtn': '_handleTransferTicket',
                'click #closeTicketBtn': '_handleCloseTicket'
            }
        });

        // 状态管理
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
                assigneeId: '',
                startDate: '',
                endDate: ''
            }
        };

        // 初始化组件
        this.init();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            // 加载页面初始数据
            await Promise.all([
                this._loadDepartments(),
                this._loadAssignees(),
                this._loadTickets()
            ]);

            // 初始化子组件
            this._initComponents();

            // 检查URL参数
            this._checkUrlParams();

        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面初始化失败，请刷新重试');
        }
    }

    /**
     * 初始化子组件
     */
    _initComponents() {
        // 初始化工单模态框
        this.ticketModal = new bootstrap.Modal('#ticketModal');
        // 初始化转交模态框
        this.transferModal = new bootstrap.Modal('#transferModal');
        // 初始化其他组件...
    }

    /**
     * 检查URL参数
     */
    _checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const ticketId = params.get('id');
        if (ticketId) {
            this._showTicketDetail(ticketId);
        }
    }

    /**
     * 加载部门数据
     */
    async _loadDepartments() {
        try {
            const response = await window.requestUtil.get(window.Const.API.SYSTEM.GET_DEPARTMENT_LIST);
            const departments = response.data;
            this._renderDepartmentOptions(departments);
        } catch (error) {
            console.error('加载部门失败:', error);
            throw error;
        }
    }

    /**
     * 加载处理人数据
     */
    async _loadAssignees() {
        try {
            const response = await window.requestUtil.get(`${window.Const.API.USER.GET_LIST}?role=processor`);
            const assignees = response.data;
            this._renderAssigneeOptions(assignees);
        } catch (error) {
            console.error('加载处理人失败:', error);
            throw error;
        }
    }

    /**
     * 加载工单列表
     */
    async _loadTickets() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const { current, pageSize } = this.state.pagination;
            const params = {
                pageNum: current,
                pageSize,
                ...this.state.filters
            };

            const response = await window.requestUtil.get(window.Const.API.TICKET.GET_LIST, params);

            this.state.tickets = response.data.list;
            this.state.pagination.total = response.data.total;

            this._renderTicketList();
            this._updatePagination();

        } catch (error) {
            console.error('加载工单列表失败:', error);
            this.showError('加载工单列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染工单列表
     */
    _renderTicketList() {
        const html = this.state.tickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                        ${ticket.title}
                    </div>
                </td>
                <td>${ticket.department}</td>
                <td>${ticket.assignee || '-'}</td>
                <td>
                    <span class="ticket-status status-${ticket.status.toLowerCase()}">
                        ${window.Const.BUSINESS.TICKET.STATUS_MAP.text[ticket.status]}
                    </span>
                </td>
                <td>${window.Const.BUSINESS.TICKET.PRIORITY_MAP.text[ticket.priority]}</td>
                <td>${window.utils.formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" data-id="${ticket.id}">
                        <i class="bi bi-eye"></i> 查看
                    </button>
                </td>
            </tr>
        `).join('');

        $('#ticketList').html(html);
        $('#totalCount').text(this.state.pagination.total);
    }

    /**
     * 处理查询
     */
    _handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.state.filters = {
            keyword: formData.get('keyword'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            departmentId: formData.get('department'),
            assigneeId: formData.get('assignee'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate')
        };
        this.state.pagination.current = 1;
        this._loadTickets();
    }

    /**
     * 显示工单详情
     */
    async _showTicketDetail(ticketId) {
        try {
            const response = await window.requestUtil.get(window.Const.API.TICKET.GET_DETAIL(ticketId));
            this.state.currentTicket = response.data;

            // 更新详情面板
            this._updateTicketDetail();

            // 显示详情面板
            $('.ticket-detail-panel').addClass('show');

        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError('加载工单详情失败');
        }
    }

    /**
     * 更新工单详情面板
     */
    _updateTicketDetail() {
        const ticket = this.state.currentTicket;
        if (!ticket) return;

        $('#ticketCode').text(ticket.code);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(window.utils.formatDate(ticket.createTime));
        $('#ticketStatus').html(`
            <span class="ticket-status status-${ticket.status.toLowerCase()}">
                ${window.Const.BUSINESS.TICKET.STATUS_MAP.text[ticket.status]}
            </span>
        `);

        // 渲染附件列表
        this._renderAttachments(ticket.attachments);

        // 渲染处理记录
        this._renderTimeline(ticket.records);

        // 更新按钮状态
        this._updateActionButtons(ticket.status);
    }

    /**
     * 渲染时间线
     */
    _renderTimeline(records) {
        const html = records.map(record => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-time">
                        ${window.utils.formatDate(record.createTime)}
                    </div>
                    <div class="timeline-title">
                        <strong>${record.operator}</strong>
                        ${this._getOperationText(record.operation)}
                    </div>
                    <div class="timeline-body">
                        ${record.content || ''}
                    </div>
                </div>
            </div>
        `).join('');

        $('#ticketTimeline').html(html);
    }

    /**
     * 获取操作文本
     */
    _getOperationText(operation) {
        const operationMap = {
            'CREATE': '创建了工单',
            'PROCESS': '开始处理',
            'COMMENT': '添加了备注',
            'TRANSFER': '转交工单',
            'RESOLVE': '完成处理',
            'CLOSE': '关闭工单'
        };
        return operationMap[operation] || operation;
    }

    /**
     * 更新操作按钮状态
     */
    _updateActionButtons(status) {
        const buttons = {
            processBtn: $('#processTicketBtn'),
            resolveBtn: $('#resolveTicketBtn'),
            transferBtn: $('#transferTicketBtn'),
            closeBtn: $('#closeTicketBtn')
        };

        // 根据状态启用/禁用按钮
        switch(status) {
            case 'PENDING':
                buttons.processBtn.prop('disabled', false);
                buttons.resolveBtn.prop('disabled', true);
                buttons.transferBtn.prop('disabled', false);
                buttons.closeBtn.prop('disabled', false);
                break;
            case 'PROCESSING':
                buttons.processBtn.prop('disabled', true);
                buttons.resolveBtn.prop('disabled', false);
                buttons.transferBtn.prop('disabled', false);
                buttons.closeBtn.prop('disabled', false);
                break;
            case 'COMPLETED':
                buttons.processBtn.prop('disabled', true);
                buttons.resolveBtn.prop('disabled', true);
                buttons.transferBtn.prop('disabled', true);
                buttons.closeBtn.prop('disabled', false);
                break;
            case 'CLOSED':
                Object.values(buttons).forEach(btn => btn.prop('disabled', true));
                break;
        }
    }

    /**
     * 处理工单处理
     */
    async _handleProcessTicket() {
        const note = $('#processingNote').val().trim();
        if(!note) {
            this.showError('请输入处理说明');
            return;
        }

        try {
            await window.requestUtil.put(window.Const.API.TICKET.PUT_PROCESS(this.state.currentTicket.id), {
                note: note
            });

            this.showSuccess('工单已开始处理');
            await this._showTicketDetail(this.state.currentTicket.id);
            await this._loadTickets();

        } catch(error) {
            console.error('处理工单失败:', error);
            this.showError('处理工单失败');
        }
    }

    /**
     * 处理工单完成
     */
    async _handleResolveTicket() {
        const note = $('#processingNote').val().trim();
        if(!note) {
            this.showError('请输入完成说明');
            return;
        }

        try {
            await window.requestUtil.put(window.Const.API.TICKET.PUT_RESOLVE(this.state.currentTicket.id), {
                note: note
            });

            this.showSuccess('工单已完成处理');
            await this._showTicketDetail(this.state.currentTicket.id);
            await this._loadTickets();

        } catch(error) {
            console.error('完成工单失败:', error);
            this.showError('完成工单失败');
        }
    }

    /**
     * 处理工单转交
     */
    async _handleTransferTicket() {
        const departmentId = $('#transferDepartment').val();
        const note = $('#transferNote').val().trim();

        if(!departmentId || !note) {
            this.showError('请填写完整的转交信息');
            return;
        }

        try {
            await window.requestUtil.post(window.Const.API.TICKET.POST_TRANSFER(this.state.currentTicket.id), {
                departmentId: departmentId,
                note: note
            });

            this.transferModal.hide();
            this.showSuccess('工单已转交');
            await this._showTicketDetail(this.state.currentTicket.id);
            await this._loadTickets();

        } catch(error) {
            console.error('转交工单失败:', error);
            this.showError('转交工单失败');
        }
    }

    /**
     * 处理工单关闭
     */
    async _handleCloseTicket() {
        const note = $('#processingNote').val().trim();
        if(!note) {
            this.showError('请输入关闭原因');
            return;
        }

        if(!confirm('确定要关闭此工单吗？')) {
            return;
        }

        try {
            await window.requestUtil.put(window.Const.API.TICKET.PUT_CLOSE(this.state.currentTicket.id), {
                note: note
            });

            this.showSuccess('工单已关闭');
            await this._showTicketDetail(this.state.currentTicket.id);
            await this._loadTickets();

        } catch(error) {
            console.error('关闭工单失败:', error);
            this.showError('关闭工单失败');
        }
    }

    /**
     * 处理创建/编辑工单
     */
    async _handleSaveTicket() {
        if(!this._validateTicketForm()) {
            return;
        }

        const formData = new FormData($('#ticketForm')[0]);
        const ticketData = {
            title: formData.get('title'),
            content: formData.get('content'),
            departmentId: formData.get('department'),
            priority: formData.get('priority'),
            expectFinishTime: formData.get('expectFinishTime')
        };

        try {
            const isEdit = !!this.state.currentTicket;
            const url = isEdit ?
                window.Const.API.TICKET.GET_DETAIL(this.state.currentTicket.id) :
                window.Const.API.TICKET.POST_CREATE;
            const method = isEdit ? 'put' : 'post';

            await window.requestUtil[method](url, ticketData);

            // 处理附件上传
            const files = $('#attachments')[0].files;
            if(files.length > 0) {
                await this._uploadAttachments(files);
            }

            this.ticketModal.hide();
            this.showSuccess(`工单${isEdit ? '更新' : '创建'}成功`);
            await this._loadTickets();

        } catch(error) {
            console.error('保存工单失败:', error);
            this.showError('保存工单失败');
        }
    }

    /**
     * 验证工单表单
     */
    _validateTicketForm() {
        const form = $('#ticketForm')[0];
        if(!form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const title = $('#title').val().trim();
        const content = $('#content').val().trim();

        if(title.length < 5 || title.length > 50) {
            this.showError('标题长度应在5-50个字符之间');
            return false;
        }

        if(content.length < 10 || content.length > 500) {
            this.showError('内容长度应在10-500个字符之间');
            return false;
        }

        return true;
    }

    /**
     * 上传附件
     */
    async _uploadAttachments(files) {
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            await window.requestUtil.post(
                `/api/tickets/${this.state.currentTicket.id}/attachments`,
                formData
            );
        } catch(error) {
            console.error('上传附件失败:', error);
            throw error;
        }
    }

    /**
     * 更新分页
     */
    _updatePagination() {
        // 生成分页HTML
        const html = PaginationUtil.generateHTML(this.state.pagination, {
            containerClass: 'pagination justify-content-end'
        });
        $('#pagination').html(html);

        // 更新分页信息文本
        $('#totalCount').text(PaginationUtil.getInfoText(this.state.pagination));

        // 解绑之前的事件
        $('#pagination').off('click', '.page-link');

        // 绑定新的分页事件
        PaginationUtil.bindEvents('#pagination', (page) => {
            this.state.pagination = PaginationUtil.updateState(this.state.pagination, { current: page });
            this._loadTickets();
        });
    }

    /**
     * 处理导出
     */
    async _handleExport() {
        try {
            this.showLoading('正在导出数据...');

            const params = {
                ...this.state.filters,
                exportType: 'excel'
            };

            const response = await window.requestUtil.get(`${window.Const.API.TICKET.GET_LIST}/export`, params, {
                responseType: 'blob'
            });

            // 创建下载链接
            const url = window.URL.createObjectURL(response);
            const link = document.createElement('a');
            link.href = url;
            link.download = `工单列表_${window.utils.formatDate(new Date(), 'YYYYMMDD')}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.showSuccess('导出成功');
        } catch(error) {
            console.error('导出失败:', error);
            this.showError('导出失败');
        } finally {
            this.hideLoading();
        }
    }

}

// 页面加载完成后初始化
$(document).ready(() => {
    window.ticketManagement = new TicketManagement();
});