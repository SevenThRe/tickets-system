/**
 * 工单系统通用工具类
 */
class TicketUtil {
    // 状态常量
    static TICKET_STATUS = {
        PENDING: 'PENDING',
        PROCESSING: 'PROCESSING',
        COMPLETED: 'COMPLETED',
        CLOSED: 'CLOSED'
    };

    // 优先级常量
    static PRIORITY = {
        NORMAL: 'NORMAL',
        URGENT: 'URGENT',
        EXTREMELY_URGENT: 'EXTREMELY_URGENT'
    };

    // 所有之前列举的工具方法
    static getPriorityClass(priority) {
        const map = {
            'HIGH': 'high',
            'MEDIUM': 'medium',
            'LOW': 'low',
            '2': 'high',
            '1': 'medium',
            '0': 'low'
        };
        return map[priority] || 'low';
    }

    static getPriorityText(priority) {
        const map = {
            'HIGH': '高',
            'MEDIUM': '中',
            'LOW': '低',
            '2': '高',
            '1': '中',
            '0': '低'
        };
        return map[priority] || '普通';
    }

    static formatDate(dateString) {
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

    static escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    static getStatusText(status) {
        const statusMap = {
            'PENDING': '待处理',
            'PROCESSING': '处理中',
            'COMPLETED': '已完成',
            'CLOSED': '已关闭',
            '0': '待处理',
            '1': '处理中',
            '2': '已完成',
            '3': '已关闭'
        };
        return statusMap[status] || '未知状态';
    }

    static getOperationText(operationType) {
        const operationMap = {
            0: '创建工单',
            1: '分配工单',
            2: '处理工单',
            3: '完成工单',
            4: '关闭工单',
            5: '转交工单'
        };
        return operationMap[operationType] || '未知操作';
    }

    static formatFileSize(bytes) {
        if(bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    static renderTimeline(records, containerId = 'ticketTimeline') {
        const container = $(`#${containerId}`);
        if (!records || !records.length) {
            container.html('<div class="text-muted">暂无处理记录</div>');
            return;
        }

        const html = records.map(record => `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-time">${this.formatDate(record.createTime)}</div>
                    <div class="timeline-title">
                        <strong>${record.operatorName}</strong> 
                        ${this.getOperationText(record.operationType)}
                    </div>
                    ${record.operationContent ? `
                        <div class="timeline-body">${record.operationContent}</div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.html(html);
    }

    static showLoading(targetElement = 'body') {
        let $loading = $('.loading-overlay');
        if (!$loading.length) {
            $loading = $(`
                <div class="loading-overlay">
                    <div class="spinner-border text-primary"></div>
                    <div class="loading-text">加载中...</div>
                </div>
            `).appendTo(targetElement);
        }
        $loading.show();
        return $loading;
    }

    static hideLoading() {
        $('.loading-overlay').hide();
    }
}

// 添加到全局对象
window.TicketUtil = TicketUtil;