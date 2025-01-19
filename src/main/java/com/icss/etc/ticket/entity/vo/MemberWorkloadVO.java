package com.icss.etc.ticket.entity.vo;

import lombok.Data;

/**
 * {@code MemberWorkloadVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class MemberWorkloadVO {
    private Long userId;
    private Integer currentCount;    // 当前工作量
    private Integer completedCount;  // 已完成数
    private String efficiencyGrade;  // 效率等级
    private Double avgSatisfaction;  // 平均满意度
}