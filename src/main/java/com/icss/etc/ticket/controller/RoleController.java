package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Role;
import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.entity.dto.RoleDTO;
import com.icss.etc.ticket.entity.vo.ChooseRolesVO;
import com.icss.etc.ticket.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @program: tickets-system
 * @author: 刘屿薄
 * @create: 2025-01-08 16:45
 **/

@RestController
@RequestMapping("/roles")
public class RoleController {
    @Autowired
    private RoleService roleService;

    /**
     * 新增角色
     * @param role 角色信息
     * @return  成功或失败
     */
    @RequestMapping("/insert")
    public R insert(Role role){
        int result=roleService.insert(role);
        return result>0?R.OK():R.FAIL();
    }

    /**
     * 根据角色id查询角色信息
     * @param roleId 角色id
     * @return  角色信息
     */
    @RequestMapping("/selectByByRoleId/{roleId}")
    public R selectDeptById(@PathVariable("roleId")Long roleId){
        return R.OK(roleService.selectByByRoleId(roleId));
    }

    /**
     * 更新角色信息
     * @param role 角色信息
     * @return  成功或失败
     */
    @RequestMapping("/updateRole")
    public R updateRole(Role role){
        int result=roleService.updateRole(role);
        return result>0?R.OK():R.FAIL();
    }

    /**
     *  根据角色名称查询角色信息
     * @param roleId  角色id
     * @return   角色信息
     */
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
    public R selectAllDept(RoleDTO roleDTO){
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
    @GetMapping("/role/list")
    public R selectAllRolesName(){
        List<ChooseRolesVO> chooseRolesVO = roleService.chooseRoles();
        return R.OK(chooseRolesVO);
    }


    /**
     * 根据角色名称查询角色信息
     * @param roleName  角色名称
     * @return  角色信息
     */
    @RequestMapping("/selectRoleByName/{roleName}")
    public R selectRoleByName(@PathVariable("roleName")String roleName){
        return R.OK(roleService.selectRoleByName(roleName));
    }

    /**
     * 查询所有角色
     * @return 所有角色信息
     */
    @RequestMapping("/OneRoleMorePermission")
    public R OneRoleMorePermission(){
        List<Role2> list = roleService.OneRoleMorePermission();
        return R.OK(list);
    }
}
