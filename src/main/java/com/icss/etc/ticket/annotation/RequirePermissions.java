package com.icss.etc.ticket.annotation;

import com.icss.etc.ticket.enums.Logical;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * {@code RequirePermissions}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface RequirePermissions {
    String[] value();
    Logical logical() default Logical.AND;
}
