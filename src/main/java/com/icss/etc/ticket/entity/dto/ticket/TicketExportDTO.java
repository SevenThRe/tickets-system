package com.icss.etc.ticket.entity.dto.ticket;

import com.icss.etc.ticket.annotation.ExcelColumn;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工单导出数据传输对象
 * 使用@ExcelColumn注解配置导出列信息
 *
 * @author SeventhRe
 * @version 1.0
 */
@Data
public class TicketExportDTO {
    private String ticketCode;
    private String title;
    private String content;
    private String departmentName;
    private String processorName;
    private String statusName;
    private String priorityName;
    private LocalDateTime createTime;
    private LocalDateTime expectFinishTime;
    private LocalDateTime actualFinishTime;
}