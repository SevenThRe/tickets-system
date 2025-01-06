package com.icss.etc.ticket.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code UserTheme} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
/**
 * 用户主题配置表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserTheme implements Serializable {
    /**
    * 用户ID
    */
    private Long user_id;

    /**
    * 主题ID
    */
    private String theme_id;

    /**
    * 是否当前使用的主题
    */
    private Integer is_current;

    /**
    * 创建时间
    */
    private LocalDateTime create_time;

    /**
    * 更新时间
    */
    private LocalDateTime update_time;

    private static final long serialVersionUID = 1L;
}