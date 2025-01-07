package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code Theme}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Theme implements Serializable {
    /**
     * 主题ID
     */
    private String themeId;

    /**
     * 主题名称
     */
    private String themeName;

    /**
     * 主题类型
     */
    private String themeType;

    /**
     * 是否系统主题
     */
    private Integer isSystem;

    /**
     * 是否默认主题
     */
    private Integer isDefault;

    /**
     * 主题配置JSON
     */
    private String configJson;

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