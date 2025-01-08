package com.icss.etc.ticket.entity.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransferTicketRequest {
    @NotNull(message = "部门ID不能为空")
    private Long departmentId;

    @NotNull(message = "操作人不能为空")
    private Long updateBy;

    @NotBlank(message = "转交说明不能为空")
    private String note;
}
