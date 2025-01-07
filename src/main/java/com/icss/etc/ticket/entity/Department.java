package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

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
    * 更新人
    */
    private Long updateBy;

    /**
    * 创建时间
    */
    private LocalDateTime createTime;

    /**
    * 更新时间
    */
    private LocalDateTime updateTime;

    /**
    * 部门排序号
    */
    private Integer orderNum;


    private List<Department> subDepartments;

    @Serial
    private static final long serialVersionUID = 1L;
}