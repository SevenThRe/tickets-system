package com.icss.etc.ticket.entity.dto.ticket;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * {@code RecentTicketDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class RecentTicketDTO {
    private Date date;
    private Long created;
    private BigDecimal completed;
}
