/**
 * Navbar.js
 * 导航栏组件
 *
 * 功能特性:
 * 1. 响应式菜单展示
 * 2. 动态权限控制
 * 3. 菜单状态管理
 * 4. 主题样式适配
 * 5. 用户状态集成
 */
class Navbar extends BaseComponent {
    /**
     * 导航栏构造函数
     * @param {Object} options 配置选项
     * @param {String|jQuery} options.container 容器选择器或jQuery对象
     * @param {Object} options.currentUser 当前用户信息
     * @param {String} [options.activeMenu] 当前激活的菜单项
     */
    constructor(options) {
        super(options);

        if (!options.currentUser) {
            throw new Error('currentUser为必要参数');
        }

        // 组件配置
        this.config = {
            // 颜色变量
            colors: {
                primary: '237, 94%, 81%',
                background: '266, 16%, 92%',
                backgroundSecondary: '256, 12%, 12%',
                backgroundSecondaryDark: '256, 10%, 10%',
                backgroundSecondaryLight: '257, 11%, 16%',
                textPrimary: '0, 0%, 0%',
                white: '0, 0%, 100%',
                quiteGray: '0, 0%, 50%'
            },
            // 尺寸配置
            sizes: {
                expandedWidth: '16em',
                collapsedWidth: '5em',
                itemHeight: '3.5em'
            },
            // 动画配置
            animation: {
                duration: 350,
                easing: 'cubic-bezier(.175, .885, .32, 1)'
            }
        };

        // 组件状态
        this.state = {
            expanded: false,              // 是否展开
            activeMenu: null,             // 当前激活菜单
            currentUser: null,            // 当前用户信息
            userMenus: [],                // 用户菜单列表
            loading: false                // 加载状态
        };

        // DOM引用缓存
        this._domRefs = {};

        // 初始化事件绑定
        this._bindEvents();
    }

    /**
     * 绑定事件处理
     * @private
     */
    _bindEvents() {
        this.events = {
            'mouseenter @navbar': '_handleMouseEnter',
            'mouseleave @navbar': '_handleMouseLeave',
            'click @menuItem': '_handleMenuClick',
            'click @logoutBtn': '_handleLogout'
        };
    }

    /**
     * 组件初始化
     * @override
     */
    async init() {
        try {
            this.state.loading = true;
            // 加载用户信息
            await this._loadUserInfo();
            // 加载用户菜单
            await this._loadUserMenus();
            // 设置当前菜单
            this._setActiveMenu();
        } catch (error) {
            console.error('导航栏初始化失败:', error);
            this.showError('加载失败，请刷新重试');
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 加载用户菜单配置
     * @private
     */
    async _loadUserMenus() {
        const roleCode = this.state.currentUser.role.roleCode;

        // 角色菜单映射
        const menuGroups = {
            'ADMIN': [{
                id: 'dashboard',
                title: '控制台',
                icon: 'speedometer-outline',
                url: '/admin/dashboard.html',
                permissions: ['ADMIN_DASHBOARD']
            }, {
                id: 'tickets',
                title: '工单管理',
                icon: 'document-text-outline',
                url: '/admin/ticket-management.html',
                permissions: ['TICKET_MANAGE']
            }],
            'USER': [{
                id: 'tickets',
                title: '我的工单',
                icon: 'document-text-outline',
                url: '/user/ticket-list.html'
            }]
        };

        // 获取角色菜单
        const baseMenus = menuGroups[roleCode] || [];

        // 过滤权限菜单
        this.state.userMenus = baseMenus.filter(menu => {
            if (!menu.permissions) return true;
            return menu.permissions.some(permission =>
                this.state.currentUser.permissions.includes(permission)
            );
        });
    }

    /**
     * 设置当前激活菜单
     * @private
     */
    _setActiveMenu() {
        const path = window.location.pathname;
        const menu = this.state.userMenus.find(item =>
            item.url.includes(path.split('/').pop().split('.')[0])
        );
        this.state.activeMenu = menu ? menu.id : null;
    }

    /**
     * 渲染导航栏
     * @override
     */
    render() {
        if (this.state.loading) {
            return this._renderLoading();
        }

        const html = `
            <nav id="navbar" class="navbar${this.state.expanded ? ' expanded' : ''}"
                 style="width: ${this.state.expanded ? this.config.sizes.expandedWidth : this.config.sizes.collapsedWidth}">
                <ul class="navbar-items">
                    ${this._renderLogo()}
                    ${this._renderMenuItems()}
                    ${this._renderLogoutButton()}
                </ul>
            </nav>
        `;

        this.container.html(html);
        this._cacheDomRefs();
    }

    /**
     * 渲染Logo
     * @private
     */
    _renderLogo() {
        return `
            <li class="navbar-logo">
                <a class="navbar-item-inner">
                    <svg viewBox="0 0 24 24">
                        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                    </svg>
                </a>
            </li>
        `;
    }

    /**
     * 渲染菜单项
     * @private
     */
    _renderMenuItems() {
        return this.state.userMenus.map(menu => `
            <li class="navbar-item ${menu.id === this.state.activeMenu ? 'active' : ''}"
                data-menu-id="${menu.id}">
                <a class="navbar-item-inner" href="${menu.url}">
                    <div class="navbar-item-icon">
                        <i class="icon ${menu.icon}"></i>
                    </div>
                    <span class="navbar-item-text">${menu.title}</span>
                </a>
            </li>
        `).join('');
    }

    // ... 其他私有方法实现 ...

    /**
     * 处理鼠标进入
     * @private
     */
    _handleMouseEnter() {
        this.state.expanded = true;
        this._updateExpandState();
    }

    /**
     * 处理鼠标离开
     * @private
     */
    _handleMouseLeave() {
        this.state.expanded = false;
        this._updateExpandState();
    }

    /**
     * 更新展开状态
     * @private
     */
    _updateExpandState() {
        const { navbar } = this._domRefs;
        if (this.state.expanded) {
            navbar.addClass('expanded')
                .css('width', this.config.sizes.expandedWidth);
        } else {
            navbar.removeClass('expanded')
                .css('width', this.config.sizes.collapsedWidth);
        }
    }
}

// 添加到全局命名空间
window.Navbar = Navbar;