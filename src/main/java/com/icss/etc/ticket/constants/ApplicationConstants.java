package com.icss.etc.ticket.constants;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * {@code ApplicationConstants}
 *  全局常量类
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
@Getter
@Setter
@PropertySource("classpath:options.properties")
public class ApplicationConstants {

    /**
     * 缓存过期时间值
     * 默认10
     */
    @Value("${caches.expire_time}")
    public static Integer EXPIRE_TIME_VALUE  = 10;

    /**
     *  缓存过期时间单位
     *  默认MINUTES
     */
    @Value("${caches.expire_time_unit}")
    public static String EXPIRE_TIME_UNIT = "MINUTES";
    /**
     *  缓存最大容量
     *  默认500
     */
    @Value("${caches.max_size}")
    public static Integer MAX_SIZE = 500;






}
