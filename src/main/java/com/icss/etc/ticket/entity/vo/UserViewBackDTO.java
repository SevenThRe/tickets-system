package com.icss.etc.ticket.entity.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserViewBackDTO {
    private String username;
    private Long userId;
    private String realName;
    private String phone;
    private String departmentName;
    private String email;
    private Integer status;
    private LocalDateTime createTime;
    private String roleName;
    private String password;
    private String baseRoleCode;
}
