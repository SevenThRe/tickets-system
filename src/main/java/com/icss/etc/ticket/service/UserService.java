package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;

import java.util.List;

public interface UserService {
    //  注册
    int register(RegisteredDTO user);

    //登陆
    User login(String username);

    // TODO:修改密码

    // TODO:忘记密码

    // TODO:修改个人信息

    // TODO:修改头像

    // TODO:修改密码

    // TODO:获取用户信息

    // TODO:获取用户列表

    // TODO:获取部门成员列表
    List<DeptMemberVO> selectByDepartmentId(Long departmentId);

    /**
     * 添加部门成员
     * @param deptMemberDTO 部门成员DTO
     * @return 返回结果
     */
    Integer addUser(DeptMemberDTO deptMemberDTO);

    /**
     * 删除部门成员
     * @param deptMemberDTO 部门成员DTO
     * @return 返回结果
     */
    Integer deleteUser(DeptMemberDTO deptMemberDTO);

    void logout(User user);

    List<String> getUsernames();
}
