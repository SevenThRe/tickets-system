package com.icss.etc.ticket.entity.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import lombok.Data; /**
 * {@code CloseTicketRequest}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */


@Data
public class ProcessTicketRequest {
    @NotBlank(message = "处理说明不能为空")
    private String note;
}