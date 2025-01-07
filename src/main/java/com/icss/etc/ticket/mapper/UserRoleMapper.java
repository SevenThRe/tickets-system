package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.UserRole;

import java.time.LocalDateTime;
import java.util.List;

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
}