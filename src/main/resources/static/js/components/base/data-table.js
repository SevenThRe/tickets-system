/**
 * Created by SevenThRe
 * 数据表格组件
 * 提供数据展示、排序、分页、选择等功能
 */
class DataTable extends BaseComponent {
    /**
     * 表格组件构造函数
     * @param {Object} options 配置项
     * @param {String|jQuery} options.container 容器选择器或jQuery对象
     * @param {Array} options.columns 列配置数组
     * @param {Function} options.dataSource 数据源函数
     * @param {Object} [options.pagination] 分页配置
     * @param {Object} [options.selection] 选择配置
     */
    constructor(options) {
        super(options);
        
        // 表格配置
        this.columns = options.columns || [];
        this.dataSource = options.dataSource;
        
        // 分页配置
        this.pagination = {
            enabled: true,
            current: 1,
            pageSize: 10,
            total: 0,
            ...options.pagination
        };
        
        // 选择配置
        this.selection = {
            enabled: false,
            type: 'checkbox',  // checkbox|radio
            selectedKeys: new Set(),
            ...options.selection
        };
        
        // 排序配置
        this.sortInfo = {
            field: null,
            direction: null  // asc|desc
        };
        
        // 组件状态
        this.loading = false;
        this.data = [];
        
        // 绑定事件处理函数
        this.bindMethods();
    }

    /**
     * 绑定类方法
     */
    bindMethods() {
        this.events = {
            'click .sort-trigger': this.handleSort.bind(this),
            'change .row-selector': this.handleRowSelect.bind(this),
            'change .select-all': this.handleSelectAll.bind(this),
            'click .pagination-item': this.handlePageChange.bind(this)
        };
    }

    /**
     * 渲染组件
     * @returns {Promise}
     */
    async render() {
        const html = `
            <div class="data-table">
                <div class="table-container">
                    <table class="table">
                        ${this.renderHeader()}
                        ${this.renderBody()}
                    </table>
                </div>
                ${this.renderPagination()}
            </div>
        `;
        
        this.container.html(html);
    }

    /**
     * 渲染表头
     * @returns {String}
     */
    renderHeader() {
        const cols = this.columns.map(col => {
            let sortTrigger = '';
            if (col.sortable) {
                const sortClass = this.getSortClass(col.field);
                sortTrigger = `<span class="sort-trigger ${sortClass}" data-field="${col.field}"></span>`;
            }
            return `<th>${col.title}${sortTrigger}</th>`;
        });

        // 添加选择列
        if (this.selection.enabled) {
            const selectAll = `
                <th>
                    <input type="checkbox" 
                           class="select-all"
                           ${this.isAllSelected() ? 'checked' : ''}>
                </th>
            `;
            cols.unshift(selectAll);
        }

        return `
            <thead>
                <tr>${cols.join('')}</tr>
            </thead>
        `;
    }

    /**
     * 渲染表格主体
     * @returns {String}
     */
    renderBody() {
        if (this.loading) {
            return this.renderLoading();
        }

        if (!this.data.length) {
            return this.renderEmpty();
        }

        const rows = this.data.map(item => {
            const cells = this.columns.map(col => {
                let content = item[col.field];
                if (col.render) {
                    content = col.render(content, item);
                }
                return `<td>${content}</td>`;
            });

            // 添加选择框
            if (this.selection.enabled) {
                const selector = `
                    <td>
                        <input type="${this.selection.type}" 
                               class="row-selector"
                               data-key="${item.key}"
                               ${this.isSelected(item.key) ? 'checked' : ''}>
                    </td>
                `;
                cells.unshift(selector);
            }

            return `<tr data-key="${item.key}">${cells.join('')}</tr>`;
        });

        return `<tbody>${rows.join('')}</tbody>`;
    }

    /**
     * 渲染加载状态
     * @returns {String}
     */
    renderLoading() {
        const colspan = this.getColSpan();
        return `
            <tbody>
                <tr>
                    <td colspan="${colspan}" class="text-center">
                        <div class="loading-spinner"></div>
                    </td>
                </tr>
            </tbody>
        `;
    }

    /**
     * 渲染空状态
     * @returns {String}
     */
    renderEmpty() {
        const colspan = this.getColSpan();
        return `
            <tbody>
                <tr>
                    <td colspan="${colspan}" class="text-center">
                        暂无数据
                    </td>
                </tr>
            </tbody>
        `;
    }

    /**
     * 渲染分页器
     * @returns {String}
     */
    renderPagination() {
        if (!this.pagination.enabled || this.pagination.total <= this.pagination.pageSize) {
            return '';
        }

        const pageCount = Math.ceil(this.pagination.total / this.pagination.pageSize);
        const pages = this.calculatePageNumbers(pageCount);

        const items = pages.map(page => {
            if (page === '...') {
                return `
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>
                `;
            }
            return `
                <li class="page-item ${page === this.pagination.current ? 'active' : ''}">
                    <a class="page-link pagination-item" 
                       href="javascript:void(0)" 
                       data-page="${page}">${page}</a>
                </li>
            `;
        });

        // 添加上一页、下一页
        const prevDisabled = this.pagination.current === 1;
        const nextDisabled = this.pagination.current === pageCount;

        return `
            <nav class="pagination-container">
                <ul class="pagination">
                    <li class="page-item ${prevDisabled ? 'disabled' : ''}">
                        <a class="page-link pagination-item" 
                           href="javascript:void(0)" 
                           data-page="${this.pagination.current - 1}">上一页</a>
                    </li>
                    ${items.join('')}
                    <li class="page-item ${nextDisabled ? 'disabled' : ''}">
                        <a class="page-link pagination-item" 
                           href="javascript:void(0)" 
                           data-page="${this.pagination.current + 1}">下一页</a>
                    </li>
                </ul>
            </nav>
        `;
    }

    /**
     * 计算需要显示的页码
     * @param {Number} total 总页数
     * @returns {Array} 页码数组
     */
    calculatePageNumbers(total) {
        const current = this.pagination.current;
        const pages = [];
        const showSideNumbers = 2;

        // 总是显示第一页
        pages.push(1);

        // 计算左边界
        const leftBoundary = Math.max(2, current - showSideNumbers);
        if (leftBoundary > 2) {
            pages.push('...');
        }

        // 添加当前页码左右的页码
        for (let i = leftBoundary; i <= Math.min(total - 1, current + showSideNumbers); i++) {
            pages.push(i);
        }

        // 计算右边界
        if (current + showSideNumbers < total - 1) {
            pages.push('...');
        }

        // 总是显示最后一页
        if (total > 1) {
            pages.push(total);
        }

        return pages;
    }

    /**
     * 获取表格总列数
     * @returns {Number}
     */
    getColSpan() {
        return this.columns.length + (this.selection.enabled ? 1 : 0);
    }

    /**
     * 获取排序类名
     * @param {String} field 字段名
     * @returns {String}
     */
    getSortClass(field) {
        if (this.sortInfo.field !== field) {
            return '';
        }
        return `sort-${this.sortInfo.direction}`;
    }

    /**
     * 检查是否全选
     * @returns {Boolean}
     */
    isAllSelected() {
        return this.data.length > 0 && 
               this.data.every(item => this.selection.selectedKeys.has(item.key));
    }

    /**
     * 检查行是否被选中
     * @param {String|Number} key 行键值
     * @returns {Boolean}
     */
    isSelected(key) {
        return this.selection.selectedKeys.has(key);
    }

    /**
     * 加载数据
     * @returns {Promise}
     */
    async loadData() {
        try {
            this.loading = true;
            await this.render();

            const params = {
                pageNum: this.pagination.current,
                pageSize: this.pagination.pageSize,
                sortField: this.sortInfo.field,
                sortDirection: this.sortInfo.direction
            };

            const result = await this.dataSource(params);
            
            this.data = result.data;
            this.pagination.total = result.total;
            
            this.loading = false;
            await this.render();
        } catch (error) {
            this.loading = false;
            this.showError('数据加载失败');
            console.error('Failed to load data:', error);
        }
    }

    /**
     * 处理排序事件
     * @param {Event} e 事件对象
     */
    handleSort(e) {
        const field = $(e.currentTarget).data('field');
        
        // 切换排序方向
        if (this.sortInfo.field === field) {
            this.sortInfo.direction = this.sortInfo.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortInfo.field = field;
            this.sortInfo.direction = 'asc';
        }

        this.loadData();
    }

    /**
     * 处理行选择事件
     * @param {Event} e 事件对象
     */
    handleRowSelect(e) {
        const key = $(e.currentTarget).data('key');
        const checked = e.currentTarget.checked;

        if (this.selection.type === 'radio') {
            this.selection.selectedKeys.clear();
            if (checked) {
                this.selection.selectedKeys.add(key);
            }
        } else {
            if (checked) {
                this.selection.selectedKeys.add(key);
            } else {
                this.selection.selectedKeys.delete(key);
            }
        }

        // 触发选择变更事件
        this.trigger('selectionChange', {
            selectedKeys: Array.from(this.selection.selectedKeys),
            selectedRows: this.data.filter(item => this.selection.selectedKeys.has(item.key))
        });

        // 只更新表头的全选框状态
        const selectAll = this.container.find('.select-all');
        selectAll.prop('checked', this.isAllSelected());
    }

    /**
     * 处理全选事件
     * @param {Event} e 事件对象
     */
    handleSelectAll(e) {
        const checked = e.currentTarget.checked;

        if (checked) {
            this.data.forEach(item => this.selection.selectedKeys.add(item.key));
        } else {
            this.selection.selectedKeys.clear();
        }

        // 更新所有选择框的状态
        this.container.find('.row-selector').prop('checked', checked);

        // 触发选择变更事件
        this.trigger('selectionChange', {
            selectedKeys: Array.from(this.selection.selectedKeys),
            selectedRows: checked ? [...this.data] : []
        });
    }

    /**
     * 处理分页事件
     * @param {Event} e 事件对象
     */
    handlePageChange(e) {
        e.preventDefault();
        
        const page = $(e.currentTarget).data('page');
        if (page === this.pagination.current || 
            page < 1 || 
            page > Math.ceil(this.pagination.total / this.pagination.pageSize)) {
            return;
        }

        this.pagination.current = page;
        this.loadData();
    }

    /**
     * 获取选中的行数据
     * @returns {Array} 选中的行数据数组
     */
    getSelectedRows() {
        return this.data.filter(item => this.selection.selectedKeys.has(item.key));
    }

    /**
     * 设置选中的行
     * @param {Array} keys 要选中的行的key数组
     */
    setSelection(keys) {
        this.selection.selectedKeys = new Set(keys);
        this.render();
    }

    /**
     * 清除选择
     */
    clearSelection() {
        this.selection.selectedKeys.clear();
        this.render();
    }

    /**
     * 刷新表格数据
     */
    refresh() {
        this.loadData();
    }
}
