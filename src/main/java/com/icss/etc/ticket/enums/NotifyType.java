package com.icss.etc.ticket.enums;

import lombok.Getter;

/**
 * {@code NotifyType}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

@Getter
public enum NotifyType {

    /**
     * 工单分配
     */
    ASSIGN(0),
    /**
     * 工单转交
     */
    STATUS_CHANGE(1),
    /**
     * 工单完成
     */
    COMPLETE(2),
    ;


    private final int value;

    NotifyType(int value) {
        this.value = value;
    }

}
