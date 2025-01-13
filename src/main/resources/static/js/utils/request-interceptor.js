(function() {
    const originalAjax = $.ajax;

    // 重写ajax方法
    $.ajax = function(options) {
        // API权限映射
        const apiPermissions = {
            '/roles/insert': ['role:create'],
            '/roles/updateRole': ['role:update'],
            '/roles/deleteByRoleId': ['role:delete'],
            '/roles/selectAll': ['role:view'],
            '/roles/list': ['role:view'],
            '/roles/permissions': ['role:view', 'permission:view']
            // 更多API权限映射
        };

        // 检查用户权限
        const checkPermission = (url) => {
            // 遍历权限映射检查是否有权限
            for (const [api, permissions] of Object.entries(apiPermissions)) {
                if (url.includes(api)) {
                    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                    const userPermissions = JSON.parse(localStorage.getItem('permissions') || '[]');
                    // 检查是否有所需的任一权限
                    const hasPermission = permissions.some(p => userPermissions.includes(p));
                    if (!hasPermission) {
                        return false;
                    }
                }
            }
            return true;
        };

        // 检查当前请求的权限
        if (!checkPermission(options.url)) {
            console.error('没有权限访问:', options.url);
            window.history.back();
            return Promise.reject(new Error('没有权限执行此操作'));
        }

        // 添加token
        const token = localStorage.getItem('token');
        if (token) {
            options.headers = options.headers || {};
            options.headers['Authorization'] = token;
        }

        // 统一错误处理
        return originalAjax(options).catch(error => {
            if (error.status === 401) {
                // token过期，跳转到登录页
                window.location.href = '/pages/auth/login.html';
            } else if (error.status === 403) {
                alert('没有权限执行此操作');
            } else {
                console.error('请求失败:', error);
                alert('操作失败，请稍后重试');
            }
            throw error;
        });
    };

    $.ajaxSetup({
        complete: function(xhr) {
            // 检查是否有新token
            const newToken = xhr.getResponseHeader('Authorization');
            if (newToken) {
                localStorage.setItem('token', newToken);
            }
        }
    });
})();