package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Department;

import java.time.LocalDateTime;
import java.util.List;

import com.icss.etc.ticket.entity.vo.DepartmentChargeVO;
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
     * insert record departmentMapper table
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
     * 根据主键查询
     *
     * @param departmentId primary key
     * @return object by primary key
     */
    Department selectByPrimaryKey(Long departmentId);
    /**
     * 根据父部门ID查询子部门列表
     *
     * @param parent_id parent department id
     * @return sub department list
     */
    List<Department> selectSubDepartments(Long parent_id);

    /**
     * 查询所有状态正常未删除的部门列表
     * @return department list
     */
    List<Department> selectAll();
    /**
     * 修改部门信息
     * @param record  部门信息DTO
     * @return 修改结果
     */
    int updateByPrimaryKey(Department record);

    /**
     * 查询部门列表
     * @param department department object
     * @return department list
     */
    List<Department> selectByAll(Department department);

    /**
     * 批量更新部门
     * @param list department list
     * @return update count
     */
    int updateBatchSelective(@Param("list") List<Department> list);

    /**
     * 批量插入部门
     * @param list department list
     * @return insert count
     */
    int batchInsert(@Param("list") List<Department> list);

    /**
     * 查询部门详情
     * @param department_id 部门ID
     * @return department object
     */
    Department selectByDpartmentId(Long department_id);

    /**
     * @return 部门表根节点集合
     */
    List<Department> selectParentAll();

    /**
     * 删除部门
     * @param department_id 部门ID
     * @return 删除结果
     */
    int deleteByPrimaryKey(Long department_id);

    /**
     * 查询部门负责人列表
     * @param department_id 部门ID
     * @return 部门负责人列表
     */
    List<DepartmentChargeVO> selectManagerByDepartmentId(Long department_id);



}