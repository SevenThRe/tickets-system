package com.icss.etc.ticket.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.UserRole;
import com.icss.etc.ticket.entity.dto.DepartmentsQueryDTO;
import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.entity.dto.UserPasswordDTO;
import com.icss.etc.ticket.entity.dto.UserQueryDTO;
import com.icss.etc.ticket.entity.dto.user.UserCreateDTO;
import com.icss.etc.ticket.entity.vo.DeptMemberVO;
import com.icss.etc.ticket.entity.dto.RegisteredDTO;
import com.icss.etc.ticket.entity.User;
import com.icss.etc.ticket.entity.vo.DeptMembersDetailVO;
import com.icss.etc.ticket.entity.vo.UserVO;
import com.icss.etc.ticket.entity.vo.UserViewBackDTO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.DepartmentMapper;
import com.icss.etc.ticket.mapper.TicketMapper;
import com.icss.etc.ticket.mapper.UserMapper;
import com.icss.etc.ticket.mapper.UserRoleMapper;
import com.icss.etc.ticket.service.UserService;
import com.icss.etc.ticket.util.GradeCalculator;
import com.icss.etc.ticket.util.MD5Util;
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
    private TicketMapper ticketMapper;
    @Autowired
    private UserRoleMapper userRoleMapper;
    @Autowired
    private PropertiesUtil propertiesUtil;

    private String DEFAULT_PASSWORD;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int register(RegisteredDTO user)  {
        int count =0;
        try {
            count = userMapper.register(user);
            log.info(this.getClass().getSimpleName()+ "user register :" + user.getUsername() + " count: " + count);
            //TODO: 将用户信息写入到T USER_ROLE表中
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
    @Override
    public User getUserInfo(Long userId) {
        return userMapper.getUserInfo(userId);
    }

    @Override
    public List<DeptMemberVO> queryByDepartmentId(DepartmentsQueryDTO departmentsQueryDTO) {
        if(departmentsQueryDTO.getUserId() == null)throw new BusinessException(CodeEnum.BAD_REQUEST,"用户ID不能为空");
        Long departmentId = userMapper.selectDepartmentId(departmentsQueryDTO.getUserId());
        if(departmentId == null|| departmentId == 0)throw new BusinessException(CodeEnum.BAD_REQUEST,"用户所在部门不存在,或者用户无部门");
        departmentsQueryDTO.setDepartmentId(departmentId);
        PageHelper.startPage(departmentsQueryDTO.getPageNum(),departmentsQueryDTO.getPageSize());
        PageInfo<DeptMemberVO> pageInfo = new PageInfo<>(userMapper.queryByDepartmentId(departmentsQueryDTO));
        List<DeptMemberVO> deptMemberVOs = pageInfo.getList();
        for(DeptMemberVO deptMemberVO : deptMemberVOs){
            Double avgProcessTime = ticketMapper.getAvgProcessTime(deptMemberVO.getUserId(), departmentsQueryDTO.getPerformanceFilter());
            if(avgProcessTime != null){
                deptMemberVO.setAverageProcessingTime(avgProcessTime);
                deptMemberVO.setProcessingEfficiency(GradeCalculator.getGrade(avgProcessTime));
            };
            deptMemberVO.setMonthlyPerformance(ticketMapper.getMonthlyPerformance(deptMemberVO.getUserId()));
            deptMemberVO.setSatisfaction(ticketMapper.getSatisfaction(deptMemberVO.getUserId()));
            deptMemberVO.setCurrentWorkload(ticketMapper.countCrrentWorkload(deptMemberVO.getUserId(),departmentsQueryDTO.getWorkloadFilter()));
        }
        return deptMemberVOs;
    }

    @Override
    public List<DeptMemberVO> selectByDepartmentId(Long userId) {
        return userMapper.selectByDepartmentId(userId);
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
        DEFAULT_PASSWORD = propertiesUtil.getProperty("default.password", "123456");
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
        try {
            if (!dest.exists()) {
                dest.createNewFile();
            }
        } catch (IOException e) {
            log.error("保存头像失败:", e);
            throw new BusinessException(CodeEnum.SAVE_FAILED);
        }
        file.transferTo(dest);
    }


    @Transactional
    @Override
    public int deleteUserFromDepartment(Long departmentId, Long userId) {
       try {
           // 先删除部门下面的用户
           int count = userMapper.deleteUserFromDepartment(userId);
           if (userRoleMapper.selectByUserId(userId, "USER") && userRoleMapper.selectByUserId(userId, "ADMIN")) {
               // 再删除用户的角色
               count += userRoleMapper.transferUserToNormal(userId);
               if (count != 2) {
                   throw new BusinessException(CodeEnum.DELETE_MEMBER_FAILED);
               }
           }
           log.info("{}user delete from department :{} count: {}", this.getClass().getSimpleName(), userId, count);
           return count;
       }catch (Exception e) {
           log.error("{}user delete from department failed :{}", this.getClass().getSimpleName(), userId);
              throw new BusinessException(CodeEnum.DELETE_MEMBER_FAILED);
       }
    }

    @Override
    public PageInfo<UserVO> selectAllUsersInfo(UserQueryDTO queryDTO) {
        PageHelper.startPage(queryDTO.getPageNum(),queryDTO.getPageSize());
        return new PageInfo<>(userMapper.selectAllUsersInfo(queryDTO));
    }

    @Override
    public int changeUserStatus(Long userId) {
        return userMapper.changeUserStatus(userId);
    }

    /**
     * 新建用户功能
     */
    @Transactional(rollbackFor = Exception.class)
    @Override
    public int createANewUser(UserCreateDTO user) {
        // 密码加密
        user.setPassword(MD5Util.getMD5(user.getPassword()));
        // 创建用户
        int result =0;
        try {
            result = userMapper.createANewUser(user);
            result += userRoleMapper.insert(new UserRole(user.getUserId(), user.getRoleId()));
            if (result != 2) {
                throw new BusinessException(CodeEnum.CREATION_FAILED);
            }
        } catch (Exception e) {
        log.error("创建用户失败:", e);
        throw new BusinessException(CodeEnum.CREATION_FAILED);
        }
        return result;
    }

    @Override
    public int resetPassword(Long userId) {
        String md5 = MD5Util.getMD5("123456");
        log.info("reset password userId:{}, password:{}", userId, DEFAULT_PASSWORD);
        return userMapper.resetPassword(userId,md5);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int updateUserInfo(Long userId, UserViewBackDTO userViewBackDTO) {
        int i = 0;
        try{
            i += userMapper.updateUserInfo(userId, userViewBackDTO);
            if(userRoleMapper.selectByPrimaryKey(userId, userViewBackDTO.getRoleId()) != null){
                return i;
            }else {
                i += userRoleMapper.insert(new UserRole(userId, userViewBackDTO.getRoleId()));
            }
            if (i != 2) {
                throw new BusinessException(CodeEnum.UPDATE_FAILED);
            }
        }catch (BusinessException e){
            log.error("更新用户信息失败: {}", e.getMessage());
            throw e;
        }
        return i;
    }

    @Override
    public DeptMembersDetailVO getDeptMemberDetial(Long userId) {
        UserVO user = userMapper.selectUserVO(userId);
        Double avgProcessTime = ticketMapper.getAvgProcessTime(userId, "");
        if(avgProcessTime == null ) avgProcessTime = 0.0;
        return DeptMembersDetailVO.builder().userId(userId)
                .realName(user.getRealName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .status(user.getStatus())
                .roleName(user.getRoleName())
                .currentWorkload(ticketMapper.countCrrentWorkload(userId, 0))
                .processingEfficiency(GradeCalculator.getGrade(avgProcessTime))
                .averageProcessingTime(avgProcessTime)
                .satisfaction(ticketMapper.getSatisfaction(userId))
                .monthlyPerformance(ticketMapper.getMonthlyPerformance(userId))
                .build();
    }

    /**
     * 获取用户头像路径
     */
    public String getUserAvatarPath(String username, Long userId) {
        return username + "_" + userId + "_avatar.png";
    }


}