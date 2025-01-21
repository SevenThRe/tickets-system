package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.*;
import com.icss.etc.ticket.entity.dto.PermissionDTO;
import com.icss.etc.ticket.entity.dto.RPDTO;
import com.icss.etc.ticket.entity.dto.RoleDTO;
import com.icss.etc.ticket.service.PermissionService;
import jakarta.validation.Valid;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
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

    @RequestMapping("/deletePermission")
    public R deletePermission(RPDTO rpdto) {
        int result = permissionService.deletePermission(rpdto);
        return result > 0 ? R.OK() : R.FAIL();
    }

    @RequestMapping("/selectAllPermission")
    public R selectAllPermission(PermissionDTO permissionDTO) {
        return R.OK(permissionService.selectAllPermission(permissionDTO.keyword()));
    }

    @RequestMapping("/selectPermissionByPermissionId/{roleId}")
    public R selectPermissionByPermissionId(@PathVariable("roleId")Long roleId) {
        return R.OK(permissionService.selectPermissionByRoleId(roleId));
    }

    @RequestMapping("/addPermission")
    public R addPermission(RolePermission permission) {
        int result = permissionService.addPermission(permission);
        return result > 0 ? R.OK() : R.FAIL();
    }
}