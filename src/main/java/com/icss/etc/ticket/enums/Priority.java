package com.icss.etc.ticket.enums;

import lombok.Getter;

/**
 * {@code Priority}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Getter
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

}
