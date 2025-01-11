-- we don't know how to generate root <with-no-name> (class Root) :(

grant select on performance_schema.* to 'mysql.session'@localhost;

grant trigger on sys.* to 'mysql.sys'@localhost;

grant audit_abort_exempt, firewall_exempt, select, system_user on *.* to 'mysql.infoschema'@localhost;

grant audit_abort_exempt, authentication_policy_admin, backup_admin, clone_admin, connection_admin, firewall_exempt, persist_ro_variables_admin, session_variables_admin, shutdown, super, system_user, system_variables_admin on *.* to 'mysql.session'@localhost;

grant audit_abort_exempt, firewall_exempt, system_user on *.* to 'mysql.sys'@localhost;

grant alter, alter routine, application_password_admin, audit_abort_exempt, audit_admin, authentication_policy_admin, backup_admin, binlog_admin, binlog_encryption_admin, clone_admin, connection_admin, create, create role, create routine, create tablespace, create temporary tables, create user, create view, delete, drop, drop role, encryption_key_admin, event, execute, file, firewall_exempt, flush_optimizer_costs, flush_status, flush_tables, flush_user_resources, group_replication_admin, group_replication_stream, index, innodb_redo_log_archive, innodb_redo_log_enable, insert, lock tables, passwordless_user_admin, persist_ro_variables_admin, process, references, reload, replication client, replication slave, replication_applier, replication_slave_admin, resource_group_admin, resource_group_user, role_admin, select, sensitive_variables_observer, service_connection_admin, session_variables_admin, set_user_id, show databases, show view, show_routine, shutdown, super, system_user, system_variables_admin, table_encryption_admin, telemetry_log_admin, trigger, update, xa_recover_admin, grant option on *.* to newuser@seven;

grant alter, alter routine, create, create role, create routine, create tablespace, create temporary tables, create user, create view, delete, drop, drop role, event, execute, file, index, insert, lock tables, process, references, reload, replication client, replication slave, select, show databases, show view, shutdown, super, trigger, update, grant option on *.* to root;

create table sys_theme
(
    theme_id    varchar(32)                        not null comment '主题ID'
        primary key,
    theme_name  varchar(50)                        not null comment '主题名称',
    theme_type  varchar(20)                        not null comment '主题类型',
    is_system   tinyint  default 0                 not null comment '是否系统主题',
    is_default  tinyint  default 0                 not null comment '是否默认主题',
    config_json text                               not null comment '主题配置JSON',
    create_by   bigint                             null comment '创建人',
    create_time datetime default CURRENT_TIMESTAMP null,
    update_time datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint uk_theme_name
        unique (theme_name)
);

create table sys_user_theme
(
    user_id     bigint                             not null comment '用户ID',
    theme_id    varchar(32)                        not null comment '主题ID',
    is_current  tinyint  default 0                 not null comment '是否当前使用的主题',
    create_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    primary key (user_id, theme_id)
)
    comment '用户主题配置表' charset = utf8mb4;

create index idx_current
    on sys_user_theme (user_id, is_current)
    comment '当前主题索引';

create table t_attachment
(
    attachment_id bigint auto_increment comment '附件ID'
        primary key,
    ticket_id     bigint                             not null comment '工单ID',
    file_name     varchar(255)                       not null comment '文件名',
    file_path     varchar(500)                       not null comment '文件路径',
    file_size     bigint                             not null comment '文件大小(字节)',
    file_type     varchar(50)                        null comment '文件类型',
    is_deleted    tinyint  default 0                 not null comment '是否删除',
    create_by     bigint                             null comment '上传人',
    create_time   datetime default CURRENT_TIMESTAMP not null comment '上传时间'
)
    comment '附件表' charset = utf8mb4;

create index idx_ticket
    on t_attachment (ticket_id)
    comment '工单索引';

create table t_department
(
    department_id   bigint auto_increment comment '部门ID'
        primary key,
    department_name varchar(50)                            not null comment '部门名称',
    manager_id      bigint                                 null comment '部门负责人ID',
    parent_id       bigint                                 null comment '父部门ID',
    dept_level      tinyint                                not null comment '部门层级',
    description     varchar(200)                           null comment '部门描述',
    status          tinyint     default 1                  not null comment '状态：0-禁用，1-启用',
    is_deleted      tinyint     default 0                  not null comment '是否删除',
    create_by       bigint                                 null comment '创建人',
    update_by       bigint                                 null comment '更新人',
    create_time     datetime    default CURRENT_TIMESTAMP  not null comment '创建时间',
    update_time     datetime    default CURRENT_TIMESTAMP  not null on update CURRENT_TIMESTAMP comment '更新时间',
    order_num       int         default 0                  null comment '部门排序号',
    icon_class      varchar(50) default 'fa-shipping-fast' not null comment '部门图标',
    constraint idx_orderNum_parent
        unique (parent_id, order_num) comment '父部门ID和序号的唯一索引',
    constraint uk_dept_name
        unique (department_name) comment '部门名称唯一索引'
)
    comment '部门表' charset = utf8mb4;

create index idx_manager
    on t_department (manager_id)
    comment '部门负责人索引';

create index idx_parent
    on t_department (parent_id)
    comment '父部门索引';

create table t_notification
(
    notification_id bigint auto_increment comment '通知ID'
        primary key,
    user_id         bigint                             not null comment '接收用户ID',
    ticket_id       bigint                             not null comment '相关工单ID',
    notify_type     tinyint                            not null comment '通知类型：0-工单分配，1-工单转交，2-工单完成，3-其他',
    content         text                               not null comment '通知内容',
    is_read         tinyint  default 0                 not null comment '是否已读：0-未读，1-已读',
    is_deleted      tinyint  default 0                 not null comment '是否删除',
    create_time     datetime default CURRENT_TIMESTAMP not null comment '创建时间'
)
    comment '通知表' charset = utf8mb4;

create index idx_ticket
    on t_notification (ticket_id)
    comment '工单索引';

create index idx_user
    on t_notification (user_id)
    comment '用户索引';

create table t_permission
(
    permission_id   bigint auto_increment comment '权限ID'
        primary key,
    permission_name varchar(50)                        not null comment '权限名称',
    permission_code varchar(50)                        not null comment '权限编码',
    icon            varchar(100)                       null comment '图标',
    sort            int      default 0                 null comment '排序',
    is_deleted      tinyint  default 0                 not null comment '是否删除',
    create_by       bigint                             null comment '创建人',
    update_by       bigint                             null comment '更新人',
    create_time     datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time     datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_permission_code
        unique (permission_code) comment '权限编码唯一索引'
)
    comment '权限表' charset = utf8mb4;

create table t_role
(
    role_id        bigint auto_increment comment '角色ID'
        primary key,
    role_name      varchar(50)                        not null comment '角色名称',
    role_code      varchar(50)                        not null comment '角色编码',
    base_role_code varchar(20)                        not null comment '基础角色编码(ADMIN/DEPT/USER)',
    description    varchar(200)                       null comment '角色描述',
    status         tinyint  default 1                 not null comment '状态：0-禁用，1-启用',
    is_deleted     tinyint  default 0                 not null comment '是否删除',
    create_by      bigint                             null comment '创建人',
    create_time    datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time    datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_role_code
        unique (role_code) comment '角色编码唯一索引'
)
    comment '角色表' charset = utf8mb4;

create table t_role_permission
(
    role_id       bigint                             not null comment '角色ID',
    permission_id bigint                             not null comment '权限ID',
    create_time   datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    primary key (role_id, permission_id)
)
    comment '角色权限关联表' charset = utf8mb4;

create table t_ticket
(
    ticket_id          bigint auto_increment comment '工单ID'
        primary key,
    type_id            bigint                             not null comment '工单类型ID',
    title              varchar(100)                       not null comment '工单标题',
    content            text                               not null comment '工单内容',
    processor_id       bigint                             null comment '处理人ID',
    department_id      bigint                             not null comment '处理部门ID',
    priority           tinyint  default 0                 not null comment '优先级：0-普通，1-紧急，2-非常紧急',
    status             tinyint  default 0                 not null comment '状态：0-待处理，1-处理中，2-已完成，3-已关闭',
    expect_finish_time datetime                           null comment '期望完成时间',
    actual_finish_time datetime                           null comment '实际完成时间',
    is_deleted         tinyint  default 0                 not null comment '是否删除',
    create_by          bigint                             null comment '创建人',
    update_by          bigint                             null comment '更新人',
    create_time        datetime default CURRENT_TIMESTAMP null comment '创建时间',
    update_time        datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '工单表' charset = utf8mb4;

create index idx_department
    on t_ticket (department_id)
    comment '部门索引';

create index idx_processor
    on t_ticket (processor_id)
    comment '处理人索引';

create index idx_type
    on t_ticket (type_id)
    comment '类型索引';

create table t_ticket_record
(
    record_id          bigint auto_increment comment '记录ID'
        primary key,
    ticket_id          bigint                             not null comment '工单ID',
    operator_id        bigint                             not null comment '操作人ID',
    operation_type     tinyint                            not null comment '操作类型：0-创建，1-分配，2-处理，3-完成，4-关闭，5-转交',
    operation_content  text                               null comment '操作内容',
    evaluation_score   tinyint                            null comment '评分(1-5)',
    evaluation_content text                               null comment '评价内容',
    is_deleted         tinyint  default 0                 not null comment '是否删除',
    create_time        datetime default CURRENT_TIMESTAMP not null comment '创建时间'
)
    comment '工单处理记录表' charset = utf8mb4;

create index idx_operator
    on t_ticket_record (operator_id)
    comment '操作人索引';

create index idx_ticket
    on t_ticket_record (ticket_id)
    comment '工单索引';

create table t_ticket_type
(
    type_id     bigint auto_increment comment '类型ID'
        primary key,
    type_name   varchar(50)                        not null comment '类型名称',
    status      tinyint  default 1                 not null comment '状态：0-禁用，1-启用',
    is_deleted  tinyint  default 0                 not null comment '是否删除',
    create_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time datetime default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
)
    comment '工单类型表' charset = utf8mb4;

create table t_user
(
    user_id       bigint auto_increment comment '用户ID'
        primary key,
    username      varchar(50)                        not null comment '用户名',
    password      varchar(100)                       not null comment '密码',
    real_name     varchar(50)                        not null comment '真实姓名',
    department_id bigint   default 0                 not null comment '所属部门ID',
    email         varchar(100)                       null comment '邮箱',
    phone         varchar(20)                        null comment '电话',
    status        tinyint  default 1                 not null comment '状态：0-禁用，1-启用',
    is_deleted    tinyint  default 0                 not null comment '0 未删除 1删除',
    create_by     bigint                             null comment '创建人',
    update_by     bigint                             null comment '更新人',
    create_time   datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time   datetime default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP comment '更新时间',
    constraint uk_username
        unique (username) comment '用户名唯一索引'
)
    comment '用户表' charset = utf8mb4;

create index idx_department
    on t_user (department_id)
    comment '部门索引';

create table t_user_role
(
    user_id     bigint                             not null comment '用户ID',
    role_id     bigint                             not null comment '角色ID',
    create_time datetime default CURRENT_TIMESTAMP not null comment '创建时间',
    primary key (user_id, role_id)
)
    comment '用户角色关联表' charset = utf8mb4;

