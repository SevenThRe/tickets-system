package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.UserPermission;
import com.icss.etc.ticket.entity.UserRole;

import java.time.LocalDateTime;
import java.util.List;

import com.icss.etc.ticket.entity.dto.ticket.CheckOperationDTO;
import org.apache.ibatis.annotations.Param;

/**
 * {@code UserRoleMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface UserRoleMapper {
    /**
     * insert record to table
     *
     * @param record the record
     * @return insert count
     */
    int insert(UserRole record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(UserRole record);

    /**
     * select by primary key
     *
     * @param userId primary key
     * @return object by primary key
     */
    UserRole selectByPrimaryKey(@Param("userId") Long userId, @Param("roleId") Long roleId);

    /**
     * update record selective
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(UserRole record);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(UserRole record);

    List<UserRole> selectByAll(UserRole userRole);

    int updateBatchSelective(@Param("list") List<UserRole> list);

    int batchInsert(@Param("list") List<UserRole> list);

    /**
     * 将用户变更为普通用户
     * @param userId 用户ID
     * @return update count
     */
    int transferUserToNormal(Long userId);

    /**
     * 根据用户ID和角色编码查询是否有角色
     * @param userId 用户ID
     * @param baseRoleCode 角色编码
     * @return 是否有角色
     */
    boolean selectByUserId(@Param("userId") Long userId, @Param("baseRoleCode") String baseRoleCode);

    /**
     * 检查操作权限
     * @param checkOperationDTO 检查操作权限DTO
     * @return 是否有权限
     */
     UserPermission checkOperationPermission(CheckOperationDTO checkOperationDTO);

    boolean hasManagePermission(@Param("userId") Long currentUserId, @Param("departmentId") Long departmentId);

    int update(UserRole userRole);
}