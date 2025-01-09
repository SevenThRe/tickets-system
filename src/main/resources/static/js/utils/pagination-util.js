/**
 * Pagination-util.js
 * 分页工具类
 */
class Pagination {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.container - 分页容器选择器
     * @param {number} options.pageSize - 每页显示数量
     * @param {Function} options.onChange - 页码变更回调函数
     */
    constructor(options) {
        // 配置参数
        this.container = $(options.container);  // 分页容器元素
        this.pageSize = options.pageSize || 10; // 每页数量，默认10
        this.onChange = options.onChange;       // 页码变更回调

        // 当前状态
        this.currentPage = 1;  // 当前页码
        this.totalItems = 0;   // 总记录数

        // 初始化分页配置
        this.config = {
            showFirstLast: true,   // 显示首尾页按钮
            showPrevNext: true,    // 显示上下页按钮
            maxPageButtons: 5,     // 最大显示的页码按钮数
            firstText: '首页',      // 首页按钮文本
            lastText: '末页',       // 末页按钮文本
            prevText: '上一页',     // 上一页按钮文本
            nextText: '下一页'      // 下一页按钮文本
        };

        // 绑定点击事件委托
        this.bindEvents();
    }

    /**
     * 绑定分页事件
     * @private
     */
    bindEvents() {
        this.container.on('click', '.page-link', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            if (page && page !== this.currentPage) {
                this.goToPage(page);
            }
        });
    }

    /**
     * 更新分页数据
     * @param {number} total - 总记录数
     * @param {number} current - 当前页码
     */
    update(total, current) {
        this.totalItems = total;
        this.currentPage = current;
        this.render();
    }

    /**
     * 跳转到指定页
     * @param {number} page - 目标页码
     */
    goToPage(page) {
        if (page < 1 || page > this.getTotalPages() || page === this.currentPage) {
            return;
        }
        this.currentPage = page;
        this.onChange && this.onChange(page);
    }

    /**
     * 获取总页数
     * @returns {number} 总页数
     * @private
     */
    getTotalPages() {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    /**
     * 渲染分页控件
     * @private
     */
    render() {
        const totalPages = this.getTotalPages();
        if (totalPages <= 1) {
            this.container.empty();
            return;
        }

        let html = '<ul class="pagination mb-0">';

        // 首页和上一页按钮
        if (this.config.showFirstLast || this.config.showPrevNext) {
            html += this.renderNavigationButtons('prev');
        }

        // 页码按钮
        html += this.renderPageButtons();

        // 下一页和末页按钮
        if (this.config.showFirstLast || this.config.showPrevNext) {
            html += this.renderNavigationButtons('next');
        }

        html += '</ul>';
        this.container.html(html);
    }

    /**
     * 渲染导航按钮(首页、上一页、下一页、末页)
     * @param {string} type - 按钮类型(prev/next)
     * @returns {string} 按钮HTML
     * @private
     */
    renderNavigationButtons(type) {
        const totalPages = this.getTotalPages();
        const isNext = type === 'next';
        let html = '';

        // 首页/上一页
        if (!isNext && this.config.showFirstLast) {
            html += `
                <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="1">${this.config.firstText}</a>
                </li>
            `;
        }

        // 上一页/下一页
        if (this.config.showPrevNext) {
            const page = isNext ? this.currentPage + 1 : this.currentPage - 1;
            const disabled = isNext ?
                this.currentPage === totalPages :
                this.currentPage === 1;

            html += `
                <li class="page-item ${disabled ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${page}">
                        ${isNext ? this.config.nextText : this.config.prevText}
                    </a>
                </li>
            `;
        }

        // 末页/下一页
        if (isNext && this.config.showFirstLast) {
            html += `
                <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${totalPages}">${this.config.lastText}</a>
                </li>
            `;
        }

        return html;
    }

    /**
     * 渲染页码按钮
     * @returns {string} 页码按钮HTML
     * @private
     */
    renderPageButtons() {
        const totalPages = this.getTotalPages();
        let startPage = Math.max(1, this.currentPage - Math.floor(this.config.maxPageButtons / 2));
        let endPage = startPage + this.config.maxPageButtons - 1;

        if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - this.config.maxPageButtons + 1);
        }

        let html = '';
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }
        return html;
    }
}
// 添加到全局命名空间
window.Pagination = Pagination;