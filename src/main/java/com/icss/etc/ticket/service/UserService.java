package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import org.apache.ibatis.annotations.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface UserService {
    //  注册
    int register(RegisteredDTO user) ;

    //登陆
    UserViewBackDTO login(String username);

    User selectByPrimaryKey(@Param("user_id") Long user_id);


    UserViewBackDTO selectUserInfo (@Param("user_id") Long user_id);

    // TODO:修改密码
    int updateByPrimaryKey(UserPasswordDTO record);


    // TODO:忘记密码

    // TODO:修改个人基本信息
    int updateByPrimaryKeySelective(User record);


    // TODO:修改头像

    // TODO:修改密码

    // TODO:获取用户信息
    User getUserInfo(Long userId);
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

    User selectByUsername(String username);

    /**
     * 查询用户权限
     * @param userId 用户ID
     * @return 用户权限
     */
    String[] selectUserPermissions(Long userId);
}
