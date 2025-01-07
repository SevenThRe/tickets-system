package com.icss.etc.ticket.entity.dto;

import java.math.BigDecimal;

/**
 * {@code TicketTypeStatsDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public record TicketTypeStatsDTO(
        /*
         * 类型ID
         */
        Long typeId,
        /*
         * 类型名称
         */
        String typeName,
        /*
         * 数量
         */
        Long count,
        /*
         * 占比
         */
        BigDecimal proportion
) {
}
