package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * {@code UserController}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    /**
     * 获取所有用户名
     * @return 用户名列表
     */
    @GetMapping ("/usernames")
    public R getUsernames() {
        return R.OK(userService.getUsernames());
    }




}
