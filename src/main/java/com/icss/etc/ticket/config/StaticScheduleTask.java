package com.icss.etc.ticket.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * {@code StaticScheduleTask}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Configuration
@EnableScheduling
@EnableAsync
public class StaticScheduleTask  {

    /**
     * 定时清理Redis缓存
     */
    @Async
    @Scheduled(cron = "0 0 0 1/1 * ? ")
    public void redisClean() {

    }
}
