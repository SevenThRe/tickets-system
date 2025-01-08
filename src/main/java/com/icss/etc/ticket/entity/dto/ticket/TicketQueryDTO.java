package com.icss.etc.ticket.entity.dto.ticket;

import java.time.LocalDateTime;

/**
 * {@code TicketQueryDTO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
public record TicketQueryDTO(
        /*
         * 关键字搜索
         */
        String keyword,
        /*
         * 状态筛选
         */
        Integer status,
        /*
         * 优先级筛选
         */
        Integer priority,
        /*
         * 部门筛选
         */
        Long departmentId,
        /*
         * 处理人筛选
         */
        Long processorId,
        /*
         * 开始时间筛选
         */
        LocalDateTime startTime,
        /*
         * 结束时间筛选
         */
        LocalDateTime endTime,

        /*
         * 当前页
         */
        Integer pageNum,

        /*
         * 每页条数
         */
        Integer pageSize


)
{


}
