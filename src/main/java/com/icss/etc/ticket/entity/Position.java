package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Position} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
/**
 * 职位表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Position implements Serializable {
    /**
    * 主键ID
    */
    private Long id;

    /**
    * 职位编码
    */
    private String code;

    /**
    * 职位名称
    */
    private String name;

    /**
    * 所属部门ID
    */
    private Long deptId;

    /**
    * 状态(0-禁用 1-启用)
    */
    private Integer status;

    /**
    * 排序号
    */
    private Integer orderNum;

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