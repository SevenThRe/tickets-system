package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.annotation.RequirePermissions;
import com.icss.etc.ticket.annotation.RequireRoles;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Role;
import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.entity.dto.RoleDTO;
import com.icss.etc.ticket.entity.vo.ChooseRolesVO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.service.RoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @program: tickets-system
 * @author: 刘屿薄
 * @create: 2025-01-08 16:45
 **/

@Slf4j
@RestController
@RequestMapping("/roles")
@RequireRoles("ADMIN")
public class RoleController {
    @Autowired
    private RoleService roleService;

    /**
     * 新增角色
     * @param role 角色信息
     * @return  成功或失败
     */
    @RequirePermissions("role:create")
    @RequestMapping("/insert")
    public R insert(Role role){
        int result=roleService.insert(role);
        return result>0?R.OK():R.FAIL(CodeEnum.ROLE_ISEXIST);
    }

    /**
     * 根据角色id查询角色信息
     * @param roleId 角色id
     * @return  角色信息
     */
    @RequirePermissions("role:view")
    @RequestMapping("/selectByByRoleId/{roleId}")
    public R selectDeptById(@PathVariable("roleId")Long roleId){
        return R.OK(roleService.selectByByRoleId(roleId));
    }

    /**
     * 更新角色信息
     * @param role 角色信息
     * @return  成功或失败
     */
    @RequirePermissions("role:update")
    @RequestMapping("/updateRole")
    public R updateRole(Role role){
        System.out.println(role);
        int result=roleService.updateRole(role);
        return result>0?R.OK():R.FAIL();
    }

    /**
     *  根据角色名称查询角色信息
     * @param roleId  角色id
     * @return   角色信息
     */
    @RequirePermissions("role:delete")
    @RequestMapping("/deleteByRoleId/{roleId}")
    public R deleteByRoleId(@PathVariable("roleId")Long roleId){
        int result = roleService.deleteByRoleId(roleId);
        return result>0?R.OK():R.FAIL();
    }

    /**
     * 查询所有角色
     * @param roleDTO 角色信息
     * @return 所有角色信息
     */
    @RequestMapping("/selectAll")
    public R selectAll(RoleDTO roleDTO){
        PageHelper.startPage(roleDTO.pageNumber(),roleDTO.pageSize(),true);
        List<Role> list = roleService.selectAll(roleDTO.keyword());
        PageInfo<Role> pageInfo=new PageInfo<>(list);
        Map<String,Object> map=new HashMap<>();
        map.put("list",list);
        map.put("total",pageInfo.getPages());
        return R.OK(map);
    }
    /**
     * 回显角色下拉列表
     * @return 所有角色信息
     */
    @GetMapping("/list")
    public R selectAllRolesName(){
        List<ChooseRolesVO> chooseRolesVO = roleService.chooseRoles();
        return R.OK(chooseRolesVO);
    }


    /**
     * 根据角色名称查询角色信息
     * @param roleName  角色名称
     * @return  角色信息
     */


    /**
     * 查询所有角色
     * @return 所有角色信息
     */
    @RequestMapping("/OneRoleMorePermission")
    public R OneRoleMorePermission(){
        List<Role2> list = roleService.OneRoleMorePermission();
        return R.OK(list);
    }

    @RequestMapping("/selectByRoleId/{roleId}")
    public R selectByRoleId(@PathVariable("roleId")Long roleId){
        Role2 role2 = roleService.selectByRoleId(roleId);
        return R.OK(role2);
    }
//    @RequestMapping("/deletePermissionByRoleId/{permissionId}")
//    public R deletePermissionByRoleId(@PathVariable("permissionId")Long permissionId){
//        int result = roleService.deletePermissionByRoleId(permissionId);
//        return result>0?R.OK():R.FAIL();
//    }
}
