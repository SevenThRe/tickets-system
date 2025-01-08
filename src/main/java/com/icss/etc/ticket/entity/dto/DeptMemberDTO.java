package com.icss.etc.ticket.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * {@code DeptMemberDTO}
 * 用于部门成员管理功能 增加部门成员 删除部门成员
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeptMemberDTO {
    private Long departmentId;
    private Long userId;
}
