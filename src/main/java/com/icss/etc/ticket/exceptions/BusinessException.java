package com.icss.etc.ticket.exceptions;

/**
 * {@code BusinessException}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.enums.TicketEnum;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 业务异常类
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BusinessException extends RuntimeException {

    /**
     * 错误码
     */
    private int code;

    /**
     * 错误消息
     */
    private String message;

    /**
     * 使用CodeEnum构造异常
     * @param codeEnum 错误枚举
     */
    public BusinessException(CodeEnum codeEnum) {
        super(codeEnum.getMsg());
        this.code = codeEnum.getCode();
        this.message = codeEnum.getMsg();
    }

    /**
     * 使用TicketEnum构造异常
     * @param ticketEnum 工单错误枚举
     */
    public BusinessException(TicketEnum ticketEnum) {
        super(ticketEnum.getMessage());
        this.code = ticketEnum.getCode();
        this.message = ticketEnum.getMessage();
    }

    /**
     * 自定义错误消息的构造方法
     * @param code 错误码
     * @param message 错误消息
     */
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
        this.message = message;
    }

    /**
     * 使用自定义消息覆盖CodeEnum中的消息
     * @param codeEnum 错误枚举
     * @param message 自定义错误消息
     */
    public BusinessException(CodeEnum codeEnum, String message) {
        super(message);
        this.code = codeEnum.getCode();
        this.message = message;
    }

    /**
     * 使用自定义消息覆盖TicketEnum中的消息
     * @param ticketEnum 工单错误枚举
     * @param message 自定义错误消息
     */
    public BusinessException(TicketEnum ticketEnum, String message) {
        super(message);
        this.code = ticketEnum.getCode();
        this.message = message;
    }
}