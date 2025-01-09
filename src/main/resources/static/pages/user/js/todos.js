/**
 * TodoList.js
 * 待办工单列表页面控制器
 * 实现待办工单的查询、处理等功能
 */
class TodoList {
    constructor() {
        // 缓存jQuery选择器结果
        this.$container = $('#main');
        this.$todoList = $('#todoList');
        this.$pagination = $('#pagination');
        this.$totalCount = $('#totalCount');
        this.$searchForm = $('#searchForm');
        this.$processModal = $('#processModal');

        // 状态管理
        this.state = {
            loading: false,
            currentTicket: null,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {
                keyword: '',
                priority: '',
                startDate: '',
                endDate: ''
            }
        };

        // 绑定事件处理器
        this.bindEvents();

        // 初始化Bootstrap模态框
        this.processModal = new bootstrap.Modal(this.$processModal[0]);

        // 初始化
        this.init();
    }

    /**
     * 绑定事件处理器
     */
    bindEvents() {
        // 搜索和重置
        this.$searchForm.on('submit', (e) => this.handleSearch(e));
        $('#resetBtn').on('click', () => this.handleReset());

        // 工单处理
        this.$container.on('click', '.process-ticket', (e) => this.showProcessModal(e));
        $('#submitProcessBtn').on('click', (e) => this.handleProcessSubmit(e));

        // 分页事件委托
        this.$pagination.on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && page !== this.state.pagination.current) {
                this.state.pagination.current = page;
                this.loadTickets();
            }
        });
    }

    /**
     * 初始化
     */
    async init() {
        try {
            await this.loadTickets();
            this.checkUrlParams();
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('页面加载失败,请刷新重试');
        }
    }

    /**
     * 检查URL参数
     */
    checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const ticketId = params.get('id');
        if (ticketId) {
            this.showProcessModal(null, ticketId);
        }
    }

    /**
     * 加载工单列表
     */
    async loadTickets() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this.showLoading();

            const { current, pageSize } = this.state.pagination;
            const params = {
                pageNum: current,
                pageSize,
                ...this.state.filters
            };

            const response = await $.ajax({
                url: '/api/tickets/todos',
                method: 'GET',
                data: params,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                const { list = [], total = 0 } = response.data;
                this.state.pagination.total = total;
                this.renderTicketList(list);
                this.updatePagination();
            } else {
                throw new Error(response.message || '加载失败');
            }

        } catch (error) {
            console.error('加载待办工单失败:', error);
            this.handleError(error);
        } finally {
            this.state.loading = false;
            this.hideLoading();
        }
    }

    /**
     * 渲染工单列表
     */
    renderTicketList(tickets) {
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
                <td>${this.getPriorityText(ticket.priority)}</td>
                <td>${ticket.expectFinishTime ?
            this.formatDate(ticket.expectFinishTime) : '-'}</td>
                <td>${this.formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-primary process-ticket" 
                            data-id="${ticket.ticketId}">
                        处理工单
                    </button>
                </td>
            </tr>
        `).join('');

        this.$todoList.html(html || '<tr><td colspan="7" class="text-center">暂无待办工单</td></tr>');
        this.$totalCount.text(this.state.pagination.total);
    }

    /**
     * 更新分页控件
     */
    updatePagination() {
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
            } else if (i === current - 3 || i === current + 3) {
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

        this.$pagination.html(html);
    }

    /**
     * 显示处理工单模态框
     */
    async showProcessModal(e, ticketId) {
        if (e) {
            e.preventDefault();
            ticketId = $(e.currentTarget).data('id');
        }

        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                this.state.currentTicket = response.data;
                this.updateModalContent();
                this.processModal.show();
            } else {
                throw new Error(response.message || '加载工单详情失败');
            }

        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError('加载工单详情失败');
        }
    }

    /**
     * 更新模态框内容
     */
    updateModalContent() {
        const ticket = this.state.currentTicket;
        if (!ticket) return;

        $('#ticketCode').text(ticket.code);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(this.formatDate(ticket.createTime));
        this.renderAttachments(ticket.attachments);
    }

    /**
     * 处理工单提交
     */
    async handleProcessSubmit(e) {
        e.preventDefault();

        if (!this.state.currentTicket) return;

        const note = $('#processNote').val().trim();
        if (!note) {
            this.showError('请输入处理说明');
            return;
        }

        try {
            // 提交处理
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.ticketId}/process`,
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                data: JSON.stringify({ note })
            });

            if (response.code === 200) {
                // 处理附件上传
                const files = $('#processAttachments')[0].files;
                if (files.length > 0) {
                    await this.uploadAttachments(files);
                }

                this.showSuccess('工单处理成功');
                this.processModal.hide();
                await this.loadTickets();
            } else {
                throw new Error(response.message || '处理工单失败');
            }

        } catch (error) {
            console.error('处理工单失败:', error);
            this.showError(error.message || '处理工单失败');
        }
    }

    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
        const priorityMap = {
            'HIGH': '高优先级',
            'MEDIUM': '中等优先级',
            'LOW': '低优先级'
        };
        return priorityMap[priority] || priority;
    }

    /**
     * 格式化日期
     */
    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        const pad = num => String(num).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }

    /**
     * 渲染附件列表
     */
    renderAttachments(attachments) {
        if (!attachments?.length) {
            $('#ticketAttachments').html('<div class="text-muted">无附件</div>');
            return;
        }

        const html = attachments.map(file => `
        <div class="attachment-item">
            <i class="bi bi-paperclip"></i>
            <a href="/api/attachments/${file.id}" target="_blank">${file.fileName}</a>
            <span class="text-muted ms-2">(${this.formatFileSize(file.fileSize)})</span>
        </div>
    `).join('');

        $('#ticketAttachments').html(html);
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    /**
     * 处理搜索
     */
    handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        this.state.filters = {
            keyword: formData.get('keyword'),
            priority: formData.get('priorityFilter'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate')
        };
        this.state.pagination.current = 1;
        this.loadTickets();
    }

    /**
     * 处理重置
     */
    handleReset() {
        this.$searchForm[0].reset();
        this.state.filters = {
            keyword: '',
            priority: '',
            startDate: '',
            endDate: ''
        };
        this.state.pagination.current = 1;
        this.loadTickets();
    }

    /**
     * 上传附件
     */
    async uploadAttachments(files) {
        // 文件验证配置
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        const maxFiles = 5;

        // 验证文件
        if (files.length > maxFiles) {
            throw new Error(`最多只能上传${maxFiles}个附件`);
        }

        for (const file of files) {
            if (file.size > maxSize) {
                throw new Error(`文件 ${file.name} 大小超过限制(10MB)`);
            }
            if (!allowedTypes.includes(file.type)) {
                throw new Error(`文件 ${file.name} 类型不支持`);
            }
        }

        // 构建表单数据
        const formData = new FormData();
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.ticketId}/attachments`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                data: formData,
                processData: false,
                contentType: false,
                xhr: () => {
                    const xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener('progress', (e) => {
                        if (e.lengthComputable) {
                            const percent = Math.round((e.loaded / e.total) * 100);
                            $('#uploadProgress').text(`上传进度：${percent}%`);
                        }
                    }, false);
                    return xhr;
                }
            });

            if (response.code !== 200) {
                throw new Error(response.message || '上传附件失败');
            }
        } catch (error) {
            console.error('上传附件失败:', error);
            throw new Error('上传附件失败，请重试');
        }
    }

    /**
     * 处理错误
     */
    handleError(error) {
        if (error.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }

        if (error.status === 403) {
            this.showError('您没有访问权限');
            return;
        }

        const errorMessage = error.responseJSON?.message || error.message || '操作失败，请重试';
        this.showError(errorMessage);
    }

    /**
     * 验证表单数据
     */
    validateForm() {
        const note = $('#processNote').val().trim();
        if (!note) {
            this.showError('请输入处理说明');
            return false;
        }

        const files = $('#processAttachments')[0].files;
        if (files.length > 5) {
            this.showError('最多只能上传5个附件');
            return false;
        }

        return true;
    }

    /**
     * 获取状态标签样式类
     */
    getStatusClass(status) {
        const statusMap = {
            'PENDING': 'status-pending',
            'PROCESSING': 'status-processing',
            'COMPLETED': 'status-completed',
            'CLOSED': 'status-closed'
        };
        return statusMap[status] || '';
    }

    /**
     * 显示错误提示
     */
    showError(message) {
        $.notify(message, {
            className: 'error',
            position: 'top right'
        });
    }

    /**
     * 显示成功提示
     */
    showSuccess(message) {
        $.notify(message, {
            className: 'success',
            position: 'top right'
        });
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        if (!this.$loading) {
            this.$loading = $('<div class="loading-overlay">')
                .append('<div class="spinner-border text-primary">')
                .appendTo('body');
        }
        this.$loading.show();
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        if (this.$loading) {
            this.$loading.hide();
        }
    }

    /**
     * 销毁实例
     * 释放资源并销毁实例
     */
    destroy() {
        // 移除事件监听
        this.$searchForm.off();
        this.$container.off();
        this.$pagination.off();

        // 销毁模态框
        if (this.processModal) {
            this.processModal.dispose();
        }

        // 移除加载遮罩
        if (this.$loading) {
            this.$loading.remove();
        }

        // 清理引用
        this.$container = null;
        this.$todoList = null;
        this.$pagination = null;
        this.$processModal = null;
        this.$loading = null;
        this.state = null;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.todoList = new TodoList();
});