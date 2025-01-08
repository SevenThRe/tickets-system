package com.icss.etc.ticket.entity.dto;

/**
 * @program: tickets-system
 * @author: 刘屿薄
 *
 * 角色查询方法的传参
 * @create: 2025-01-08 21:56
 **/



public record RoleDTO(
        Integer pageSize,
        Integer pageNumber,
        String keyword
) {
}
