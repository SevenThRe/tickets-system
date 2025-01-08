package com.icss.etc.ticket.entity.dto.ticket;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * {@code TicketTrendDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public record TicketTrendDTO(
        /*
         * 日期
         */
        LocalDate date,
        /*
         * 新增工单数
         */
        Long newCount,
        /*
         * 完成工单数
         */
        Long completedCount,
        /*
         * 完成率
         */
        BigDecimal completionRate
) {

}
