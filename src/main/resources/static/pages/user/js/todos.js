/**
 * TodoList.js
 * 待办工单列表页面控制器
 * 实现待办工单的查询、处理等功能
 *
 * @author SevenThRe
 * @created 2024-01-05
 */
class TodoList extends BaseComponent {
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
                'click .process-ticket': '_showProcessModal',
                'click #submitProcessBtn': '_handleProcessSubmit'
            }
        });

        // 状态管理
        this.state = {
            loading: false,           // 加载状态
            currentTicket: null,      // 当前处理的工单
            pagination: {             // 分页信息
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {                // 筛选条件
                keyword: '',
                priority: '',
                startDate: '',
                endDate: ''
            }
        };

        // 初始化模态框
        this.processModal = new bootstrap.Modal('#processModal');

        // 初始化组件
        this.init();
    }

    /**
     * 组件初始化
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // 加载工单列表
            await this._loadTickets();

            // 检查URL参数
            this._checkUrlParams();

        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面加载失败，请刷新重试');
        }
    }

    /**
     * 检查URL参数
     * @private
     */
    _checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const ticketId = params.get('id');
        if (ticketId) {
            this._showProcessModal(null, ticketId);
        }
    }

    async _loadTickets() {
        // 防重复加载
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            const { current, pageSize } = this.state.pagination;
            // 构建查询参数
            const params = {
                pageNum: current,
                pageSize,
                ...this.state.filters
            };

            // 请求数据
            const response = await window.requestUtil.get(Const.API.TICKET.GET_TODOS, params);

            // 数据校验
            if (!response?.data?.list) {
                throw new Error('接口返回数据格式错误');
            }

            // 解构数据
            const { list = [], total = 0 } = response.data;

            // 更新状态
            this.state.pagination.total = total;

            // 更新UI
            this._renderTicketList(list);
            this._updatePagination();

        } catch (error) {
            console.error('加载待办工单失败:', error);
            // 处理特定错误
            switch(error.status) {
                case 401:
                    window.location.href = '/login.html';
                    break;
                case 403:
                    this.showError('您没有查看待办工单的权限');
                    break;
                case 500:
                    this.showError('服务器错误，请稍后重试');
                    break;
                default:
                    this.showError(error.message || '加载待办工单失败，请重试');
            }
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染工单列表
     * @private
     * @param {Array} tickets - 工单列表数据
     */
    _renderTicketList(tickets) {
        const html = tickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                        ${ticket.title}
                    </div>
                </td>
                <td>${ticket.departmentName}</td>
                <td>${Const.BUSINESS.TICKET.PRIORITY_MAP.text[ticket.priority]}</td>
                <td>${ticket.expectFinishTime ?
            window.utils.formatDate(ticket.expectFinishTime) : '-'}</td>
                <td>${window.utils.formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-primary process-ticket" 
                            data-id="${ticket.ticketId}">
                        处理工单
                    </button>
                </td>
            </tr>
        `).join('');

        $('#todoList').html(html || '<tr><td colspan="7" class="text-center">暂无待办工单</td></tr>');
        $('#totalCount').text(this.state.pagination.total);
    }

    /**
     * 更新分页控件
     * @private
     */
    _updatePagination() {
        const { current, pageSize, total } = this.state.pagination;
        const totalPages = Math.ceil(total / pageSize);

        let html = '';

        // 上一页
        html += `
            <li class="page-item ${current === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current - 1}">上一页</a>
            </li>
        `;

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (
                i === 1 ||
                i === totalPages ||
                (i >= current - 2 && i <= current + 2)
            ) {
                html += `
                    <li class="page-item ${i === current ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `;
            } else if (
                i === current - 3 ||
                i === current + 3
            ) {
                html += `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
        }

        // 下一页
        html += `
            <li class="page-item ${current === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${current + 1}">下一页</a>
            </li>
        `;

        const $pagination = $('#pagination');
        $pagination.html(html);

        // 绑定页码点击事件
        $pagination.off('click').on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && page !== current) {
                this.state.pagination.current = page;
                this._loadTickets();
            }
        });
    }

    /**
     * 显示处理工单模态框
     * @private
     * @param {Event} [e] - 事件对象
     * @param {string} [ticketId] - 工单ID
     */
    async _showProcessModal(e, ticketId) {
        if (e) {
            e.preventDefault();
            ticketId = $(e.currentTarget).data('id');
        }

        try {
            // 加载工单详情
            const response = await window.requestUtil.get(
                Const.API.TICKET.GET_DETAIL(ticketId)
            );

            this.state.currentTicket = response.data;

            // 更新模态框内容
            this._updateModalContent();

            // 显示模态框
            this.processModal.show();

        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError('加载工单详情失败');
        }
    }

    /**
     * 更新模态框内容
     * @private
     */
    _updateModalContent() {
        const ticket = this.state.currentTicket;
        if (!ticket) return;

        // 更新基本信息
        $('#ticketCode').text(ticket.code);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(window.utils.formatDate(ticket.createTime));

        // 渲染附件列表
        this._renderAttachments(ticket.attachments);
    }

    /**
     * 渲染附件列表
     * @private
     * @param {Array} attachments - 附件列表
     */
    _renderAttachments(attachments) {
        if (!attachments || !attachments.length) {
            $('#ticketAttachments').html('<div class="text-muted">无附件</div>');
            return;
        }

        const html = attachments.map(file => `
            <div class="attachment-item">
                <i class="bi bi-paperclip"></i>
                <a href="/api/attachments/${file.id}" target="_blank">${file.fileName}</a>
                <span class="text-muted ms-2">(${window.utils.formatFileSize(file.fileSize)})</span>
            </div>
        `).join('');

        $('#ticketAttachments').html(html);
    }

    /**
     * 处理工单表单提交
     * @private
     * @param {Event} e - 事件对象
     */
    async _handleProcessSubmit(e) {
        e.preventDefault();

        if (!this.state.currentTicket) return;

        const note = $('#processNote').val().trim();
        if (!note) {
            this.showError('请输入处理说明');
            return;
        }

        try {
            // 提交处理
            await window.requestUtil.put(
                Const.API.TICKET.PUT_PROCESS(this.state.currentTicket.ticketId),
                { note }
            );

            // 处理附件上传
            const files = $('#processAttachments')[0].files;
            if (files.length > 0) {
                await this._uploadAttachments(files);
            }

            this.showSuccess('工单处理成功');
            this.processModal.hide();
            await this._loadTickets();

        } catch (error) {
            console.error('处理工单失败:', error);
            this.showError(error.message || '处理工单失败');
        }
    }

    /**
     * 文件上传处理
     * @private
     * @description 处理工单相关文件的上传，包含文件验证和上传进度
     * @param {FileList} files - 要上传的文件列表
     * @throws {Error} 当文件不符合要求或上传失败时抛出异常
     */
    async _uploadAttachments(files) {
        // 文件验证配置
        const maxSize = Const.FILE.MAX_SIZE;  // 10MB
        const allowedTypes = Const.FILE.ALLOWED_TYPES;
        const maxFiles = 5; // 最大允许5个附件

        // 文件数量检查
        if (files.length > maxFiles) {
            throw new Error(`最多只能上传${maxFiles}个附件`);
        }

        // 文件校验
        for (const file of files) {
            // 大小校验
            if (file.size > maxSize) {
                throw new Error(`文件 ${file.name} 大小超过限制(${maxSize / 1024 / 1024}MB)`);
            }
            // 类型校验
            if (!allowedTypes.includes(file.type)) {
                const allowedTypeNames = allowedTypes.map(type => Const.FILE.TYPE_MAP[type]).join('、');
                throw new Error(`不支持的文件类型 ${file.name}，仅支持${allowedTypeNames}`);
            }
        }

        // 构建表单数据
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            // 上传文件
            await window.requestUtil.post(
                Const.API.TICKET.PUT_UPLOAD(this.state.currentTicket.ticketId),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (progressEvent) => {
                        // 更新上传进度
                        const percent = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        $('#uploadProgress').text(`上传进度：${percent}%`);
                    }
                }
            );
        } catch (error) {
            console.error('文件上传失败:', error);
            throw new Error(Const.MESSAGES.ERROR.TICKET.ATTACHMENT_UPLOAD_FAILED);
        }
    }

    /**
     * 处理搜索
     * @private
     * @param {Event} e - 事件对象
     */
    _handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.state.filters = {
            keyword: formData.get('keyword'),
            priority: formData.get('priorityFilter'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate')
        };
        this.state.pagination.current = 1;
        this._loadTickets();
    }

    /**
     * 处理重置
     * @private
     */
    _handleReset() {
        $('#searchForm')[0].reset();
        this.state.filters = {
            keyword: '',
            priority: '',
            startDate: '',
            endDate: ''
        };
        this.state.pagination.current = 1;
        this._loadTickets();
    }

    /**
     * 组件销毁
     * @public
     * @description 清理组件资源，包括事件监听、定时器、DOM引用等
     */
    destroy() {
        // 清理事件监听
        $('#pagination').off('click');
        this.container.find('button').off('click');
        this.container.find('input').off('input change');

        // 销毁模态框
        if (this.processModal) {
            this.processModal.dispose();
            this.processModal = null;
        }

        // 清理DOM引用
        if (this.loadingEl) {
            this.loadingEl.remove();
            this.loadingEl = null;
        }

        // 清理状态
        this.state = null;

        // 调用父类销毁
        super.destroy();
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.todoList = new TodoList();
});