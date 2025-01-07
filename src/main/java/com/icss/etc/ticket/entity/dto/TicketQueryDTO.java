package com.icss.etc.ticket.entity.dto;

import java.time.LocalDateTime;

/**
 * {@code TicketQueryDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public record TicketQueryDTO(
        String keyword,
        Integer status,
        Integer priority,
        Long departmentId,
        Long processorId,
        LocalDateTime startTime,
        LocalDateTime endTime
) {
}
