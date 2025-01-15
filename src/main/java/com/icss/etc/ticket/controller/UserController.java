package com.icss.etc.ticket.controller;

import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.entity.dto.UserQueryDTO;
import com.icss.etc.ticket.entity.dto.UserUpdateInfoDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.service.UserService;
import com.icss.etc.ticket.util.MD5Util;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
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
@Slf4j
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
        try {
            return R.OK(userService.selectUserInfo(userId));
        } catch (BusinessException e) {
            log.error("获取用户信息失败: {}", e.getMessage());
            return R.builder().code(e.getCode()).msg(e.getMessage()).build();
        } catch (Exception e) {
            log.error("获取用户信息失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
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
    public R updatePassword(@RequestBody UserPasswordDTO record) {
        try {
            // 获取用户信息
            User user = userService.selectByPrimaryKey(record.getUserId());
            if (user == null) {
                return R.FAIL(CodeEnum.UNKNOW_USER);
            }

            // 验证旧密码
            String oldPasswordMd5 = MD5Util.getMD5(record.getOldPassword());
            if (!user.getPassword().equals(oldPasswordMd5)) {
                return R.FAIL(CodeEnum.PASSWORD_ERROR);
            }

            // 验证新旧密码是否相同
            if (record.getNewPassword().equals(record.getOldPassword())) {
                return R.FAIL(CodeEnum.PASSWORD_SAME);
            }

            // 密码强度校验
            if (!isStrongPassword(record.getNewPassword())) {
                return R.FAIL(CodeEnum.PASSWORD_WEAK);
            }

            // 更新密码
            record.setNewPassword(MD5Util.getMD5(record.getNewPassword()));
            int result = userService.updateByPrimaryKey(record);
            return result > 0 ? R.OK() : R.FAIL(CodeEnum.UPDATE_FAILED);

        } catch (BusinessException e) {
            log.error("修改密码失败: {}", e.getMessage());
            return R.builder().code(e.getCode()).msg(e.getMessage()).build();
        } catch (Exception e) {
            log.error("修改密码失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }
    // 密码强度检查方法
    private boolean isStrongPassword(String password) {
        // 密码强度规则：6位字母加数字的组合
        String regex = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{6,}$";
        return password.matches(regex);
    }

    //修改个人基本信息
    @PutMapping("/profile")
    public R updateByPrimaryKeySelective(@RequestBody User user) {
        try {
            int result = userService.updateByPrimaryKeySelective(user);
            return result > 0 ? R.OK() : R.FAIL(CodeEnum.UPDATE_FAILED);
        } catch (BusinessException e) {
            log.error("更新用户信息失败: {}", e.getMessage());
            return R.builder().code(e.getCode()).msg(e.getMessage()).build();
        } catch (Exception e) {
            log.error("更新用户信息失败:", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }
    /**
     * 添加用户头像
     * @param userId 用户ID
     * @param file 头像地址
     */
    @PostMapping("/avatar")
    public R<String> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam("username") String username) {

        try {
            userService.saveAvatar(file, userId, username);
            return R.OK();
        } catch (Exception e) {
            log.error("Upload avatar failed", e);
            return R.FAIL(CodeEnum.INTERNAL_ERROR);
        }
    }
    /**
     * 根据用户ID 查询用户所在部门ID
     */
    @GetMapping("/department/{userId}")
    public R getDepartmentIdByUserId(@PathVariable("userId") Long userId) {
        return R.OK(userService.getUserInfo(userId).getDepartmentId());
    }

    /**
     * 获取所有用户个人信息
     */
    @GetMapping("/list")
    public R selectAllUsersInfo(UserQueryDTO queryDTO) {
        return R.OK(userService.selectAllUsersInfo(queryDTO));
    }

    /**
     * 禁用或启用用户
     */
    @PutMapping("/{userId}/status")
    public R changeUserStatus(@PathVariable Long userId) {
        return R.OK(userService.changeUserStatus(userId));
    }
    /**
     * 重置密码
     */
    @PostMapping("/{userId}/reset-password")
    public R resetPassword(@PathVariable Long userId) {
        return R.OK(userService.resetPassword(userId));
    }

    /**
     * 更新用户信息
     * @param userViewBackDTO 用户信息
     * @return R
     */
    @PutMapping("{userId}")
    public R updateUserInfo(@PathVariable Long userId,@RequestBody UserViewBackDTO userViewBackDTO) {
        return R.OK(userService.updateUserInfo(userId,userViewBackDTO));
    }

    @GetMapping("/search")
    public R searchUser(@RequestParam("keyword") String keyword) {
        return R.OK(userService.searchUser(keyword));
    }
}
