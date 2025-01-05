package com.icss.etc.ticket.enums;

import lombok.Getter;

/**
 * {@code TicketStatus}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Getter
public enum TicketStatus {
    /**
     * 待处理
     */
    PENDING(0),
    /**
     * 处理中
     */
    PROCESSING(1),
    /**
     * 已完成
     */
    COMPLETED(2),
    /**
     * 已关闭
     */
    CLOSED(3);

    private final int value;

    TicketStatus(int value) {
        this.value = value;
    }

}
