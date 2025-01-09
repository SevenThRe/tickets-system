package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.service.UserService;
import com.icss.etc.ticket.util.MD5Util;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

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

    /**
     * 回显用户个人信息
     * @param user_id  用户ID
     * @return UserViewBackDTO
     */
    @RequestMapping("/current")
    public R selectUserInfo(Long user_id) {
        return R.OK(userService.selectUserInfo(user_id));
    }


//    修改密码
    @PutMapping("/password")
    public R updatePassword(UserPasswordDTO record) {
        User u= userService.selectByPrimaryKey(record.getUserId());
        if (u == null){
            return R.FAIL(CodeEnum.UNKNOW_USER);
        }
        if(record.getNewPassword().equals(record.getOldPassword())){return R.FAIL(CodeEnum.PASSWORD_SAME);}
        String userOldPassword = MD5Util.getMD5(record.getOldPassword());
        assert userOldPassword != null;
        if(userOldPassword.equals(u.getPassword())){
          record.setNewPassword(MD5Util.getMD5(record.getNewPassword()));
          return userService.updateByPrimaryKey(record) > 0 ? R.OK() : R.FAIL(CodeEnum.UPDATE_FAILED);
      }else{
          return R.FAIL(CodeEnum.PASSWORD_ERROR);
      }
    }


}
