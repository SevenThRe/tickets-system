package com.icss.etc.ticket.entity.dto;

import java.math.BigDecimal;

/**
 * {@code DeptTicketStatsDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public record DeptTicketStatsDTO(
        Long totalCount,
        Long pendingCount,
        Long processingCount,
        Long completedCount,
        Long closedCount,
        BigDecimal avgProcessTime,
        BigDecimal completionRate,
        BigDecimal satisfactionRate
) {
}
