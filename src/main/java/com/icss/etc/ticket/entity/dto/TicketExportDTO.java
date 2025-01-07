package com.icss.etc.ticket.entity.dto;

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

    @ExcelColumn(value = "工单编号", index = 0, width = 20)
    private String ticketCode;

    @ExcelColumn(value = "标题", index = 1, width = 40)
    private String title;

    @ExcelColumn(value = "内容", index = 2, width = 60)
    private String content;

    @ExcelColumn(value = "部门", index = 3, width = 20)
    private String departmentName;

    @ExcelColumn(value = "处理人", index = 4, width = 20)
    private String processorName;

    @ExcelColumn(value = "状态", index = 5, width = 15)
    private String statusName;

    @ExcelColumn(value = "优先级", index = 6, width = 15)
    private String priorityName;

    @ExcelColumn(value = "创建时间", index = 7, width = 25)
    private LocalDateTime createTime;

    @ExcelColumn(value = "期望完成时间", index = 8, width = 25)
    private LocalDateTime expectFinishTime;

    @ExcelColumn(value = "实际完成时间", index = 9, width = 25)
    private LocalDateTime actualFinishTime;
}