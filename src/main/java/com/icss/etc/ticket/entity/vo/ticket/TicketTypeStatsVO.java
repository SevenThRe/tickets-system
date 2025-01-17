package com.icss.etc.ticket.entity.vo.ticket;

import lombok.Data;

/**
 * {@code TicketTypeStatsVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class TicketTypeStatsVO {
    private String typeName;    // 类型名称
    private Long count;         // 数量
    private Double proportion;  // 占比
}
