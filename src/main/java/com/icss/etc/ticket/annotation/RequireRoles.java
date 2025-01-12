package com.icss.etc.ticket.annotation;
import com.icss.etc.ticket.enums.Logical;

import java.lang.annotation.*;

/**
 * {@code RequireRoles}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface RequireRoles {
    String[] value();
    Logical logical() default Logical.AND;
}
