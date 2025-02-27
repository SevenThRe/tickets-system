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
    ROLE_ISEXIST(1325,"角色已存在"),
    PASSWORD_WEAK(1325,"密码强度不足"),
    UNKNOW_USER(1411,"未知用户"),
    DELETE_MEMBER_FAILED(1412, "删除成员失败"),
    SAVE_FAILED(1055, "保存失败"),
    INVALID_FILE_SIZE(1551, "文件大小超出限制"),
    INVALID_FILE_TYPE(1552, "文件类型不支持"), REGISTER_CLOSED(1553, "系统注册已关闭"),
    PARAM_ERROR(1555, "参数错误"), DATA_NOT_FOUND(1556, "数据未找到"), DATA_EXIST(1557, "数据已存在"),;
    @Getter
    @Setter
    private int code;

    @Getter
    @Setter
    private String msg;

}
