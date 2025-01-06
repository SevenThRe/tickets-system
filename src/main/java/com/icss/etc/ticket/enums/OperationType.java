package com.icss.etc.ticket.enums;

import lombok.Getter;

/**
 * {@code OperationType}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Getter
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
    TRANSFER(5);

    private final int value;

    OperationType(int value) {
        this.value = value;
    }

}
