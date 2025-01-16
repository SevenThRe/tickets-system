/**
 * Navbar 类 - 导航栏组件实现
 */
class Navbar {
    constructor(element) {
        // DOM 元素引用
        this.container = $(element);

        // 状态管理
        this.state = {
            expanded: true,
            activeMenu: null,
            currentUser: null,
            userMenus: [],
            loading: false,
            isMobile: window.innerWidth <= 768
        };

        // 绑定方法到实例
        this._handleResize = this._handleResize.bind(this);
        this._handleLogout = this._handleLogout.bind(this);

        // 初始化
        this.init();
    }

    /**
     * 初始化导航栏
     */
    async init() {
        try {
            this.state.loading = true;
            // 加载用户信息
            await this._loadUserInfo();
            // 加载用户菜单
            await this._loadUserMenus();
            // 绑定事件监听
            this._bindEvents();
            // 渲染导航栏
            this.render();
        } catch (error) {
            console.error('导航栏初始化失败:', error);
            this._showError('加载失败，请刷新重试');
        } finally {
            this.state.loading = false;
        }
    }

    /**
     * 加载用户信息
     */
    async _loadUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            window.location.href = '/pages/auth/login.html';
            return;
        }
        this.state.currentUser = JSON.parse(userInfo);
    }

    /**
     * 加载用户菜单
     */
    async _loadUserMenus() {
        const roleCode = this.state.currentUser.baseRoleCode;

        // 角色菜单映射
        const menuGroups = {
            'ADMIN': [
                {
                    id: 'dashboard',
                    title: '控制台',
                    icon: 'bi bi-speedometer2',
                    url: '/pages/admin/dashboard.html'
                },
                {
                    id: 'tickets',
                    title: '工单管理',
                    icon: 'bi bi-ticket-detailed',
                    url: '/pages/admin/ticket-management.html'
                },
                {
                    id: 'users',
                    title: '用户管理',
                    icon: 'bi bi-people',
                    url: '/pages/admin/user-management.html'
                },
                {
                    id: 'departments',
                    title: '部门管理',
                    icon: 'bi bi-diagram-3',
                    url: '/pages/admin/department-management.html'
                },
                {
                    id: 'roles',
                    title: '角色管理',
                    icon: 'bi bi-person-badge',
                    url: '/pages/admin/role-management.html'
                },
                {
                    id: 'system',
                    title: '系统设置',
                    icon: 'bi bi-gear',
                    url: '/pages/admin/system-settings.html'
                }
            ],
            'DEPT': [
                {
                    id: 'dept-members',
                    title: '部门成员',
                    icon: 'bi bi-people',
                    url: '/pages/dept/dept-members.html'
                }
            ],
            'USER': [
                {
                    id: 'dashboard',
                    title: '工作台',
                    icon: 'bi bi-grid',
                    url: '/pages/user/dashboard.html'
                },
                {
                    id: 'todos',
                    title: '待办工单',
                    icon: 'bi bi-check2-square',
                    url: '/pages/user/todos.html'
                }
            ]
        };

        // 公共菜单项
        const commonMenus = [{
            id: 'my-tickets',
            title: '我的工单',
            icon: 'bi bi-folder',
            url: '/pages/common/my-tickets.html'
        }, {
            id: 'profile',
            title: '个人中心',
            icon: 'bi bi-person',
            url: '/pages/common/profile.html'
        }];

        // 获取当前角色的菜单
        const roleMenus = menuGroups[roleCode] || [];

        // 合并菜单
        this.state.userMenus = [...roleMenus, ...commonMenus];

        // 设置当前激活的菜单
        this._setActiveMenu();
    }

    /**
     * 绑定事件
     */
    _bindEvents() {
        // 窗口大小变化监听
        $(window).on('resize', this._handleResize);

        // 登出按钮点击
        this.container.on('click', '#logoutBtn', this._handleLogout);

        // 移动端菜单切换
        this.container.on('click', '#navbarToggle', () => {
            this.state.expanded = !this.state.expanded;
            this._updateNavbarState();
        });
    }

    /**
     * 处理窗口大小变化
     */
    _handleResize() {
        const isMobile = window.innerWidth <= 768;
        if (this.state.isMobile !== isMobile) {
            this.state.isMobile = isMobile;
            this.state.expanded = !isMobile;
            this.render();
        }
    }

    /**
     * 处理登出
     */
    _handleLogout(e) {
        e.preventDefault();
        // 清除认证信息
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        // 跳转到登录页
        window.location.href = '/pages/auth/login.html';
    }

    /**
     * 设置当前激活的菜单
     */
    _setActiveMenu() {
        const currentPath = window.location.pathname;
        const menu = this.state.userMenus.find(item =>
            currentPath.includes(item.url.split('.')[0])
        );
        this.state.activeMenu = menu ? menu.id : null;
    }

    /**
     * 更新导航栏状态
     */
    _updateNavbarState() {
        this.container
            .find('.navbar-items')
            .toggleClass('expanded', this.state.expanded);
        this.container.toggleClass('navbar-expanded', this.state.expanded);
    }

    /**
     * 渲染导航栏
     */
    render() {
        const html = `
            ${this.state.isMobile ? `
                <button id="navbarToggle" class="navbar-toggle">
                    <i class="bi bi-list"></i>
                </button>
            ` : ''}
            <ul class="navbar-items ${this.state.expanded ? 'expanded' : ''}">
                ${this._renderLogo()}
                ${this._renderMenuItems()}
                ${this._renderLogoutButton()}
            </ul>
        `;

        this.container.html(html);
    }

    /**
     * 渲染Logo
     */
    _renderLogo() {
        return `
            <li class="navbar-logo">
                <a class="navbar-item-inner">
                    <i class="bi bi-kanban navbar-logo-icon"></i>
                    <span class="navbar-logo-text">工单系统</span>
                </a>
            </li>
        `;
    }

    /**
     * 渲染菜单项
     */
    _renderMenuItems() {
        return this.state.userMenus.map(menu => `
            <li class="navbar-item ${menu.id === this.state.activeMenu ? 'active' : ''}">
                <a class="navbar-item-inner" href="${menu.url}">
                    <i class="${menu.icon} navbar-item-icon"></i>
                    <span class="navbar-item-text">${menu.title}</span>
                </a>
            </li>
        `).join('');
    }

    /**
     * 渲染登出按钮
     */
    _renderLogoutButton() {
        return `
            <li class="navbar-item mt-auto">
                <a class="navbar-item-inner" href="#" id="logoutBtn">
                    <i class="bi bi-box-arrow-right navbar-item-icon"></i>
                    <span class="navbar-item-text">退出登录</span>
                </a>
            </li>
        `;
    }

    /**
     * 显示错误提示
     */
    _showError(message) {
        NotifyUtil.error(message);
    }
}
$.ajaxSetup({
    beforeSend: function(xhr) {
        const token = localStorage.getItem('token');
        if (token) {
            xhr.setRequestHeader('Authorization', `${token}`);
        }
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        if (userInfo.userId) {
            xhr.setRequestHeader('X-User-Id', userInfo.userId);
        }
    }
});
// 自动初始化导航栏
$(document).ready(function() {
    $('.navbar-container').each(function() {
        new Navbar(this);
    });
});