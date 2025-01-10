package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.UserRole;
import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.vo.UserQueryDTO;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import com.icss.etc.ticket.mapper.UserMapper;
import com.icss.etc.ticket.mapper.UserRoleMapper;
import com.icss.etc.ticket.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class UserServiceImpl implements UserService{
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int register(RegisteredDTO user)  {
        int count =0;
        try {
            count = userMapper.register(user);
            log.info(this.getClass().getSimpleName()+ "user register :" + user.getUsername() + " count: " + count);
            //TODO: 将用户信息写入到T USER_ROLE表中
            Long userId = userMapper.login(user.getUsername());
            count += userRoleMapper.insert(new UserRole(userId, user.getRoleId()));
            if (count != 2) {
                throw new RuntimeException("register failed");
            }
        } catch (Exception ignored) {
            log.error(this.getClass().getSimpleName()+ "user register failed :" + user.getUsername());
            throw ignored;
        }
        return count;
    }



    @Override
    public UserViewBackDTO login(String username) {
        Long userId = userMapper.login(username);
        log.info(this.getClass().getSimpleName()+ "user login :" + username + " userId: " + userId);
        return this.selectUserInfo(userId);
    }


    @Override
    public User selectByPrimaryKey(Long user_id) {
        return userMapper.selectByPrimaryKey(user_id);
    }

    @Override
    public UserViewBackDTO selectUserInfo(Long user_id) {
        UserViewBackDTO userViewBackDTO = userMapper.selectUserInfo(user_id);
        return userViewBackDTO;
    }
//
//    public List<UserViewBackDTO> selectUserInfo1(UserQueryDTO userQueryDTO) {
//        return userMapper.selectUserInfo1(userQueryDTO);
//    }

    //修改密码
    @Override
    public int updateByPrimaryKey(UserPasswordDTO record) {
        return userMapper.updateByPrimaryKey(record);
    }

    //修改个人基本信息
    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateByPrimaryKeySelective(User record) {
        if (record == null || record.getUserId() == null) {
            log.warn("Invalid user record for update: {}", record);
            throw new IllegalArgumentException("User record or userId cannot be null");
        }
        // Log before update
        log.info("Updating user with id: {}", record.getUserId());

        int result = userMapper.updateByPrimaryKeySelective(record);

        // Log after update
        if (result > 0) {
            log.info("Successfully updated user with id: {}", record.getUserId());
        } else {
            log.warn("Failed to update user with id: {}", record.getUserId());
        }

        return result;
    }

    @Override
    public User getUserInfo(Long userId) {
        return userMapper.getUserInfo(userId);
    }

    @Override
    public List<DeptMemberVO> selectByDepartmentId(Long departmentId) {
        return userMapper.selectByDepartmentId(departmentId);
    }


    public Integer addUser(DeptMemberDTO deptMemberDTO){
        return userMapper.addUser(deptMemberDTO);
    }

    public Integer deleteUser(DeptMemberDTO deptMemberDTO){
        return userMapper.deleteUser(deptMemberDTO);
    }

    @Override
    public void logout(User user) {
        log.info(this.getClass().getSimpleName()+ "user logout :" + user.getUsername());
        // TODO: logout logic
    }

    @Override
    public List<String> getUsernames() {
        return userMapper.getUsernames();
    }

    @Override
    public User selectByUsername(String username) {
        return userMapper.selectByUsername(username);
    }

    @Override
    public List<UserViewBackDTO> selectUserInfo1(UserQueryDTO userQueryDTO) {
        return userMapper.selectUserInfo1(userQueryDTO);
    }


}