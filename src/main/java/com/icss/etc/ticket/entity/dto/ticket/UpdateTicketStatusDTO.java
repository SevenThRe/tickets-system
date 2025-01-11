package com.icss.etc.ticket.entity.dto.ticket;

import com.icss.etc.ticket.enums.OperationType;
import com.icss.etc.ticket.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code UpdateTicketStatusDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateTicketStatusDTO {
    @NotNull(message = "工单ID不能为空")
    private Long ticketId;

    @NotNull(message = "工单状态不能为空")
    private TicketStatus status;

    @NotNull(message = "操作人不能为空")
    private Long operatorId;

    private String content; // 更新说明
}

