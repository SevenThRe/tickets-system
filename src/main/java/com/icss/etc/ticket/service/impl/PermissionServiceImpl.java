package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Permission;
import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.enums.Logical;
import com.icss.etc.ticket.mapper.PermissionMapper;
import com.icss.etc.ticket.mapper.RoleMapper;
import com.icss.etc.ticket.service.PermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * @program: tickets-system
 * @author: 刘屿薄
 * @create: 2025-01-08 23:22
 **/
@Service
@Slf4j
public class PermissionServiceImpl implements PermissionService {
    @Autowired
    private PermissionMapper permissionMapper;



    @Override
    public int insertPermission(Permission permission) {
        return permissionMapper.insertPermission(permission);
    }

    @Override
    public int updatePermission(Permission permission) {
        return permissionMapper.updatePermission(permission);
    }

    @Override
    public List<Permission> selectAllPermission() {
        return permissionMapper.selectAllPermission();
    }

    @Override
    public int deletePermission(Long permissionId) {
        return permissionMapper.deletePermission(permissionId);
    }

    @Override
    public boolean checkPermissions(String[] permissions, Long userId, Logical logical) {
        Set<String> userPermissions = permissionMapper.selectUserPermissions(userId);

        if (logical == Logical.AND) {
            return Arrays.stream(permissions).allMatch(userPermissions::contains);
        } else {
            return Arrays.stream(permissions).anyMatch(userPermissions::contains);
        }
    }

    @Override
    public boolean checkRoles(String[] roles, Long userId, Logical logical) {
        Set<String> userRoles = permissionMapper.selectUserRoles(userId);

        if (logical == Logical.AND) {
            return Arrays.stream(roles).allMatch(userRoles::contains);
        } else {
            return Arrays.stream(roles).anyMatch(userRoles::contains);
        }
    }
}
