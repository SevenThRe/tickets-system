package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Permission;
import com.icss.etc.ticket.entity.Role;

import java.time.LocalDateTime;
import java.util.List;

import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.entity.dto.PermissionDTO;
import com.icss.etc.ticket.entity.vo.ChooseRolesVO;
import org.apache.ibatis.annotations.Param;

/**
 * {@code RoleMapper}
 * 角色增删改查
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface RoleMapper {
    /**
     * insert record to table
     * 添加角色
     * @param role the record
     * @return insert count
     */
    int insert(Role role);

    /**
     * select by primary key
     * 根据roleId查询角色
     * @param roleId primary key
     * @return object by primary key
     */
    Role selectByByRoleId(@Param("roleId") Long roleId);
    Role2 selectByRoleId(@Param("roleId") Long roleId);
    /**
     * update record
     * 修改角色
     * @param role the updated record
     * @return update count
     */
    int updateRole(Role role);

    //查询所有角色
    List<Role> selectAll(@Param("keyword") String keyword);

    //根据roleId删除角色
    int deleteByRoleId(@Param("roleId") Long roleId);

//    //根据id删除权限
//    int deletePermissionByRoleId(@Param("permissionId") Long permissionId);
    //一个角色查询所有权限
    List<Permission> OneRoleMorePermission(@Param("p") PermissionDTO permissionDTO);

    List<ChooseRolesVO> chooseRoles();


}
