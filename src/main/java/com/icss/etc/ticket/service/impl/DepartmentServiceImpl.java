package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.Department;
import com.icss.etc.ticket.entity.vo.DepartmentChargeVO;
import com.icss.etc.ticket.entity.vo.DepartmentDetailVO;
import com.icss.etc.ticket.entity.vo.ticket.DepartmentWorkloadVO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.mapper.DepartmentMapper;
import com.icss.etc.ticket.mapper.UserMapper;
import com.icss.etc.ticket.mapper.UserRoleMapper;
import com.icss.etc.ticket.service.DepartmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * TODO 类作用描述
 *
 * @author 陈明
 * @Date 2025/1/9
 */

@Slf4j
@Service
public class DepartmentServiceImpl implements DepartmentService {
    @Autowired
    private DepartmentMapper departmentMapper;
    @Autowired
    private UserMapper userMapper;


    @Override
    public int insert(Department record) {
        if(departmentMapper.selectByPrimaryKey(record.getDepartmentId()) != null){
            log.error(CodeEnum.DEPARTMENT_IS_EXIST.getMsg());
            return CodeEnum.DEPARTMENT_IS_EXIST.getCode();
        }
         return departmentMapper.insert(record);
    }


    @Override
    public Department selectByPrimaryKey(Long departmentId) {
        return departmentMapper.selectByPrimaryKey(departmentId);
    }


    @Override
    public List<Department> selectSubDepartments(Long parent_id) {
        return departmentMapper.selectSubDepartments(parent_id);
    }

    @Override
    public int updateByPrimaryKey(Department record) {
        return departmentMapper.updateByPrimaryKey(record);
    }

    @Override
    public List<Department> selectByAll(Department department) {
        return departmentMapper.selectByAll(department);
    }

    @Override
    public int updateBatchSelective(List<Department> list) {
        return departmentMapper.updateBatchSelective(list);
    }

    @Override
    public int batchInsert(List<Department> list) {
        return departmentMapper.batchInsert(list);
    }


    /**
     * 部门详情
     * @return DepartmentDetailVO
     */
    public DepartmentDetailVO getDepartmentDetail(Long departmentId) {
        Department department = departmentMapper.selectByPrimaryKey(departmentId);
        return new DepartmentDetailVO(departmentMapper.selectManagerByDepartmentId(departmentId), department);
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
    public int selectDepartmentProcessors(Long userId) {
        Long deptId = userMapper.selectByPrimaryKey(userId).getDepartmentId();
        return departmentMapper.selectDeptMoreUser(deptId);
    }
    @Override
    public List<DepartmentWorkloadVO> getWorkloadStats() {

        return departmentMapper.getWorkloadStats();
    }


    @Override
    public int deleteByPrimaryKey(Long departmentId) {
        if(departmentMapper.selectByPrimaryKey(departmentId)==null){
            log.error(CodeEnum.DEPARTMENT_IS_NOT_EXIST.getMsg());
            return CodeEnum.DEPARTMENT_IS_NOT_EXIST.getCode();
        }
        return departmentMapper.deleteByPrimaryKey(departmentId);
    }

    @Override
    public List<DepartmentChargeVO> selectManagerByDepartmentId(Long department_id) {
        return departmentMapper.selectManagerByDepartmentId(department_id);
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
