package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.mapper.UserMapper;
import com.icss.etc.ticket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserMapper userMapper;
    @Override
    public int register(RegisteredDTO user) {
        return userMapper.register(user);
    }

    @Override
    public User login(String username) {
        return userMapper.login(username);
    }
}