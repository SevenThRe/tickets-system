package com.icss.etc.ticket.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * {@code CodeEnum}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

@NoArgsConstructor
@AllArgsConstructor
public enum CodeEnum {

    OK(200, "成功"),
    FAIL(1400, "失败"),
    BAD_REQUEST(1400, "请求错误"),
    NOT_FOUND(404, "未找到资源"),
    INTERNAL_ERROR(500, "内部服务器错误"),
    MODIFICATION_FAILED(1400, "修改失败"),
    DELETION_FAILED(1400, "删除失败"),
    CREATION_FAILED(1400, "创建失败"),
    USERNAME_OR_PASSWORD_ERROR(1400, "用户名或密码错误"),
    REGISTER_FAILED(1400, "注册失败"),
    USERNAME_EXIST(1400, "用户名已存在"),
    DEPARTMENT_IS_EXIST(1400, "部门已存在"),
    DEPARTMENT_IS_NOT_EXIST(1400, "部门不存在"),
    DEPARTMENT_IS_NOT_EMPTY(1400, "部门不为空"),
    PASSWORD_ERROR(1400, "旧密码错误"),
    PASSWORD_SAME(1400, "旧密码不能与新密码相同"),
    UPDATE_FAILED(1423,"更新失败,请重试"),
    UNKNOW_USER(1411,"未知用户");

    @Getter
    @Setter
    private int code;

    @Getter
    @Setter
    private String msg;

}
