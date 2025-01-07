package com.icss.etc.ticket.entity.dto;

import cn.hutool.poi.excel.annotation.ExcelColumn;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 工单导出数据传输对象
 * 使用FastExcel进行导出
 *
 * @author SeventhRe
 * @version 1.0
 */
@Data
public class TicketExportDTO {

    @ExcelColumn(value = "工单编号", order = 0)
    private String ticketCode;

    @ExcelColumn(value = "标题", order = 1)
    private String title;

    @ExcelColumn(value = "内容", order = 2)
    private String content;

    @ExcelColumn(value = "部门", order = 3)
    private String departmentName;

    @ExcelColumn(value = "处理人", order = 4)
    private String processorName;

    @ExcelColumn(value = "状态", order = 5)
    private String statusName;

    @ExcelColumn(value = "优先级", order = 6)
    private String priorityName;

    @ExcelColumn(value = "创建时间", order = 7, format = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime;

    @ExcelColumn(value = "期望完成时间", order = 8, format = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expectFinishTime;

    @ExcelColumn(value = "实际完成时间", order = 9, format = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime actualFinishTime;
}
