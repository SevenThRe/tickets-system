package com.icss.etc.ticket.entity;

import java.io.Serial;
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
    private Long userId;

    /**
     * 主题ID
     */
    private String themeId;

    /**
     * 是否当前使用的主题
     */
    private Integer isCurrent;

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