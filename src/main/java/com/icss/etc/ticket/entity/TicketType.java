package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code TicketType} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
/**
 * 工单类型表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketType implements Serializable {
    /**
    * 类型ID
    */
    private Long type_id;

    /**
    * 类型名称
    */
    private String type_name;

    /**
    * 状态：0-禁用，1-启用
    */
    private Integer status;

    /**
    * 是否删除
    */
    private Integer is_deleted;

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