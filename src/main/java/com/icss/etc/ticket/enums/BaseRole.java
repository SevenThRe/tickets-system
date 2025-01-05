package com.icss.etc.ticket.enums;

import lombok.Getter;

/**
 * {@code BaseRole}
 * @apiNote 基础角色枚举类，包含
 * {@code ADMIN}，
 * {@code DEPT}，
 * {@code USER} 三种角色
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Getter
public enum BaseRole {
    /**
     * 管理员
     */
    ADMIN("管理员"),
    /**
     * 部门主管
     */
    DEPT("部门主管"),
    /**
     * 普通用户
     */
    USER("普通用户");

    private final String desc;

    BaseRole(String desc) {
        this.desc = desc;
    }

}
