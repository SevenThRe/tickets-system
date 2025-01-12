package com.icss.etc.ticket.entity.dto.ticket;

import com.icss.etc.ticket.enums.OperationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AddTicketRecordDTO {
    @NotNull(message = "工单ID不能为空")
    private Long ticketId;

    @NotNull(message = "操作人不能为空")
    private Long operatorId;

    @NotNull(message = "操作类型不能为空")
    private OperationType operationType;

    @NotBlank(message = "处理内容不能为空")
    private String content;
}
