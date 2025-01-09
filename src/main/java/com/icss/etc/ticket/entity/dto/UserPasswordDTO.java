package com.icss.etc.ticket.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPasswordDTO {
    private Long userId;
    private String oldPassword;
    private String newPassword;
}

