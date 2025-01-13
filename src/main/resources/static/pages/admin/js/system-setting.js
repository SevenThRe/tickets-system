
$(document).ready(function() {
    // 加载当前配置
    loadCurrentConfig();

    // 绑定表单提交事件
    bindFormSubmitEvents();
});

// 加载当前配置
function loadCurrentConfig() {
    $.ajax({
        url: '/api/config/system', 
        type: 'GET',
        success: function(response) {
            // 基本设置
            $('#generalForm [name="systemName"]').val(response.general.systemName);
            // 缓存设置
            $('#cacheForm [name="enableCache"]').prop('checked', response.cache.enableCache);
            $('#cacheForm [name="expireTime"]').val(response.cache.expireTime);
            $('#cacheForm [name="expireTimeUnit"]').val(response.cache.expireTimeUnit);
            $('#cacheForm [name="maxSize"]').val(response.cache.maxSize);
            // 日志设置
            $('#logForm [name="logPath"]').val(response.log.logPath);
            $('#logForm [name="logLevel"]').val(response.log.logLevel);
            $('#logForm [name="logRetentionDays"]').val(response.log.logRetentionDays);
        },
        error: function(xhr) {
            NotifyUtil.error('获取配置失败：' + xhr.responseText);
        }
    });
}

// 绑定表单提交事件
function bindFormSubmitEvents() {
    // 基本设置表单提交
    $('#generalForm').on('submit', function(event) {
        event.preventDefault();
        NotifyUtil.loading('正在保存基本设置...');
        var formData = $(this).serialize();
        $.ajax({
            url: '/api/config/update-general',
            type: 'POST',
            data: formData,
            success: function(response) {
                NotifyUtil.closeLoading();
                NotifyUtil.success('基本设置保存成功');
            },
            error: function(xhr) {
                NotifyUtil.closeLoading();
                NotifyUtil.error('基本设置保存失败：' + xhr.responseText);
            }
        });
    });

    // 缓存设置表单提交
    $('#cacheForm').on('submit', function(event) {
        event.preventDefault();
        NotifyUtil.loading('正在保存缓存设置...');
        var formData = $(this).serialize();
        $.ajax({
            url: '/api/config/update-cache',
            type: 'POST',
            data: formData,
            success: function(response) {
                NotifyUtil.closeLoading();
                NotifyUtil.success('缓存设置保存成功');
            },
            error: function(xhr) {
                NotifyUtil.closeLoading();
                NotifyUtil.error('缓存设置保存失败：' + xhr.responseText);
            }
        });
    });

    // 日志设置表单提交
    $('#logForm').on('submit', function(event) {
        event.preventDefault();
        NotifyUtil.loading('正在保存日志设置...');
        var formData = $(this).serialize();
        $.ajax({
            url: '/api/config/update-log',
            type: 'POST',
            data: formData,
            success: function(response) {
                NotifyUtil.closeLoading();
                NotifyUtil.success('日志设置保存成功');
            },
            error: function(xhr) {
                NotifyUtil.closeLoading();
                NotifyUtil.error('日志设置保存失败：' + xhr.responseText);
            }
        });
    });
}