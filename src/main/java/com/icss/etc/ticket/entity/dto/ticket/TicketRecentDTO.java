package com.icss.etc.ticket.entity.dto.ticket;

import com.icss.etc.ticket.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.apache.tomcat.util.http.parser.Priority;

import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRecentDTO {
    private Long ticketId;
    private String title;
    private Long createBy;
    private TicketStatus status;
    private Priority priority;
    private LocalDateTime createTime;
    private Integer pageSize;
    private Integer pageNum;

}
