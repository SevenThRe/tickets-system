package com.icss.etc.ticket.mapper;

import com.icss.etc.ticket.entity.Department;
import org.springframework.stereotype.Repository;

public interface DepartmentMapper {
    int deleteByPrimaryKey(Long departmentId);

    int insert(Department record);

    int insertSelective(Department record);

    Department selectByPrimaryKey(Long departmentId);

    int updateByPrimaryKeySelective(Department record);

    int updateByPrimaryKey(Department record);
}