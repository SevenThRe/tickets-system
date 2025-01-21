# 工单管理系统

一个基于 Spring Boot 3、Spring MVC、MyBatis 的工单管理系统，支持多角色（管理员、部门主管、普通用户）操作，适用于企业内部的工单管理需求。

## 目录

- [功能概述](https://github.com/SevenThRe/tickets-system#功能概述)
- [技术栈](https://github.com/SevenThRe/tickets-system#技术栈)
- [项目结构](https://github.com/SevenThRe/tickets-system#项目结构)
- [本地运行](https://github.com/SevenThRe/tickets-system#本地运行)
- [部署上线](https://github.com/SevenThRe/tickets-system#部署上线)
- [贡献指南](https://github.com/SevenThRe/tickets-system#贡献指南)
- [版权声明](https://github.com/SevenThRe/tickets-system#版权声明)

## 功能概述

### 管理员端

- **用户管理**：创建、修改、删除用户，分配用户角色。
- **部门管理**：创建、修改、删除部门，调整部门人员。
- **工单管理**：创建、修改、删除、查询工单，分配工单处理人。
- **角色权限管理**：创建、修改、删除角色，配置角色权限。
- **系统监控**：查看系统运行状态，日志管理。

### 部门主管端

- **本部门工单管理**：查看本部门工单，分配工单给部门成员处理。
- **部门成员管理**：查看部门成员工作量和绩效。
- **工单统计**：按状态、类型等维度统计工单数量、处理效率等。

### 普通用户端

- **我的工单**：查看分配给自己的工单，更新工单进度，反馈问题。
- **我的待办**：查看分配给自己的尚未完成的工单。
- **提交工单**：发起新的工单请求。
- **个人中心**：修改个人信息，查看个人工单统计。

## 技术栈

### 后端

- **Spring Boot 3**：用于快速开发和部署。
- **Spring MVC**：用于处理 HTTP 请求和响应。
- **MyBatis**：用于数据库操作。
- **JWT (JSON Web Token)**：用于用户认证和授权。
- **MySQL**：数据库存储。
- **Maven 3**：项目构建和依赖管理。
- **JDK 17**：运行环境。

### 前端

- **HTML5/CSS3**：页面结构和样式。
- **JavaScript (ES6)**：页面逻辑。
- **jQuery**：简化 DOM 操作和事件处理。
- **Bootstrap 5**：响应式布局和组件样式。

## 项目结构

### 前端目录结构


```plaintext
project-root/
├── static/                # 静态资源目录
│   ├── css/               # CSS 样式文件
│   ├── images/            # 图片资源
│   └── js/                # JavaScript 文件
│       ├── components/    # 前端组件
│       ├── constants/     # 常量定义
│       ├── stores/        # 状态管理
│       └── utils/         # 工具函数
├── pages/                 # 页面文件
│   ├── admin/             # 管理员端页面
│   ├── auth/              # 认证页面（登录等）
│   ├── common/            # 公共页面
│   └── user/              # 普通用户端页面
├── application.properties # 主配置文件
├── application-dev.properties # 开发环境配置
├── application-prd.properties # 生产环境配置
└── index.html             # 入口页面
```

### 后端目录结构


```plaintext
src/
├── main/
│   ├── java/
│   │   └── com.example.ticketsystem/ # Java 代码目录
│   │       ├── controller/           # 控制器层
│   │       ├── service/              # 业务逻辑层
│   │       ├── repository/           # 数据访问层
│   │       └── model/                # 数据模型
│   ├── resources/
│   │   ├── application.properties    # 主配置文件
│   │   ├── application-dev.properties# 开发环境配置
│   │   └── application-prd.properties# 生产环境配置
│   └── webapp/
│       └── WEB-INF/                  # 静态资源和页面
└── test/                           # 测试代码
```

## 本地运行

### 环境准备

1. 安装 **JDK 17**。
2. 安装 **Maven 3**。
3. 安装 **MySQL** 并创建数据库。
4. 安装 **Node.js** 和 **npm**（如果需要构建前端资源）。
5. 修改 `src/main/resources/application.properties` 文件，配置数据库连接信息。
6. 修改 `config/options.properties` 文件，配置上传信息。

### 运行步骤

1. 克隆项目：

   bash复制

   ```bash
   git clone https://github.com/SevenThRe/tickets-system.git
   ```

2. 初始化数据库：

  - 在项目根目录找到 `ticket.sql` 文件。
  - 执行 SQL 脚本初始化数据库表结构。

3. 配置数据库连接：

  - 修改 `src/main/resources/application.properties` 文件，配置数据库连接信息。

4. 启动后端服务：

   bash复制

   ```bash
   cd tickets-system
   mvn clean install
   mvn spring-boot:run
   ```

5. 访问前端页面：

  - 打开浏览器，访问 `http://localhost:8089`。

## 部署上线

### 生产环境部署

1. **打包项目**：

   bash复制

   ```bash
   mvn clean package -Pprd
   ```

2. **部署到服务器**：

  - 将生成的 `target/tickets-system.jar` 文件上传到服务器。

  - 使用以下命令启动应用：

    bash复制

    ```bash
    java -jar tickets-system.jar
    ```

3. **配置反向代理**（可选）：

  - 使用 Nginx 或其他反向代理工具配置域名访问。

### 注意事项

- 确保服务器已安装 **JDK 17**。
- 配置生产环境的数据库连接信息（`application-prd.properties`）。
- 根据需要配置 SSL 证书以启用 HTTPS。

## 贡献指南

欢迎任何开发者参与项目贡献！以下是贡献指南：

1. **Fork** 项目到您的 GitHub 账号。

2. 创建一个新的分支进行开发：

   bash复制

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. 提交您的代码并推送分支：

   bash复制

   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

4. 提交 Pull Request 到主仓库。



