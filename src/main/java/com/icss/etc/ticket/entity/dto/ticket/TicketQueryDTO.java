package com.icss.etc.ticket.entity.dto.ticket;

import com.icss.etc.ticket.enums.Priority;
import com.icss.etc.ticket.enums.TicketStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * {@code TicketQueryDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class TicketQueryDTO {
    private String keyword;
    private Long processorId;
    private Long departmentId;
    private Priority priority;
    private TicketStatus status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer pageNum = 1;
    private Integer pageSize = 10;

    @Data
    public static class ResolveTicketRequest {
        @NotBlank(message = "完成说明不能为空")
        private String note;
    }
}
