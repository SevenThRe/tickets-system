package com.icss.etc.ticket.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.extern.slf4j.Slf4j;

/**
 * {@code OperationType}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Slf4j
public enum OperationType {
    /**
     * 创建
     */
    CREATE(0),
    /**
     * 分配
     */
    ASSIGN(1),
    /**
     * 处理
     */
    HANDLE(2),
    /**
     * 完成
     */
    FINISH(3),
    /**
     * 关闭
     */
    CLOSE(4),
    /**
     * 转交
     */
    TRANSFER(5),
    /**
     * 备注
     */
    COMMENT(6);

    private final int value;

    OperationType(int value) {
        this.value = value;
    }


    @JsonValue
    public int getValue() {
        return value;
    }

    @JsonCreator
    public static OperationType fromValue(int value) {
        for (OperationType operationType : OperationType.values()) {
            if (operationType.getValue() == value) {
                return operationType;
            }
        }
        if (log.isErrorEnabled()) {
            log.error("Invalid value for OperationType: %d, return CREATE".formatted(value));
        }
        return OperationType.CREATE;
    }

}
