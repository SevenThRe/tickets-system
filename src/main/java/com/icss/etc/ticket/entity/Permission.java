package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Permission} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
/**
 * 权限表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Permission implements Serializable {
    /**
    * 权限ID
    */
    private Long permission_id;

    /**
    * 权限名称
    */
    private String permission_name;

    /**
    * 权限编码
    */
    private String permission_code;

    /**
    * 图标
    */
    private String icon;

    /**
    * 排序
    */
    private Integer sort;

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