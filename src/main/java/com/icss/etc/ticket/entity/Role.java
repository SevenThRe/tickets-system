package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

import com.icss.etc.ticket.enums.BaseRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Role} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/**
 * 角色表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Role implements Serializable {
    /**
     * 角色ID
     */
    private Long role_id;

    /**
     * 角色名称
     */
    private String role_name;

    /**
     * 角色编码
     */
    private String role_code;

    /**
     * 基础角色编码(ADMIN/DEPT/USER)
     */
    private BaseRole base_role_code;

    /**
     * 角色描述
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