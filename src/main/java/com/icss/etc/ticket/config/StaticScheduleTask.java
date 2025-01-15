package com.icss.etc.ticket.config;

import com.icss.etc.ticket.service.TicketService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
@Slf4j
public class StaticScheduleTask  {

    /**
     * 定时清理Redis缓存
     */
    @Async
    @Scheduled(cron = "0 0 0 1/1 * ? ")
    public void redisClean() {

    }

    /**
     * 定时派发工单
     */
    @Autowired
    private TicketService ticketService;

    /**
     * 每5分钟自动分配一次待处理的工单
     */
    @Async
    @Scheduled(fixedRate = 300000) // 5分钟执行一次
    public void autoAssignTickets() {
        try {
            log.info("开始自动分配工单...");
            ticketService.autoAssignPendingTickets();
            log.info("自动分配工单完成");
        } catch (Exception e) {
            log.error("自动分配工单失败:", e);
        }
    }
}
