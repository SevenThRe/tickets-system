-- 清空现有数据
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE t_department;
TRUNCATE TABLE t_role;
TRUNCATE TABLE t_permission;
TRUNCATE TABLE t_ticket_type;
TRUNCATE TABLE t_user;
TRUNCATE TABLE t_user_role;
TRUNCATE TABLE t_role_permission;
TRUNCATE TABLE t_ticket;
TRUNCATE TABLE t_ticket_record;
TRUNCATE TABLE t_attachment;
TRUNCATE TABLE t_notification;
TRUNCATE TABLE t_user_settings;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. 插入部门数据
INSERT INTO t_department (department_id, department_name, manager_id, parent_id, dept_level, description, status, icon_class)
VALUES
    (1, '总经办', null, null, 1, '公司最高决策部门', 1, 'fa-building'),
    (2, '技术部', null, 1, 2, '负责公司技术研发', 1, 'fa-laptop-code'),
    (3, '运维部', null, 1, 2, '负责系统运维', 1, 'fa-server'),
    (4, '人事部', null, 1, 2, '负责人力资源管理', 1, 'fa-users'),
    (5, '前端组', null, 2, 3, '负责前端开发', 1, 'fa-code'),
    (6, '后端组', null, 2, 3, '负责后端开发', 1, 'fa-database');

-- 2. 插入角色数据
INSERT INTO t_role (role_id, role_name, role_code, base_role_code, description, status)
VALUES
    (1, '系统管理员', 'ADMIN', 'ADMIN', '系统超级管理员', 1),
    (2, '部门主管', 'DEPT_MANAGER', 'DEPT', '部门管理者', 1),
    (3, '普通用户', 'NORMAL_USER', 'USER', '普通员工', 1);

-- 3. 插入权限数据
INSERT INTO t_permission (permission_id, permission_name, permission_code, icon, sort)
VALUES
    (1, '用户管理', 'sys:user:manage', 'fa-user', 1),
    (2, '部门管理', 'sys:dept:manage', 'fa-sitemap', 2),
    (3, '角色管理', 'sys:role:manage', 'fa-user-tag', 3),
    (4, '工单管理', 'ticket:manage', 'fa-tickets-alt', 4),
    (5, '工单处理', 'ticket:process', 'fa-tasks', 5),
    (6, '工单查询', 'ticket:query', 'fa-search', 6);

-- 4. 插入工单类型数据
INSERT INTO t_ticket_type (type_id, type_name, status)
VALUES
    (1, '系统故障', 1),
    (2, '功能建议', 1),
    (3, '权限申请', 1),
    (4, '其他问题', 1);

-- 5. 插入用户数据 密码都是 123456
INSERT INTO t_user (user_id, username, password, real_name, department_id, email, phone, status)
VALUES
    (1, 'admin', '7c4a8d09ca3762af61e59520943dc26494f8941b', '系统管理员', 1, 'admin@company.com', '13800000001', 1),
    (2, 'tech_manager', '7c4a8d09ca3762af61e59520943dc26494f8941b', '技术主管', 2, 'tech@company.com', '13800000002', 1),
    (3, 'hr_manager', '7c4a8d09ca3762af61e59520943dc26494f8941b', '人事主管', 4, 'hr@company.com', '13800000003', 1),
    (4, 'dev1', '7c4a8d09ca3762af61e59520943dc26494f8941b', '开发工程师1', 6, 'dev1@company.com', '13800000004', 1),
    (5, 'dev2', '7c4a8d09ca3762af61e59520943dc26494f8941b', '开发工程师2', 6, 'dev2@company.com', '13800000005', 1);

-- 6. 更新部门管理者
UPDATE t_department SET manager_id = 1 WHERE department_id = 1;
UPDATE t_department SET manager_id = 2 WHERE department_id = 2;
UPDATE t_department SET manager_id = 3 WHERE department_id = 4;

-- 7. 插入用户角色关联
INSERT INTO t_user_role (user_id, role_id)
VALUES
    (1, 1), -- admin -> 系统管理员
    (2, 2), -- tech_manager -> 部门主管
    (3, 2), -- hr_manager -> 部门主管
    (4, 3), -- dev1 -> 普通用户
    (5, 3); -- dev2 -> 普通用户

-- 8. 插入角色权限关联
INSERT INTO t_role_permission (role_id, permission_id)
VALUES
-- 系统管理员权限
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6),
-- 部门主管权限
(2, 4), (2, 5), (2, 6),
-- 普通用户权限
(3, 5), (3, 6);

-- 9. 插入工单数据
INSERT INTO t_ticket (ticket_id, type_id, title, content, processor_id, department_id, priority, status, expect_finish_time, create_by)
VALUES
    (1, 1, '系统登录异常', '无法登录系统，提示密码错误', 4, 2, 1, 0, DATE_ADD(NOW(), INTERVAL 2 DAY), 3),
    (2, 2, '建议优化界面', '建议优化用户界面，提高用户体验', 5, 2, 0, 1, DATE_ADD(NOW(), INTERVAL 5 DAY), 3),
    (3, 3, '申请数据库权限', '申请测试环境数据库读写权限', null, 3, 1, 0, DATE_ADD(NOW(), INTERVAL 1 DAY), 4);

-- 10. 插入工单记录
INSERT INTO t_ticket_record (ticket_id, operator_id, operation_type, operation_content)
VALUES
    (1, 3, 0, '创建工单'),
    (1, 2, 1, '分配给开发工程师1处理'),
    (2, 3, 0, '创建工单'),
    (2, 2, 1, '分配给开发工程师2处理'),
    (2, 5, 2, '正在处理中'),
    (3, 4, 0, '创建工单');

-- 11. 插入通知数据
INSERT INTO t_notification (user_id, ticket_id, notify_type, content)
VALUES
    (4, 1, 0, '您有新的工单待处理：系统登录异常'),
    (5, 2, 0, '您有新的工单待处理：建议优化界面'),
    (2, 3, 0, '有新的工单待分配：申请数据库权限');

-- 12. 插入用户设置
INSERT INTO t_user_settings (user_id, ticket_notification, process_notification, system_notification, create_time, update_time)
VALUES
    (1, 1, 1, 1, NOW(), NOW()),
    (2, 1, 1, 1, NOW(), NOW()),
    (3, 1, 1, 1, NOW(), NOW()),
    (4, 1, 1, 1, NOW(), NOW()),
    (5, 1, 1, 1, NOW(), NOW());