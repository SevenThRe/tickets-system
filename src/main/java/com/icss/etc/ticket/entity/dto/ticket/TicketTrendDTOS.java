package com.icss.etc.ticket.entity.dto.ticket;

import lombok.Data;

import java.time.LocalDate;

/**
 * {@code TicketTrendDTOS}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class TicketTrendDTOS {
    private LocalDate date;         // 日期
    private Long created;           // 新建数量
    private Long completed;         // 完成数量
}
