package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Role;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code RoleMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface RoleMapper {
    /**
     * insert record to table
     *
     * @param record the record
     * @return insert count
     */
    int insert(Role record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(Role record);

    /**
     * select by primary key
     *
     * @param role_id primary key
     * @return object by primary key
     */
    Role selectByPrimaryKey(Long role_id);

    /**
     * update record selective
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(Role record);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(Role record);

    List<Role> selectByAll(Role role);

    int updateBatchSelective(@Param("list") List<Role> list);

    int batchInsert(@Param("list") List<Role> list);
}