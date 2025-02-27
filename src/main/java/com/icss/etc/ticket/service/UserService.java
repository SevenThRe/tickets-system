package com.icss.etc.ticket.service;

import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.dto.DepartmentsQueryDTO;
import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.entity.dto.UserQueryDTO;
import com.icss.etc.ticket.entity.dto.user.UserCreateDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.vo.DeptMembersDetailVO;
import com.icss.etc.ticket.entity.vo.UserVO;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import org.apache.ibatis.annotations.Param;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

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
    List<DeptMemberVO> selectByDepartmentId(Long userId);
    List<DeptMemberVO> queryByDepartmentId(DepartmentsQueryDTO departmentsQueryDTO);

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

    /**
     * 更新用户头像
     * @param userId 用户ID
     * @param file  文件
     */
    void saveAvatar(MultipartFile file, Long userId, String username) throws IOException;

    int deleteUserFromDepartment(Long departmentId, Long userId);

    PageInfo<UserVO> selectAllUsersInfo(UserQueryDTO queryDTO);

    /**
     * 更改用户状态
     * @param userId 用户ID
     * @return 返回结果
     */
    int changeUserStatus(Long userId);

    int createANewUser(UserCreateDTO userCreateDTO);

    /**
     * 重置密码
     * @param userId 用户ID
     * @return 返回结果
     */
    int resetPassword(Long userId);

    /**
     * 更新用户信息
     *
     * @param userId
     * @param userViewBackDTO 用户信息DTO
     * @return 返回结果
     */
    int updateUserInfo(Long userId, UserViewBackDTO userViewBackDTO);

    /**
     * 根据部门ID查询成员
     * @param departmentId 部门ID
     * @return 员工列表
     */
    List<UserVO> getDeptMembersInDept( Long departmentId);

    List<UserVO> searchUser(String keyword);

    /**
     * 添加部门成员
     * @param map 部门成员信息
     * @return 返回结果
     */
    Integer addMembers(Map<String, Object> map);

    DeptMembersDetailVO getDeptMemberDetial(Long userId);

    List<User> selectDepartmentProcessors(@Param("departmentId") Long departmentId);

}
