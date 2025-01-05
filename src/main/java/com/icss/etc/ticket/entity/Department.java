package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 部门表
 * t_department
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Department implements Serializable {
    /**
     * 部门ID
     */
    private Long departmentId;

    /**
     * 部门名称
     */
    private String departmentName;

    /**
     * 部门负责人ID
     */
    private Long managerId;

    /**
     * 父部门ID
     */
    private Long parentId;

    /**
     * 部门层级
     */
    private Integer deptLevel;

    /**
     * 部门描述
     */
    private String description;

    /**
     * 状态：0-禁用，1-启用
     */
    private Byte status;

    /**
     * 是否删除
     */
    private Byte isDeleted;

    /**
     * 创建人
     */
    private Long createBy;

    /**
     * 更新人
     */
    private Long updateBy;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
    @Serial
    private static final long serialVersionUID = 1L;
}