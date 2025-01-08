package com.icss.etc.ticket.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.extern.slf4j.Slf4j;

/**
 * {@code NotifyType}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

@Slf4j
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

    @JsonCreator
    public static NotifyType fromValue(int value) {
        for (NotifyType notifyType : NotifyType.values()) {
            if (notifyType.getValue() == value) {
                return notifyType;
            }
        }
        if (log.isErrorEnabled()){
            log.error("Invalid value for NotifyType: %d, return ASSIGN".formatted(value));
        }
        return NotifyType.ASSIGN;
    }


    @JsonValue
    public int getValue() {
        return value;
    }
}
