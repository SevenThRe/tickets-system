package com.icss.etc.ticket.entity.dto;

import java.math.BigDecimal;

/**
 * {@code ProcessorStatsDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public record ProcessorStatsDTO(
        /*
         * 处理工作量统计
         */
        Long processingCount,
        /*
         * 完成工作量统计
         */
        Long completedCount,
        /*
         * 平均处理时间统计
         */
        BigDecimal avgProcessTime,
        /*
         * 平均完成时间统计
         */
        BigDecimal onTimeRate,
        /*
         * 平均满意度统计
         */
        BigDecimal satisfactionRate
) {
}
