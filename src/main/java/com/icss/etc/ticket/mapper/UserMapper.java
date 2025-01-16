package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.dto.DepartmentsQueryDTO;
import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.entity.dto.UserQueryDTO;
import com.icss.etc.ticket.entity.dto.user.UserCreateDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;

import java.util.List;
import java.util.Map;

import com.icss.etc.ticket.entity.vo.UserVO;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import org.apache.ibatis.annotations.Param;

/**
 * {@code UserMapper} 
 *
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
    
public interface UserMapper {

    //  注册
    int register(RegisteredDTO user);

    //登陆
    Long login(@Param("username") String username);

    User selectByPrimaryKey(@Param("user_id") Long user_id);

    UserViewBackDTO selectUserInfo(@Param("user_id") Long user_id);

    /**
     * insert record to table
     * @param record the record
     * @return insert count
     */
    int insert(User record);

    /**
     * insert record to table selective
     * @param record the record
     * @return insert count
     */
    int insertSelective(User record);

    /**
     * select by primary key
     * @param user_id primary key
     * @return object by primary key
     */

    /**
     * update record selective
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(User record);

    /**
     * update record
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(UserPasswordDTO record);

    List<User> selectByAll(User user);

    int updateBatchSelective(@Param("list") List<User> list);

    int batchInsert(@Param("list") List<User> list);

    /**
     * 根据部门ID查询用户列表
     * @param departmentId 部门ID
     * @return 用户列表
     */
    List<DeptMemberVO> selectByDepartmentId(Long departmentId);


    List<DeptMemberVO> queryByDepartmentId(DepartmentsQueryDTO departmentsQueryDTO);


    /**
     * 根据部门ID和用户ID添加用户
     * @param deptMemberDTO 部门ID和用户ID
     * @return  添加结果
     */
    Integer addUser(DeptMemberDTO deptMemberDTO);

    /**
     * 根据部门ID和用户ID删除用户
     * @param deptMemberDTO 部门ID和用户ID
     * @return  删除结果
     */
    Integer deleteUser(DeptMemberDTO deptMemberDTO);

    /**
     * 获取所有用户名
     * @return 用户名列表
     */
    List<String> getUsernames();

    User getUserInfo(Long userId);

    User selectByUsername(String username);

    String[] selectUserPermissions(Long userId);

    List<User> selectOnlineProcessorsByDepartment(Long departmentId);

    Long selectDepartmentId(Long userId);

    int deleteUserFromDepartment(Long userId);

    List<UserVO> selectAllUsersInfo(@Param("queryDTO") UserQueryDTO queryDTO);

    int changeUserStatus(Long userId);

    /**
     * 创建新用户
     * @param user 用户信息
     * @return 创建结果
     */
    int createANewUser(UserCreateDTO user);

    int resetPassword(@Param("userId") Long userId, @Param("password") String password);

    /**
     * 更新用户信息
     * @param userViewBackDTO 用户信息
     * @return 更新结果
     */
    int updateUserInfo(@Param("userId") Long userId, @Param("dto") UserViewBackDTO userViewBackDTO);


    /**
     * 根据部门ID查询部门处理人
     * @param departmentId 部门ID
     * @return 处理人列表
     */
    List<User> selectDepartmentProcessors(@Param("departmentId") Long departmentId);

    /**
     * 根据部门ID查询部门成员
     * @param departmentId 部门ID
     * @return 部门成员列表
     */
    List<UserVO> getDeptMembersInDept(Long departmentId);

    /**
     * 通过关键词 检索用户
     * @param keyword 关键词
     * @return 用户列表
     */
    List<UserVO> searchUser(@Param("keyword") String keyword);

    Integer addMembers(Map<String, Object> map);
}