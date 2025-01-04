/**
 * 权限控制组件
 * 提供基于角色和权限的访问控制功能
 */
class PermissionControl {
    constructor() {
        // 用户权限数据
        this.permissions = new Set();
        // 角色数据
        this.roles = new Set();
        // 权限与页面映射关系配置
        this.pagePermissions = new Map();
        // 初始化状态
        this.initialized = false;
    }

    /**
     * 初始化权限数据
     * @param {Object} userData 用户数据,包含权限和角色信息
     */
    init(userData) {
        if (!userData) return;
        
        // 初始化权限集合
        if (userData.permissions) {
            this.permissions = new Set(userData.permissions);
        }
        
        // 初始化角色集合
        if (userData.roles) {
            this.roles = new Set(userData.roles.map(role => role.roleCode));
        }

        this.initialized = true;
        
        // 执行初始页面权限检查
        this._checkCurrentPagePermission();
    }

    /**
     * 检查当前页面权限
     * @private
     */
    _checkCurrentPagePermission() {
        const currentPath = window.location.pathname;
        const requiredPermissions = this.pagePermissions.get(currentPath);
        
        if (requiredPermissions && !this.hasPermissions(requiredPermissions)) {
            // 无权限访问,跳转到403页面
            window.location.href = '/403.html';
        }
    }

    /**
     * 添加页面权限配置
     * @param {String} path 页面路径
     * @param {String|Array} permissions 需要的权限
     */
    addPagePermission(path, permissions) {
        if (typeof permissions === 'string') {
            permissions = [permissions];
        }
        this.pagePermissions.set(path, permissions);
    }

    /**
     * 检查是否拥有指定权限
     * @param {String|Array} permissions 权限标识
     * @returns {Boolean} 是否拥有权限
     */
    hasPermissions(permissions) {
        if (!this.initialized) {
            console.warn('权限组件未初始化');
            return false;
        }

        if (typeof permissions === 'string') {
            permissions = [permissions];
        }

        return permissions.every(permission => 
            this.permissions.has(permission)
        );
    }

    /**
     * 检查是否拥有指定角色
     * @param {String|Array} roles 角色标识
     * @returns {Boolean} 是否拥有角色
     */
    hasRoles(roles) {
        if (!this.initialized) {
            console.warn('权限组件未初始化');
            return false;
        }

        if (typeof roles === 'string') {
            roles = [roles];
        }

        return roles.some(role => 
            this.roles.has(role)
        );
    }

    /**
     * 渲染基于权限的DOM元素
     * @param {String} permission 所需权限
     * @param {Function} render 渲染函数
     * @returns {String} 渲染结果
     */
    renderWithPermission(permission, render) {
        if (this.hasPermissions(permission)) {
            return render();
        }
        return '';
    }

    /**
     * 权限指令处理
     * 用于处理DOM中的权限属性
     */
    initDirectives() {
        // 处理 data-permission 属性
        $('[data-permission]').each((index, element) => {
            const $el = $(element);
            const permission = $el.data('permission');
            
            if (!this.hasPermissions(permission)) {
                $el.remove();
            }
        });

        // 处理 data-role 属性
        $('[data-role]').each((index, element) => {
            const $el = $(element);
            const role = $el.data('role');
            
            if (!this.hasRoles(role)) {
                $el.remove();
            }
        });
    }
}

// 导出单例
export const permissionControl = new PermissionControl();
export default PermissionControl;