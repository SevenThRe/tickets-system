package com.icss.etc.ticket.entity.vo;

import com.icss.etc.ticket.entity.Department;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * {@code DepartmentDetailVO}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DepartmentDetailVO {
    private List<DepartmentChargeVO> charge;
    private Department department;
}
