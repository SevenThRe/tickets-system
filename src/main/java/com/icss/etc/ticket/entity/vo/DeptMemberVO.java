package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * {@code DeptMemberVO} 部门成员数据传输对象
 * 用于department-management.html页面的部门成员管理功能
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeptMemberVO {

    /**
     * 工号
     */
    private Long userId;

    /**
     * 姓名
     */
    private String realName;

    /**
     * .
     * 邮箱
     */
    private String email;

    /**
     * 状态
     */
    private Integer status;

    /**
     * 职位
     */
    private String roleName;



}
