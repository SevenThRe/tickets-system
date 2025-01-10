/**
 * TodoList.js
 * 待办工单列表页面控制器
 * 实现工单的搜索、查看、处理等功能
 */
class TodoList {
    /**
     * 构造函数 - 初始化组件属性和状态
     */
    constructor() {
        // 缓存DOM元素引用
        this.$todoList = $('#todoList');
        this.$searchForm = $('#searchForm');
        this.$pagination = $('#pagination');
        this.$totalCount = $('#totalCount');

        // 加载状态元素
        this.$loading = null;

        // 状态管理
        this.state = {
            loading: false,          // 加载状态标记
            currentPage: 1,          // 当前页码
            pageSize: 10,            // 每页条数
            total: 0,                // 总记录数
            filters: {               // 筛选条件
                keyword: '',         // 关键词
                priority: '',        // 优先级
                startDate: '',       // 开始日期
                endDate: ''          // 结束日期
            }
        };

        // 初始化事件绑定
        this.initEventHandlers();

        // 加载初始数据
        this.loadTodoList();
    }

    /**
     * 显示加载状态
     * 创建并显示全局loading遮罩
     */
    showLoading() {
        if (!this.$loading) {
            this.$loading = $(`
                <div class="loading-overlay">
                    <div class="spinner-border text-primary"></div>
                    <div class="loading-text">加载中...</div>
                </div>
            `).appendTo('body');

            // 添加样式
            this.$loading.css({
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.8)',
                display: 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'z-index': 9999
            });
        }
        this.$loading.show();
    }

    /**
     * 隐藏加载状态
     * 隐藏全局loading遮罩
     */
    hideLoading() {
        if (this.$loading) {
            this.$loading.hide();
        }
    }

    /**
     * 显示成功提示
     * @param {string} message - 提示信息
     */
    showSuccess(message) {
        // 使用Bootstrap Toast或其他提示组件
        $.notify({
            message: message,
            type: 'success',
            delay: 3000
        });
    }

    /**
     * 显示错误提示
     * @param {string} message - 错误信息
     */
    showError(message) {
        // 使用Bootstrap Toast或其他提示组件
        $.notify({
            message: message,
            type: 'danger',
            delay: 3000
        });
    }

    /**
     * 初始化事件处理器
     * 绑定各种DOM事件
     */
    initEventHandlers() {
        // 搜索表单提交
        this.$searchForm.on('submit', (e) => {
            e.preventDefault();
            this.handleSearch();
        });

        // 表单字段变化时自动触发搜索
        this.$searchForm.find('select, input[type="date"]').on('change', () => {
            this.handleSearch();
        });

        // 关键词搜索防抖
        let searchTimeout = null;
        this.$searchForm.find('input[type="text"]').on('input', (e) => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(() => {
                this.handleSearch();
            }, 500);
        });

        // 重置按钮点击
        $('#resetBtn').on('click', () => this.handleReset());

        // 分页点击事件
        this.$pagination.on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && page !== this.state.currentPage) {
                this.state.currentPage = page;
                this.loadTodoList();
            }
        });
    }


    /**
     * 处理搜索请求
     */
    async handleSearch() {
        // 收集表单数据
        const formData = new FormData(this.$searchForm[0]);
        this.state.filters = {
            keyword: formData.get('keyword') || '',
            priority: formData.get('priorityFilter') || '',
            startDate: formData.get('startDate') || '',
            endDate: formData.get('endDate') || ''
        };

        // 重置页码并重新加载
        this.state.currentPage = 1;
        await this.loadTodoList();
    }

    /**
     * 处理重置操作
     */
    async handleReset() {
        // 重置表单
        this.$searchForm[0].reset();

        // 重置过滤条件
        this.state.filters = {
            keyword: '',
            priority: '',
            startDate: '',
            endDate: ''
        };

        // 重新加载数据
        this.state.currentPage = 1;
        await this.loadTodoList();
    }

    /**
     * 加载待办工单列表
     */
    async loadTodoList() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this.showLoading();

            // 构造请求参数
            const params = {
                pageNum: this.state.currentPage,
                pageSize: this.state.pageSize,
                ...this.state.filters
            };

            // 发起请求
            const response = await $.ajax({
                url: '/api/tickets/todos',
                method: 'GET',
                data: params,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                // 更新状态
                this.state.total = response.data.total;

                // 渲染列表和分页
                this.renderTodoList(response.data.list);
                this.renderPagination();

                // 更新总数显示
                this.$totalCount.text(this.state.total);
            } else {
                throw new Error(response.message || '加载失败');
            }

        } catch (error) {
            console.error('加载待办工单失败:', error);
            this.showError(error.message || '加载失败，请重试');
        } finally {
            this.state.loading = false;
            this.hideLoading();
        }
    }
    /**
     * 渲染待办工单列表
     * @param {Array} todos - 工单列表数据
     */
    renderTodoList(todos) {
        if (!todos || todos.length === 0) {
            this.$todoList.html(`
            <tr>
                <td colspan="7" class="text-center">暂无待办工单</td>
            </tr>
        `);
            return;
        }

        const html = todos.map(ticket => `
        <tr>
            <td>${this.escapeHtml(ticket.code)}</td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="priority-indicator priority-${ticket.priority.toLowerCase()}"></span>
                    ${this.escapeHtml(ticket.title)}
                </div>
            </td>
            <td>${this.escapeHtml(ticket.departmentName)}</td>
            <td>${this.getPriorityText(ticket.priority)}</td>
            <td>${ticket.expectFinishTime ? this.formatDateTime(ticket.expectFinishTime) : '-'}</td>
            <td>${this.formatDateTime(ticket.createTime)}</td>
            <td>
                <button class="btn btn-sm btn-primary process-btn" 
                        data-id="${ticket.id}">
                    处理工单
                </button>
            </td>
        </tr>
    `).join('');

        this.$todoList.html(html);
    }

    /**
     * 渲染分页控件
     */
    renderPagination() {
        const { currentPage, pageSize, total } = this.state;
        const totalPages = Math.ceil(total / pageSize);

        let html = '';

        // 上一页
        html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">
                上一页
            </a>
        </li>
    `;

        // 页码
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages ||
                (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
            }
        }

        // 下一页
        html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">
                下一页
            </a>
        </li>
    `;

        this.$pagination.html(html);
    }
    /**
     * 处理工单
     * @param {string} ticketId - 工单ID
     */
    async processTicket(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}/process`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                contentType: 'application/json',
                data: JSON.stringify({
                    note: $('#processNote').val().trim()
                })
            });

            if (response.code === 200) {
                this.showSuccess('工单处理成功');
                await this.loadTodoList();
                $('#processModal').modal('hide');
            } else {
                throw new Error(response.message || '处理失败');
            }

        } catch (error) {
            console.error('处理工单失败:', error);
            this.showError(error.message || '处理失败，请重试');
        }
    }

    /**
     * 显示工单处理模态框
     * @param {string} ticketId - 工单ID
     */
    async showProcessModal(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                const ticket = response.data;

                // 填充模态框数据
                $('#ticketCode').text(ticket.code);
                $('#ticketTitle').text(ticket.title);
                $('#ticketContent').text(ticket.content);
                $('#createTime').text(this.formatDateTime(ticket.createTime));

                // 显示模态框
                $('#processModal').modal('show');

                // 清空处理说明
                $('#processNote').val('');

            } else {
                throw new Error(response.message || '加载失败');
            }

        } catch (error) {
            console.error('加载工单详情失败:', error);
            this.showError(error.message || '加载失败，请重试');
        }
    }

    /**
     * 工具方法
     */

    // 格式化日期时间
    formatDateTime(date) {
        return new Date(date).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 获取优先级文本
    getPriorityText(priority) {
        const map = {
            'HIGH': '高',
            'MEDIUM': '中',
            'LOW': '低'
        };
        return map[priority] || priority;
    }

    // 转义HTML
    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
$(document).ready(() => {
    window.todoList = new TodoList();
});