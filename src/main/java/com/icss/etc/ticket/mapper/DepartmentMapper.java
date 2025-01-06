package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Department;

import java.time.LocalDateTime;
import java.util.List;

import org.apache.ibatis.annotations.Param;

/**
 * {@code DepartmentMapper}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

public interface DepartmentMapper {
    /**
     * insert record to table
     *
     * @param record the record
     * @return insert count
     */
    int insert(Department record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(Department record);

    /**
     * select by primary key
     *
     * @param department_id primary key
     * @return object by primary key
     */
    Department selectByPrimaryKey(Long department_id);

    /**
     * update record
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKey(Department record);

    List<Department> selectByAll(Department department);

    int updateBatchSelective(@Param("list") List<Department> list);

    int batchInsert(@Param("list") List<Department> list);
}