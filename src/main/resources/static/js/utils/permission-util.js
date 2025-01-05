/**
 * PermissionUtil.js
 * 权限工具类 - 提供统一的权限验证、判断和处理机制
 * 采用单例模式，确保全局使用同一个权限控制实例
 */
class PermissionUtil {
    constructor() {
        // 防止重复创建实例
        if (PermissionUtil.instance) {
            return PermissionUtil.instance;
        }
        PermissionUtil.instance = this;

        /**
         * 当前用户的权限集合
         * @type {Set<string>}
         * @private
         */
        this._permissions = new Set();

        /**
         * 当前用户的基础角色
         * @type {string}
         * @private
         */
        this._baseRole = null;

        // 初始化权限数据
        this._initPermissions();
    }

    /**
     * 初始化用户权限数据
     * @private
     */
    _initPermissions() {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        this._baseRole = userInfo.baseRole || '';
        this._permissions = new Set(userInfo.permissions || []);
    }

    /**
     * 检查是否拥有指定权限
     * @param {string|Array<string>} permissions - 权限标识或权限标识数组
     * @param {boolean} [requireAll=false] - 是否要求具有所有权限
     * @returns {boolean} 是否拥有权限
     */
    hasPermission(permissions, requireAll = false) {
        // 系统管理员默认拥有所有权限
        if (this._baseRole === Const.BUSINESS.BASE_ROLE.ADMIN) {
            return true;
        }

        // 转换为数组统一处理
        const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

        // 根据requireAll参数决定验证逻辑
        return requireAll
            ? permissionArray.every(perm => this._permissions.has(perm))
            : permissionArray.some(perm => this._permissions.has(perm));
    }

    /**
     * 检查是否为指定基础角色
     * @param {string|Array<string>} roles - 角色标识或角色标识数组
     * @returns {boolean} 是否匹配角色
     */
    hasRole(roles) {
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(this._baseRole);
    }

    /**
     * 基于权限控制DOM元素的显示
     * @param {string|Array<string>} permissions - 所需权限
     * @param {jQuery} $element - jQuery元素
     * @param {boolean} [requireAll=false] - 是否需要具备所有权限
     */
    handlePermissionElement(permissions, $element, requireAll = false) {
        if (!this.hasPermission(permissions, requireAll)) {
            $element.remove();
        }
    }

    /**
     * 获取当前用户可访问的菜单项
     * @param {Array} menus - 原始菜单配置
     * @returns {Array} 过滤后的菜单配置
     */
    filterMenus(menus) {
        return menus.filter(menu => {
            if (menu.permission && !this.hasPermission(menu.permission)) {
                return false;
            }
            if (menu.children?.length > 0) {
                menu.children = this.filterMenus(menu.children);
                return menu.children.length > 0;
            }
            return true;
        });
    }

    /**
     * 更新权限数据
     * @param {Array<string>} permissions - 新的权限列表
     * @param {string} baseRole - 新的基础角色
     */
    updatePermissions(permissions, baseRole) {
        this._permissions = new Set(permissions);
        this._baseRole = baseRole;

        // 触发权限更新事件
        window.eventBus.emit('permissionsUpdate', {
            permissions: Array.from(this._permissions),
            baseRole: this._baseRole
        });
    }

    /**
     * 清除权限数据
     */
    clearPermissions() {
        this._permissions.clear();
        this._baseRole = null;
    }
}

// 创建全局单例实例
window.permissionUtil = new PermissionUtil();

/**
 * 使用示例：
 *
 * 1. 检查单个权限
 * if (permissionUtil.hasPermission('USER_CREATE')) {
 *     // 执行创建用户操作
 * }
 *
 * 2. 检查多个权限(任一)
 * if (permissionUtil.hasPermission(['USER_UPDATE', 'USER_DELETE'])) {
 *     // 显示操作按钮
 * }
 *
 * 3. 检查多个权限(所有)
 * if (permissionUtil.hasPermission(['TICKET_VIEW', 'TICKET_PROCESS'], true)) {
 *     // 显示处理按钮
 * }
 *
 * 4. 控制DOM元素显示
 * permissionUtil.handlePermissionElement('USER_MANAGE', $('#userManageBtn'));
 *
 * 5. 基于角色的判断
 * if (permissionUtil.hasRole('DEPT')) {
 *     // 显示部门管理相关功能
 * }
 */