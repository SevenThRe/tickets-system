package com.icss.etc.ticket.entity.vo.ticket;

import lombok.Data;

/**
 * {@code SystemOverviewVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class SystemOverviewVO {
    private Long totalUsers;        // 总用户数
    private Long totalDepartments;  // 总部门数
    private Long totalTickets;      // 总工单数
    private Long onlineUsers;       // 在线用户数
}
