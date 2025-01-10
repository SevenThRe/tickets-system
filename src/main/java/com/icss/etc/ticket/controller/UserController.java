package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
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
     * 获取处理人列表
     * @param departmentId 部门ID
     * @return 用户ID列表
     */
    @GetMapping("/selectByDepartmentId/{department_id}")
    public R<List<DeptMemberVO>> selectByDepartmentId(@PathVariable("department_id") Long departmentId) {
        return R.OK(userService.selectByDepartmentId(departmentId));
    }

    /**
     * 获取用户信息
     * @param userId 用户ID
     * @return 用户信息
     */
    @GetMapping("/{userId}/info")
    public R getUserInfo(@PathVariable("userId") Long userId) {
        return R.OK(userService.selectUserInfo(userId));
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
        //用户是否存在
        if (u == null){return R.FAIL(CodeEnum.UNKNOW_USER);}
        //验证旧密码是否正确
        String userOldPassword = MD5Util.getMD5(record.getOldPassword());
        assert userOldPassword!= null;
        if (!userOldPassword.equals(u.getPassword())){return R.FAIL(CodeEnum.PASSWORD_ERROR);}

        // 验证新密码是否与旧密码相同
        if (record.getNewPassword().equals(record.getOldPassword())) {
            return R.FAIL(CodeEnum.PASSWORD_SAME);}
        if(!isStrongPassword(record.getNewPassword())){
            throw new RuntimeException("密码强度不够");
        }
        // 更新密码
        record.setNewPassword(MD5Util.getMD5(record.getNewPassword()));
        int result = userService.updateByPrimaryKey(record);
        return result > 0? R.OK() : R.FAIL(CodeEnum.UPDATE_FAILED);
    }
    // 密码强度检查方法
    private boolean isStrongPassword(String password) {
        // 密码强度规则：6位字母加数字的组合
        String regex = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6}$";
        return password.matches(regex);
    }

//修改个人基本信息
    @PutMapping("/profile")
    public R updateByPrimaryKeySelective(@RequestBody User user) {
        int result = userService.updateByPrimaryKeySelective(user);
        return result > 0 ? R.OK() : R.FAIL();
    }
}
