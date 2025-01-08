-- 权限表测试数据
INSERT INTO t_permission (permission_id, permission_name, permission_code, icon, sort, is_deleted) VALUES
-- 用户管理权限
(1, '用户管理', 'USER_MANAGE', 'bi-people', 1, 0),
(2, '查看用户', 'USER_VIEW', 'bi-eye', 2, 0),
(3, '创建用户', 'USER_CREATE', 'bi-person-plus', 3, 0),
(4, '编辑用户', 'USER_UPDATE', 'bi-pencil', 4, 0),
(5, '删除用户', 'USER_DELETE', 'bi-trash', 5, 0),

-- 部门管理权限
(11, '部门管理', 'DEPT_MANAGE', 'bi-diagram-3', 11, 0),
(12, '查看部门', 'DEPT_VIEW', 'bi-eye', 12, 0),
(13, '创建部门', 'DEPT_CREATE', 'bi-plus-circle', 13, 0),
(14, '编辑部门', 'DEPT_UPDATE', 'bi-pencil', 14, 0),
(15, '删除部门', 'DEPT_DELETE', 'bi-trash', 15, 0),

-- 工单管理权限
(21, '工单管理', 'TICKET_MANAGE', 'bi-ticket', 21, 0),
(22, '查看工单', 'TICKET_VIEW', 'bi-eye', 22, 0),
(23, '创建工单', 'TICKET_CREATE', 'bi-plus-circle', 23, 0),
(24, '处理工单', 'TICKET_PROCESS', 'bi-play', 24, 0),
(25, '转交工单', 'TICKET_TRANSFER', 'bi-arrow-left-right', 25, 0),
(26, '关闭工单', 'TICKET_CLOSE', 'bi-x-circle', 26, 0),

-- 角色权限管理
(31, '角色权限管理', 'ROLE_MANAGE', 'bi-shield-lock', 31, 0),
(32, '查看角色', 'ROLE_VIEW', 'bi-eye', 32, 0),
(33, '创建角色', 'ROLE_CREATE', 'bi-plus-circle', 33, 0),
(34, '编辑角色', 'ROLE_UPDATE', 'bi-pencil', 34, 0),
(35, '删除角色', 'ROLE_DELETE', 'bi-trash', 35, 0),
(36, '分配权限', 'PERMISSION_ASSIGN', 'bi-shield-check', 36, 0),

-- 系统管理权限
(41, '系统管理', 'SYSTEM_MANAGE', 'bi-gear', 41, 0),
(42, '系统监控', 'SYSTEM_MONITOR', 'bi-activity', 42, 0),
(43, '查看日志', 'LOG_VIEW', 'bi-journal-text', 43, 0);

-- 角色表测试数据
INSERT INTO t_role (role_id, role_name, role_code, base_role_code, description, status) VALUES
                                                                                            (1, '系统管理员', 'ADMIN', 'ADMIN', '系统最高权限管理员', 1),
                                                                                            (2, '部门主管', 'DEPT_MANAGER', 'DEPT', '部门管理者,可以管理本部门工单和成员', 1),
                                                                                            (3, '普通用户', 'NORMAL_USER', 'USER', '普通用户,可以提交和处理工单', 1),
                                                                                            (4, '临时用户', 'TEMP_USER', 'USER', '临时用户,仅可以提交工单', 1);


-- 部门表测试数据
INSERT INTO t_department (department_id, department_name, parent_id, dept_level, description, status, order_num) VALUES
-- 一级部门
(1, '技术部', NULL, 1, '负责公司技术研发工作', 1, 1),
(2, '运维部', NULL, 1, '负责系统运维工作', 1, 2),
(3, '客服部', NULL, 1, '负责客户服务工作', 1, 3),
(4, '人事部', NULL, 1, '负责人力资源管理', 1, 4),

-- 技术部下属部门
(11, '后端开发组', 1, 2, '负责后端服务开发', 1, 1),
(12, '前端开发组', 1, 2, '负责前端界面开发', 1, 2),
(13, '测试组', 1, 2, '负责软件测试', 1, 3),

-- 运维部下属部门
(21, '系统运维组', 2, 2, '负责系统维护', 1, 1),
(22, '网络运维组', 2, 2, '负责网络维护', 1, 2),

-- 客服部下属部门
(31, '在线客服组', 3, 2, '负责在线客户服务', 1, 1),
(32, '电话客服组', 3, 2, '负责电话客户服务', 1, 2);

-- 工单类型表测试数据
INSERT INTO t_ticket_type (type_id, type_name, status) VALUES
                                                           (1, '系统故障', 1),
                                                           (2, '功能建议', 1),
                                                           (3, '账号问题', 1),
                                                           (4, '权限申请', 1),
                                                           (5, '系统咨询', 1),
                                                           (6, '其他问题', 1);


-- 用户表测试数据
INSERT INTO t_user
(user_id, username, password, real_name, department_id, email, phone, status, position_id)
VALUES
-- 系统管理员
(1, 'admin', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '系统管理员', 1, 'admin@system.com', '13800000001', 1, 1),

-- 技术部成员
(2, 'tech_manager', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '技术部主管', 1, 'tech.manager@system.com', '13800000002', 1, 2),
(3, 'backend_lead', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '后端组长', 11, 'backend.lead@system.com', '13800000003', 1, 3),
(4, 'frontend_lead', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '前端组长', 12, 'frontend.lead@system.com', '13800000004', 1, 3),
(5, 'test_lead', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '测试组长', 13, 'test.lead@system.com', '13800000005', 1, 3),

-- 运维部成员
(6, 'ops_manager', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '运维部主管', 2, 'ops.manager@system.com', '13800000006', 1, 2),
(7, 'sys_ops', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '系统运维工程师', 21, 'sys.ops@system.com', '13800000007', 1, 4),
(8, 'net_ops', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '网络运维工程师', 22, 'net.ops@system.com', '13800000008', 1, 4),

-- 客服部成员
(9, 'service_manager', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '客服部主管', 3, 'service.manager@system.com', '13800000009', 1, 2),
(10, 'online_service', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '在线客服专员', 31, 'online.service@system.com', '13800000010', 1, 5),
(11, 'phone_service', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '电话客服专员', 32, 'phone.service@system.com', '13800000011', 1, 5),

-- 人事部成员
(12, 'hr_manager', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '人事部主管', 4, 'hr.manager@system.com', '13800000012', 1, 2),
(13, 'hr_staff', '$2a$10$MHPy9nvYB5jYb1K0VHXkWORjZrGxgQz.Li44GLY', '人事专员', 4, 'hr.staff@system.com', '13800000013', 1, 6);

-- 角色权限关联表测试数据
INSERT INTO t_role_permission (role_id, permission_id) VALUES
-- 系统管理员权限(所有权限)
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),          -- 用户管理权限
(1, 11), (1, 12), (1, 13), (1, 14), (1, 15),     -- 部门管理权限
(1, 21), (1, 22), (1, 23), (1, 24), (1, 25), (1, 26), -- 工单管理权限
(1, 31), (1, 32), (1, 33), (1, 34), (1, 35), (1, 36), -- 角色权限管理
(1, 41), (1, 42), (1, 43),                        -- 系统管理权限

-- 部门主管权限
(2, 2), (2, 12),                                  -- 查看用户和部门
(2, 21), (2, 22), (2, 23), (2, 24), (2, 25),     -- 工单管理权限(除关闭)
(2, 42),                                          -- 系统监控

-- 普通用户权限
(3, 22), (3, 23), (3, 24),                       -- 工单基础权限

-- 临时用户权限
(4, 22), (4, 23);                                -- 仅查看和创建工单

-- 用户角色关联表测试数据
INSERT INTO t_user_role (user_id, role_id) VALUES
-- 系统管理员
(1, 1),

-- 各部门主管
(2, 2),  -- 技术部主管
(6, 2),  -- 运维部主管
(9, 2),  -- 客服部主管
(12, 2), -- 人事部主管

-- 普通用户
(3, 3), (4, 3), (5, 3),  -- 技术部组长们
(7, 3), (8, 3),          -- 运维工程师们
(10, 3), (11, 3),        -- 客服专员们
(13, 3);                 -- 人事专员


-- 工单表测试数据
INSERT INTO t_ticket
(ticket_id, type_id, title, content, processor_id, department_id, priority, status,
 expect_finish_time, actual_finish_time, create_by, create_time)
VALUES
-- 系统故障工单
(1, 1, '生产环境服务器CPU使用率异常', '生产环境主服务器CPU使用率持续超过90%,需要紧急处理',
 7, 21, 2, 1, '2024-01-05 18:00:00', NULL, 4, '2024-01-05 10:00:00'),

-- 功能建议工单
(2, 2, '建议优化系统登录页面交互体验', '当前登录页面交互不够友好,建议增加记住密码功能和登录提示',
 4, 12, 0, 2, '2024-01-20 18:00:00', '2024-01-15 15:30:00', 10, '2024-01-05 14:30:00'),

-- 账号问题工单
(3, 3, '无法重置密码', '点击忘记密码后,没有收到重置邮件',
 10, 31, 1, 0, '2024-01-06 18:00:00', NULL, 13, '2024-01-05 16:45:00'),

-- 权限申请工单
(4, 4, '申请测试环境管理员权限', '需要测试环境管理员权限用于新功能测试',
 2, 1, 1, 2, '2024-01-07 18:00:00', '2024-01-06 10:20:00', 5, '2024-01-05 11:30:00'),

-- 系统咨询工单
(5, 5, '关于新版本发布时间咨询', '请问新版本预计什么时候发布?有更新日志吗?',
 11, 32, 0, 3, '2024-01-10 18:00:00', '2024-01-08 14:20:00', 8, '2024-01-05 09:15:00');


-- 附件表测试数据
INSERT INTO t_attachment
(attachment_id, ticket_id, file_name, file_path, file_size, file_type, create_by)
VALUES
-- 工单1的附件
(1, 1, 'cpu_usage.png', '/uploads/2024/01/05/cpu_usage.png', 524288, 'image/png', 4),
(2, 1, 'server_log.txt', '/uploads/2024/01/05/server_log.txt', 102400, 'text/plain', 4),

-- 工单2的附件
(3, 2, 'login_ui_design.pdf', '/uploads/2024/01/05/login_ui_design.pdf', 2097152, 'application/pdf', 10),

-- 工单4的附件
(4, 4, 'permission_list.xlsx', '/uploads/2024/01/05/permission_list.xlsx', 15360, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 5);


-- 通知表测试数据
INSERT INTO t_notification
(notification_id, user_id, ticket_id, notify_type, content, is_read)
VALUES
-- 工单分配通知
(1, 7, 1, 0, '您有一个新的待处理工单:生产环境服务器CPU使用率异常', 1),
(2, 4, 2, 0, '您有一个新的待处理工单:建议优化系统登录页面交互体验', 1),
(3, 10, 3, 0, '您有一个新的待处理工单:无法重置密码', 0),

-- 工单转交通知
(4, 11, 5, 1, '工单[关于新版本发布时间咨询]已转交给您处理', 1),

-- 工单完成通知
(5, 10, 2, 2, '您提交的工单[建议优化系统登录页面交互体验]已完成处理', 1),
(6, 5, 4, 2, '您提交的工单[申请测试环境管理员权限]已完成处理', 1),
(7, 8, 5, 2, '您提交的工单[关于新版本发布时间咨询]已完成处理', 0);