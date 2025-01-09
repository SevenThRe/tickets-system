package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Role;
import com.icss.etc.ticket.entity.Role2;
import com.icss.etc.ticket.entity.vo.ChooseRolesVO;
import com.icss.etc.ticket.mapper.RoleMapper;
import com.icss.etc.ticket.service.RoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @program: tickets-system
 * @author: 刘屿薄
 * @create: 2025-01-08 13:54
 **/
@Service
@Slf4j
public class RoleServiceImpl implements RoleService {
    @Autowired
    private RoleMapper roleMapper;

    @Override
    public int insert(Role role) {
        return roleMapper.insert(role);
    }

    @Override
    public Role selectByByRoleId(Long roleId) {
        return roleMapper.selectByByRoleId(roleId);
    }

    @Override
    public int updateRole(Role role) {
        return roleMapper.updateRole(role);
    }

    @Override
    public List<Role> selectAll(String keyword) {
        return roleMapper.selectAll(keyword);
    }

    @Override
    public int deleteByRoleId(Long roleId) {
        return roleMapper.deleteByRoleId(roleId);
    }


    @Override
    public List<Role2> OneRoleMorePermission() {
        return roleMapper.OneRoleMorePermission();
    }

    @Override
    public List<ChooseRolesVO> chooseRoles() {
        return roleMapper.chooseRoles();
    }
}
