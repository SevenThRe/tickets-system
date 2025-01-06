package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Permission;
import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Param;

/**
 * {@code PermissionMapper} 
 * 
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */
    
public interface PermissionMapper {
    /**
     * insert record to table
     * @param record the record
     * @return insert count
     */
    int insert(Permission record);

    /**
     * insert record to table selective
     * @param record the record
     * @return insert count
     */
    int insertSelective(Permission record);

    /**
     * select by primary key
     * @param permission_id primary key
     * @return object by primary key
     */
    Permission selectByPrimaryKey(Long permission_id);

    /**
     * update record selective
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(Permission record);

    /**
     * update record
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(Permission record);

    List<Permission> selectByAll(Permission permission);

    int updateBatchSelective(@Param("list") List<Permission> list);

    int batchInsert(@Param("list") List<Permission> list);
}