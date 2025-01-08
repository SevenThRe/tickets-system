package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.Department;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface DepartmentService {

    int insert(Department record);

    /**
     * insert record to table selective
     *
     * @param record the record
     * @return insert count
     */
    int insertSelective(Department record);

    /**
     * 根据主键查询
     *
     * @param departmentId primary key
     * @return object by primary key
     */
    Department selectByPrimaryKey(Long departmentId);

    /**
     * update record selective
     *
     * @param record the updated record
     * @return update count
     */
    int updateByPrimaryKeySelective(Department record);

    /**
     * 根据父部门ID查询子部门列表
     *
     * @param parent_id parent department id
     * @return sub department list
     */
    List<Department> selectSubDepartments(Long parent_id);


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

    //   查询部门详情
    Department selectByDpartmentId(Long department_id);

}
