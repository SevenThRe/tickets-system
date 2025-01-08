package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.dto.ticket.TicketQueryDTO;
import com.icss.etc.ticket.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {
    @Autowired
    private DepartmentService departmentService;

    public void setDepartmentService(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping("list")
    public R list(Department queryDTO,Integer pageNum,Integer pageSize) {
        PageHelper.startPage(pageNum, pageSize);
        PageInfo<Department> pageInfo = new PageInfo<>(departmentService.selectByAll(new Department()));
        Map<String, Object> map = new HashMap<>();
        map.put("total", pageInfo.getTotal());
        map.put("list", pageInfo.getList());
        return R.OK(map);
    }

    @GetMapping("/{id}")
    public R getDepartmentById(@PathVariable("id") Long department_id){
        return R.OK(departmentService.selectByDpartmentId(department_id));
    }

    //TODO:修改API接口
    @GetMapping("/child/{id}")
    public R getSubDepartmentById(@PathVariable("id") Long department_id){
        return R.OK(departmentService.selectSubDepartments(department_id));
    }




}
