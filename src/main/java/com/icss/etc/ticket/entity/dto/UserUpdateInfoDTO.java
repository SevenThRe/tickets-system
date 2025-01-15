package com.icss.etc.ticket.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code UserUpdateInfoDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateInfoDTO {
    /**
     * 用户名称
     */
    private String realName;
    /**
     * 角色ID
     */
    private String roleId;
    /**
     * 部门ID
     */
    private Long departmentId;
    /**
     * 手机号
     */
    private String phone;



}
