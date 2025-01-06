package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Department} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/**
 * 部门表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Department implements Serializable {
    /**
     * 部门ID
     */
    private Long department_id;

    /**
     * 部门名称
     */
    private String department_name;

    /**
     * 部门负责人ID
     */
    private Long manager_id;

    /**
     * 父部门ID
     */
    private Long parent_id;

    /**
     * 部门层级
     */
    private Integer dept_level;

    /**
     * 部门描述
     */
    private String description;

    /**
     * 状态：0-禁用，1-启用
     */
    private Integer status;

    /**
     * 是否删除
     */
    private Integer is_deleted;

    /**
     * 创建人
     */
    private Long create_by;

    /**
     * 更新人
     */
    private Long update_by;

    /**
     * 创建时间
     */
    private LocalDateTime create_time;

    /**
     * 更新时间
     */
    private LocalDateTime update_time;

    @Serial
    private static final long serialVersionUID = 1L;
}