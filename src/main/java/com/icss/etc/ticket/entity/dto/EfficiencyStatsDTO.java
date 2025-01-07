package com.icss.etc.ticket.entity.dto;

import java.math.BigDecimal;

/**
 * {@code EfficiencyStatsDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public record EfficiencyStatsDTO(
        Long userId,
        String userName,
        BigDecimal avgProcessTime,
        BigDecimal onTimeRate,
        String efficiencyLevel
) {
}
