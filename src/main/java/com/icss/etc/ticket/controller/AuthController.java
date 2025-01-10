package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.dto.AuthDTO;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.service.UserService;
import com.icss.etc.ticket.util.JWTUtils;
import com.icss.etc.ticket.util.MD5Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public R register(@RequestBody RegisteredDTO user) {
        if(userService.selectByUsername(user.getUsername()) != null){
            return R.FAIL(CodeEnum.USERNAME_EXIST);
        }
        user.setPassword( MD5Util.getMD5(user.getPassword()));
        int result = userService.register(user);
        if (result > 0) {
            return R.OK("注册成功");
        } else {
            return R.FAIL(CodeEnum.REGISTER_FAILED);
        }
    }

    @RequestMapping("/login")
    public R login(@RequestBody AuthDTO user) {
        UserViewBackDTO u = userService.login(user.username());
        if (u != null && u.getPassword().equals(MD5Util.getMD5(user.password()))) {
            String token = JWTUtils.generToken(u.getUserId().toString(), "AuthToken", u.getPassword());
            Map<String, Object> map = new HashMap<>();
            map.put("token", token);
            u.setPassword("");
            map.put("userInfo", u);
            return R.OK(map);
        } else {
            return R.FAIL(CodeEnum.USERNAME_OR_PASSWORD_ERROR);
        }
    }

    @RequestMapping("/logout")
    public R logout(User user) {
        userService.logout(user);
        return R.OK("登出成功");
    }
}
