package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;

public interface UserService {
    //  注册
    int register(RegisteredDTO user);

    //登陆
    User login(String username);
}
