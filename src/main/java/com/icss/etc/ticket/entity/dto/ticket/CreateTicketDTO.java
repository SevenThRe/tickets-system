package com.icss.etc.ticket.entity.dto.ticket;

import com.icss.etc.ticket.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * {@code CreateTicketDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateTicketDTO {
    @NotNull(message = "工单类型不能为空")
    private Long typeId;              // 工单类型ID

    @NotBlank(message = "工单标题不能为空")
    private String title;             // 工单标题

    @NotBlank(message = "工单内容不能为空")
    private String content;           // 工单内容

    @NotNull(message = "处理部门不能为空")
    private Long departmentId;        // 处理部门ID

    private Priority priority;        // 优先级

    private LocalDateTime expectFinishTime; // 期望完成时间

    @NotNull(message = "创建人不能为空")
    private Long currentUserId;       // 当前用户ID
}
