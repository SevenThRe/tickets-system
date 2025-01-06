package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code UserRole} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/**
 * 用户角色关联表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRole implements Serializable {
    /**
     * 用户ID
     */
    private Long user_id;

    /**
     * 角色ID
     */
    private Long role_id;

    /**
     * 创建时间
     */
    private LocalDateTime create_time;

    @Serial
    private static final long serialVersionUID = 1L;
}