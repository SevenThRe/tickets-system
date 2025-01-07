package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
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
    private Long roleId;

    /**
     * 角色名称
     */
    private String roleName;

    /**
     * 角色编码
     */
    private String roleCode;

    /**
     * 基础角色编码(ADMIN/DEPT/USER)
     */
    private String baseRoleCode;

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
    private Integer isDeleted;

    /**
     * 创建人
     */
    private Long createBy;

    /**
     * 创建时间
     */
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    private LocalDateTime updateTime;

    @Serial
    private static final long serialVersionUID = 1L;
}