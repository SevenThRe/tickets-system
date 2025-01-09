/**
 * TicketManagement.js
 * 工单管理类 - 负责工单的查询、展示和状态管理
 */
class TicketManagement {
    /**
     * 构造函数 - 初始化组件属性和状态
     */
    constructor() {
        // 缓存DOM引用
        this.$container = $('#main');
        this.$ticketList = $('#ticketList');
        this.$searchForm = $('#searchForm');
        this.$pagination = $('#pagination');

        // 状态管理
        this.state = {
            loading: false,              // 加载状态标记
            tickets: [],                 // 工单列表数据
            currentTicket: null,         // 当前选中工单
            pagination: {                // 分页信息
                current: 1,
                pageSize: 10,
                total: 0
            },
            filters: {                   // 筛选条件
                keyword: '',             // 关键词搜索
                status: '',              // 工单状态
                priority: '',            // 优先级
                departmentId: '',        // 部门ID
                assigneeId: '',          // 处理人ID
                startDate: '',           // 开始日期
                endDate: ''              // 结束日期
            }
        };

        // 绑定事件处理器
        this._bindEvents();

        // 初始化组件
        this.init();
    }

    /**
     * 事件绑定
     * @private
     */
    _bindEvents() {
        // 搜索表单提交
        this.$searchForm.on('submit', (e) => this._handleSearch(e));

        // 重置按钮点击
        $('#resetBtn').on('click', () => this._handleReset());

        // 工单点击查看
        this.$ticketList.on('click', '.view-ticket', (e) => this._handleViewTicket(e));

        // 分页点击
        this.$pagination.on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if(page && page !== this.state.pagination.current) {
                this.state.pagination.current = page;
                this._loadTickets();
            }
        });
    }

    /**
     * 初始化方法
     */
    async init() {
        try {
            await this._loadTickets();
            this._checkUrlParams();
        } catch(error) {
            console.error('初始化失败:', error);
            this._showError('页面加载失败，请刷新重试');
        }
    }

    /**
     * 加载工单列表数据
     * @private
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
            this._showError('加载工单列表失败');
        } finally {
            this.state.loading = false;
            this._hideLoading();
        }
    }

    /**
     * 渲染工单列表
     * @private
     */
    _renderTicketList() {
        const html = this.state.tickets.map(ticket => `
            <tr>
                <td>${ticket.code}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${this._getPriorityClass(ticket.priority)}"></span>
                        ${ticket.title}
                    </div>
                </td>
                <td>${ticket.department || '-'}</td>
                <td>${ticket.processor || '-'}</td>
                <td>
                    <span class="ticket-status status-${ticket.status.toLowerCase()}">
                        ${this._getStatusText(ticket.status)}  
                    </span>
                </td>
                <td>${this._getPriorityText(ticket.priority)}</td>
                <td>${this._formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" 
                            data-id="${ticket.id}">
                        <i class="bi bi-eye"></i> 查看
                    </button>
                </td>
            </tr>
        `).join('');

        this.$ticketList.html(html);
    }

    /**
     * 处理搜索请求
     * @param {Event} e - 表单提交事件
     * @private
     */
    _handleSearch(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        this.state.filters = {
            keyword: formData.get('keyword'),
            status: formData.get('statusFilter'),
            priority: formData.get('priorityFilter'),
            departmentId: formData.get('departmentFilter'),
            assigneeId: formData.get('assigneeFilter'),
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
        this.$searchForm[0].reset();
        this.state.filters = {
            keyword: '',
            status: '',
            priority: '',
            departmentId: '',
            assigneeId: '',
            startDate: '',
            endDate: ''
        };
        this.state.pagination.current = 1;
        this._loadTickets();
    }

    /**
     * 获取状态文本
     * @private
     */
    _getStatusText(status) {
        return {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭'
        }[status] || status;
    }

    /**
     * 获取优先级样式类
     * @private
     */
    _getPriorityClass(priority) {
        return {
            'HIGH': 'high',
            'MEDIUM': 'medium',
            'LOW': 'low'
        }[priority] || 'low';
    }

    /**
     * 格式化日期
     * @private
     */
    _formatDate(date) {
        return new Date(date).toLocaleString();
    }

    /**
     * 显示加载状态
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
    }

    /**
     * 隐藏加载状态
     * @private
     */
    _hideLoading() {
        if(this.$loading) {
            this.$loading.hide();
        }
    }

    /**
     * 显示错误提示
     * @private
     */
    _showError(message) {
        $.notify({
            message: message,
            type: 'danger'
        });
    }

    /**
     * 组件销毁
     */
    destroy() {
        // 解绑事件
        this.$container.off();
        this.$searchForm.off();
        this.$ticketList.off();
        this.$pagination.off();

        // 清理DOM引用
        if(this.$loading) {
            this.$loading.remove();
        }

        // 清理状态
        this.state = null;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.ticketManagement = new TicketManagement();
});

/**
 * TicketEditor.js
 * 工单创建和编辑功能
 * 负责工单表单的验证、提交和文件上传
 */
function TicketEditor() {
    // 缓存DOM引用
    var $modal = $('#ticketModal');
    var $form = $('#ticketForm');
    var $attachments = $('#attachments');
    var $submitBtn = $('#saveTicketBtn');

    // 模态框实例
    var modal = new bootstrap.Modal($modal[0]);

    // 表单验证规则
    var validationRules = {
        title: {
            required: true,
            minLength: 5,
            maxLength: 50,
            message: '标题长度必须在5-50个字符之间'
        },
        content: {
            required: true,
            minLength: 10,
            maxLength: 500,
            message: '内容长度必须在10-500个字符之间'
        },
        departmentId: {
            required: true,
            message: '请选择处理部门'
        },
        priority: {
            required: true,
            message: '请选择优先级'
        }
    };

    /**
     * 初始化函数
     * 绑定事件处理器
     */
    function init() {
        // 表单提交事件
        $form.on('submit', handleSubmit);

        // 字段验证事件
        $form.find('input,select,textarea').on('blur', function(e) {
            var field = $(e.target).attr('name');
            validateField(field);
        });

        // 文件上传变更事件
        $attachments.on('change', handleFileChange);
    }

    /**
     * 显示创建工单模态框
     */
    function showCreateModal() {
        resetForm();
        $('#ticketModalTitle').text('新建工单');
        modal.show();
    }

    /**
     * 显示编辑工单模态框
     * @param {Object} ticket - 工单数据对象
     */
    function showEditModal(ticket) {
        fillForm(ticket);
        $('#ticketModalTitle').text('编辑工单');
        modal.show();
    }

    /**
     * 处理表单提交
     * @param {Event} e - 提交事件对象
     */
    function handleSubmit(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        var formData = getFormData();
        var isEdit = !!formData.ticketId;

        disableForm(true);

        $.ajax({
            url: isEdit ? '/api/tickets/' + formData.ticketId : '/api/tickets',
            method: isEdit ? 'PUT' : 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function(response) {
                if(response.code === 200) {
                    uploadAttachments(response.data.ticketId)
                        .then(function() {
                            modal.hide();
                            showSuccess(isEdit ? '工单更新成功' : '工单创建成功');
                            $(document).trigger('ticketSaved');
                        })
                        .catch(function(error) {
                            console.error('上传附件失败:', error);
                            showError('附件上传失败');
                        })
                        .finally(function() {
                            disableForm(false);
                        });
                }
            },
            error: function(error) {
                console.error('保存工单失败:', error);
                showError('保存失败，请重试');
                disableForm(false);
            }
        });
    }

    /**
     * 验证整个表单
     * @returns {boolean} 验证结果
     */
    function validateForm() {
        var isValid = true;

        // 遍历所有字段进行验证
        Object.keys(validationRules).forEach(function(field) {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * 验证单个字段
     * @param {string} field - 字段名称
     * @returns {boolean} 验证结果
     */
    function validateField(field) {
        var rules = validationRules[field];
        var $field = $form.find('[name="' + field + '"]');
        var value = $field.val()?.trim();

        // 必填验证
        if (rules.required && !value) {
            setFieldError($field, rules.message);
            return false;
        }

        // 长度验证
        if (rules.minLength && value.length < rules.minLength) {
            setFieldError($field, rules.message);
            return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
            setFieldError($field, rules.message);
            return false;
        }

        setFieldValid($field);
        return true;
    }

    /**
     * 设置字段错误状态
     * @param {jQuery} $field - 字段jQuery对象
     * @param {string} message - 错误信息
     */
    function setFieldError($field, message) {
        var $formGroup = $field.closest('.form-group');
        $field.addClass('is-invalid').removeClass('is-valid');

        var $feedback = $formGroup.find('.invalid-feedback');
        if (!$feedback.length) {
            $feedback = $('<div class="invalid-feedback"></div>').appendTo($formGroup);
        }
        $feedback.text(message);
    }

    /**
     * 设置字段有效状态
     * @param {jQuery} $field - 字段jQuery对象
     */
    function setFieldValid($field) {
        $field.addClass('is-valid').removeClass('is-invalid')
            .closest('.form-group')
            .find('.invalid-feedback')
            .remove();
    }

    /**
     * 获取表单数据
     * @returns {Object} 表单数据对象
     */
    function getFormData() {
        return {
            ticketId: $form.find('[name="ticketId"]').val(),
            title: $form.find('[name="title"]').val().trim(),
            content: $form.find('[name="content"]').val().trim(),
            departmentId: $form.find('[name="departmentId"]').val(),
            priority: $form.find('[name="priority"]').val(),
            expectFinishTime: $form.find('[name="expectFinishTime"]').val()
        };
    }

    /**
     * 填充表单数据
     * @param {Object} ticket - 工单数据
     */
    function fillForm(ticket) {
        $form.find('[name="ticketId"]').val(ticket.ticketId);
        $form.find('[name="title"]').val(ticket.title);
        $form.find('[name="content"]').val(ticket.content);
        $form.find('[name="departmentId"]').val(ticket.departmentId);
        $form.find('[name="priority"]').val(ticket.priority);

        if (ticket.expectFinishTime) {
            $form.find('[name="expectFinishTime"]').val(
                formatDateTime(ticket.expectFinishTime)
            );
        }
    }

    /**
     * 重置表单
     */
    function resetForm() {
        $form[0].reset();
        $form.find('.is-invalid,.is-valid')
            .removeClass('is-invalid is-valid');
        $form.find('.invalid-feedback').remove();
        $attachments.val('');
    }

    /**
     * 禁用/启用表单
     * @param {boolean} disabled - 是否禁用
     */
    function disableForm(disabled) {
        $form.find('input,select,textarea,button')
            .prop('disabled', disabled);

        if (disabled) {
            $submitBtn.html('<span class="spinner-border spinner-border-sm me-1"></span>保存中...');
        } else {
            $submitBtn.text('保存');
        }
    }

    /**
     * 格式化日期时间
     * @param {string|Date} date - 日期对象或字符串
     * @returns {string} 格式化后的日期时间
     */
    function formatDateTime(date) {
        return new Date(date).toISOString().slice(0, 16);
    }

    /**
     * 显示成功提示
     * @param {string} message - 提示信息
     */
    function showSuccess(message) {
        $.notify({
            message: message,
            type: 'success'
        });
    }

    /**
     * 显示错误提示
     * @param {string} message - 错误信息
     */
    function showError(message) {
        $.notify({
            message: message,
            type: 'danger'
        });
    }

    /**
     * 销毁组件
     */
    function destroy() {
        $form.off();
        $attachments.off();
        modal.dispose();
    }

    // 暴露公共接口
    return {
        init: init,
        showCreateModal: showCreateModal,
        showEditModal: showEditModal,
        destroy: destroy
    };
}

// 创建实例
$(document).ready(function() {
    window.ticketEditor = TicketEditor();
    window.ticketEditor.init();
});

/**
 * TicketManagement.js
 * 工单管理模块 - 负责工单的增删改查和状态流转
 */
var TicketManagement = (function() {
    // 私有变量
    var $container, $ticketList, $searchForm, $pagination;
    var $ticketModal, $ticketForm, $ticketDetail;
    var modal;
    var state = {
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

    // 验证规则配置
    var validationRules = {
        title: {
            required: true,
            minLength: 5,
            maxLength: 50,
            message: '标题长度必须在5-50个字符之间'
        },
        content: {
            required: true,
            minLength: 10,
            maxLength: 500,
            message: '内容长度必须在10-500个字符之间'
        },
        departmentId: {
            required: true,
            message: '请选择处理部门'
        },
        priority: {
            required: true,
            message: '请选择优先级'
        }
    };

    /**
     * 初始化函数
     * 缓存DOM引用并绑定事件
     */
    function init() {
        // 缓存DOM引用
        $container = $('#main');
        $ticketList = $('#ticketList');
        $searchForm = $('#searchForm');
        $pagination = $('#pagination');
        $ticketModal = $('#ticketModal');
        $ticketForm = $('#ticketForm');
        $ticketDetail = $('#ticketDetail');

        // 初始化Bootstrap模态框
        modal = new bootstrap.Modal($ticketModal[0]);

        // 绑定事件处理
        bindEvents();

        // 加载初始数据
        loadTickets();
    }

    /**
     * 绑定事件处理器
     * @private
     */
    function bindEvents() {
        // 搜索相关
        $searchForm.on('submit', handleSearch);
        $('#resetBtn').on('click', handleReset);

        // 工单操作
        $('#createTicketBtn').on('click', showCreateModal);
        $('#saveTicketBtn').on('click', handleSaveTicket);
        $ticketList.on('click', '.view-ticket', handleViewTicket);

        // 状态流转
        $('#processBtn').on('click', handleProcess);
        $('#resolveBtn').on('click', handleResolve);
        $('#transferBtn').on('click', handleTransfer);
        $('#closeBtn').on('click', handleClose);

        // 分页事件
        $pagination.on('click', '.page-link', handlePageChange);

        // 表单验证
        $ticketForm.find('input,select,textarea').on('blur', function(e) {
            validateField($(e.target).attr('name'));
        });
    }

    /**
     * 显示工单详情
     * @param {string} ticketId - 工单ID
     */
    function showTicketDetail(ticketId) {
        $.ajax({
            url: '/api/tickets/' + ticketId,
            method: 'GET',
            success: function(response) {
                if(response.code === 200) {
                    state.currentTicket = response.data;
                    updateTicketDetail();
                    $ticketDetail.addClass('show');
                }
            },
            error: function(error) {
                console.error('加载工单详情失败:', error);
                showError('加载详情失败');
            }
        });
    }

    /**
     * 更新工单详情显示
     */
    function updateTicketDetail() {
        var ticket = state.currentTicket;
        if(!ticket) return;

        // 更新基本信息
        $('#ticketCode').text(ticket.code);
        $('#ticketTitle').text(ticket.title);
        $('#ticketContent').text(ticket.content);
        $('#createTime').text(formatDate(ticket.createTime));
        $('#ticketStatus').html(
            '<span class="ticket-status status-' + ticket.status.toLowerCase() + '">' +
            getStatusText(ticket.status) +
            '</span>'
        );

        // 更新处理记录
        renderTimeline(ticket.records);

        // 更新操作按钮状态
        updateActionButtons(ticket.status);
    }

    /**
     * 处理工单状态流转
     * @param {string} operation - 操作类型
     * @param {Object} data - 请求数据
     */
    function handleStatusTransition(operation, data) {
        if(!state.currentTicket) return;

        var operations = {
            'process': {
                url: '/api/tickets/' + state.currentTicket.id + '/process',
                successMsg: '工单已开始处理'
            },
            'resolve': {
                url: '/api/tickets/' + state.currentTicket.id + '/resolve',
                successMsg: '工单已完成处理'
            },
            'transfer': {
                url: '/api/tickets/' + state.currentTicket.id + '/transfer',
                successMsg: '工单已转交'
            },
            'close': {
                url: '/api/tickets/' + state.currentTicket.id + '/close',
                successMsg: '工单已关闭'
            }
        };

        var config = operations[operation];
        if(!config) return;

        $.ajax({
            url: config.url,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function(response) {
                if(response.code === 200) {
                    showSuccess(config.successMsg);
                    showTicketDetail(state.currentTicket.id);
                    loadTickets();
                }
            },
            error: function(error) {
                console.error('操作失败:', error);
                showError('操作失败，请重试');
            }
        });
    }

    /**
     * 处理工单处理
     */
    function handleProcess() {
        var note = $('#processNote').val().trim();
        if(!note) {
            showError('请输入处理说明');
            return;
        }

        handleStatusTransition('process', { note: note });
    }

    /**
     * 处理工单完成
     */
    function handleResolve() {
        var note = $('#processNote').val().trim();
        if(!note) {
            showError('请输入完成说明');
            return;
        }

        handleStatusTransition('resolve', { note: note });
    }

    /**
     * 处理工单转交
     * 弹出转交模态框,选择转交目标部门/人员
     */
    function handleTransfer() {
        if(!state.currentTicket) {
            showError('请先选择工单');
            return;
        }

        // 显示转交模态框
        var transferModal = new bootstrap.Modal(createTransferModal());
        transferModal.show();

        // 绑定转交确认事件
        $('#confirmTransferBtn').one('click', function() {
            var data = {
                targetDeptId: $('#transferDept').val(),
                targetUserId: $('#transferUser').val(),
                note: $('#transferNote').val().trim()
            };

            if(!data.note) {
                showError('请输入转交说明');
                return;
            }

            if(!data.targetDeptId) {
                showError('请选择转交部门');
                return;
            }

            handleStatusTransition('transfer', data);
            transferModal.hide();
        });
    }

    /**
     * 创建转交模态框
     * @returns {HTMLElement} 模态框DOM元素
     */
    function createTransferModal() {
        var modalHtml = `
            <div class="modal fade" id="transferModal">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">转交工单</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="transferForm">
                                <div class="form-group mb-3">
                                    <label class="form-label required">转交部门</label>
                                    <select class="form-select" id="transferDept" required>
                                        <option value="">请选择部门</option>
                                        ${renderDepartmentOptions()}
                                    </select>
                                </div>
                                <div class="form-group mb-3">
                                    <label class="form-label">转交给</label>
                                    <select class="form-select" id="transferUser">
                                        <option value="">请选择处理人</option>
                                    </select>
                                </div>
                                <div class="form-group mb-3">
                                    <label class="form-label required">转交说明</label>
                                    <textarea class="form-control" id="transferNote" 
                                        rows="3" required></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" 
                                data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" 
                                id="confirmTransferBtn">确认转交</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        var $modal = $(modalHtml);
        $('body').append($modal);

        // 部门变更联动
        $modal.find('#transferDept').on('change', function() {
            var deptId = $(this).val();
            if(deptId) {
                loadDepartmentUsers(deptId);
            }
        });

        // 模态框关闭时移除DOM
        $modal.on('hidden.bs.modal', function() {
            $(this).remove();
        });

        return $modal[0];
    }

    /**
     * 加载部门用户列表
     * @param {string} deptId - 部门ID
     */
    function loadDepartmentUsers(deptId) {
        $.ajax({
            url: '/api/departments/' + deptId + '/users',
            method: 'GET',
            success: function(response) {
                if(response.code === 200) {
                    var options = response.data.map(function(user) {
                        return '<option value="' + user.id + '">' +
                            user.realName + '</option>';
                    });
                    $('#transferUser').html('<option value="">请选择处理人</option>' +
                        options.join(''));
                }
            },
            error: function(error) {
                console.error('加载部门用户失败:', error);
                showError('加载部门用户失败');
            }
        });
    }

    /**
     * 处理工单关闭
     */
    function handleClose() {
        var note = $('#processNote').val().trim();
        if(!note) {
            showError('请输入关闭原因');
            return;
        }

        if(!confirm('确定要关闭此工单吗？')) {
            return;
        }

        handleStatusTransition('close', { note: note });
    }

    /**
     * 渲染处理记录时间线
     * @param {Array} records - 处理记录列表
     */
    function renderTimeline(records) {
        if(!records || !records.length) {
            $('#ticketTimeline').html('<div class="text-muted">暂无处理记录</div>');
            return;
        }

        var html = records.map(function(record) {
            return `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <div class="timeline-time">
                            ${formatDate(record.createTime)}
                        </div>
                        <div class="timeline-title">
                            <strong>${record.operator}</strong>
                            ${getOperationText(record.operation)}
                        </div>
                        ${record.content ? `
                            <div class="timeline-body">
                                ${record.content}
                            </div>
                        ` : ''}
                        ${record.evaluation ? renderEvaluation(record.evaluation) : ''}
                    </div>
                </div>
            `;
        }).join('');

        $('#ticketTimeline').html(html);
    }

    /**
     * 渲染工单评价
     * @param {Object} evaluation - 评价信息
     * @returns {string} 评价HTML
     */
    function renderEvaluation(evaluation) {
        return `
            <div class="evaluation-info mt-2">
                <div class="rating">
                    ${renderStars(evaluation.score)}
                </div>
                <div class="evaluation-content text-muted">
                    ${evaluation.content}
                </div>
            </div>
        `;
    }

    /**
     * 渲染评分星级
     * @param {number} score - 评分
     * @returns {string} 星级HTML
     */
    function renderStars(score) {
        var stars = [];
        for(var i = 1; i <= 5; i++) {
            stars.push('<i class="bi bi-star' +
                (i <= score ? '-fill' : '') +
                ' text-warning"></i>');
        }
        return stars.join('');
    }

    /**
     * 更新操作按钮状态
     * @param {string} status - 工单状态
     */
    function updateActionButtons(status) {
        // 获取所有操作按钮
        var $processBtn = $('#processBtn');
        var $resolveBtn = $('#resolveBtn');
        var $transferBtn = $('#transferBtn');
        var $closeBtn = $('#closeBtn');

        // 根据状态启用/禁用按钮
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
                $processBtn.prop('disabled', true);
                $resolveBtn.prop('disabled', true);
                $transferBtn.prop('disabled', true);
                $closeBtn.prop('disabled', false);
                break;
            case 'CLOSED':
                $processBtn.prop('disabled', true);
                $resolveBtn.prop('disabled', true);
                $transferBtn.prop('disabled', true);
                $closeBtn.prop('disabled', true);
                break;
        }
    }

    /**
     * 获取操作文本
     * @param {string} operation - 操作类型
     * @returns {string} 操作描述文本
     */
    function getOperationText(operation) {
        var operationMap = {
            'CREATE': '创建了工单',
            'PROCESS': '开始处理',
            'NOTE': '添加了备注',
            'TRANSFER': '转交工单',
            'COMPLETE': '完成处理',
            'CLOSE': '关闭工单',
            'EVALUATE': '评价工单'
        };
        return operationMap[operation] || operation;
    }

    // 暴露公共接口
    return {
        init: init,
        showTicketDetail: showTicketDetail,
        destroy: function() {
            // 解绑事件
            $container.off();
            $searchForm.off();
            $ticketList.off();
            $pagination.off();
            $ticketForm.off();

            // 销毁模态框
            if(modal) modal.dispose();

            // 清理状态
            state = null;
        }
    };

})();

// 页面加载完成后初始化
$(document).ready(function() {
    TicketManagement.init();
});

