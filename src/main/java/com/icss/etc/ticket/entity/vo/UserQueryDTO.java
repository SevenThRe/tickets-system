package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserQueryDTO {
    private Integer pageNum;
    private Integer pageSize;
    private String keyword;
    private Integer status;
    private Long departmentId;
    private String roleName;

}

