package com.icss.etc.ticket.entity.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CloseTicketRequest {
    @NotBlank(message = "关闭说明不能为空")
    private String note;
}