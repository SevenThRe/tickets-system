package com.icss.etc.ticket.controller;


import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.dto.DeptMemberDTO;
import com.icss.etc.ticket.service.DepartmentService;
import com.icss.etc.ticket.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/departments")
public class DepartmentController {
    @Autowired
    private DepartmentService departmentService;
    @Autowired
    private UserService userService;


    @GetMapping("")
    public R list() {
        return R.OK(departmentService.selectAll());
    }

    @GetMapping("/get/{id}")
    public R getDepartmentById(@PathVariable("id") Long department_id){
        return R.OK(departmentService.selectByDpartmentId(department_id));
    }

    //TODO:修改API接口
    @GetMapping("/child/{id}")
    public R getSubDepartmentById(@PathVariable("id") Long department_id){
        return R.OK(departmentService.selectSubDepartments(department_id));
    }



    /**
     * 部门权限树
     * @return R
     */
    @GetMapping("/trees")
    public R getDepartmentTree() {
        return R.OK(departmentService.getDepartmentTree());
    }

    //TODO:更改API接口
    @GetMapping("/users/{id}")
    public R getDeptMemberByDeptId(@PathVariable("id") Long department_id){
        return R.OK(userService.selectByDepartmentId(department_id));
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





}
