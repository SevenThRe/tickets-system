/**
 * 系统设置管理类
 */
class SystemSettings {
    constructor() {
        // 缓存表单元素
        this.forms = {
            general: $('#generalForm'),
            cache: $('#cacheForm'),
            log: $('#logForm'),
            upload: $('#uploadForm')
        };

        // 初始化
        this.init();
    }

    /**
     * 初始化方法
     */
    init() {
        // 加载当前配置
        this.loadCurrentConfig();
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 加载当前配置
     */
    async loadCurrentConfig() {
        try {
            const response = await $.ajax({
                url: '/api/config/system',
                method: 'GET'
            });

            if(response.code === 200) {
                this.updateFormValues(response.data);
            } else {
                NotifyUtil.error(response.msg || '获取配置失败');
            }
        } catch(error) {
            console.error('加载配置失败:', error);
            NotifyUtil.error('加载配置失败');
        }
    }

    /**
     * 更新表单值
     */
    updateFormValues(config) {
        // 基本设置
        this.forms.general.find('[name="systemName"]').val(config.general.systemName);

        // 缓存设置
        this.forms.cache.find('[name="enableCache"]').prop('checked', config.cache.enableCache);
        this.forms.cache.find('[name="expireTime"]').val(config.cache.expireTime);
        this.forms.cache.find('[name="expireTimeUnit"]').val(config.cache.expireTimeUnit);
        this.forms.cache.find('[name="maxSize"]').val(config.cache.maxSize);

        // 日志设置
        this.forms.log.find('[name="logPath"]').val(config.log.logPath);
        this.forms.log.find('[name="logLevel"]').val(config.log.logLevel);
        this.forms.log.find('[name="logRetentionDays"]').val(config.log.logRetentionDays);

        // 上传设置
        this.forms.upload.find('[name="uploadPath"]').val(config.upload.uploadPath);
        this.forms.upload.find('[name="maxSize"]').val(config.upload.maxSize);
        this.forms.upload.find('[name="avatarPath"]').val(config.upload.avatarPath);
        // 设置多选值
        const $allowedTypes = this.forms.upload.find('[name="allowedTypes"]');
        $allowedTypes.val(config.upload.allowedTypes);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 基本设置表单提交
        this.forms.general.on('submit', (e) => this.handleGeneralSubmit(e));

        // 缓存设置表单提交
        this.forms.cache.on('submit', (e) => this.handleCacheSubmit(e));

        // 日志设置表单提交
        this.forms.log.on('submit', (e) => this.handleLogSubmit(e));

        // 缓存启用状态变更
        $('#enableCache').on('change', (e) => {
            $('#cacheSettings').toggle(e.target.checked);
        });

        this.forms.upload.on('submit', (e) => this.handleUploadSubmit(e));
    }

    /**
     * 处理基本设置提交
     */
    async handleGeneralSubmit(e) {
        e.preventDefault();
        try {
            const formData = this.forms.general.serializeArray();
            const data = this.convertFormDataToObject(formData);

            const response = await $.ajax({
                url: '/api/config/update-general',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });

            if(response.code === 200) {
                NotifyUtil.success('基本设置保存成功');
            } else {
                NotifyUtil.error(response.msg || '保存失败');
            }
        } catch(error) {
            console.error('保存基本设置失败:', error);
            NotifyUtil.error('保存失败');
        }
    }

    /**
     * 处理上传设置提交
     */

    async handleUploadSubmit(e) {
        e.preventDefault();
        try {
            const formData = this.forms.upload.serializeArray();
            const data = this.convertFormDataToObject(formData);

            // 处理多选值
            data.allowedTypes = this.forms.upload.find('[name="allowedTypes"]').val();

            // 处理头像上传路径
            data.avatarPath = this.forms.upload.find('[name="avatarPath"]').val();

            const response = await $.ajax({
                url: '/api/config/update-upload',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });

            if(response.code === 200) {
                NotifyUtil.success('文件上传设置保存成功');
            } else {
                NotifyUtil.error(response.msg || '保存失败');
            }
        } catch(error) {
            console.error('保存文件上传设置失败:', error);
            NotifyUtil.error('保存失败');
        }
    }

    /**
     * 处理缓存设置提交
     */
    async handleCacheSubmit(e) {
        e.preventDefault();
        try {
            const formData = this.forms.cache.serializeArray();
            const data = this.convertFormDataToObject(formData);
            data.enableCache = $('#enableCache').is(':checked');

            const response = await $.ajax({
                url: '/api/config/update-cache',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });

            if(response.code === 200) {
                NotifyUtil.success('缓存设置保存成功');
            } else {
                NotifyUtil.error(response.msg || '保存失败');
            }
        } catch(error) {
            console.error('保存缓存设置失败:', error);
            NotifyUtil.error('保存失败');
        }
    }

    /**
     * 处理日志设置提交
     */
    async handleLogSubmit(e) {
        e.preventDefault();
        try {
            const formData = this.forms.log.serializeArray();
            const data = this.convertFormDataToObject(formData);

            const response = await $.ajax({
                url: '/api/config/update-log',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            });

            if(response.code === 200) {
                NotifyUtil.success('日志设置保存成功');
            } else {
                NotifyUtil.error(response.msg || '保存失败');
            }
        } catch(error) {
            console.error('保存日志设置失败:', error);
            NotifyUtil.error('保存失败');
        }
    }

    /**
     * 转换表单数据为对象
     */
    convertFormDataToObject(formData) {
        const data = {};
        formData.forEach(item => {
            data[item.name] = item.value;
        });
        return data;
    }
}

// 页面加载完成后初始化
$(document).ready(() => {
    window.systemSettings = new SystemSettings();
});