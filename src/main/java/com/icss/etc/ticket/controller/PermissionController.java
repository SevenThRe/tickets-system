package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.Permission;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Role;
import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.entity.dto.RoleDTO;
import com.icss.etc.ticket.service.PermissionService;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * {@code PermissionMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/permissions")
public class PermissionController {
    @Autowired
    private PermissionService permissionService;

    //    //一个角色查询所有权限
//    List<Role2> OneRoleMorePermission();
//    //增加权限
//    int insertPermission(Permission permission);
//    //修改权限
//    int updatePermission(Permission permission);
//    //查询所有权限
//    List<Permission> selectAllPermission();
//    //删除权限
//    int deletePermission(@Param("permissionId") Long permissionId);
    @RequestMapping("/insertPermission")
    public R insertPermission(Permission permission) {
        int result = permissionService.insertPermission(permission);
        return result > 0 ? R.OK() : R.FAIL();
    }

    @RequestMapping("/updatePermission")
    public R updatePermission(Permission permission) {
        int result = permissionService.updatePermission(permission);
        return result > 0 ? R.OK() : R.FAIL();
    }

    @RequestMapping("/deletePermission/{permissionId}")
    public R deletePermission(@PathVariable("permissionId") Long permissionId) {
        int result = permissionService.deletePermission(permissionId);
        return result > 0 ? R.OK() : R.FAIL();
    }

    @RequestMapping("/selectAllPermission")
    public R selectAllPermission() {
        return R.OK(permissionService.selectAllPermission());
    }
}