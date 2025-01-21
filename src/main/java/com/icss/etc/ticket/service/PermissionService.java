package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.Permission;
import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.entity.RolePermission;
import com.icss.etc.ticket.entity.dto.RPDTO;
import com.icss.etc.ticket.enums.Logical;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * {@code PermissionMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface PermissionService {

    //增加权限
    int insertPermission(Permission permission);
    //修改权限
    int updatePermission(Permission permission);
    //查询所有权限
    List<Permission> selectAllPermission(@Param("keyword") String keyword);
    //删除权限
    int deletePermission(RPDTO rpdto);
    /**
     * 根据roleID查询权限
     */
    List<Permission> selectPermissionByRoleId(@Param("roleId")Long roleId);

    /**
     * 检查权限
     * @param permissions 权限列表
     * @param userId     用户ID
     * @param logical  逻辑运算符
     * @return 是否有权限
     */
    boolean checkPermissions(String[] permissions, Long userId, Logical logical);

    /**
     * 查询所有角色
     * @param roles     角色列表
     * @param userId    用户ID
     * @param logical  逻辑运算符
     * @return 是否有权限
     */
    boolean checkRoles(String[] roles, Long userId, Logical logical);

    int addPermission(RolePermission permission);
}