# 工单管理系统

这是一个基于Spring Boot 3、Spring MVC、MyBatis的工单管理系统。系统包括管理员、部门主管和普通用户三种角色,分别对应三个不同的端。

## 技术栈

- 后端:
  - Spring Boot 3
  - Spring MVC
  - MyBatis
- 前端:  
  - jQuery
  - Bootstrap
  - ES6
  - HTML5
  - CSS
- 其他:
  - Maven 3
  - JDK 17

## 主要功能

### 管理员端

- 用户管理:创建、修改、删除用户,分配用户角色
- 部门管理:创建、修改、删除部门,调整部门人员  
- 工单管理:创建、修改、删除、查询工单,分配工单处理人
- 角色权限管理:创建、修改、删除角色,配置角色权限
- 系统监控:查看系统运行状态,日志管理

### 部门主管端

- 本部门工单管理:查看本部门工单,分配工单给部门成员处理
- 部门成员管理:查看部门成员工作量和绩效
- 工单统计:按状态、类型等维度统计工单数量、处理效率等

### 普通用户端

- 我的工单:查看分配给自己的工单,更新工单进度,反馈问题  
- 我的待办:查看分配给自己的尚未完成的工单
- 提交工单:发起新的工单请求
- 个人中心:修改个人信息,查看个人工单统计

## 验证与授权

系统采用JWT (JSON Web Token)进行用户认证与授权。用户登录成功后,后端签发JWT,前端保存JWT并在后续请求中携带JWT。后端验证JWT以判断用户身份。

不同角色拥有不同的操作权限。后端基于JWT中存储的用户角色信息,对用户的请求进行权限控制。  

## 项目结构

### 前端目录
```
project-root/
│
├── static/
│   ├── config/
│   │   ├── constants.js
│   │   └── theme-const.js
│   ├── css/
│   │   ├── navbar.css
│   │   └── (other CSS files)
│   ├── images/
│   │   └── default-avatar.png
│   └── js/
│       ├── components/
│       │   ├── base/
│       │   │   ├── base-component.js
│       │   │   └── data-table.js
│       │   ├── layout/
│       │   │   ├── navbar.js
│       │   │   ├── theme-customizer.js
│       │   │   ├── theme-manager.js
│       │   │   └── theme-selector.js
│       │   └── (other components)
│       ├── constants/
│       │   └── theme-constants.js
│       ├── stores/
│       │   ├── theme-store.js
│       │   └── user-store.js
│       └── utils/
│           ├── event-bus.js
│           ├── pagination-util.js
│           ├── permission-control.js
│           ├── request-util.js
│           ├── theme-preference.js
│           ├── theme-utils.js
│           ├── ticket-modal.js
│           ├── utils.js
│           └── validator-util.js
│
├── pages/
│   ├── admin/
│   │   ├── css/
│   │   │   ├── admin-dashboard.css
│   │   │   ├── department-management.css
│   │   │   ├── system-settings.css
│   │   │   ├── ticket-management.css
│   │   │   └── user-management.css
│   │   ├── js/
│   │   │   ├── dashboard.js
│   │   │   ├── department-management.js
│   │   │   ├── system-setting.js
│   │   │   ├── ticket-management.js
│   │   │   └── user-management.js
│   │   ├── dashboard.html
│   │   ├── department-management.html
│   │   ├── system-settings.html
│   │   ├── ticket-management.html
│   │   └── user-management.html
│   ├── auth/
│   │   ├── css/
│   │   │   └── login.css
│   │   ├── js/
│   │   │   └── login.js
│   │   └── login.html
│   └── common/
│   │   ├── css/
│   │   │   ├── my-tickets.css
│   │   │   └── profile.css
│   │   ├── js/
│   │   │   ├── my-tickets.js
│   │   │   └── profile.js
│   │   ├── my-tickets.html
│   │   └── profile.html
│   └── user/
│       ├── css/
│       │   └── dashboard.css
│       ├── js/
│       │   └── dashboard.js
│       └── dashboard.html      // 用户工作台
│
├── application.properties      // 主配置文件
├── application-dev.properties  // 开发环境
├── application-prd.properties  // 生产环境
└── index.html                  // 没什么用的白页 或许会被移出
└── option.yml                  // 项目配置文件
```

## 本地运行

1. 创建MySQL数据库,执行`ticket.sql`初始化表结构。

2. 在`ticket/src/main/resources/application.properties`中配置数据库连接信息。

3. 进入ticket目录,运行以下命令启动后端:

   ```bash
   mvn spring-boot:run
   ```

4. 使用浏览器打开前端页面:
   http://localhost:{port}/index

## 部署上线

//待完善

## 贡献者

- [SevenThRe](https://github.com/SevenThRe)
- 

## 版权声明
  
本项目仅供学习参考，不用于任何商业用途。
项目并不完善，斟酌使用。
