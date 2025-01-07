package com.icss.etc.ticket.entity.dto;

import java.math.BigDecimal;

/**
 * {@code WorkloadStatsDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public record WorkloadStatsDTO(
        /*
         * 用户ID
         */
        Long userId,
        /*
         * 用户名
         */
        String userName,
        /*
         * 处理工单数量
         */
        Long processingCount,
        /*
         * 完成工单数量
         */
        Long completedCount,
        /*
         * 工作负载率
         */
        BigDecimal workloadRate
) {
}
