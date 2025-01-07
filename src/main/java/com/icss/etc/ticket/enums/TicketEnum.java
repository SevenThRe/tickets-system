package com.icss.etc.ticket.enums;

import lombok.Getter;

/**
 * {@code TicketEnum}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

@Getter
public enum TicketEnum {
    /**
     * "工单已存在"
     */
    TICKET_EXIST(-1, "工单已存在"),
    /**
     * "工单不存在"
     */
    TICKET_NOT_EXIST(-2, "工单不存在"),
    /**
     * "工单已关闭"
     */
    TICKET_CLOSED(-3, "工单已关闭"),
    /**
     * "工单已完成"
     */
    TICKET_COMPLETED(-4, "工单已完成"),
    /**
     * "工单已过期"
     */
    TICKET_EXPIRED(-5, "工单已过期"),
    /**
     * "工单状态异常"
     */
    TICKET_STATUS_EXCEPTION(-6, "工单状态异常"),
    /**
     * "工单类型异常"
     */
    TICKET_TYPE_EXCEPTION(-7, "工单类型异常"),
    /**
     * "工单操作失败"
     */
    TICKET_OPERATION_FAILED(-8, "工单操作失败"),
    /**
     * "工单操作成功"
     */
    TICKET_OPERATION_SUCCESS(-9, "工单操作成功"),

    /**
     * "工单信息非法"
     */
    TICKET_INFO_ILLEGAL(-10, "工单信息非法"),
    ;

    private final int code;
    private final String message;


    TicketEnum(int i,String message) {
        this.code = i;
        this.message = message;

    }


}
