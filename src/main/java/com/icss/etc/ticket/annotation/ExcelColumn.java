package com.icss.etc.ticket.annotation;

import java.lang.annotation.*;

/**
 * Excel导出列配置注解
 * 用于标注需要导出到Excel的字段
 *
 * @author SeventhRe
 */
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface ExcelColumn {
    /**
     * 列名
     */
    String value() default "";

    /**
     * 列序号(从0开始)
     */
    int index() default 0;

    /**
     * 列宽(字符数)
     */
    int width() default 20;

    /**
     * 日期格式化模式
     */
    String dateFormat() default "yyyy-MM-dd HH:mm:ss";
}