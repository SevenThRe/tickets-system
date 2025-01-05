/**
 * navbar.js
 * 导航栏组件配置和实现
 */
class Navbar extends BaseComponent {
    constructor(options) {
        super(options);

        // 状态管理
        this.state = {
            expanded: true,              // 是否展开
            activeMenu: null,             // 当前激活菜单
            currentUser: null,            // 当前用户信息
            userMenus: [],                // 用户菜单列表
            loading: false,               // 加载状态
            isMobile: window.innerWidth <= 768  // 是否移动端
        };

        window.addEventListener('resize', this._handleResize.bind(this));

        // 初始化事件绑定
        this._bindEvents();
        // 监听Logo更新事件
        window.eventBus.on('system:logoUpdated', () => {
            this.render();
        });
    }

    /**
     * 绑定事件
     * @private
     */
    _bindEvents() {
        // 切换导航栏展开状态
        document.addEventListener('click', (e) => {
            const navbar = document.getElementById('navbar');
            const toggleBtn = document.getElementById('navbarToggle');
            const isMobile = window.innerWidth <= 768;

            // 处理移动端导航栏切换
            if (toggleBtn && toggleBtn.contains(e.target)) {
                this.state.expanded = !this.state.expanded;
                this._updateNavbarState();
                return;
            }

            // 移动端点击外部区域收起导航栏
            if (isMobile && navbar && !navbar.contains(e.target)) {
                this.state.expanded = false;
                this._updateNavbarState();
            }
        });

        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                this.state.expanded = false;
                this._updateNavbarState();
            }
        });
    }

    /**
     * 更新导航栏状态
     * @private
     */
    _updateNavbarState() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.classList.toggle('expanded', this.state.expanded);
        }
    }



    /**
     * 处理窗口大小变化
     * @private
     */
    _handleResize() {
        const isMobile = window.innerWidth <= 768;
        if (this.state.isMobile !== isMobile) {
            this.state.isMobile = isMobile;
            this.state.expanded = false;
            this.render();
        }
    }

    /**
     * 加载用户菜单配置
     * @private
     */
    async _loadUserMenus() {
        const roleCode = this.state.currentUser.role.roleCode;

        // 公共菜单项 - 不需要权限验证
        const commonMenus = [{
            id: 'my-profile',
            title: '个人中心',
            icon: 'person-outline',
            url: '/common/profile.html'
        }, {
            id: 'my-tickets',
            title: '我的工单',
            icon: 'document-text-outline',
            url: '/common/my-tickets.html'
        }];

        // 角色特定菜单映射
        const menuGroups = {
            'ADMIN': [
                {
                    id: 'dashboard',
                    title: '控制台',
                    icon: 'speedometer-outline',
                    url: '/admin/dashboard.html',
                    permissions: ['ADMIN_DASHBOARD']
                },
                {
                    id: 'tickets',
                    title: '工单管理',
                    icon: 'ticket-outline',
                    url: '/admin/ticket-management.html',
                    permissions: ['TICKET_MANAGE']
                },
                {
                    id: 'users',
                    title: '用户管理',
                    icon: 'people-outline',
                    url: '/admin/user-management.html',
                    permissions: ['USER_MANAGE']
                },
                {
                    id: 'departments',
                    title: '部门管理',
                    icon: 'git-branch-outline',
                    url: '/admin/department-management.html',
                    permissions: ['DEPT_MANAGE']
                },
                {
                    id: 'system',
                    title: '系统设置',
                    icon: 'settings-outline',
                    url: '/admin/system-settings.html',
                    permissions: ['SYSTEM_MANAGE']
                }
            ],
            'DEPT': [
                {
                    id: 'dept-dashboard',
                    title: '部门统计',
                    icon: 'bar-chart-outline',
                    url: '/dept/dashboard.html',
                    permissions: ['DEPT_DASHBOARD']
                },
                {
                    id: 'dept-tickets',
                    title: '部门工单',
                    icon: 'documents-outline',
                    url: '/dept/ticket-management.html',
                    permissions: ['DEPT_TICKET_MANAGE']
                },
                {
                    id: 'dept-members',
                    title: '成员管理',
                    icon: 'people-circle-outline',
                    url: '/dept/member-management.html',
                    permissions: ['DEPT_MEMBER_MANAGE']
                }
            ],
            'USER': [
                {
                    id: 'user-dashboard',
                    title: '工作台',
                    icon: 'grid-outline',
                    url: '/user/dashboard.html'
                }
            ]
        };

        // 获取角色特定菜单
        const roleMenus = menuGroups[roleCode] || [];

        // 过滤需要权限验证的菜单项
        const filteredRoleMenus = roleMenus.filter(menu => {
            if (!menu.permissions) return true;
            return menu.permissions.some(permission =>
                this.state.currentUser.permissions.includes(permission)
            );
        });

        // 合并公共菜单和角色菜单
        this.state.userMenus = [...filteredRoleMenus, ...commonMenus];

        // 根据当前页面设置活动菜单
        this._setActiveMenu();
    }

    /**
     * 初始化
     */
    async init() {
        try {
            this.state.loading = true;
            // 加载用户信息
            await this._loadUserInfo();
            // 加载用户菜单
            await this._loadUserMenus();
            // 渲染导航栏
            await this.render();
        } catch (error) {
            console.error('导航栏初始化失败:', error);
            this.showError('加载失败，请刷新重试');
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 加载用户信息
     */
    async _loadUserInfo() {
        try {
            const userInfo = localStorage.getItem('userInfo');
            if (!userInfo) {
                throw new Error('未登录');
            }
            this.state.currentUser = JSON.parse(userInfo);
        } catch (error) {
            console.error('加载用户信息失败:', error);
            window.location.href = '/pages/auth/login.html';
        }
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

    /**
     * 设置当前激活菜单
     * @private
     */
    _setActiveMenu() {
        const path = window.location.pathname;
        const menu = this.state.userMenus.find(item =>
            path.includes(item.url.split('/').pop().split('.')[0])
        );
        this.state.activeMenu = menu ? menu.id : null;
    }

    /**
     * 渲染导航栏
     */
    render() {
        if (this.state.loading) {
            return this._renderLoading();
        }

        const html = `
            ${window.innerWidth <= 768 ? `
                <button id="navbarToggle" class="navbar-toggle">
                    <i class="bi bi-list"></i>
                </button>
            ` : ''}
            <nav id="navbar" class="${this.state.expanded ? 'expanded' : ''}">
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
     */
    _renderLogo() {
        // 从localStorage或系统配置获取Logo配置
        const systemConfig = this._getSystemConfig();
        const logoUrl = systemConfig?.logoUrl;

        return `
        <li class="navbar-logo">
            <a class="navbar-item-inner">
                ${logoUrl ? `
                    <img src="${logoUrl}" alt="系统Logo" class="navbar-logo-image">
                ` : `
                    <!-- 默认SVG Logo -->
                    <div class="navbar-logo-default">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                        </svg>
                    </div>
                `}
            </a>
        </li>
    `;
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

    /**
     * 渲染退出按钮
     */
    _renderLogoutButton() {
        return `
            <li class="navbar-item mt-auto">
                <a class="navbar-item-inner" href="#" id="logoutBtn">
                    <div class="navbar-item-icon">
                        <i class="icon log-out-outline"></i>
                    </div>
                    <span class="navbar-item-text">退出登录</span>
                </a>
            </li>
        `;
    }
}

// 导出组件
window.Navbar = Navbar;