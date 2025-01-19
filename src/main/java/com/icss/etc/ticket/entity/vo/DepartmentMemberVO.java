package com.icss.etc.ticket.entity.vo;

import lombok.Data;

/**
 * {@code DepartmentMemberVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
public class DepartmentMemberVO {
    private Long userId;
    private String realName;
    private String roleName;
    private String processingEfficiency; // 处理效率等级
    private Integer satisfaction; // 满意度评分
}
