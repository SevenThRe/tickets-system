/**
 * Created by SevenThRe
 * 导航栏组件 (Navbar.js)
 * 继承自BaseComponent,提供完整的导航菜单管理
 */
import BaseComponent from "@components/base/base-component";


class Navbar extends BaseComponent {
    constructor(options) {
        super({
            ...options,
            // 定义事件处理器
            events: {
                'mouseenter @navbar': 'handleMouseEnter',
                'mouseleave @navbar': 'handleMouseLeave',
                'click @menuItem': 'handleMenuClick',
                'click @logoutBtn': 'handleLogout'
            }
        });

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
            },
            // 菜单配置
            menus: {
                admin: [
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
                        icon: 'document-text-outline',
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
                        id: 'reports',
                        title: '统计报表',
                        icon: 'bar-chart-outline',
                        url: '/admin/reports.html',
                        permissions: ['REPORT_VIEW']
                    },
                    {
                        id: 'settings',
                        title: '系统设置',
                        icon: 'settings-outline',
                        url: '/admin/settings.html',
                        permissions: ['SYSTEM_SETTINGS']
                    },
                    {
                        id: 'profile',
                        title: '个人设置',
                        icon: 'person-outline',
                        url: '/user/profile.html'
                    }
                ],
                dept_manager: [
                    {
                        id: 'dashboard',
                        title: '部门工作台',
                        icon: 'speedometer-outline',
                        url: '/dept/dashboard.html'
                    },
                    {
                        id: 'dept-tickets',
                        title: '部门工单',
                        icon: 'document-text-outline',
                        url: '/dept/ticket-management.html'
                    },
                    {
                        id: 'dept-members',
                        title: '部门成员',
                        icon: 'people-outline',
                        url: '/dept/members.html'
                    },
                    {
                        id: 'dept-statistics',
                        title: '部门统计',
                        icon: 'bar-chart-outline',
                        url: '/dept/statistics.html'
                    },
                    {
                        id: 'my-tickets',
                        title: '我的工单',
                        icon: 'briefcase-outline',
                        url: '/user/ticket-list.html'
                    }
                ],
                user: [
                    {
                        id: 'tickets',
                        title: '我的工单',
                        icon: 'document-text-outline',
                        url: '/user/ticket-list.html',
                        permissions: ['ticket:list'],  // 添加查看权限要求
                        operations: [  // 添加操作权限配置-给TicketList组件使用
                            {
                                id: 'create-ticket',
                                title: '创建工单',
                                permission: 'ticket:create',
                                show: true  // 是否显示按钮
                            },
                            {
                                id: 'update-ticket',
                                title: '修改工单',
                                permission: 'ticket:update',
                                show: true
                            }
                        ]
                    }
                ],
                user_common: [
                    {
                        id: 'tickets',
                        title: '我的工单',
                        icon: 'document-text-outline',
                        url: '/user/ticket-list.html'
                    },
                    {
                        id: 'profile',
                        title: '个人设置',
                        icon: 'person-outline',
                        url: '/user/profile.html'
                    }
                ]
            },
            roleMenuMapping: {
                ADMIN: ['admin'],
                DEPT_MANAGER: ['dept_manager', 'user_common'],
                USER: ['user', 'user_common']
            }
        };

        // 组件状态
        this.state = {
            expanded: false,
            activeMenu: null,
            currentUser: null,
            userMenus: [],
            loading: false
        };


        // 初始化DOM引用缓存
        this._domRefs = {};
    }



    /**
     * 组件初始化前的准备工作
     */
    async beforeInit() {
        try {
            this.state.loading = true;
            // 获取当前用户信息
            await this._loadUserInfo();
            // 加载用户菜单
            await this._loadUserMenus();
            // 设置当前激活菜单
            this._setActiveMenu();
        } catch (error) {
            console.error('Navbar initialization failed:', error);
            throw error;
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 加载用户信息
     */
    async _loadUserInfo() {
        const userStore = window.stores.userStore;
        this.state.currentUser = await userStore.getCurrentUser();
        if (!this.state.currentUser) {
            throw new Error('Failed to load user info');
        }
    }

    /**
     * 加载用户菜单
     */
        // 在config中添加角色菜单映射配置


    async _loadUserMenus() {
        const roleCode = this.state.currentUser.role.roleCode;

        // 获取角色对应的菜单组
        const menuGroups = this.config.roleMenuMapping[roleCode] || ['user'];

        // 合并所有菜单组的菜单
        const baseMenus = menuGroups.reduce((allMenus, groupName) => {
            const groupMenus = this.config.menus[groupName] || [];
            return [...allMenus, ...groupMenus];
        }, []);

        // 过滤无权限的菜单
        this.state.userMenus = baseMenus.filter(menu => {
            if (!menu.permissions) return true;
            return menu.permissions.some(permission =>
                this.state.currentUser.permissions.includes(permission)
            );
        });
    }
    /**
     * 设置当前激活的菜单
     */
    _setActiveMenu() {
        const path = window.location.pathname;
        const menu = this.state.userMenus.find(item =>
            item.url.includes(path.split('/').pop().split('.')[0])
        );
        this.state.activeMenu = menu ? menu.id : null;
    }

    /**
     * 渲染组件
     */
    render() {
        if (this.state.loading) {
            return this._renderLoading();
        }

        const html = `
            <nav id="navbar" class="navbar${this.state.expanded ? ' expanded' : ''}" 
                 style="width: ${this.state.expanded ? this.config.sizes.expandedWidth : this.config.sizes.collapsedWidth}">
                <ul class="navbar-items flexbox-col">
                    ${this._renderLogo()}
                    ${this._renderMenuItems()}
                    ${this._renderLogoutButton()}
                </ul>
            </nav>
        `;

        this.container.html(html);
        this._cacheDomRefs();
        this._initStyles();
    }

    /**
     * 缓存重要的DOM引用
     */
    _cacheDomRefs() {
        this._domRefs = {
            navbar: this.container.find('#navbar'),
            menuItems: this.container.find('.navbar-item'),
            logoutBtn: this.container.find('#logoutBtn')
        };
    }

    /**
     * 初始化样式
     */
    _initStyles() {
        const styleId = 'navbar-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = this._getStyles();
            document.head.appendChild(style);
        }
    }

    /**
     * 获取组件样式
     */
    _getStyles() {
        return `
            .navbar {
                top: 0;
                padding: 0;
                height: 100vh;
                position: fixed;
                background-color: hsl(${this.config.colors.backgroundSecondary});
                transition: width ${this.config.animation.duration}ms ${this.config.animation.easing};
                overflow-y: auto;
                overflow-x: hidden;
                z-index: 1000;
            }

            .navbar-items {
                margin: 0;
                padding: 0;
                list-style-type: none;
            }

            .navbar-item {
                padding: 0 .5em;
                width: 100%;
                cursor: pointer;
            }

            .navbar-item-inner {
                padding: 1em 0;
                width: 100%;
                position: relative;
                color: hsl(${this.config.colors.quiteGray});
                border-radius: .25em;
                text-decoration: none;
                transition: all .2s ${this.config.animation.easing};
            }

            .navbar-item-inner:hover {
                color: hsl(${this.config.colors.white});
                background: hsl(${this.config.colors.backgroundSecondaryLight});
                box-shadow: 0 17px 30px -10px hsla(0, 0%, 0%, .25);
            }

            .link-text {
                margin: 0;
                width: 0;
                text-overflow: ellipsis;
                white-space: nowrap;
                transition: all ${this.config.animation.duration}ms ${this.config.animation.easing};
                overflow: hidden;
                opacity: 0;
            }

            .navbar.expanded .link-text {
                width: calc(100% - ${this.config.sizes.collapsedWidth});
                opacity: 1;
            }
        `;
    }

    /**
     * 渲染Logo
     */
    _renderLogo() {
        return `
            <li class="navbar-logo flexbox-left">
                <a class="navbar-item-inner flexbox">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1438.88 1819.54">
                        <polygon points="925.79 318.48 830.56 0 183.51 1384.12 510.41 1178.46 925.79 318.48"/>
                        <polygon points="1438.88 1663.28 1126.35 948.08 111.98 1586.26 0 1819.54 1020.91 1250.57 1123.78 1471.02 783.64 1663.28 1438.88 1663.28"/>
                    </svg>
                </a>
            </li>
        `;
    }

    /**
     * 渲染菜单项
     */
    _renderMenuItems() {
        return this.state.userMenus.map(menu => `
            <li class="navbar-item ${menu.id === this.state.activeMenu ? 'active' : ''}"
                data-menu-id="${menu.id}">
                <a class="navbar-item-inner flexbox-left" href="${menu.url}">
                    <div class="navbar-item-inner-icon-wrapper">
                        <ion-icon name="${menu.icon}"></ion-icon>
                    </div>
                    <span class="link-text">${menu.title}</span>
                </a>
            </li>
        `).join('');
    }

    /**
     * 渲染退出按钮
     */
    _renderLogoutButton() {
        return `
            <li class="navbar-item mt-auto">
                <a class="navbar-item-inner flexbox-left" href="javascript:void(0)" id="logoutBtn">
                    <div class="navbar-item-inner-icon-wrapper">
                        <ion-icon name="log-out-outline"></ion-icon>
                    </div>
                    <span class="link-text">退出登录</span>
                </a>
            </li>
        `;
    }

    /**
     * 渲染加载状态
     */
    _renderLoading() {
        return '<div class="navbar-loading">Loading...</div>';
    }

    /**
     * 处理鼠标进入
     */
    handleMouseEnter() {
        this.state.expanded = true;
        this._domRefs.navbar.addClass('expanded');
        this._domRefs.navbar.css('width', this.config.sizes.expandedWidth);
    }

    /**
     * 处理鼠标离开
     */
    handleMouseLeave() {
        this.state.expanded = false;
        this._domRefs.navbar.removeClass('expanded');
        this._domRefs.navbar.css('width', this.config.sizes.collapsedWidth);
    }


    /**
     * 处理菜单点击
     */
    handleMenuClick(e) {
        const menuId = $(e.currentTarget).data('menu-id');
        if (menuId && menuId !== this.state.activeMenu) {
            this.state.activeMenu = menuId;
            this._domRefs.menuItems.removeClass('active');
            $(e.currentTarget).addClass('active');

            // 触发菜单变更事件
            eventBus.emit('menuChange', {
                menuId,
                menu: this.state.userMenus.find(m => m.id === menuId)
            });
        }
    }

    /**
     * 处理退出登录
     */
    async handleLogout(e) {
        e.preventDefault();

        try {
            const userStore = window.stores.userStore;
            await userStore.logout();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout failed:', error);
            // 显示错误提示
            this.showError('退出登录失败，请重试');
        }
    }

    /**
     * 更新用户信息
     */
    async updateUserInfo(user) {
        this.state.currentUser = user;
        await this._loadUserMenus();
        this._setActiveMenu();
        this.render();
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 移除样式
        $('#navbar-styles').remove();
        // 调用父类销毁方法
        super.destroy();
    }
}

// 导出组件
export default Navbar;