package com.icss.etc.ticket.controller;


import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.dto.DepartmentsQueryDTO;
import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.service.DepartmentService;
import com.icss.etc.ticket.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/departments")
@Slf4j
public class DepartmentController {
    @Autowired
    private DepartmentService departmentService;
    @Autowired
    private UserService userService;

    /**
     * 新增部门
     * @param department 部门对象
     */
    @PostMapping("/add")
    public R addDepartment(@RequestBody Department department) {
        return R.OK(departmentService.insert(department));
    }

    /**
     *  修改部门
     * @param department 部门对象
     */
    @PutMapping("/update")
    public R updateDepartment(@RequestBody Department department) {
        return R.OK(departmentService.updateByPrimaryKey(department));
    }

    /**
     * 删除部门
     * @param department_id 部门ID
     */
    @DeleteMapping("/delete/{id}")
    public R deleteDepartment(@PathVariable("id") Long department_id) {
        return R.OK(departmentService.deleteByPrimaryKey(department_id));
    }

    /**
     * 查询部门详情
     * @param department_id 部门ID
     * @return department object
     */
    @RequestMapping("/selectByPrimaryKey/{department_id}")
    public R selectByPrimaryKey(@PathVariable("department_id") Long department_id) {
        return R.OK(departmentService.selectByPrimaryKey(department_id));
    }

    //TODO:修改API接口
    @GetMapping("/child/{id}")
    public R getSubDepartmentById(@PathVariable("id") Long department_id){
        return R.OK(departmentService.selectSubDepartments(department_id));
    }


    @GetMapping("/selectByAll")
    public R selectByAll(Department department) {
        return R.OK(departmentService.selectByAll(department));
    }

    //批量更新部门
    //int updateBatchSelective(@Param("list") List<Department> list);



    //批量插入部门
    //int batchInsert(@Param("list") List<Department> list);



    //部门表根节点集合   */
    //    List<Department> selectParentAll();


    //查询部门负责人列表
    //List<DepartmentChargeVO> selectManagerByDepartmentId(Long department_id);





    @GetMapping("/detail/{id}")
    public R getDepartmentById(@PathVariable("id") Long department_id){
        return R.OK(departmentService.getDepartmentDetail(department_id));
    }



    /**
     * 部门权限树
     * @return R
     */
    @GetMapping("/trees")
    public R getDepartmentTree() {
        return R.OK(departmentService.getDepartmentTree());
    }



    /**
     * 通过用户ID 查询部门成员的全部信息
     * @param departmentsQueryDTO 部门查询DTO
     * @return
     */
    @GetMapping("/meblist")
    public R getDeptMemberByDeptId(DepartmentsQueryDTO departmentsQueryDTO){
        return R.OK(userService.queryByDepartmentId(departmentsQueryDTO));
    }

    /**
     *department-management.html
     * 部门成员列表
     * @return R 部门成员列表
     */
    @GetMapping("/members/{departmentId}")
    public R getDeptMembersInDept(@PathVariable("departmentId") Long departmentId){
        return R.OK(userService.getDeptMembersInDept(departmentId));
    }

    @PostMapping("/addUser")
    public R addUser(DeptMemberDTO deptMemberDTO) {
        return R.OK(userService.addUser(deptMemberDTO));
    }

    @DeleteMapping("/deleteUser")
    public R deleteUser(DeptMemberDTO deptMemberDTO) {
        return R.OK(userService.deleteUser(deptMemberDTO));
    }

    /**
     * 部门列表
     * @return R 部门列表
     */
    @GetMapping("/list")
    public R selectAll() {
        return R.OK(departmentService.selectAll());
    }


    @GetMapping("/parent")
    public R selectParentAll() {
        return R.OK(departmentService.selectParentAll());
    }


    @DeleteMapping("{departmentId}/members/{userId}")
    public R deleteMember(@PathVariable("departmentId") Long departmentId, @PathVariable("userId") Long userId) {
        return R.OK(userService.deleteUserFromDepartment(departmentId, userId));
    }

    @PostMapping("/addMembers")
    public R addMembers(Map<String, Object> map) {
        return R.OK(userService.addMembers(map));
    }

    /**
     * dept-members.html 的查询详情
     * @param userId
     * @return
     */
    @GetMapping("/member/{userId}")
    public R getDeptMemberDetial(@PathVariable Long userId){
        return R.OK(userService.getDeptMemberDetial(userId));
    }









}
