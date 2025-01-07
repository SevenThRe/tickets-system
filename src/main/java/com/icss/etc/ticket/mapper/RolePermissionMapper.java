package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.RolePermission;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code RolePermissionMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface RolePermissionMapper {
    /**
     * insert record to table
     *
     * @param record the record
     * @return insert count
     */
    int insert(RolePermission record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(RolePermission record);

    /**
     * select by primary key
     *
     * @param roleId primary key
     * @return object by primary key
     */
    RolePermission selectByPrimaryKey(@Param("roleId") Long roleId, @Param("permissionId") Long permissionId);

    /**
     * update record selective
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(RolePermission record);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(RolePermission record);

    List<RolePermission> selectByAll(RolePermission rolePermission);

    int updateBatchSelective(@Param("list") List<RolePermission> list);

    int batchInsert(@Param("list") List<RolePermission> list);
}