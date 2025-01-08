package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.mapper.DepartmentMapper;
import com.icss.etc.ticket.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceImlp implements DepartmentService {
    @Autowired
    private DepartmentMapper departmentMapper;

    @Override
    public int insert(Department record) {
        return 0;
    }

    @Override
    public int insertSelective(Department record) {
        return DepartmentMapper.insertSelective(record);
    }

    @Override
    public Department selectByPrimaryKey(Long departmentId) {
        return null;
    }

    @Override
    public int updateByPrimaryKeySelective(Department record) {
        return 0;
    }

    @Override
    public List<Department> selectSubDepartments(Long parent_id) {
        return departmentMapper.selectSubDepartments(parent_id);
    }

    @Override
    public int updateByPrimaryKey(Department record) {
        return 0;
    }

    @Override
    public List<Department> selectByAll(Department department) {
        return departmentMapper.selectByAll(department);
    }

    @Override
    public int updateBatchSelective(List<Department> list) {
        return 0;
    }

    @Override
    public int batchInsert(List<Department> list) {
        return 0;
    }

    @Override
    public Department selectByDpartmentId(Long department_id) {
        return departmentMapper.selectByDpartmentId(department_id);
    }
}
