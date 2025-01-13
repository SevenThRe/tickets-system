package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code TodoStatsVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoStatsVO {
    private Integer pendingCount;      // 待处理数量
    private Integer processingCount;   // 处理中数量
    private Integer todayCompleted;    // 今日完成数量
}