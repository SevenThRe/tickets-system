package com.icss.etc.ticket.entity.dto.ticket;

import lombok.Data;

import java.math.BigDecimal;

/**
 * {@code TicketTypeStatsDTOS}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class TicketTypeStatsDTOS {
    private String typeName;        // 类型名称
    private Long count;             // 数量
    private BigDecimal percentage;  // 占比
}
