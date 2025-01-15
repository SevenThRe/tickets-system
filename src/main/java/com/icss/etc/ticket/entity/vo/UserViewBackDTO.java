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
     *  部门Id
     */
    private Long departmentId;
    /**
     *  部门名称
     */
    private String departmentName;
    /**
     *  角色Id
     */
    private Long roleId;
    /**
     *  角色名称
     */
    private String roleName;
    /**
     *  密码
     */
    private String password;
    /**
     *  邮箱
     */
    private String email;
    /**
     * 角色编码
     */
    private String baseRoleCode;
    /**
     *  角色状态
     */
    private Integer status;
}
