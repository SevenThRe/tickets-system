/**
 * MyTickets.js
 * 我的工单页面控制器类
 * 实现工单的查看、创建、处理等核心功能
 */
class MyTickets {

    constructor() {
        // 从localStorage获取用户信息
        this.userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

        /**
         * @type {Object} state - 状态管理对象
         * @property {boolean} loading - 加载状态标识
         * @property {Array<Object>} tickets - 工单列表数据,初始化为空数组
         * @property {Object|null} currentTicket - 当前查看的工单
         * @property {number} selectedRating - 选中的评分值
         * @property {Object} pagination - 分页信息
         * @property {Object} filters - 筛选条件
         */
        this.state = {
            loading: false,
            tickets: [], // 明确初始化为空数组
            currentTicket: null,
            selectedRating: 0,
            pagination: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {
                keyword: '',               // 搜索关键词
                status: '',               // 工单状态
                priority: '',             // 优先级
                departmentId: '',         // 部门ID
                processorId: '',          // 处理人ID
                startTime: '',            // 开始时间
                endTime: '',              // 结束时间
                userId: this.userInfo.userId  // 当前用户ID
            }
        };

        // DOM元素缓存
        this.elements = {
            container: $('#main'),
            ticketList: $('#ticketList'),
            searchForm: $('#searchForm'),
            ticketDetail: $('.ticket-detail-panel'),
            pagination: $('#pagination'),
            totalCount: $('#totalCount')
        };

        // 初始化loading遮罩
        this.$loading = $(`
            <div class="loading-overlay" style="display:none;">
                <div class="spinner-border text-primary"></div>
                <div class="loading-text">加载中...</div>
            </div>
        `).appendTo('body');


        this.debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        this._bindCreateTicketEvents();
        this._initSearchForm();
        // 绑定事件
        this._bindEvents();

        // 初始化数据
        this.init();
    }



    /**
     * 工具方法 - HTML转义
     * 防止XSS攻击
     * @param {string} str - 需要转义的字符串
     * @returns {string} 转义后的字符串
     * @private
     */
    _escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * 工具方法 - 获取状态样式类
     * @param {number} status - 状态码
     * @returns {string} CSS类名
     * @private
     */
    _getStatusClass(status) {
        const classMap = {
            0: 'pending',
            1: 'processing',
            2: 'completed',
            3: 'closed'
        };
        return classMap[status] || 'unknown';
    }

    /**
     * 工具方法 - 获取优先级样式类
     * @param {number} priority - 优先级(0:普通,1:紧急,2:非常紧急)
     * @returns {string} CSS类名
     * @private
     */
    _getPriorityClass(priority) {
        const classMap = {
            0: 'low',
            1: 'medium',
            2: 'high'
        };
        return classMap[priority] || 'low';
    }


    /**
     * 工具方法 - 格式化日期
     * @param {string} dateString - 日期字符串
     * @returns {string} 格式化后的日期字符串
     * @private
     */
    _formatDate(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('日期格式化失败:', error);
            return '-';
        }
    }

    /**
     * 初始化组件
     * 加载工单列表等初始化操作
     */
    async init() {
        try {
            await this._loadTickets();
        } catch(error) {
            console.error('初始化失败:', error);
            NotifyUtil.error('加载失败，请刷新重试');
        }
    }



    /**
     * 获取状态文本
     * @param {string} status - 状态码
     * @returns {string} 状态描述文本
     * @private
     */
    _getStatusText(status) {
        const statusMap = {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭'
        };
        return statusMap[status] || '未知状态';
    }

    /**
     * 获取优先级文本
     * @param {number} priority - 优先级
     * @returns {string} 优先级描述文本
     * @private
     */
    _getPriorityText(priority) {
        const textMap = {
            0: '普通',
            1: '紧急',
            2: '非常紧急'
        };
        return textMap[priority] || '普通';
    }


    /**
     * 渲染工单列表
     * @private
     */
    _renderTicketList() {
        // 确保tickets是数组且有数据
        if (!Array.isArray(this.state.tickets) || this.state.tickets.length === 0) {
            this.elements.ticketList.html('<tr><td colspan="8" class="text-center">暂无工单</td></tr>');
            this.elements.totalCount.text('0');
            return;
        }

        try {
            const html = this.state.tickets.map(ticket => {
                // 确保每个属性都有默认值
                return `
                    <tr>
                        <td>${ticket.ticketId || '-'}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <span class="priority-indicator priority-${this._getPriorityClass(ticket.priority)}"></span>
                                ${this._escapeHtml(ticket.title) || ''}
                            </div>
                        </td>
                        <td>${this._escapeHtml(ticket.departmentName) || '-'}</td>
                        <td>${this._escapeHtml(ticket.processorName) || '-'}</td>
                        <td>
                            <span class="ticket-status status-${this._getStatusClass(ticket.status)}">
                                ${this._getStatusText(ticket.status)}
                            </span>
                        </td>
                        <td>${this._getPriorityText(ticket.priority)}</td>
                        <td>${this._formatDate(ticket.createTime)}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary view-ticket" 
                                    data-id="${ticket.ticketId}">
                                <i class="bi bi-eye"></i> 查看
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

            this.elements.ticketList.html(html);
            this.elements.totalCount.text(this.state.pagination.total);
        } catch (error) {
            console.error('渲染工单列表失败:', error);
            this.elements.ticketList.html('<tr><td colspan="8" class="text-center text-danger">渲染失败</td></tr>');
            this.elements.totalCount.text('0');
        }
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 文件字节大小
     * @returns {string} 格式化后的大小
     * @private
     */
    _formatFileSize(bytes) {
        if(bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }


    /**
     * 绑定事件处理
     * 处理搜索、重置、查看详情等事件
     * @private
     */
    _bindEvents() {
        // 搜索表单提交处理
        this.elements.searchForm.on('submit', (e) => this._handleSearch(e));

        // 重置按钮点击处理
        $('#resetBtn').on('click', () => this._handleReset());

        // 查看工单详情
        this.elements.ticketList.on('click', '.view-ticket', (e) => {
            const ticketId = $(e.currentTarget).data('id');
            this._loadTicketDetail(ticketId);
        });

        // 评分点击事件
        $('.rating-star').on('click', (e) => {
            const rating = $(e.currentTarget).data('rating');
            this._handleRating(rating);
        });

        // 添加备注按钮点击
        $('#addNoteBtn').on('click', () => this._handleAddNote());

        // 关闭工单按钮点击
        $('#closeTicketBtn').on('click', () => this._handleCloseTicket());

        // 提交评价按钮点击
        $('#submitEvaluationBtn').on('click', () => this._handleSubmitEvaluation());

        // 关闭详情面板
        $('#closeDetailBtn').on('click', () => {
            this.elements.ticketDetail.removeClass('show');
            this.state.currentTicket = null;
        });
    }

    /**
     * 处理搜索事件
     * 收集表单数据并触发工单列表刷新
     * @param {Event} e - 表单提交事件对象
     * @private
     */
    _handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        // 更新筛选条件
        Object.assign(this.state.filters, {
            keyword: formData.get('keyword'),
            status: formData.get('status'),
            priority: formData.get('priority'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime')
        });

        // 重置分页并加载数据
        this.state.pagination.current = 1;
        this._loadTickets();
    }
    /**
     * 加载工单详情信息
     * @param {number} ticketId - 工单ID
     * @private
     */
    async _loadTicketDetail(ticketId) {
        try {
            // 发起工单详情请求
            const response = await $.ajax({
                url: `/api/tickets/${ticketId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(response.code === 200) {
                this.state.currentTicket = response.data;
                this._renderTicketDetail();
                this.elements.ticketDetail.addClass('show');

                // 加载处理记录
                await this._loadTicketRecords(ticketId);
            }
        } catch(error) {
            console.error('加载工单详情失败:', error);
            NotifyUtil.error('加载详情失败');
        }
    }



    /**
     * 初始化搜索表单功能
     * @private
     */
    _initSearchForm() {
        // 状态筛选变化事件
        $('#statusFilter').on('change', (e) => {
            this.state.filters.status = e.target.value;
        });

        // 优先级筛选变化事件
        $('#priorityFilter').on('change', (e) => {
            this.state.filters.priority = e.target.value;
        });

        // 日期范围选择变化事件
        $('#startDate, #endDate').on('change', (e) => {
            const field = e.target.id === 'startDate' ? 'startTime' : 'endTime';
            this.state.filters[field] = e.target.value;
        });

        // 关键词搜索输入事件（使用自定义防抖函数）
        $('#keyword').on('input', this.debounce((e) => {
            this.state.filters.keyword = e.target.value.trim();
        }, 300));
    }


    _bindCreateTicketEvents() {
        // 新建工单按钮点击事件
        $('#createTicketBtn').on('click', () => this._showCreateModal());

        // 保存工单按钮点击事件
        $('#saveTicketBtn').on('click', () => this._handleSaveTicket());

        // 附件上传变化事件
        $('#attachments').on('change', (e) => this._handleFileChange(e));

        // 部门选择变化事件
        $('#departmentId').on('change', (e) => {
            const departmentId = e.target.value;
            if(departmentId) {
                this._loadTicketTypes(departmentId);
            }
        });
    }

    /**
     * 显示创建工单模态框
     * @private
     */
    async _showCreateModal() {
        try {
            // 重置表单
            $('#ticketForm')[0].reset();
            $('#fileList').empty();

            // 加载部门列表
            await this._loadDepartments();

            // 显示模态框
            this.ticketModal.show();
        } catch(error) {
            console.error('初始化创建表单失败:', error);
            NotifyUtil.error('初始化表单失败');
        }
    }

    /**
     * 加载部门列表
     * @private
     */
    async _loadDepartments() {
        try {
            const response = await $.ajax({
                url: '/api/departments/list',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(response.code === 200) {
                const options = response.data.map(dept =>
                    `<option value="${dept.departmentId}">${dept.departmentName}</option>`
                ).join('');

                $('#departmentId').html('<option value="">请选择处理部门</option>' + options);
            }
        } catch(error) {
            console.error('加载部门列表失败:', error);
            throw error;
        }
    }

    /**
     * 加载工单类型
     * @param {string} departmentId - 部门ID
     * @private
     */
    async _loadTicketTypes(departmentId) {
        try {
            const response = await $.ajax({
                url: '/api/tickets/types',
                method: 'GET',
                data: { departmentId },
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
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
     * 处理文件选择变化
     * @param {Event} e - 文件输入变化事件
     * @private
     */
    _handleFileChange(e) {
        const files = e.target.files;
        const $fileList = $('#fileList');
        $fileList.empty();

        Array.from(files).forEach(file => {
            const $item = $(`
                <div class="file-item d-flex align-items-center p-2 border rounded mb-2">
                    <i class="bi bi-file-earmark me-2"></i>
                    <span class="flex-grow-1">${file.name}</span>
                    <small class="text-muted me-2">${this._formatFileSize(file.size)}</small>
                    <button type="button" class="btn btn-sm btn-link text-danger remove-file">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            `).appendTo($fileList);

            // 删除文件
            $item.find('.remove-file').on('click', () => {
                $item.remove();
                // 从文件输入中移除文件
                const dt = new DataTransfer();
                const remainingFiles = Array.from(files).filter(f => f !== file);
                remainingFiles.forEach(f => dt.items.add(f));
                e.target.files = dt.files;
            });
        });
    }

    /**
     * 处理工单保存
     * @private
     */
    async _handleSaveTicket() {
        try {
            const formData = new FormData($('#ticketForm')[0]);
            formData.append('createBy', this.userInfo.userId);
            formData.append('status', 'PENDING');

            // 表单验证
            if(!this._validateTicketForm(formData)) {
                return;
            }

            const response = await $.ajax({
                url: '/api/tickets',
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
                this.ticketModal.hide();
                await this._loadTickets();
            }
        } catch(error) {
            console.error('创建工单失败:', error);
            NotifyUtil.error('创建工单失败');
        }
    }

    /**
     * 验证工单表单
     * @param {FormData} formData - 表单数据
     * @returns {boolean} 验证结果
     * @private
     */
    _validateTicketForm(formData) {
        const requiredFields = {
            typeId: '工单类型',
            title: '标题',
            content: '内容描述',
            departmentId: '处理部门',
            priority: '优先级'
        };

        for(const [field, label] of Object.entries(requiredFields)) {
            if(!formData.get(field)) {
                NotifyUtil.warning(`请选择${label}`);
                return false;
            }
        }

        return true;
    }





    /**
     * 处理重置事件
     * 清空所有筛选条件并刷新数据
     * @private
     */
    _handleReset() {
        // 重置表单元素
        this.elements.searchForm[0].reset();

        // 重置日期选择
        $('#startDate, #endDate').val('');

        // 重置过滤条件到初始状态
        this.state.filters = {
            keyword: '',
            status: '',
            priority: '',
            startTime: '',
            endTime: '',
            userId: this.userInfo.userId  // 保持用户ID不变
        };

        // 重置分页
        this.state.pagination.current = 1;

        // 重新加载数据
        this._loadTickets();
    }

    /**
     * 加载工单列表
     * 根据筛选条件获取数据
     * @private
     */
    async _loadTickets() {
        if (this.state.loading) return;

        try {
            this.state.loading = true;
            this._showLoading();

            // 构建查询参数
            const params = {
                pageNum: this.state.pagination.current,
                pageSize: this.state.pagination.pageSize,
                ...this.state.filters
            };

            // 移除空值参数
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await $.ajax({
                url: '/api/tickets/my',
                method: 'GET',
                data: params,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.code === 200) {
                this.state.tickets = response.data || [];
                this.state.pagination.total = response.data?.length || 0;
                this._renderTicketList();
            }

        } catch (error) {
            console.error('加载工单列表失败:', error);
            NotifyUtil.error('加载工单列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 加载工单处理记录
     * @param {number} ticketId - 工单ID
     * @private
     */
    async _loadTicketRecords(ticketId) {
        try {
            const response = await $.ajax({
                url: `/api/records/detail/${ticketId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(response.code === 200) {
                this._renderTicketRecords(response.data);
            }
        } catch(error) {
            console.error('加载处理记录失败:', error);
            NotifyUtil.error('加载处理记录失败');
        }
    }

    /**
     * 渲染工单详情
     * @private
     */
    _renderTicketDetail() {
        const ticket = this.state.currentTicket;
        if(!ticket) return;

        // 渲染基本信息
        $('#ticketCode').text(ticket.ticketId);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(this._formatDate(ticket.createTime));

        // 渲染状态标签
        $('#ticketStatus').html(`
            <span class="ticket-status status-${ticket.status}">
                ${this._getStatusText(ticket.status)}
            </span>
        `);

        // 控制评价表单显示
        const canEvaluate = ticket.status === 2 && // 已完成
            ticket.createBy === this.userInfo.userId && // 是创建人
            !this._hasEvaluation(ticket.records); // 未评价
        $('#evaluationForm').toggle(canEvaluate);

        // 控制按钮状态
        const canClose = ticket.status !== 3 && // 非关闭状态
            (ticket.createBy === this.userInfo.userId || // 是创建人
                ticket.processorId === this.userInfo.userId); // 或处理人
        $('#closeTicketBtn').prop('disabled', !canClose);
    }

    /**
     * 渲染工单处理记录
     * @param {Array} records - 处理记录列表
     * @private
     */
    _renderTicketRecords(records) {
        if(!records?.length) {
            $('#ticketTimeline').html('<div class="text-muted">暂无处理记录</div>');
            return;
        }

        const html = records.map(record => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-time">
                        ${this._formatDate(record.createTime)}
                    </div>
                    <div class="timeline-title">
                        <strong>${record.operatorName}</strong>
                        ${this._getOperationText(record.operationType)}
                    </div>
                    ${record.operationContent ? `
                        <div class="timeline-body">
                            ${record.operationContent}
                        </div>
                    ` : ''}
                    ${record.evaluationScore ? `
                        <div class="evaluation-content">
                            <div class="rating-display">
                                ${this._renderStars(record.evaluationScore)}
                            </div>
                            <div class="evaluation-text">
                                ${record.evaluationContent}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        $('#ticketTimeline').html(html);
    }

    /**
     * 处理工单评分
     * @param {number} rating - 评分值(1-5)
     * @private
     */
    _handleRating(rating) {
        this.state.selectedRating = rating;
        $('.rating-star').each((index, star) => {
            $(star).toggleClass('bi-star-fill', index < rating)
                .toggleClass('bi-star', index >= rating);
        });
    }

    /**
     * 提交工单评价
     * @private
     */
    async _handleSubmitEvaluation() {
        if(!this.state.selectedRating) {
            NotifyUtil.warning('请选择评分');
            return;
        }

        const content = $('#evaluationContent').val().trim();
        if(!content) {
            NotifyUtil.warning('请输入评价内容');
            return;
        }

        try {
            await $.ajax({
                url: `/api/records`,
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    ticketId: this.state.currentTicket.ticketId,
                    operationType: 5, // 评价类型
                    operationContent: content,
                    evaluationScore: this.state.selectedRating,
                    evaluationContent: content
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            NotifyUtil.success('评价提交成功');
            $('#evaluationForm').hide();
            await this._loadTicketDetail(this.state.currentTicket.ticketId);
        } catch(error) {
            console.error('提交评价失败:', error);
            NotifyUtil.error('评价提交失败');
        }
    }

    /**
     * 工具方法 - 检查是否已评价
     * @param {Array} records - 处理记录列表
     * @returns {boolean} 是否已评价
     * @private
     */
    _hasEvaluation(records) {
        return records?.some(record =>
            record.operationType === 5 && record.evaluationScore > 0
        );
    }

    /**
     * 工具方法 - 渲染星级评分
     * @param {number} score - 评分值
     * @returns {string} 星级HTML
     * @private
     */
    _renderStars(score) {
        return Array(5).fill(0).map((_, i) =>
            `<i class="bi bi-star${i < score ? '-fill' : ''} text-warning"></i>`
        ).join('');
    }



    /**
     * 处理工单关闭
     * 需要填写关闭说明
     * @private
     */
    async _handleCloseTicket() {
        const content = $('#noteContent').val().trim();
        if(!content) {
            NotifyUtil.warning('请输入关闭说明');
            return;
        }

        if(!confirm('确定要关闭此工单吗？')) {
            return;
        }

        try {
            await $.ajax({
                url: `/api/tickets/${this.state.currentTicket.ticketId}/close`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    content,
                    operatorId: this.userInfo.userId
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            NotifyUtil.success('工单已关闭');
            await this._loadTicketDetail(this.state.currentTicket.ticketId);
            await this._loadTickets(); // 刷新列表
        } catch(error) {
            console.error('关闭工单失败:', error);
            NotifyUtil.error('关闭工单失败');
        }
    }

    /**
     * 处理添加备注
     * @private
     */
    async _handleAddNote() {
        const content = $('#noteContent').val().trim();
        if(!content) {
            NotifyUtil.warning('请输入备注内容');
            return;
        }

        try {
            await $.ajax({
                url: '/api/records',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    ticketId: this.state.currentTicket.ticketId,
                    operatorId: this.userInfo.userId,
                    operationType: 2, // 处理类型
                    operationContent: content
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            NotifyUtil.success('添加备注成功');
            $('#noteContent').val('');
            await this._loadTicketDetail(this.state.currentTicket.ticketId);
        } catch(error) {
            console.error('添加备注失败:', error);
            NotifyUtil.error('添加备注失败');
        }
    }



    /**
     * 显示加载状态
     * 在异步操作开始时调用
     * @private
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
        this.elements.container.addClass('loading');
    }

    /**
     * 隐藏加载状态
     * 在异步操作完成时调用
     * @private
     */
    _hideLoading() {
        if(this.$loading) {
            this.$loading.hide();
            this.elements.container.removeClass('loading');
        }
    }

    /**
     * 文件上传相关功能
     */

    /**
     * 初始化文件上传功能
     * @private
     */
    _initFileUpload() {
        const $fileInput = $('#attachments');
        const $fileList = $('<div class="file-list mt-2"></div>').insertAfter($fileInput);

        // 文件选择变化事件
        $fileInput.on('change', (e) => {
            const files = e.target.files;
            this._updateFileList(files, $fileList);
        });

        // 拖拽上传
        const $dropZone = $('<div class="upload-dropzone">拖拽文件到此处上传</div>')
            .insertAfter($fileInput);

        $dropZone.on('dragover', (e) => {
            e.preventDefault();
            $dropZone.addClass('dragover');
        });

        $dropZone.on('dragleave', () => {
            $dropZone.removeClass('dragover');
        });

        $dropZone.on('drop', (e) => {
            e.preventDefault();
            $dropZone.removeClass('dragover');
            const files = e.originalEvent.dataTransfer.files;
            $fileInput[0].files = files;
            this._updateFileList(files, $fileList);
        });
    }

    /**
     * 更新文件列表显示
     * @param {FileList} files - 选择的文件列表
     * @param {JQuery} $fileList - 文件列表容器元素
     * @private
     */
    _updateFileList(files, $fileList) {
        $fileList.empty();

        Array.from(files).forEach(file => {
            const $item = $(`
                <div class="file-item">
                    <i class="bi bi-file-earmark"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">(${this._formatFileSize(file.size)})</span>
                    <button type="button" class="btn btn-sm btn-link text-danger remove-file">
                        <i class="bi bi-x"></i>
                    </button>
                </div>
            `).appendTo($fileList);

            // 删除文件
            $item.find('.remove-file').on('click', () => {
                $item.remove();
                // 从FileList中移除文件 - 创建新的FileList
                const dt = new DataTransfer();
                const remainingFiles = Array.from(files).filter(f => f !== file);
                remainingFiles.forEach(f => dt.items.add(f));
                $('#attachments')[0].files = dt.files;
            });
        });
    }

    /**
     * 上传工单附件
     * @param {number} ticketId - 工单ID
     * @param {FileList} files - 附件文件列表
     * @returns {Promise<void>}
     * @private
     */
    async _uploadAttachments(ticketId, files) {
        if(!files.length) return;

        const formData = new FormData();
        formData.append('ticketId', ticketId);
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await $.ajax({
                url: '/api/attachments/upload',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(response.code === 200) {
                return response.data; // 返回上传成功的附件信息
            }
            throw new Error('上传失败');
        } catch(error) {
            console.error('上传附件失败:', error);
            throw error;
        }
    }


    /**
     * 修改创建工单方法,支持文件上传
     * @private
     */
    async _handleCreateTicket() {
        try {
            // 1. 先创建工单
            const ticketResponse = await $.ajax({
                url: '/api/tickets',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    title,
                    content,
                    departmentId,
                    priority,
                    createBy: this.userInfo.userId
                }),
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if(ticketResponse.code === 200) {
                const ticketId = ticketResponse.data;

                // 2. 上传附件(如果有)
                const files = $('#attachments')[0].files;
                if(files.length > 0) {
                    await this._uploadAttachments(ticketId, files);
                }

                NotifyUtil.success('工单创建成功');
                this.ticketModal.hide();
                await this._loadTickets();
            }
        } catch(error) {
            console.error('创建工单失败:', error);
            NotifyUtil.error('创建工单失败');
        }
    }

    /**
     *  导出工单
     * @returns {Promise<void>}
     */
    async exportTickets() {
        try {
            const params = new URLSearchParams({
                ...this.state.filters,
                pageSize: 1000 // 导出更多数据
            });

            window.location.href = `/api/tickets/export?${params.toString()}`;
        } catch(error) {
            console.error('导出失败:', error);
            NotifyUtil.error('导出失败');
        }
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.myTickets = new MyTickets();
    $('#exportBtn').on('click', () => this.exportTickets());

});