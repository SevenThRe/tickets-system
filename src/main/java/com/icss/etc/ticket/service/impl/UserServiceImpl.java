package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.mapper.UserMapper;
import com.icss.etc.ticket.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class UserServiceImpl implements UserService{
    @Autowired
    private UserMapper userMapper;
    @Override
    public int register(RegisteredDTO user) {
        return userMapper.register(user);
    }

    @Override
    public User login(String username) {
        User login = userMapper.login(username);
        log.info(this.getClass().getSimpleName()+ "user login :" + username);
        return login;
    }

    @Override
    public List<DeptMemberVO> selectByDepartmentId(Long departmentId) {
        return userMapper.selectByDepartmentId(departmentId);
    }


    public Integer addUser(List<DeptMemberDTO> deptMemberDTO){
        for(DeptMemberDTO dto : deptMemberDTO){

        }
        return userMapper.batchaddUserToDept(deptMemberDTO);
    }

    public Integer deleteUser(DeptMemberDTO deptMemberDTO){
        return userMapper.deleteUser(deptMemberDTO);
    }

    @Override
    public void logout(User user) {
        log.info(this.getClass().getSimpleName()+ "user logout :" + user.getUsername());
        // TODO: logout logic
    }



}