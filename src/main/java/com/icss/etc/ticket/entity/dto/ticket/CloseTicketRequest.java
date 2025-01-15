package com.icss.etc.ticket.entity.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CloseTicketRequest {
    @NotBlank(message = "关闭说明不能为空")
    private String content;
    @NotBlank(message = "操作ID不能为空")
    private Long operatorId;
    @NotNull(message = "工单ID不能为空")
    private Long tickedId;

}