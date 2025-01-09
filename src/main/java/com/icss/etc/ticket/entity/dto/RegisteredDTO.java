package com.icss.etc.ticket.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisteredDTO {
    private String username;
    private String password;
    private String realName;
    private String email;
    private String phone;
    private Long roleId;

}
