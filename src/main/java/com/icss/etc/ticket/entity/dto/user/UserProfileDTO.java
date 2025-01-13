package com.icss.etc.ticket.entity.dto.user;

import lombok.Data;
import lombok.Getter;

/**
 * {@code UserProfileDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class UserProfileDTO {
    private Long userId;
    private String username;
    private String realName;
    private String email;
    private String phone;
    private Long departmentId;
    private Long roleId;
}