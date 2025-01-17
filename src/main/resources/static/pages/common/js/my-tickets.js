/**
 * 工单管理类 MyTickets
 */
function MyTickets() {
    // 状态定义
    this.state = {
        loading: false,
        tickets: [],
        currentTicket: null,
        selectedRating: 0,
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
            endTime: '',
            userId: JSON.parse(localStorage.getItem('userInfo')).userId || ''
        }
    };

    // 常量定义
    this.STATUS_MAP = {
        '0': '待处理',
        '1': '处理中',
        '2': '已完成',
        '3': '已关闭'
    };

    this.PRIORITY_MAP = {
         0 : {text: '普通', class: 'low'},
         1 : {text: '紧急', class: 'medium'},
         2 : {text: '高', class: 'high'}
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

    // 初始化加载中遮罩
    this.$loading = $('<div class="loading-overlay"><div class="spinner-border text-primary"></div><div class="loading-text">加载中...</div></div>').appendTo('body');

    // 初始化方法
    this.init();
}

/**
 * 初始化
 */
MyTickets.prototype.init = function() {
    try {
        this._bindCreateTicketEvents();
        this._initSearchForm();
        this._bindEvents();
        this._loadTickets();
        this._loadTicketTypes();
        this._initFileUpload();
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        const ticketId = urlParams.get('ticketId');
        if (action === 'create') {
            setTimeout(() => {
                $('#createTicketBtn').click();
            }, 30);
        }
        if (ticketId) {
            setTimeout(() => {
                this._loadTicketDetail(ticketId);
            },30)
        }
    }catch(e) {
        console.error('初始化失败:', error);
        NotifyUtil.error('页面加载失败，请刷新重试');
    }
};

/**
 * 绑定事件
 */
MyTickets.prototype._bindEvents = function() {
    let self = this;

    // 搜索表单提交
    this.elements.searchForm.on('submit', function(e) {
        e.preventDefault();
        self._handleSearch(e);
    });

    // 重置按钮
    $('#resetBtn').on('click', function() {
        self._handleReset();
    });

    // 查看工单详情
    this.elements.ticketList.on('click', '.view-ticket', function(e) {
        let ticketId = $(this).data('id');
        self._loadTicketDetail(ticketId);
    });

    // 评分点击
    $('.rating-star').on('click', function(e) {
        let rating = $(this).data('rating');
        self._handleRating(rating);
    });

    // 添加备注
    $('#addNoteBtn').on('click', function() {
        self._handleAddNote();
    });

    // 关闭工单
    $('#closeTicketBtn').on('click', function() {
        self._handleCloseTicket();
    });

    // 提交评价
    $('#submitEvaluationBtn').on('click', function() {
        self._handleSubmitEvaluation();
    });

    // 关闭详情面板
    $('#closeDetailBtn').on('click', function() {
        self.elements.ticketDetail.removeClass('show');
        self.state.currentTicket = null;
    });

    // 导出按钮
    $('#exportBtn').on('click', function() {
        self.exportTickets();
    });
};


/**
 * 加载工单列表
 */
MyTickets.prototype._loadTickets = function() {
    let self = this;
    if (this.state.loading) return;

    this.state.loading = true;
    this._showLoading();

    let params = {
        pageNum: this.state.pagination.current,
        pageSize: this.state.pagination.pageSize
    };

    // 合并筛选条件
    Object.keys(this.state.filters).forEach(function(key) {
        if (self.state.filters[key]) {
            params[key] = self.state.filters[key];
        }
    });

    $.ajax({
        url: '/api/tickets/my',
        method: 'GET',
        data: params,
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).done(function(response) {
        if (response.code === 200) {
            self.state.tickets = response.data.list || [];
            self.state.pagination.total = response.data.total || 0;
            self._renderTicketList();
        }
    }).fail(function(error) {
        console.error('加载工单列表失败:', error);
        NotifyUtil.error('加载工单列表失败');
    }).always(function() {
        self.state.loading = false;
        self._hideLoading();
    });
};

/**
 * 渲染工单列表
 */
MyTickets.prototype._renderTicketList = function() {
    let self = this;

    if (!Array.isArray(this.state.tickets) || this.state.tickets.length === 0) {
        this.elements.ticketList.html('<tr><td colspan="8" class="text-center">暂无工单</td></tr>');
        this.elements.totalCount.text('0');
        return;
    }

    const html = this.state.tickets.map(ticket => {
        const priorityInfo = this.PRIORITY_MAP[ticket.priority] || this.PRIORITY_MAP[0];
        return `
            <tr>
                <td>${ticket.ticketId || '-'}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <span class="priority-indicator priority-${priorityInfo.class}"></span>
                        ${this._escapeHtml(ticket.title) || ''}
                    </div>
                </td>
                <td>${this._escapeHtml(ticket.departmentName) || '-'}</td>
                <td>${this._escapeHtml(ticket.processorName) || '-'}</td>
                <td>
                    <span class="badge bg-${this._getStatusClass(ticket.status)}">
                        ${this.STATUS_MAP[ticket.status]}
                    </span>
                </td>
                <td>
                    <span class="priority-badge priority-${priorityInfo.class}">
                        ${priorityInfo.text}
                    </span>
                </td>
                <td>${this._formatDate(ticket.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-ticket" data-id="${ticket.ticketId}">
                        <i class="bi bi-eye"></i> 查看
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    this.elements.ticketList.html(html);
    this.elements.totalCount.text(this.state.pagination.total);
};

/**
 * 加载工单详情
 */
MyTickets.prototype._loadTicketDetail = function(ticketId) {
    let self = this;

    $.ajax({
        url: '/api/tickets/' + ticketId,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).done(async function (response) {
        if (response.code === 200) {
            self.state.currentTicket = response.data;
            self._renderTicketDetail();

            await self._loadAttachments(ticketId);
            self.elements.ticketDetail.addClass('show');
        }
    }).fail(function(error) {
        NotifyUtil.error('加载详情失败',error);
    });
};
/**
 * 获取状态样式类
 * @param ticketId 工单ID
 * @returns {*}
 * @private
 */
MyTickets.prototype._loadAttachments = function(ticketId) {
    let self = this;
    return $.ajax({
        url: `/api/files/ticket/${ticketId}`,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    }).done(function(response) {
        if (response.code === 200) {
            self._renderAttachments(response.data);
        }
    }).fail(function(error) {
        console.error('加载附件失败:', error);
        NotifyUtil.error('加载附件失败');
    });
};

/**
 * 渲染附件列表
 */
MyTickets.prototype._renderAttachments = function(attachments) {
    if(!attachments || !attachments.length) {
        $('#ticketAttachments').html('<div class="text-muted">暂无附件</div>');
        return;
    }

    const html = attachments.map(attachment => {
        const fileExt = attachment.fileName.split('.').pop().toLowerCase();
        const iconClass = this._getFileIconClass(fileExt);
        let filePath = attachment.filePath;
        if (!filePath.startsWith('/')) filePath = '/' + filePath;

        return `
            <div class="attachment-item d-flex align-items-center mb-2">
                <i class="bi ${iconClass} me-2"></i>
                <div class="flex-grow-1">
                    <div class="file-name">${this._escapeHtml(attachment.fileName)}</div>
                    <div class="file-meta text-muted small">
                        ${this._formatFileSize(attachment.fileSize)} 
                        · ${this._formatDate(attachment.createTime)}
                    </div>
                </div>
                <div class="attachment-actions">
                    <button class="btn btn-sm btn-outline-primary me-2" 
                            onclick="window.myTickets._downloadAttachment('${attachment.ticketId}', '${filePath}', '${attachment.fileName}')">
                        <i class="bi bi-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" 
                            onclick="window.myTickets._previewFile('${attachment.ticketId}', '${filePath}', '${attachment.fileName}')">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    $('#ticketAttachments').html(html);
};


/**
 * 文件下载处理
 */
MyTickets.prototype._downloadAttachment = function(ticketId, filePath, fileName) {
    $.ajax({
        url: `/api/files/check/${ticketId}${filePath}`,
        method: 'GET'
    }).done(function(response) {
        if (response.code === 200 && response.data) {
            // 使用ajax下载
            $.ajax({
                url: `/api/files/download/${ticketId}${filePath}`,
                method: 'GET',
                xhrFields: {
                    responseType: 'blob'
                }
            }).done(function(blob) {
                // 创建blob链接进行下载
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName; // 使用原始文件名
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }).fail(function() {
                NotifyUtil.error("下载失败");
            });
        } else {
            NotifyUtil.error("文件已失效");
        }
    }).fail(function() {
        NotifyUtil.error("校验文件失败");
    });
};
/**
 * 获取文件图标
 */
MyTickets.prototype._getFileIconClass = function(fileExt) {
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
};

/**
 * 文件预览处理
 */
MyTickets.prototype._previewFile = function(ticketId, filePath, fileName) {
    const fileExt = fileName.split('.').pop().toLowerCase();

    // 清除之前的预览
    $('.preview-container').remove();

    // 创建预览容器
    const $previewContainer = $('<div class="preview-container">').appendTo('body');

    if (['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(fileExt)) {
        $.ajax({
            url: `/api/files/preview${filePath}`,
            type: 'GET',
            xhrFields: {
                responseType: 'blob'
            }
        }).done(function(blob) {
            const url = window.URL.createObjectURL(blob);
            if (fileExt === 'pdf') {
                $previewContainer.html(`
                    <div class="preview-header">
                        <h5>${fileName}</h5>
                        <button class="btn-close" onclick="$(this).closest('.preview-container').remove()"></button>
                    </div>
                    <iframe src="${url}" width="100%" height="90%"></iframe>
                `);
            } else {
                $previewContainer.html(`
                    <div class="preview-header">
                        <h5>${fileName}</h5>
                        <button class="btn-close" onclick="$(this).closest('.preview-container').remove()"></button>
                    </div>
                    <img src="${url}" alt="${fileName}" style="max-width: 100%; height: auto;">
                `);
            }
            $previewContainer.addClass('show');
        }).fail(function() {
            NotifyUtil.error("预览失败");
        });
    } else {
        // 其他类型文件直接下载
        this._downloadAttachment(ticketId, filePath, fileName);
    }
};


/**
 * 渲染工单详情
 */
MyTickets.prototype._renderTicketDetail = function() {
    let ticket = this.state.currentTicket;
    if (!ticket) return;

    $('#ticketCode').text(ticket.ticketId);
    $('#ticketTitle').text(ticket.title);
    $('#ticketContent').text(ticket.content);
    $('#createTime').text(this._formatDate(ticket.createTime));

    // 渲染状态
    $('#ticketStatus').html(`
        <span class="badge bg-${this._getStatusClass(ticket.status)}">
            ${this.STATUS_MAP[ticket.status]}
        </span>
    `);

    // 评价表单显示控制 - 只有在工单完成状态(status=2)且是创建人才能评价
    const canEvaluate = ticket.status === 2 &&
        ticket.createBy === this.state.filters.userId &&
        !this._hasEvaluation(ticket.records);

    $('#evaluationForm').toggle(canEvaluate);

    if(this._hasEvaluation(ticket.records)) {
        // 已评价,显示评价内容
        const evaluation = this._getEvaluation(ticket.records);
        this._renderEvaluation(evaluation);
    }

    // 备注按钮控制 - 处理中状态可以添加备注
    const canAddNote = ticket.status === 1 || ticket.status === 0;
    $('#noteForm').toggle(canAddNote);

    // 关闭按钮控制 - 非关闭状态且是创建人可以关闭
    const canClose = ticket.status !== 3 &&
        (ticket.createBy === this.state.filters.userId );

    $('#closeTicketBtn').prop('disabled', !canClose);



    // 渲染处理记录
    this._renderTicketRecords(ticket.records);
};

// 检查是否已有评价记录
MyTickets.prototype._hasEvaluation = function(records) {
    return records?.some(record =>
        record.operationType === 2 && record.evaluationScore > 0
    );
};

// 获取评价记录
MyTickets.prototype._getEvaluation = function(records) {
    return records?.find(record =>
        record.operationType === 2 && record.evaluationScore > 0
    );
};

// 渲染评价内容
MyTickets.prototype._renderEvaluation = function(evaluation) {
    if(!evaluation) return;

    const $evaluation = $('<div class="evaluation-result mt-3">').appendTo('#ticketDetail');
    $evaluation.html(`
        <h6>服务评价</h6>
        <div class="rating-display">
            ${this._renderStars(evaluation.evaluationScore)}
        </div>
        <div class="evaluation-content">
            ${evaluation.evaluationContent || ''}
        </div>
        <div class="evaluation-time">
            评价时间: ${this._formatDate(evaluation.createTime)}
        </div>
    `);
};

/**
 * 绑定创建工单相关的事件
 * @private
 */
MyTickets.prototype._bindCreateTicketEvents = function() {
    const self = this;

    // 新建工单按钮点击
    $('#createTicketBtn').on('click', function() {
        // 初始化模态框
        $('#ticketModal').modal({
            backdrop: 'static',
            keyboard: false
        });

        // 重置表单
        $('#ticketForm')[0].reset();
        $('#fileList').empty();

        // 初始化加载部门数据
        self._loadDepartments();

        // 显示模态框
        $('#ticketModal').modal('show');
    });

    // 保存工单按钮点击
    $('#saveTicketBtn').on('click', function() {
        const $form = $('#ticketForm');
        const $submitBtn = $(this);

        // 表单验证
        if (!$form[0].checkValidity()) {
            $form[0].reportValidity();
            return;
        }

        // 禁用提交按钮防止重复提交
        $submitBtn.prop('disabled', true).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 保存中...');

        // 收集表单数据
        const formData = new FormData($form[0]);
        formData.append('currentUserId', self.state.filters.userId);

        // 发起创建请求
        $.ajax({
            url: '/api/tickets/create',
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }).done(function(response) {
            if (response.code === 200) {
                NotifyUtil.success('工单创建成功');
                $('#ticketModal').modal('hide');
                self._loadTickets(); // 刷新列表
            } else {
                NotifyUtil.error(response.msg || '创建失败');
            }
        }).fail(function(error) {
            console.error('创建工单失败:', error);
            NotifyUtil.error('创建工单失败，请重试');
        }).always(function() {
            // 恢复提交按钮状态
            $submitBtn.prop('disabled', false).text('保存');
        });
    });


    // 附件上传相关事件
    const $attachments = $('#attachments');
    const $fileList = $('#fileList');

    $attachments.on('change', function(e) {
        const files = e.target.files;
        self._updateFileList(files, $fileList);
    });

    // 重置按钮事件
    $('#ticketModal').find('button[type="reset"]').on('click', function() {
        $('#fileList').empty();
        $('#typeId').html('<option value="">请选择工单类型</option>').prop('disabled', true);
    });

    // 模态框关闭时清理
    $('#ticketModal').on('hidden.bs.modal', function() {
        $('#ticketForm')[0].reset();
        $('#fileList').empty();
        $('#typeId').html('<option value="">请选择工单类型</option>').prop('disabled', true);
        $('.is-invalid').removeClass('is-invalid');
    });
};

MyTickets.prototype._initFileUpload = function() {
    const self = this;

    // 创建拖拽上传区域
    const $dropZone = $(`
        <div class="upload-dropzone">
            <i class="bi bi-cloud-upload me-2"></i>
            拖拽文件到此处或点击上传
            <input type="file" id="attachments" name="attachments" multiple style="display: none;">
        </div>
    `).insertAfter('#expectFinishTime');

    const $fileList = $('<div class="file-list mt-2"></div>').insertAfter($dropZone);
    const $fileInput = $dropZone.find('input[type="file"]'); // 直接找子元素而不是用ID选择器

    // 修改点击事件处理
    $dropZone.on('click', function(e) {
        // 阻止事件冒泡导致的递归触发
        if(e.target === this || $(e.target).hasClass('bi-cloud-upload')) {
            $fileInput.trigger('click');
        }
    });

    // 拖拽相关事件
    $dropZone.on({
        dragover: function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass('dragover');
        },
        dragleave: function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragover');
        },
        drop: function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('dragover');

            const files = e.originalEvent.dataTransfer.files;

            // 校验文件后缀
                const validFiles = Array.from(files).filter(file => {
                    const fileExt = file.name.split('.').pop().toLowerCase();
                    return ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(fileExt);
                });
                $(files).each((i,e) => {
                    if(validFiles.includes(e)) {
                        self._handleFiles(files, $fileList);
                    }else {NotifyUtil.warning(`文件${e.name}格式不支持`);}
                })
        }
    });

    // 文件选择变更事件
    $fileInput.on('change', function(e) {
        self._handleFiles(e.target.files, $fileList);
    });
};

/**
 * 处理上传的文件
 */
MyTickets.prototype._handleFiles = function(files, $fileList) {
    $fileList.empty();

    Array.from(files).forEach(file => {
        const $item = $(`
            <div class="file-item">
                <i class="bi bi-file-earmark me-2"></i>
                <span class="file-name">${file.name}</span>
                <span class="file-size">(${this._formatFileSize(file.size)})</span>
                <button type="button" class="btn btn-sm btn-link text-danger remove-file">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).appendTo($fileList);

        $item.find('.remove-file').on('click', () => {
            $item.remove();
            // 更新文件列表
            const dt = new DataTransfer();
            Array.from(files).forEach(f => {
                if (f !== file) {
                    dt.items.add(f);
                }
            });
            $('#attachments')[0].files = dt.files;
        });
    });
};



/**
 * 更新文件列表显示
 */
MyTickets.prototype._updateFileList = function(files, $fileList) {
    let self = this;
    $fileList.empty();

    Array.prototype.forEach.call(files, function(file) {
        let $item = $([
            '<div class="file-item">',
            '<i class="bi bi-file-earmark"></i>',
            '<span class="file-name">', file.name, '</span>',
            '<span class="file-size">(', self._formatFileSize(file.size), ')</span>',
            '<button type="button" class="btn btn-sm btn-link text-danger remove-file">',
            '<i class="bi bi-x"></i>',
            '</button>',
            '</div>'
        ].join('')).appendTo($fileList);

        $item.find('.remove-file').on('click', function() {
            $item.remove();
            // 更新文件列表
            let dt = new DataTransfer();
            Array.prototype.forEach.call(files, function(f) {
                if (f !== file) {
                    dt.items.add(f);
                }
            });
            $('#attachments')[0].files = dt.files;
        });
    });
};

/**
 * 处理关闭工单
 */
MyTickets.prototype._handleCloseTicket = function() {
    let self = this;
    let content = $('#noteContent').val().trim();

    if (!content) {
        NotifyUtil.warning('请输入关闭说明');
        return;
    }

    if(!confirm('确定要关闭此工单吗？')) {
        return;
    }

    $.ajax({
        url: `/api/tickets/${this.state.currentTicket.ticketId}/close`,
        method: 'PUT',
        contentType: 'application/json;charset=UTF-8',
        data: {
            ticketId: this.state.currentTicket.ticketId,
            content: content,
            operatorId: this.state.filters.userId
        },
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).done((response) => {
        if (response.success) {
            $('#ticketModal').modal('hide');
            NotifyUtil.success('工单已关闭');
            self._loadTicketDetail(self.state.currentTicket.ticketId);
            self._loadTickets();
        } else {
            NotifyUtil.error(response.msg || '关闭工单失败');
        }
    }).fail((error) => {
        console.error('关闭工单失败:', error);
        NotifyUtil.error('关闭工单失败');
    });
};

/**
 * 处理工单评分
 */
MyTickets.prototype._handleRating = function(rating) {
    this.state.selectedRating = rating;
    $('.rating-star').each((index, star) => {
        $(star).toggleClass('bi-star-fill', index < rating)
            .toggleClass('bi-star', index >= rating);
    });
};
/**
 * 处理提交评价
 */
MyTickets.prototype._handleSubmitEvaluation = function() {
    const self = this;

    // 再次验证状态
    if(this.state.currentTicket.status !== 2) {
        NotifyUtil.warning('只能对已完成的工单进行评价');
        return;
    }

    if(!this.state.selectedRating) {
        NotifyUtil.warning('请选择评分');
        return;
    }

    const content = $('#evaluationContent').val().trim();
    if(!content) {
        NotifyUtil.warning('请输入评价内容');
        return;
    }

    // 创建评价记录
    $.ajax({
        url: '/api/tickets/evaluate',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            ticketId: this.state.currentTicket.ticketId,
            evaluatorId: this.state.filters.userId,
            score: this.state.selectedRating,
            content: content
        }),
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).done((response) => {
        if (response.code === 200) {
            NotifyUtil.success('评价提交成功');
            $('#evaluationContent').val('');
            this.state.selectedRating = 0;
            $('.rating-star').removeClass('bi-star-fill').addClass('bi-star');
            self._loadTicketDetail(self.state.currentTicket.ticketId);
        } else {
            NotifyUtil.error(response.msg || '评价提交失败');
        }
    }).fail((error) => {
        NotifyUtil.error('评价提交失败',error);
    });
};

/**
 * 处理关闭工单
 */
MyTickets.prototype._handleCloseTicket = function() {
    const self = this;
    const content = $('#noteContent').val().trim();

    if (!content) {
        NotifyUtil.warning('请输入关闭说明');
        return;
    }

    if(!confirm('确定要关闭此工单吗？')) {
        return;
    }

    const closeRequest = {
        content: content,
        operatorId: this.state.filters.userId,
        ticketId: this.state.currentTicket.ticketId
    };

    // 关闭工单请求
    $.ajax({
        url: `/api/tickets/${this.state.currentTicket.ticketId}/close`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(closeRequest),
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).done((response) => {
        if (response.code === 200) {
            NotifyUtil.success('工单已关闭');
            self._loadTicketDetail(self.state.currentTicket.ticketId);
            self._loadTickets();
        } else {
            NotifyUtil.error(response.msg || '关闭工单失败');
        }
    }).fail((error) => {
        console.error('关闭工单失败:', error);
        NotifyUtil.error('关闭工单失败');
    });
};

/**
 * 渲染工单记录
 */
MyTickets.prototype._renderTicketRecords = function(records) {
    if (!records || !records.length) {
        $('#ticketTimeline').html('<div class="text-muted">暂无处理记录</div>');
        return;
    }

    const html = records.map(record => {
        let recordHtml = `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-time">${this._formatDate(record.createTime)}</div>
                    <div class="timeline-title">
                        <strong>${record.operatorName}</strong> 
                        ${this._getOperationText(record.operationType)}
                    </div>`;

        // 添加操作内容（如果存在）
        if (record.operationContent) {
            recordHtml += `
                <div class="timeline-body">
                    ${record.operationContent}
                </div>`;
        }

        // 添加评价内容（如果存在）
        if (record.evaluationScore) {
            recordHtml += `
                <div class="evaluation-content">
                    <div class="rating-display">
                        ${this._renderStars(record.evaluationScore)}
                    </div>
                    ${record.evaluationContent ? `
                        <div class="evaluation-text">
                            ${record.evaluationContent}
                        </div>
                    ` : ''}
                </div>`;
        }

        recordHtml += `
                </div>
            </div>`;

        return recordHtml;
    }).join('');

    $('#ticketTimeline').html(html);
};

/**
 * 处理添加备注
 */
MyTickets.prototype._handleAddNote = function() {
    const self = this;

    // 验证工单状态
    if(
        this.state.currentTicket.status === 3) {
        NotifyUtil.warning('无法对关闭的工单进行备注');
        return;
    }

    const content = $('#noteContent').val().trim();
    if(!content) {
        NotifyUtil.warning('请输入备注内容');
        return;
    }

    $.ajax({
        url: `/api/tickets/${this.state.currentTicket.ticketId}/note`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(content),
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).done((response) => {
        if (response.code === 200) {
            NotifyUtil.success('添加备注成功');
            $('#noteContent').val('');
            self._loadTicketDetail(self.state.currentTicket.ticketId);
        } else {
            NotifyUtil.error(response.msg || '添加备注失败');
        }
    }).fail((error) => {
        console.error('添加备注失败:', error);
        NotifyUtil.error('添加备注失败');
    });
};

/**
 * 导出工单列表
 */
MyTickets.prototype.exportTickets = function() {
    const params = new URLSearchParams({
        ...this.state.filters,
        pageSize: 1000
    });

    window.location.href = `/api/tickets/export?${params.toString()}`;
};

// 工具方法
MyTickets.prototype._escapeHtml = function(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

MyTickets.prototype._formatDate = function(dateString) {
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
};

MyTickets.prototype._formatFileSize = function(bytes) {
    if(bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

MyTickets.prototype._hasEvaluation = function(records) {
    return records?.some(record =>
        record.operationType === 5 && record.evaluationScore > 0
    );
};

MyTickets.prototype._renderStars = function(score) {
    return Array(5).fill(0).map((_, i) =>
        `<i class="bi bi-star${i < score ? '-fill' : ''} text-warning"></i>`
    ).join('');
};

MyTickets.prototype._showLoading = function() {
    if(this.$loading) {
        this.$loading.show();
        this.elements.container.addClass('loading');
    }
};

MyTickets.prototype._hideLoading = function() {
    if(this.$loading) {
        this.$loading.hide();
        this.elements.container.removeClass('loading');
    }
};

/**
 * 初始化表单验证
 */
MyTickets.prototype._initFormValidation = function() {
    const self = this;

    // 工单表单验证规则
    $('#ticketForm').validate({
        rules: {
            title: {
                required: true,
                minlength: 5,
                maxlength: 100
            },
            content: {
                required: true,
                minlength: 10
            },
            departmentId: "required",
            priority: "required",
            typeId: "required"
        },
        messages: {
            title: {
                required: "请输入工单标题",
                minlength: "标题至少5个字符",
                maxlength: "标题最多100个字符"
            },
            content: {
                required: "请输入工单内容",
                minlength: "内容至少10个字符"
            },
            departmentId: "请选择处理部门",
            priority: "请选择优先级",
            typeId: "请选择工单类型"
        },
        errorElement: "div",
        errorPlacement: function(error, element) {
            error.addClass("invalid-feedback");
            element.closest(".form-group").append(error);
        },
        highlight: function(element) {
            $(element).addClass("is-invalid");
        },
        unhighlight: function(element) {
            $(element).removeClass("is-invalid");
        }
    });
};

/**
 * 显示创建工单模态框
 */
MyTickets.prototype._showCreateModal = function() {
    // 重置表单
    $('#ticketForm')[0].reset();
    $('#fileList').empty();
    $('.is-invalid').removeClass('is-invalid');

    // 加载部门列表
    this._loadDepartments();

    // 显示模态框
    $('#ticketModal').modal('show');
};

/**
 * 处理搜索表单提交
 * @private
 */
MyTickets.prototype._handleSearch = function(e) {
    e.preventDefault();

    // 更新过滤条件
    this.state.filters = {
        ...this.state.filters,
        keyword: $('#keyword').val() || '',
        status: $('#statusFilter').val() || '',
        priority: $('#priorityFilter').val() || '',
        startTime: $('#startDate').val() || '',
        endTime: $('#endDate').val() || '',
    };

    // 重置分页到第一页
    this.state.pagination.current = 1;

    // 重新加载数据
    this._loadTickets();
};
/**
 * 处理重置事件
 * @private
 */
MyTickets.prototype._handleReset = function() {
    // 重置表单元素
    this.elements.searchForm[0].reset();

    // 重置过滤条件到初始状态
    this.state.filters = {
        keyword: '',
        status: '',
        priority: '',
        startTime: '',
        endTime: '',
        userId: this.state.filters.userId  // 保持用户ID不变
    };

    // 重置分页
    this.state.pagination.current = 1;

    // 重新加载数据
    this._loadTickets();
};

/**
 * 初始化搜索表单
 */
MyTickets.prototype._initSearchForm = function() {
    const self = this;

    // 优先级筛选初始化
    const $priorityFilter = $('#priorityFilter');
    $priorityFilter.html(`
        <option value="">所有优先级</option>
        <option value="NORMAL">普通</option>
        <option value="URGENT">紧急</option>
        <option value="EXTREMELY_URGENT">非常紧急</option>
    `);

    // 日期格式化辅助函数
    const formatToDateTime = function(dateStr) {
        if (!dateStr) return '';
        // 如果只有日期，添加时间部分
        if (dateStr.length <= 10) {
            return dateStr + (dateStr.length === 10 ? 'T00:00:00' : '');
        }
        return dateStr;
    };

    // 状态筛选变化事件
    $('#statusFilter').on('change', function() {
        self.state.filters.status = $(this).val();
        self._loadTickets();
    });

    // 优先级筛选变化事件
    $priorityFilter.on('change', function() {
        self.state.filters.priority = $(this).val();
        self._loadTickets();
    });

    // 日期范围选择变化事件
    $('#startDate, #endDate').on('change', function() {
        const field = this.id === 'startDate' ? 'startTime' : 'endTime';
        // 转换日期格式为LocalDateTime字符串
        self.state.filters[field] = formatToDateTime($(this).val());
        self._loadTickets();
    });

    // 关键词搜索输入事件（使用防抖）
    let searchTimeout;
    $('#keyword').on('input', function() {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        searchTimeout = setTimeout(function() {
            self.state.filters.keyword = $('#keyword').val().trim();
            self._loadTickets();
        }, 300);
    });
};


/**
 * 加载部门列表
 */
MyTickets.prototype._loadDepartments = function() {
    const self = this;

    $.ajax({
        url: '/api/departments/list',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).done(function(response) {
        if(response.code === 200) {
            const options = response.data.map(function(dept) {
                return `<option value="${dept.departmentId}">${dept.departmentName}</option>`;
            }).join('');

            $('#departmentId')
                .html('<option value="">请选择处理部门</option>' + options)
                .prop('disabled', false);
        }
    }).fail(function() {
        NotifyUtil.error('加载部门列表失败');
        $('#departmentId').prop('disabled', true);
    });
};

/**
 * 加载工单类型
 */
MyTickets.prototype._loadTicketTypes = function(departmentId) {
    const self = this;

    $.ajax({
        url: '/api/tickets/type/list',
        method: 'GET',
        data: { departmentId: departmentId },
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).done(function(response) {
        if(response.code === 200) {
            const options = response.data.map(function(type) {
                return `<option value="${type.typeId}">${type.typeName}</option>`;
            }).join('');

            $('#typeId')
                .html('<option value="">请选择工单类型</option>' + options)
                .prop('disabled', false);
        }
    }).fail(function() {
        NotifyUtil.error('加载工单类型失败');
        $('#typeId').html('<option value="">加载失败</option>').prop('disabled', true);
    });
};

/**
 * 保存工单
 */
MyTickets.prototype._handleSaveTicket = function() {
    const self = this;

    // 表单验证
    if(!$('#ticketForm').valid()) {
        return;
    }

    // 收集表单数据
    const formData = new FormData($('#ticketForm')[0]);
    formData.append('createBy', this.state.filters.userId);

    // 处理附件
    const files = $('#attachments')[0].files;
    if(files.length > 0) {
        Array.from(files).forEach(function(file) {
            formData.append('files', file);
        });
    }

    $.ajax({
        url: '/api/tickets',
        method: 'POST',
        data: formData,
        processData: false,  // 不处理数据
        contentType: false,  // 不设置内容类型
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    }).done(function(response) {
        if(response.code === 200) {
            NotifyUtil.success('工单创建成功');
            $('#ticketModal').modal('hide');
            self._loadTickets();
        }
    }).fail(function() {
        NotifyUtil.error('创建工单失败');
    });
};

/**
 * 上传附件
 */
MyTickets.prototype._uploadAttachments = function(ticketId, files) {
    if(!files.length) return Promise.resolve();

    const formData = new FormData();
    formData.append('ticketId', ticketId);

    Array.from(files).forEach(function(file) {
        formData.append('files', file);
    });

    return $.ajax({
        url: '/api/attachments/upload',
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
};


/**
 * 获取操作类型文本
 * @param {number} operationType - 操作类型编码
 * @returns {string} 操作类型描述文本
 */
MyTickets.prototype._getOperationText = function(operationType) {
    const operationMap = {
        0: '创建工单',
        1: '分配工单',
        2: '处理工单',
        3: '完成工单',
        4: '关闭工单',
        5: '转交工单',
        6: '备注工单'
    };
    return operationMap[operationType] || '未知操作';
};

/**
 * 获取状态样式类
 * @param {string} status - 状态值
 * @returns {string} 对应的CSS类名
 */
MyTickets.prototype._getStatusClass = function(status) {
    const statusMap = {
        '0': 'warning',
        '1': 'info',
        '2': 'success',
        '3': 'secondary'
    };
    return statusMap[status] || 'unknown';
};

// 初始化
$(document).ready(function() {
    window.myTickets = new MyTickets();
});