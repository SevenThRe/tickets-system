package com.icss.etc.ticket.entity.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;
import org.springframework.stereotype.Component;

/**
 * TODO 类作用描述
 *
 * @author 陈明
 * @Date 2025/1/14
 */
@Data
@Builder
public class DepartmentsQueryDTO{
    Long userId;
    @NotNull(message = "当前页码不能为空")
    Integer pageNum;
    @NotNull(message = "页码条数不能为空")
    Integer pageSize;
    String keyword;
    Integer workloadFilter;
    String performanceFilter;
    Long departmentId;
}
