package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code UserVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserVO {
    /**
     * 用户名
     */
    private String username;
    /**
     * 真实姓名
     */
    private String realName;
    /**
     * 用户ID
     */
    private String userId;
    /**
     * 角色名称
     */
    private String roleName;
    /**
     * 角色编码
     */
    private String baseRoleCode;
    /**
     *  手机号
     */
    private String phone;
    /**
     * 角色ID
     */
    private Integer roleId;
    /**
     * 部门名称
     */
    private String departmentName;
    /**
     * 部门ID
     */
    private Integer departmentId;
    /**
     * 邮箱
     */
    private String email;
    /**
     * 状态
     */
    private Integer status;

    /**
     * 创建时间
     */
    private String createTime;


}
