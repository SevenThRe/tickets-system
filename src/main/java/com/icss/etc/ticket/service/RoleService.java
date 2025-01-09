package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.Role;
import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.entity.vo.ChooseRolesVO;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * {@code RoleMapper}
 * 角色增删改查
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface RoleService {
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

    /**
     * update record
     * 修改角色
     * @param role the updated record
     * @return update count
     */
    int updateRole(Role role);

    //查询所有角色
    List<Role> selectAll(String keyword);

    //根据roleId删除角色
    int deleteByRoleId(@Param("roleId") Long roleId);



    //一个角色查询所有权限
    List<Role2> OneRoleMorePermission();

    List<ChooseRolesVO> chooseRoles();
}
