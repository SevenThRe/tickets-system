/**
 * pagination-util.js
 * 分页工具类
 */
class PaginationUtil {
    /**
     * 创建分页配置
     * @param {Object} options 配置选项
     * @returns {Object} 分页配置对象
     */
    static createConfig(options = {}) {
        return {
            current: options.current || window.Const.UI.PAGINATION.DEFAULT_CURRENT,
            pageSize: options.pageSize || window.Const.UI.PAGINATION.DEFAULT_PAGE_SIZE,
            total: options.total || 0
        };
    }

    /**
     * 生成分页HTML
     * @param {Object} pagination 分页配置
     * @param {Object} options 额外选项
     * @returns {String} 分页HTML
     */
    static generateHTML(pagination, options = {}) {
        const { current, pageSize, total } = pagination;
        const totalPages = Math.ceil(total / pageSize);
        const { containerClass = 'pagination', prevText = '上一页', nextText = '下一页' } = options;

        let html = `<ul class="${containerClass}">`;

        // 上一页
        html += this._generatePageItem(prevText, current - 1, current === 1, 'prev');

        // 页码
        html += this._generatePageNumbers(current, totalPages);

        // 下一页
        html += this._generatePageItem(nextText, current + 1, current === totalPages, 'next');

        html += '</ul>';
        return html;
    }

    /**
     * 生成单个页码项
     * @private
     */
    static _generatePageItem(text, page, disabled, type = '') {
        const className = `page-item${disabled ? ' disabled' : ''}${type ? ` ${type}` : ''}`;
        return `
            <li class="${className}">
                <a class="page-link" href="#" data-page="${page}">${text}</a>
            </li>
        `;
    }

    /**
     * 生成页码列表
     * @private
     */
    static _generatePageNumbers(current, total) {
        const pages = [];
        const showItem = 5; // 显示的页码数量

        if (total <= showItem) {
            // 总页数小于等于显示数量时，显示所有页码
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // 计算显示范围
            let start = Math.max(1, current - 2);
            let end = Math.min(total, start + showItem - 1);
            
            // 调整起始位置
            if (end === total) {
                start = Math.max(1, end - showItem + 1);
            }

            // 添加首页
            if (start > 1) {
                pages.push(1);
                if (start > 2) pages.push('...');
            }

            // 添加中间页码
            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            // 添加末页
            if (end < total) {
                if (end < total - 1) pages.push('...');
                pages.push(total);
            }
        }

        // 生成HTML
        return pages.map(page => {
            if (page === '...') {
                return `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
            return this._generatePageItem(page, page, false, page === current ? 'active' : '');
        }).join('');
    }

    /**
     * 绑定分页事件
     * @param {String|Element} container 容器选择器或元素
     * @param {Function} callback 页码变更回调
     */
    static bindEvents(container, callback) {
        $(container).on('click', '.page-link', function(e) {
            e.preventDefault();
            const $link = $(this);
            if ($link.parent().hasClass('disabled')) return;

            const page = $link.data('page');
            if (page && typeof callback === 'function') {
                callback(page);
            }
        });
    }

    /**
     * 更新分页状态
     * @param {Object} pagination 分页配置
     * @param {Object} newState 新状态
     * @returns {Object} 更新后的分页配置
     */
    static updateState(pagination, newState) {
        return {
            ...pagination,
            ...newState,
            current: newState.current || pagination.current,
            pageSize: newState.pageSize || pagination.pageSize,
            total: newState.total ?? pagination.total
        };
    }

    /**
     * 计算分页数据
     * @param {Array} data 完整数据数组
     * @param {Object} pagination 分页配置
     * @returns {Array} 当前页数据
     */
    static sliceData(data, pagination) {
        const { current, pageSize } = pagination;
        const start = (current - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }

    /**
     * 获取分页信息文本
     * @param {Object} pagination 分页配置
     * @returns {String} 分页信息文本
     */
    static getInfoText(pagination) {
        const { current, pageSize, total } = pagination;
        const start = (current - 1) * pageSize + 1;
        const end = Math.min(current * pageSize, total);
        return `显示第 ${start} 到 ${end} 条记录，共 ${total} 条`;
    }
}

// 添加到全局命名空间
window.PaginationUtil = PaginationUtil;