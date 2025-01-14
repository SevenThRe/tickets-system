package com.icss.etc.ticket.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
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
    NORMAL(0),
    URGENT(1),
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
    public static Priority from(Object value) {
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
                return Priority.valueOf(strValue.toUpperCase());
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

    public static Priority fromValue(int value) {
        for (Priority priority : values()) {
            if (priority.value == value) {
                return priority;
            }
        }
        return null;
    }
}
