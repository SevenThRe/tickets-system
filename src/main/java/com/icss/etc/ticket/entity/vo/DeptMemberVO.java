package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * {@code DeptMemberVO} 部门成员数据传输对象
 * 用于 department-management.html 页面的部门成员管理功能
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeptMemberVO {

    /**
     * 工号
     */
    private Long userId;

    /**
     * 姓名
     */
    private String realName;

//    /**
//     * 邮箱
//     */
//    private String email;

    /**
     * 状态
     */
    private Integer status;

    /**
     * 职位
     */
    private String roleName;

    /**
     * 当前工作量
     */
    private Integer currentWorkload = 0;

    /**
     * 处理效率
     */
    private String processingEfficiency ="0";

    /**
     * 平均用时（以小时为单位）
     */
    private Double averageProcessingTime=0.0;

    /**
     * 满意度
     */
    private Double satisfaction=0.0;

    /**
     * 本月绩效
     */
    private Integer monthlyPerformance=0;


    /**
     * 更新用户的状态
     *
     * @param newStatus 新的状态值
     */
//    public void updateStatus(Integer newStatus) {
//        this.status = newStatus;
//    }


}