package com.icss.etc.ticket.annotation;

import java.lang.annotation.*;

/**
 * {@code RedisOperation} redis操作注解
 *  用于标识redis操作，包括查询、修改、自动两种类型
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RedisOperation {
    /**
     * 操作类型，默认为自动判断
     */
    OperationType type() default OperationType.AUTO;

    enum OperationType {
        QUERY,   // 查询操作
        MODIFY,  // 修改操作
        AUTO     // 自动判断
    }
}
