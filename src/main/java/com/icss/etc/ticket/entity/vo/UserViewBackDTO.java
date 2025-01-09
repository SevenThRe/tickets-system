package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserViewBackDTO {
    private String userName;
    private Long userId;
    private String realName;
    private String phone;
    private String departmentName;
    private String roleName;
}
