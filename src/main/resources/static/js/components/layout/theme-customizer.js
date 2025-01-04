import ThemeManager from "./theme-manager";

/**
 * ThemeCustomizer.js
 * 主题定制器组件
 * 提供主题预览、编辑、导入导出等功能
 */
class ThemeCustomizer extends BaseComponent {
    constructor(options) {
        super({
            ...options,
            events: {
                'click @previewBtn': 'handlePreview',
                'click @resetBtn': 'handleReset',
                'click @saveBtn': 'handleSave',
                'click @exportBtn': 'handleExport',
                'change @importInput': 'handleImport',
                'change @colorPicker': 'handleColorChange',
                'input @variableInput': 'handleVariableChange'
            }
        });

        // 组件状态
        this.state = {
            currentTheme: null,  // 当前编辑的主题
            originalTheme: null, // 原始主题备份
            previewMode: false,  // 是否处于预览模式
            modified: false,     // 是否已修改
            errors: {}          // 验证错误信息
        };

        // 防抖处理
        this.debouncedPreview = _.debounce(this._updatePreview.bind(this), 300);
    }

    /**
     * 加载主题数据
     * @param {string} themeId 主题ID
     */
    async loadTheme(themeId) {
        try {
            const theme = await ThemeManager.getInstance().getTheme(themeId);
            this.state.currentTheme = JSON.parse(JSON.stringify(theme)); // 深拷贝
            this.state.originalTheme = JSON.parse(JSON.stringify(theme));
            this.render();
        } catch (error) {
            console.error('Failed to load theme:', error);
            this.showError('加载主题失败');
        }
    }

    /**
     * 渲染组件
     */
    render() {
        const theme = this.state.currentTheme;
        if (!theme) return;

        const html = `
            <div class="theme-customizer">
                <div class="customizer-header">
                    <h3>主题定制 - ${theme.name}</h3>
                    <div class="action-buttons">
                        <button class="btn btn-outline-secondary" data-ref="previewBtn">
                            ${this.state.previewMode ? '退出预览' : '预览'}
                        </button>
                        <button class="btn btn-outline-danger" data-ref="resetBtn">重置</button>
                        <button class="btn btn-primary" data-ref="saveBtn" 
                                ${!this.state.modified ? 'disabled' : ''}>
                            保存
                        </button>
                    </div>
                </div>

                <div class="customizer-body">
                    <div class="variable-editor">
                        ${this._renderVariableEditor()}
                    </div>
                    <div class="theme-preview">
                        ${this._renderPreviewPanel()}
                    </div>
                </div>

                <div class="customizer-footer">
                    <button class="btn btn-outline-primary" data-ref="exportBtn">导出</button>
                    <div class="import-wrapper">
                        <input type="file" accept=".json" 
                               class="d-none" data-ref="importInput">
                        <button class="btn btn-outline-primary" 
                                onclick="this.previousElementSibling.click()">
                            导入
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.container.html(html);
    }

    /**
     * 渲染变量编辑器
     * @private
     */
    _renderVariableEditor() {
        const theme = this.state.currentTheme;
        return Object.entries(theme.variables).map(([category, values]) => `
            <div class="variable-category">
                <h4>${this._formatCategoryName(category)}</h4>
                <div class="variable-group">
                    ${this._renderCategoryVariables(category, values)}
                </div>
            </div>
        `).join('');
    }

    /**
     * 渲染分类变量
     * @private
     */
    _renderCategoryVariables(category, values, prefix = '') {
        return Object.entries(values).map(([key, value]) => {
            const fullKey = prefix ? `${prefix}-${key}` : key;
            const error = this.state.errors[fullKey];

            if (typeof value === 'object' && value !== null) {
                return `
                    <div class="variable-subgroup">
                        <h5>${this._formatVariableName(key)}</h5>
                        ${this._renderCategoryVariables(category, value, fullKey)}
                    </div>
                `;
            }

            return `
                <div class="variable-item ${error ? 'has-error' : ''}">
                    <label>${this._formatVariableName(key)}</label>
                    ${this._renderVariableInput(category, fullKey, value)}
                    ${error ? `<div class="error-message">${error}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * 渲染变量输入控件
     * @private
     */
    _renderVariableInput(category, key, value) {
        if (category === 'colors') {
            return `
                <div class="color-picker-wrapper">
                    <input type="color" 
                           class="form-control" 
                           data-ref="colorPicker"
                           data-key="${key}"
                           value="${value}"
                           title="${value}">
                    <input type="text" 
                           class="form-control color-text"
                           data-ref="variableInput"
                           data-key="${key}"
                           value="${value}">
                </div>
            `;
        }

        return `
            <input type="text" 
                   class="form-control"
                   data-ref="variableInput"
                   data-key="${key}"
                   value="${value}">
        `;
    }

    /**
     * 渲染预览面板
     * @private
     */
    _renderPreviewPanel() {
        return `
            <div class="preview-container">
                <div class="preview-section typography">
                    <h3>Typography</h3>
                    <p class="text-primary">Primary Text</p>
                    <p class="text-secondary">Secondary Text</p>
                    <p class="text-muted">Muted Text</p>
                </div>

                <div class="preview-section colors">
                    <h3>Colors</h3>
                    <div class="color-grid">
                        ${this._renderColorSwatches()}
                    </div>
                </div>

                <div class="preview-section components">
                    <h3>Components</h3>
                    <button class="btn btn-primary">Primary Button</button>
                    <button class="btn btn-secondary">Secondary Button</button>
                    <div class="alert alert-info">Info Alert</div>
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Card Title</h5>
                            <p class="card-text">Card content</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 处理预览按钮点击
     */
    handlePreview() {
        this.state.previewMode = !this.state.previewMode;
        if (this.state.previewMode) {
            ThemeUtils.applyThemeVariables(this.state.currentTheme.variables);
        } else {
            ThemeUtils.applyThemeVariables(this.state.originalTheme.variables);
        }
        this.render();
    }

    /**
     * 处理重置按钮点击
     */
    handleReset() {
        if (!this.state.modified) return;

        Modal.confirm({
            title: '确认重置',
            content: '确定要重置所有修改吗？这将丢失所有未保存的更改。',
            onConfirm: () => {
                this.state.currentTheme = JSON.parse(
                    JSON.stringify(this.state.originalTheme)
                );
                this.state.modified = false;
                this.state.errors = {};
                if (this.state.previewMode) {
                    ThemeUtils.applyThemeVariables(this.state.currentTheme.variables);
                }
                this.render();
            }
        });
    }

    /**
     * 处理保存按钮点击
     */
    async handleSave() {
        if (!this.state.modified) return;

        try {
            // 验证主题配置
            if (!ThemeUtils.validateThemeConfig(this.state.currentTheme)) {
                this.showError('主题配置无效');
                return;
            }

            // 保存主题
            await ThemeManager.getInstance().updateTheme(
                this.state.currentTheme.id,
                this.state.currentTheme
            );

            // 更新状态
            this.state.originalTheme = JSON.parse(
                JSON.stringify(this.state.currentTheme)
            );
            this.state.modified = false;
            this.render();

            this.showSuccess('保存成功');
        } catch (error) {
            console.error('Failed to save theme:', error);
            this.showError('保存失败');
        }
    }

    /**
     * 处理颜色变更
     * @param {Event} e 事件对象
     */
    handleColorChange(e) {
        const key = e.target.dataset.key;
        const value = e.target.value;
        
        this._updateThemeVariable(key, value);
        // 同步更新文本输入框
        this.container
            .find(`input[type="text"][data-key="${key}"]`)
            .val(value);
    }

    /**
     * 处理变量值变更
     * @param {Event} e 事件对象
     */
    handleVariableChange(e) {
        const key = e.target.dataset.key;
        const value = e.target.value;
        
        this._updateThemeVariable(key, value);
        // 如果是颜色值，同步更新颜色选择器
        if (this._isColorValue(value)) {
            this.container
                .find(`input[type="color"][data-key="${key}"]`)
                .val(value);
        }
    }

    /**
     * 更新主题变量
     * @private
     */
    _updateThemeVariable(key, value) {
        const keys = key.split('-');
        let current = this.state.currentTheme.variables;
        
        // 遍历路径
        for (let i = 0; i < keys.length - 1; i++) {
            current = current[keys[i]];
        }
        
        // 更新值
        const lastKey = keys[keys.length - 1];
        if (current[lastKey] !== value) {
            current[lastKey] = value;
            this.state.modified = true;
            this.debouncedPreview();
            this.render();
        }
    }

    /**
     * 更新预览
     * @private
     */
    _updatePreview() {
        if (this.state.previewMode) {
            ThemeUtils.applyThemeVariables(this.state.currentTheme.variables);
        }
    }

    /**
     * 处理主题导出
     */
    handleExport() {
        const theme = this.state.currentTheme;
        const jsonStr = JSON.stringify(theme, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${theme.name}-theme.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * 处理主题导入
     */
    async handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const content = await this._readFileContent(file);
            const theme = JSON.parse(content);
            
            // 验证主题配置
            if (!ThemeUtils.validateThemeConfig(theme)) {
                throw new Error('Invalid theme configuration');
            }

            // 确认导入
            const confirmed = await Modal.confirm({
                title: '确认导入',
                content: `确定要导入主题"${theme.name}"吗？这将覆盖当前的修改。`
            });

            if (confirmed) {
                this.state.currentTheme = {
                    ...theme,
                    id: this.state.currentTheme.id
                };
                this.state.modified = true;
                if (this.state.previewMode) {
                    ThemeUtils.applyThemeVariables(this.state.currentTheme.variables);
                }
                this.render();
            }
        } catch (error) {
            console.error('Failed to import theme:', error);
            this.showError('主题导入失败，请确保文件格式正确');
        }

        // 清空文件输入框
        e.target.value = '';
    }

    /**
     * 读取文件内容
     * @private
     */
    _readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * 格式化分类名称
     * @private
     */
    _formatCategoryName(category) {
        const nameMap = {
            colors: '颜色',
            typography: '排版',
            spacing: '间距',
            borders: '边框',
            shadows: '阴影',
            animations: '动画'
        };
        return nameMap[category] || category;
    }

    /**
     * 格式化变量名称
     * @private
     */
    _formatVariableName(name) {
        return name.replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    /**
     * 检查是否为颜色值
     * @private
     */
    /**
     * 检查是否为颜色值
     * @private 
     * @param {string} value 要检查的值
     * @returns {boolean} 是否为颜色值
     */
    _isColorValue(value) {
        // 检查十六进制颜色
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
            return true;
        }
        
        // 检查rgb/rgba颜色
        if (/^rgba?\((\d+\s*,\s*){2}\d+\s*(,\s*\d*\.?\d+\s*)?\)$/.test(value)) {
            return true;
        }
        
        // 检查hsl/hsla颜色
        if (/^hsla?\((\d+\s*,\s*){2}\d+\s*(,\s*\d*\.?\d+\s*)?\)$/.test(value)) {
            return true;
        }
        
        return false;
    }

    /**
     * 渲染颜色色板
     * @private
     * @returns {string} 色板HTML
     */
    _renderColorSwatches() {
        const colors = this.state.currentTheme.variables.colors;
        const swatches = [];
        
        // 处理颜色对象
        const processColorObject = (obj, prefix = '') => {
            Object.entries(obj).forEach(([key, value]) => {
                const name = prefix ? `${prefix}-${key}` : key;
                if (typeof value === 'object') {
                    processColorObject(value, name);
                } else if (this._isColorValue(value)) {
                    swatches.push({
                        name: this._formatVariableName(name),
                        value: value
                    });
                }
            });
        };
        
        processColorObject(colors);
        
        return swatches.map(swatch => `
            <div class="color-swatch" title="${swatch.name}">
                <div class="swatch-color" style="background-color: ${swatch.value}"></div>
                <div class="swatch-name">${swatch.name}</div>
                <div class="swatch-value">${swatch.value}</div>
            </div>
        `).join('');
    }
    
    /**
     * 销毁组件
     * 确保清理所有事件监听和状态
     */
    destroy() {
        // 清理防抖函数
        this.debouncedPreview.cancel();
        
        // 如果处于预览模式，恢复原始主题
        if (this.state.previewMode) {
            ThemeUtils.applyThemeVariables(this.state.originalTheme.variables);
        }
        
        // 调用父类销毁方法
        super.destroy();
    }
}

// 导出组件
export default ThemeCustomizer;