package com.icss.etc.ticket.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
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
    PENDING(0),
    PROCESSING(1),
    COMPLETED(2),
    CLOSED(3);

    private final int value;

    TicketStatus(int value) {
        this.value = value;
    }

    @JsonValue
    public int getValue() {
        return value;
    }

    @JsonCreator
    public static TicketStatus from(Object value) {
        if (value == null) {
            return null;
        }
        // 处理字符串类型
        if (value instanceof String) {
            String strValue = (String) value;
            if (strValue.isEmpty() || strValue.equalsIgnoreCase("NaN")) {
                return null;
            }
            // 尝试将字符串解析为枚举名称
            try {
                return TicketStatus.valueOf(strValue.toUpperCase());
            } catch (IllegalArgumentException e) {
                // 如果不是枚举名称，尝试解析为数字
                try {
                    int intValue = Integer.parseInt(strValue);
                    return fromValue(intValue);
                } catch (NumberFormatException ne) {
                    return null;
                }
            }
        }
        // 处理数字类型
        if (value instanceof Number) {
            return fromValue(((Number) value).intValue());
        }
        return null;
    }

    public static TicketStatus fromValue(int value) {
        for (TicketStatus status : values()) {
            if (status.value == value) {
                return status;
            }
        }
        return null;
    }
}
