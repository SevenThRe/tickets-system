package com.icss.etc.ticket.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Theme} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Theme implements Serializable {
    /**
    * 主题ID
    */
    private String theme_id;

    /**
    * 主题名称
    */
    private String theme_name;

    /**
    * 主题类型
    */
    private String theme_type;

    /**
    * 是否系统主题
    */
    private Integer is_system;

    /**
    * 是否默认主题
    */
    private Integer is_default;

    /**
    * 主题配置JSON
    */
    private String config_json;

    /**
    * 创建人
    */
    private Long create_by;

    private LocalDateTime create_time;

    private LocalDateTime update_time;

    private static final long serialVersionUID = 1L;
}