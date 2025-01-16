package com.icss.etc.ticket.entity.dto.ticket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code CheckOperationDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckOperationDTO {
    private Long ticketId;
    private Long userId;
}
