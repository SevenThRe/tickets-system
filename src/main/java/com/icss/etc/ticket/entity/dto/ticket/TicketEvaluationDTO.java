package com.icss.etc.ticket.entity.dto.ticket;

/**
 * {@code TicketEvaluationDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 工单评价DTO
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketEvaluationDTO {
    @NotNull(message = "工单ID不能为空")
    private Long ticketId;

    @NotNull(message = "评分不能为空")
    @Min(value = 1, message = "评分最小为1")
    @Max(value = 5, message = "评分最大为5")
    private Integer score;

    @NotBlank(message = "评价内容不能为空")
    private String content;

    @NotNull(message = "评价人不能为空")
    private Long evaluatorId;
}