package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.mapper.DepartmentMapper;
import com.icss.etc.ticket.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

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
        return departmentMapper.insertSelective(record);
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

    @Override
    public List<Department> selectAll() {
        return departmentMapper.selectAll();
    }

    @Override
    public List<Department> selectParentAll() {
        return departmentMapper.selectParentAll();
    }


    /**
     * 查询部门树
     * @return 部门树
     */
    public List<Map<String, Object>> getDepartmentTree() {
        List<Department> allDepartments = departmentMapper.selectAll();
        Map<Long, Department> departmentMap = allDepartments.stream()
                .collect(Collectors.toMap(Department::getDepartmentId, department -> department));
        List<Map<String, Object>> tree = new ArrayList<>();
        for (Department department : allDepartments) {
            if (department.getParentId() == null || departmentMap.get(department.getParentId()) == null) {
                Map<String, Object> node = new HashMap<>();
                node.put("id", department.getDepartmentId());
                node.put("label", department.getDepartmentName());
                node.put("icon", department.getIconClass());
                node.put("children", getChildren(department.getDepartmentId(), allDepartments));
                tree.add(node);
            }
        }
        return tree;
    }

    @Override
    public int deleteByPrimaryKey(Long departmentId) {
        return departmentMapper.deleteByPrimaryKey(departmentId);
    }

    /**
     * 递归查询子部门
     * 这个我实在优化不明白
     * @param parentId 父部门ID
     * @param departments 部门列表
     * @return 子部门列表
     */
    private List<Map<String, Object>> getChildren(Long parentId, List<Department> departments) {
        List<Map<String, Object>> children = new ArrayList<>();
        for (Department department : departments) {
            if (parentId.equals(department.getParentId())) {
                Map<String, Object> childNode = new HashMap<>();
                childNode.put("id", department.getDepartmentId());
                childNode.put("label", department.getDepartmentName());
                childNode.put("icon", department.getIconClass());
                childNode.put("children", getChildren(department.getDepartmentId(), departments));
                children.add(childNode);
            }
        }
        return children;
    }

    //    /**
//      * 已废弃，不知道什么地方逻辑有问题
//     * 查询部门树
//     * 换了一种处理逻辑
//     * @return 部门树
//     */
//    public List<Map<String, Object>> getDepartmentTree() {
//        List<Department> allDepartments = departmentMapper.selectAll();
//        Map<Long, Department> departmentMap = allDepartments.stream()
//                .collect(Collectors.toMap(Department::getDepartmentId, department -> department));
//        List<Map<String, Object>> tree = new ArrayList<>();
//        // 根部门队列
//        LinkedList<Department> rootDepartments = new LinkedList<>();
//        for (Department department : allDepartments) {
//            if (department.getParentId() == null || departmentMap.get(department.getParentId()) == null) {
//                rootDepartments.add(department);
//            }
//        }
//        while (!rootDepartments.isEmpty()) {
//            Department department = rootDepartments.poll();
//            Map<String, Object> node = new HashMap<>();
//            node.put("id", department.getDepartmentId());
//            node.put("label", department.getDepartmentName());
//            node.put("icon", department.getIconClass());
//            List<Map<String, Object>> children = new ArrayList<>();
//            for (Department child : allDepartments) {
//                if (department.getDepartmentId().equals(child.getParentId())) {
//                    children.add(new HashMap<>() {{
//                        put("id", child.getDepartmentId());
//                        put("label", child.getDepartmentName());
//                        put("icon",department.getIconClass());
//                    }});
//                    rootDepartments.add(child);
//                }
//            }
//            node.put("children", children);
//            tree.add(node);
//        }
//        return tree;
//    }



}
