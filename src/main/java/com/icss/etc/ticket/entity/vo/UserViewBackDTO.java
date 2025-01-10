package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserViewBackDTO {
    /**
     * 用户名
     */
    private String username;
    /**
     *  用户ID
     */
    private Long userId;
    /**
     *  真实姓名
     */
    private String realName;
    /**
     *  手机号
     */
    private String phone;
    /**
     *  邮箱
     */
    private String departmentName;
    /**
     *  部门ID
     */
    private String roleName;
    /**
     *  密码
     */
    private String password;
    /**
     *  角色ID
     */
    private String baseRoleCode;
}
