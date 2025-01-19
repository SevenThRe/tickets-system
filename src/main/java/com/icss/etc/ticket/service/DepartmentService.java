package com.icss.etc.ticket.service;

import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.entity.vo.*;
import org.apache.ibatis.annotations.Param;
import com.icss.etc.ticket.entity.vo.ticket.DepartmentWorkloadVO;
import java.util.List;
import java.util.Map;

public interface DepartmentService {
    /**
     * insert record departmentMapper table
     *
     * @param record the record
     * @return insert count
     */
    int insert(Department record);

    /**
     * 修改部门信息
     * @param record  部门信息DTO
     * @return 修改结果
     */
    int updateByPrimaryKey(Department record);

    /**
     * 删除部门
     * @param department_id 部门ID
     * @return 删除结果
     */
    int deleteByPrimaryKey(Long department_id);

    /**
     * 查询部门详情
     * @param department_id 部门ID
     * @return department object
     */
    Department selectByPrimaryKey(Long department_id);


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
     * @return 部门表根节点集合
     */
    List<Department> selectParentAll();


    /**
     * 查询部门负责人列表
     * @param department_id 部门ID
     * @return 部门负责人列表
     */
    List<DepartmentChargeVO> selectManagerByDepartmentId(Long department_id);







    List<Map<String, Object>> getDepartmentTree();


    int selectDepartmentProcessors(Long userId);


    /**
     * 获取部门统计数据
     */
    DepartmentStatsVO getDepartmentStats(Long departmentId);

    /**
     * 获取部门成员列表
     */
    List<DepartmentMemberVO> getDepartmentMembers(Long departmentId);

    /**
     * 获取成员工作量统计
     */
    List<MemberWorkloadVO> getMemberWorkload(Long departmentId);

    /**
     * 获取部门工作量统计
     */
    List<DepartmentWorkloadVO> getWorkloadStats();

    /**
     * 获取部门详情
     */
    DepartmentDetailVO getDepartmentDetail(Long departmentId);

}
