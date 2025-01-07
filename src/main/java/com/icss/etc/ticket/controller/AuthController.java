package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.dto.AuthDTO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public R register(@RequestBody RegisteredDTO user) {
        if(userService.login(user.username())!=null){
            return R.FAIL(CodeEnum.USERNAME_EXIST);
        }
        int result = userService.register(user);
        if (result > 0) {
            return R.OK("注册成功");
        } else {
            return R.FAIL(CodeEnum.REGISTER_FAILED);
        }
    }

    @RequestMapping("/login")
    public R login(@RequestBody AuthDTO user) {
        User u = userService.login(user.username());
        if (u != null && u.getPassword().equals(user.password())) {
            return R.OK();
        } else {
            return R.FAIL(CodeEnum.USERNAME_OR_PASSWORD_ERROR);
        }
        //jwt产生token
//        String token= JWTUtils.generToken("AccessToken",a.getAdmin_name(),a.getAdmin_pass());
//        return Result.ok("登录成功",token);
    }
}
