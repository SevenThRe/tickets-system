/**
 * SystemSettings.js
 * TODO: 实现系统设置功能
 */
class SystemSettings extends BaseComponent {
    constructor() {
        // 传递必要的配置给父类BaseComponent
        super({
            container: '#main',  // 指定组件容器
            events: {
                'click #saveGeneralBtn': '_handleSaveGeneral',
                'click #saveEmailBtn': '_handleSaveEmail',
                'click #testEmailBtn': '_handleTestEmail',
                'click #saveLogBtn': '_handleSaveLog',
                'change #logoFile': '_handleLogoUpdate'
            }
        });
        // 加载配置文件内容
        this._loadSettings();
        // 渲染配置项
        this._renderSettings();
    }

    // TODO: 实现以下方法

    /**
     * 初始化组件
     */
    init() {}

    /**
     * 加载配置文件内容
     */
    _loadSettings() {}

    /**
     * 保存基本设置
     */
    _handleSaveGeneral() {}

    /**
     * 保存缓存设置
     */
    _handleSaveCache() {}

    /**
     * 保存日志设置
     */
    _handleSaveLog() {}

    /**
     * 上传新Logo
     */
    _handleLogoUpload() {}

    /**
     * 切换缓存开关状态
     */
    _handleCacheToggle() {}

    /**
     * 验证表单
     */
    _validateForm() {}

    /**
     * 渲染配置项
     */
    _renderSettings() {}

    /**
     * 处理Logo更新
     * @private
     */
    async _handleLogoUpdate(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('logo', file);

            const response = await window.requestUtil.upload('/api/system/logo', formData);

            if (response.code === 200) {
                // 更新系统配置
                const systemConfig = this._getSystemConfig() || {};
                systemConfig.logoUrl = response.data.url;
                localStorage.setItem('system_config', JSON.stringify(systemConfig));

                // 触发全局事件，通知导航栏更新
                window.eventBus.emit('system:logoUpdated');

                this.showSuccess('Logo更新成功');
            }
        } catch (error) {
            console.error('上传Logo失败:', error);
            this.showError('Logo更新失败，请重试');
        }
    }

    /**
     * 获取系统配置
     * @private
     */
    _getSystemConfig() {
        try {
            const config = localStorage.getItem('system_config');
            return config ? JSON.parse(config) : null;
        } catch (error) {
            console.error('获取系统配置失败:', error);
            return null;
        }
    }
}