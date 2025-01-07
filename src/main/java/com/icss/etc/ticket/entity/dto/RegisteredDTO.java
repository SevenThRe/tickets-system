package com.icss.etc.ticket.entity.dto;

public record RegisteredDTO(
        String username,
        String password,
        String real_name,
        Long department_id,
        String email,
        String phone,
        Long position_id) {
}
