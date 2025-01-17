package com.icss.etc.ticket.entity.vo.ticket;

import lombok.Data;

/**
 * {@code TicketTrendVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

@Data
public class TicketTrendVO {
    private String date;        // 日期
    private Long newCount;      // 新建数量
    private Long completedCount; // 完成数量
}

