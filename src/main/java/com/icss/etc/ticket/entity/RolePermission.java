package com.icss.etc.ticket.entity;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code RolePermission} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/**
 * 角色权限关联表
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RolePermission implements Serializable {
    /**
     * 角色ID
     */
    private Long role_id;

    /**
     * 权限ID
     */
    private Long permission_id;

    /**
     * 创建时间
     */
    private LocalDateTime create_time;

    @Serial
    private static final long serialVersionUID = 1L;
}