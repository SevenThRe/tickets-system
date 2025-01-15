package com.icss.etc.ticket.entity.vo;

import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.enums.Priority;
import com.icss.etc.ticket.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * {@code TicketDetailVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketDetailVO {
    // 基本信息
    private Long ticketId;
    private String title;
    private String content;

    // 类型信息
    private Long typeId;
    private String typeName;

    // 部门信息
    private Long departmentId;
    private String departmentName;

    // 处理人信息
    private Long processorId;
    private String processorName;

    // 创建/更新信息
    private Long createBy;
    private String creatorName;
    private Long updateBy;
    private String updaterName;

    // 状态信息
    private TicketStatus status;
    private Priority priority;

    // 时间信息
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private LocalDateTime expectFinishTime;
    private LocalDateTime actualFinishTime;

    // 处理记录
    private List<TicketRecordVO> records;
}