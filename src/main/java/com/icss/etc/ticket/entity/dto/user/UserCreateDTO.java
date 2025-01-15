package com.icss.etc.ticket.entity.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code UserCreateDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserCreateDTO {
    Long departmentId;
    String email;
    String password;
    String realName;
    Long roleId;
    Integer status;
    String username;
    Integer phone;

    Long userId;
}
