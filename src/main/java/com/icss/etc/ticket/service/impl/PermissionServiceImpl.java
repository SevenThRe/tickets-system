package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Permission;
import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.mapper.PermissionMapper;
import com.icss.etc.ticket.mapper.RoleMapper;
import com.icss.etc.ticket.service.PermissionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
}
