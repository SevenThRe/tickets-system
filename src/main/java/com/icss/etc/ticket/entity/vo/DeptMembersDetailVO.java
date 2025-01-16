package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TODO 类作用描述
 *
 * @author 陈明
 * @Date 2025/1/16
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeptMembersDetailVO {
    private Long userId;
    private String realName;
    private String email;
    private String phone;
    private Integer status;
    private String roleName;
    /**
     * 当前工作量
     */
    private Integer currentWorkload;

    /**
     * 处理效率
     */
    private String processingEfficiency;

    /**
     * 平均用时（以小时为单位）
     */
    private Double averageProcessingTime;

    /**
     * 满意度
     */
    private Double satisfaction;

    /**
     * 本月绩效
     */
    private Integer monthlyPerformance;
}
