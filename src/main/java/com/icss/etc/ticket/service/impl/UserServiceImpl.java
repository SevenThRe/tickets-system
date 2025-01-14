package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.UserRole;
import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.DepartmentMapper;
import com.icss.etc.ticket.mapper.UserMapper;
import com.icss.etc.ticket.mapper.UserRoleMapper;
import com.icss.etc.ticket.service.UserService;
import com.icss.etc.ticket.util.PropertiesUtil;
import io.micrometer.common.util.StringUtils;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.regex.Pattern;

@Service
@Slf4j
public class UserServiceImpl implements UserService{
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private DepartmentMapper departmentMapper;
    @Autowired
    private UserRoleMapper userRoleMapper;
    @Autowired
    private PropertiesUtil propertiesUtil;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int register(RegisteredDTO user)  {
        int count =0;
        try {
            count = userMapper.register(user);
            log.info(this.getClass().getSimpleName()+ "user register :" + user.getUsername() + " count: " + count);
            //TODO: 将用户存储到无部门中
            Long userId = userMapper.login(user.getUsername());
            count += userRoleMapper.insert(new UserRole(userId, user.getRoleId()));
            if (count != 2) {
                throw new RuntimeException("register failed");
            }
        } catch (Exception ignored) {
            log.error(this.getClass().getSimpleName()+ "user register failed :" + user.getUsername());
            throw ignored;
        }
        return count;
    }

    @Override
    public UserViewBackDTO login(String username) {
        Long userId = userMapper.login(username);
        log.info(this.getClass().getSimpleName()+ "user login :" + username + " userId: " + userId);
        return this.selectUserInfo(userId);
    }

    @Override
    public User selectByPrimaryKey(Long user_id) {
        return userMapper.selectByPrimaryKey(user_id);
    }

    @Override
    public UserViewBackDTO selectUserInfo(Long userId) {
        if(userId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST.getCode(), "用户ID不能为空");
        }

        UserViewBackDTO user = userMapper.selectUserInfo(userId);
        if(user == null) {
            throw new BusinessException(CodeEnum.NOT_FOUND.getCode(), "用户不存在");
        }

        return user;
    }

    //修改密码
    @Override
    public int updateByPrimaryKey(UserPasswordDTO record) {
        // 参数校验
        if(record == null || record.getUserId() == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST);
        }

        // 验证用户是否存在
        User user = userMapper.selectByPrimaryKey(record.getUserId());
        if(user == null) {
            throw new BusinessException(CodeEnum.UNKNOW_USER);
        }

        try {
            return userMapper.updateByPrimaryKey(record);
        } catch (Exception e) {
            log.error("更新密码失败:", e);
            throw new BusinessException(CodeEnum.UPDATE_FAILED);
        }
    }

    //修改个人基本信息
    @Override
    public int updateByPrimaryKeySelective(User user) {
        // 参数校验
        if(user == null || user.getUserId() == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST);
        }

        // 验证用户是否存在
        User existUser = userMapper.selectByPrimaryKey(user.getUserId());
        if(existUser == null) {
            throw new BusinessException(CodeEnum.UNKNOW_USER);
        }

        // 邮箱格式校验
        if(StringUtils.isNotBlank(user.getEmail()) && !isValidEmail(user.getEmail())) {
            throw new BusinessException(CodeEnum.BAD_REQUEST.getCode(), "邮箱格式不正确");
        }

        // 手机号格式校验
        if(StringUtils.isNotBlank(user.getPhone()) && !isValidPhone(user.getPhone())) {
            throw new BusinessException(CodeEnum.BAD_REQUEST.getCode(), "手机号格式不正确");
        }

        // 更新用户信息
        try {
            return userMapper.updateByPrimaryKeySelective(user);
        } catch (Exception e) {
            log.error("更新用户信息失败:", e);
            throw new BusinessException(CodeEnum.UPDATE_FAILED);
        }
    }
    // 验证工具方法
    private boolean isValidEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return Pattern.compile(emailRegex).matcher(email).matches();
    }

    private boolean isValidPhone(String phone) {
        String phoneRegex = "^1[3-9]\\d{9}$";
        return Pattern.compile(phoneRegex).matcher(phone).matches();
    }


    @Override
    public User getUserInfo(Long userId) {
        return userMapper.getUserInfo(userId);
    }

    @Override
    public List<DeptMemberVO> selectByDepartmentId(Long departmentId) {
        return userMapper.selectByDepartmentId(departmentId);
    }


    public Integer addUser(DeptMemberDTO deptMemberDTO){
        return userMapper.addUser(deptMemberDTO);
    }

    public Integer deleteUser(DeptMemberDTO deptMemberDTO){
        return userMapper.deleteUser(deptMemberDTO);
    }

    @Override
    public void logout(User user) {
        log.info(this.getClass().getSimpleName()+ "user logout :" + user.getUsername());
        // TODO: logout logic
    }

    @Override
    public List<String> getUsernames() {
        return userMapper.getUsernames();
    }

    @Override
    public User selectByUsername(String username) {
        return userMapper.selectByUsername(username);
    }

    @Override
    public String[] selectUserPermissions(Long userId) {
        return userMapper.selectUserPermissions(userId);
    }

    /**
     * 用户头像上传路径
     */

    private static  String AVATAR_PATH;

    /**
     * 初始化
     */
    @PostConstruct
    public void init() {
        AVATAR_PATH = propertiesUtil.getProperty("upload.avatarPath", "./src/main/resources/static/");
    }
    public void saveAvatar(MultipartFile file, Long userId, String username) throws IOException {
        // 确保目录存在
        File dir = new File(AVATAR_PATH);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        // 生成头像文件名
        String fileName = this.getUserAvatarPath(username, userId);
        String filePath = AVATAR_PATH + fileName;

        // 保存文件
        File dest = new File(filePath);
        if (!dest.exists()) {
            dest.createNewFile();
        }
        file.transferTo(dest);
    }

    /**
     * 获取用户头像路径
     */
    public String getUserAvatarPath(String username, Long userId) {
        return username + "_" + userId + "_avatar.png";
    }


}