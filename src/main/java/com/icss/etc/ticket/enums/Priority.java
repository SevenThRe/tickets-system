package com.icss.etc.ticket.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.extern.slf4j.Slf4j;

/**
 * {@code Priority}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Slf4j
public enum Priority {
    /**
     * 普通
     */
    NORMAL(0),
    /**
     * 紧急
     */
    URGENT(1),
    /**
     * 非常紧急
     */
    EXTREMELY_URGENT(2);

    private final int value;

    Priority(int value) {
        this.value = value;
    }


    @JsonValue
    public int getValue() {
        return value;
    }

    @JsonCreator
    public static Priority fromValue(int value) {
        for (Priority priority : Priority.values()) {
            if (priority.getValue() == value) {
                return priority;
            }
        }
        if (log.isErrorEnabled()) {
            log.error("Invalid value for Priority: %d, return NORMAL".formatted(value));
        }
        return Priority.NORMAL;
    }

}
