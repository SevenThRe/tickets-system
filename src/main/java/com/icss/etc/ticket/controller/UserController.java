package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import com.icss.etc.ticket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    @RequestMapping("/selectUserInfo")
    public @ResponseBody R selectUserInfo(Integer pageNumber, Integer pageSize) {
        PageHelper.startPage(pageNumber, pageSize, true);
        List<UserViewBackDTO> list = userService.selectUserInfo();
        PageInfo<UserViewBackDTO> pageInfo = new PageInfo<>(list);
        Map<String, Object> map = new HashMap<>();
        map.put("list", list);
        map.put("total", pageInfo.getPages()); //总页数
        return R.OK(map); //将list集合转换为json数组
    }


}
