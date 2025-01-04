import ThemeManager from "./theme-manager";
import BaseComponent from "@components/base/base-component";

/**
 * ThemeSelector.js
 * 主题选择器组件
 * 提供主题预览和切换功能
 */
class ThemeSelector extends BaseComponent {
    constructor(options) {
        super({
            ...options,
            events: {
                'click @themeCard': 'handleThemeSelect',
                'click @customizeBtn': 'handleCustomize',
                'click @createBtn': 'handleCreate'
            }
        });

        // 组件状态
        this.state = {
            themes: [],             // 所有主题列表
            currentThemeId: null,   // 当前选中的主题ID
            loading: false,         // 加载状态
            searchKey: '',          // 搜索关键词
            filter: 'all'          // 主题过滤条件
        };

        // 注入依赖
        this.themeManager = ThemeManager.getInstance();
    }

    /**
     * 初始化组件
     */
    async init() {
        try {
            this.state.loading = true;
            this.render();

            // 加载主题列表
            await this.loadThemes();
            
            // 获取当前主题
            const currentTheme = this.themeManager.getCurrentTheme();
            if (currentTheme) {
                this.state.currentThemeId = currentTheme.id;
            }

        } catch (error) {
            console.error('Failed to initialize theme selector:', error);
            this.showError('初始化失败');
        } finally {
            this.state.loading = false;
            this.render();
        }
    }

    /**
     * 加载主题列表
     */
    async loadThemes() {
        try {
            const themes = await this.themeManager.getAllThemes();
            this.state.themes = themes;
        } catch (error) {
            console.error('Failed to load themes:', error);
            throw error;
        }
    }

    /**
     * 渲染组件
     */
    render() {
        if (this.state.loading) {
            this.container.html(this._renderLoading());
            return;
        }

        const html = `
            <div class="theme-selector">
                <div class="selector-header">
                    ${this._renderHeader()}
                </div>
                <div class="selector-body">
                    ${this._renderThemeGrid()}
                </div>
            </div>
        `;

        this.container.html(html);
    }

    /**
     * 渲染头部
     * @private
     */
    _renderHeader() {
        return `
            <div class="selector-controls">
                <div class="search-box">
                    <input type="text" 
                           class="form-control" 
                           placeholder="搜索主题..."
                           value="${this.state.searchKey}"
                           data-ref="searchInput">
                </div>
                <div class="filter-box">
                    <select class="form-select" data-ref="filterSelect">
                        <option value="all" ${this.state.filter === 'all' ? 'selected' : ''}>
                            所有主题
                        </option>
                        <option value="system" ${this.state.filter === 'system' ? 'selected' : ''}>
                            系统主题
                        </option>
                        <option value="custom" ${this.state.filter === 'custom' ? 'selected' : ''}>
                            自定义主题
                        </option>
                    </select>
                </div>
            </div>
            <div class="selector-actions">
                <button class="btn btn-primary" data-ref="createBtn">
                    创建主题
                </button>
            </div>
        `;
    }

    /**
     * 渲染主题网格
     * @private
     */
    _renderThemeGrid() {
        const themes = this._getFilteredThemes();
        
        if (themes.length === 0) {
            return `
                <div class="empty-state">
                    <p>暂无主题</p>
                </div>
            `;
        }

        return `
            <div class="theme-grid">
                ${themes.map(theme => this._renderThemeCard(theme)).join('')}
            </div>
        `;
    }

    /**
     * 渲染主题卡片
     * @private
     */
    _renderThemeCard(theme) {
        const isActive = theme.id === this.state.currentThemeId;
        
        return `
            <div class="theme-card ${isActive ? 'active' : ''}" 
                 data-ref="themeCard"
                 data-theme-id="${theme.id}">
                <div class="card-preview">
                    ${this._renderThemePreview(theme)}
                </div>
                <div class="card-info">
                    <h4 class="theme-name">${theme.name}</h4>
                    <span class="theme-type">
                        ${theme.isSystem ? '系统主题' : '自定义主题'}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="btn btn-sm btn-outline-primary" 
                            data-ref="customizeBtn"
                            data-theme-id="${theme.id}"
                            ${theme.isSystem ? 'disabled' : ''}>
                        ${theme.isSystem ? '不可编辑' : '定制'}
                    </button>
                    ${isActive ? `
                        <span class="badge bg-primary">当前使用</span>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 渲染主题预览
     * @private
     */
    _renderThemePreview(theme) {
        return `
            <div class="theme-preview" style="${this._getPreviewStyles(theme)}">
                <div class="preview-header">
                    <div class="preview-title"></div>
                    <div class="preview-actions">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
                <div class="preview-body">
                    <div class="preview-content">
                        <div class="preview-line"></div>
                        <div class="preview-line"></div>
                        <div class="preview-line short"></div>
                    </div>
                    <div class="preview-sidebar">
                        <div class="preview-item"></div>
                        <div class="preview-item"></div>
                        <div class="preview-item"></div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取预览样式
     * @private
     */
    _getPreviewStyles(theme) {
        const vars = theme.variables;
        return `
            --preview-bg: ${vars.colors.background.body};
            --preview-component-bg: ${vars.colors.background.component};
            --preview-text: ${vars.colors.text.primary};
            --preview-border: ${vars.colors.border.normal};
            --preview-primary: ${vars.colors.brand.primary};
        `;
    }

    /**
     * 渲染加载状态
     * @private
     */
    _renderLoading() {
        return `
            <div class="loading-state">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">加载中...</span>
                </div>
            </div>
        `;
    }

    /**
     * 获取过滤后的主题列表
     * @private
     */
    _getFilteredThemes() {
        let themes = [...this.state.themes];
        
        // 应用过滤器
        if (this.state.filter !== 'all') {
            themes = themes.filter(theme => 
                this.state.filter === 'system' ? theme.isSystem : !theme.isSystem
            );
        }
        
        // 应用搜索
        if (this.state.searchKey) {
            const key = this.state.searchKey.toLowerCase();
            themes = themes.filter(theme => 
                theme.name.toLowerCase().includes(key)
            );
        }
        
        return themes;
    }

    /**
     * 处理主题选择
     * @param {Event} e 事件对象
     */
    async handleThemeSelect(e) {
        const themeId = e.currentTarget.dataset.themeId;
        if (themeId === this.state.currentThemeId) return;

        try {
            // 应用主题
            await this.themeManager.applyTheme(themeId);
            
            // 更新状态
            this.state.currentThemeId = themeId;
            this.render();
            
            this.showSuccess('主题切换成功');
        } catch (error) {
            console.error('Failed to switch theme:', error);
            this.showError('主题切换失败');
        }
    }

    /**
     * 处理主题定制
     * @param {Event} e 事件对象
     */
    handleCustomize(e) {
        e.stopPropagation(); // 防止触发选择事件
        
        const themeId = e.currentTarget.dataset.themeId;
        // 触发定制事件
        this.trigger('customize', { themeId });
    }

    /**
     * 处理创建主题
     */
    handleCreate() {
        // 触发创建事件
        this.trigger('create');
    }

    /**
     * 刷新主题列表
     */
    async refresh() {
        await this.loadThemes();
        this.render();
    }
}

// 导出组件
export default ThemeSelector;