import {eventBus} from "./event-bus";

/**
 * 工单弹窗组件
 */
class TicketModal {
    constructor(options) {
        this.modal = new bootstrap.Modal(document.getElementById(options.id));
        // 获取EventBus实例
        this.eventBus = eventBus; // 导入的单例实例
        this.init();
    }

    init() {
        $('#ticketForm').on('submit', (e) => {
            e.preventDefault();
            const formData = this._getFormData();
            this._submitForm(formData);
        });
    }

    _getFormData() {
        return {
            title: $('#title').val(),
            content: $('#content').val(),
            departmentId: $('#department').val(),
            priority: $('#priority').val(),
            expectFinishTime: $('#expectFinishTime').val()
        };
    }

    async _submitForm(data) {
        try {
            const $submitBtn = $('#ticketForm button[type="submit"]');
            // 设置按钮为loading状态
            $submitBtn.prop('disabled', true)
                .html('<span class="spinner-border spinner-border-sm"></span> 提交中...');

            await request.post('/tickets', data);
            this.modal.hide();
            // 使用实例方法触发事件
            this.eventBus.emit('ticket:created', data);

            // 提示创建成功
            toastr.success('工单创建成功');
        } catch (error) {
            $('#formError').text(error.message).show();
        } finally {
            // 恢复按钮状态
            $submitBtn.prop('disabled', false).text('提交');
        }
    }
}

/**
 * 工单表格组件
 */
class TicketTable {
    constructor(options) {
        this.tableId = options.tableId;
        this.pageSize = options.pageSize || 10;
        this.currentPage = 1;
        this.eventBus = eventBus;  // 导入的单例实例

        // 监听工单创建事件
        this.eventBus.on('ticket:created', () => {
            this.loadData(); // 刷新表格数据
        });
    }

    async loadData() {
        try {
            const data = await request.get('/tickets', {
                page: this.currentPage,
                size: this.pageSize
            });

            this._renderTable(data);
            this._renderPagination(data.total);
        } catch (error) {
            console.error('加载工单列表失败:', error);
            // 显示错误提示
            $('#tableError').text('加载数据失败，请重试').show();
        }
    }

    _renderTable(data) {
        const html = data.list.map(item => `
            <tr>
                <td>${item.ticketCode}</td>
                <td>${item.title}</td>
                <td>${this._renderStatus(item.status)}</td>
                <td>${this._formatDate(item.createTime)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="ticketTable.handleView(${item.id})">查看</button>
                </td>
            </tr>
        `).join('');

        $(`#${this.tableId} tbody`).html(html);
    }

    _renderStatus(status) {
        const statusMap = {
            0: '<span class="badge bg-secondary">待处理</span>',
            1: '<span class="badge bg-primary">处理中</span>',
            2: '<span class="badge bg-success">已完成</span>',
            3: '<span class="badge bg-danger">已关闭</span>'
        };
        return statusMap[status] || status;
    }

    _formatDate(date) {
        return new Date(date).toLocaleString();
    }

    handleView(id) {
        // 触发查看工单事件
        this.eventBus.emit('ticket:view', id);
    }
}

// 页面使用示例
$(document).ready(function() {
    // 初始化工单弹窗
    const ticketModal = new TicketModal({
        id: 'ticketModal'
    });

    // 初始化工单表格
    const ticketTable = new TicketTable({
        tableId: 'ticketTable',
        pageSize: 10
    });

    // 加载初始数据
    ticketTable.loadData();

    // 绑定新建工单按钮
    $('#createTicketBtn').on('click', () => {
        ticketModal.show();
    });
});