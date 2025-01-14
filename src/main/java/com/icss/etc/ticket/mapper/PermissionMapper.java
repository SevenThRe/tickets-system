package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Permission;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import com.icss.etc.ticket.entity.Role2;
import org.apache.ibatis.annotations.Param;

/**
 * {@code PermissionMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface PermissionMapper {

    //增加权限
    int insertPermission(Permission permission);
    //修改权限
    int updatePermission(Permission permission);
    //查询所有权限
    List<Permission> selectAllPermission(@Param("keyword") String keyword);
    //删除权限
    int deletePermission(@Param("permissionId") Long permissionId);
    //根据permissionId查询所有权限
    List<Permission> selectPermissionByRoleId(@Param("roleId")Long roleId);
    Set<String> selectUserPermissions(Long userId);

    Set<String> selectUserRoles(Long userId);
}