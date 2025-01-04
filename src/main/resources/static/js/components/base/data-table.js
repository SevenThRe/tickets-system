/**
 * DataTable.js
 * 数据表格组件
 *
 * 核心功能:
 * 1. 数据展示和分页
 * 2. 排序和筛选
 * 3. 行选择(单选/多选)
 * 4. 动态加载数据
 * 5. 自定义列渲染
 */
class DataTable extends BaseComponent {
    /**
     * 数据表格构造函数
     * @param {Object} options 配置参数
     * @param {String|jQuery} options.container 容器选择器或jQuery对象
     * @param {Array} options.columns 列配置数组
     * @param {Function} options.dataSource 数据源函数,返回Promise
     * @param {Object} [options.pagination] 分页配置
     * @param {Object} [options.selection] 选择配置
     */
    constructor(options) {
        super(options);

        // 验证必要参数
        if (!options.columns || !options.dataSource) {
            throw new Error('columns和dataSource为必要参数');
        }

        // 表格列配置
        this.columns = this._initColumns(options.columns);

        // 数据源函数
        this.dataSource = options.dataSource;

        // 分页配置
        this.pagination = {
            enabled: true,      // 是否启用分页
            current: 1,         // 当前页码
            pageSize: 10,       // 每页条数
            total: 0,           // 总记录数
            ...options.pagination
        };

        // 选择配置
        this.selection = {
            enabled: false,     // 是否启用选择
            type: 'checkbox',   // checkbox(多选) | radio(单选)
            selectedKeys: new Set(),  // 已选择的行key集合
            ...options.selection
        };

        // 排序配置
        this.sortInfo = {
            field: null,        // 排序字段
            direction: null     // asc | desc
        };

        // 组件状态
        this.loading = false;    // 加载状态
        this.data = [];          // 表格数据
        this.error = null;       // 错误信息

        // 绑定事件处理函数
        this._bindEvents();
    }

    /**
     * 初始化列配置
     * @private
     */
    _initColumns(columns) {
        return columns.map(col => ({
            field: col.field,            // 字段名
            title: col.title,            // 列标题
            width: col.width || 'auto',  // 列宽度
            sortable: !!col.sortable,    // 是否可排序
            render: col.render,          // 自定义渲染函数
            align: col.align || 'left'   // 对齐方式
        }));
    }

    /**
     * 绑定事件处理
     * @private
     */
    _bindEvents() {
        this.events = {
            'click .sort-trigger': this._handleSort.bind(this),
            'change .row-selector': this._handleRowSelect.bind(this),
            'change .select-all': this._handleSelectAll.bind(this),
            'click .pagination-item': this._handlePageChange.bind(this)
        };
    }

    /**
     * 渲染表格
     * @override
     */
    async render() {
        const html = `
            <div class="data-table">
                <div class="table-container">
                    <table class="table">
                        ${this._renderHeader()}
                        ${this._renderBody()}
                    </table>
                </div>
                ${this._renderPagination()}
            </div>
        `;

        this.container.html(html);

        // 初始化工具提示
        this.container.find('[data-toggle="tooltip"]').tooltip();
    }

    /**
     * 渲染表头
     * @private
     */
    _renderHeader() {
        const cols = this.columns.map(col => {
            let sortTrigger = '';
            if (col.sortable) {
                const sortClass = this._getSortClass(col.field);
                sortTrigger = `
                    <span class="sort-trigger ${sortClass}" 
                          data-field="${col.field}"
                          data-toggle="tooltip"
                          title="点击排序">
                    </span>
                `;
            }
            return `
                <th style="width:${col.width};text-align:${col.align}">
                    ${col.title}${sortTrigger}
                </th>
            `;
        });

        // 添加选择列
        if (this.selection.enabled) {
            const selectAll = `
                <th style="width:40px;">
                    <input type="checkbox" 
                           class="select-all"
                           ${this._isAllSelected() ? 'checked' : ''}>
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
     * @private
     */
    _renderBody() {
        if (this.loading) {
            return this._renderLoading();
        }

        if (this.error) {
            return this._renderError();
        }

        if (!this.data.length) {
            return this._renderEmpty();
        }

        const rows = this.data.map(item => {
            const cells = this.columns.map(col => {
                let content = item[col.field];
                if (col.render) {
                    content = col.render(content, item);
                }
                return `
                    <td style="text-align:${col.align}">
                        ${content}
                    </td>
                `;
            });

            // 添加选择框
            if (this.selection.enabled) {
                const selector = `
                    <td>
                        <input type="${this.selection.type}" 
                               class="row-selector"
                               data-key="${item.key}"
                               ${this._isSelected(item.key) ? 'checked' : ''}>
                    </td>
                `;
                cells.unshift(selector);
            }

            return `
                <tr data-key="${item.key}" 
                    class="${this._isSelected(item.key) ? 'selected' : ''}">
                    ${cells.join('')}
                </tr>
            `;
        });

        return `<tbody>${rows.join('')}</tbody>`;
    }

    /**
     * 渲染加载状态
     * @private
     */
    _renderLoading() {
        const colspan = this._getColSpan();
        return `
            <tbody>
                <tr>
                    <td colspan="${colspan}" class="text-center">
                        <div class="spinner-border spinner-border-sm text-primary">
                        </div>
                        <span class="ml-2">数据加载中...</span>
                    </td>
                </tr>
            </tbody>
        `;
    }

    // ... 更多渲染和事件处理方法 ...

    /**
     * 加载数据
     * @public
     */
    async loadData() {
        try {
            this.loading = true;
            this.error = null;
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

        } catch (error) {
            this.error = error;
            console.error('数据加载失败:', error);
        } finally {
            this.loading = false;
            await this.render();
        }
    }

    /**
     * 获取选中的行数据
     * @returns {Array} 选中的行数据数组
     * @public
     */
    getSelectedRows() {
        return this.data.filter(item =>
            this.selection.selectedKeys.has(item.key)
        );
    }

    /**
     * 设置选中的行
     * @param {Array} keys 要选中的行key数组
     * @public
     */
    setSelection(keys) {
        this.selection.selectedKeys = new Set(keys);
        this.render();
    }

    /**
     * 刷新表格数据
     * @public
     */
    refresh() {
        return this.loadData();
    }
}

// 添加到全局命名空间
window.DataTable = DataTable;