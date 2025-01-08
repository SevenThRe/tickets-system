package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.annotation.RedisOperation;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.dto.*;
import com.icss.etc.ticket.entity.dto.ticket.TicketExportDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketQueryDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketTrendDTO;
import com.icss.etc.ticket.entity.dto.ticket.TicketTypeStatsDTO;
import com.icss.etc.ticket.service.TicketService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * {@code TicketController} 类用于处理与 {@code Ticket} 相关的请求。
 * @since 1.0
 * @version 1.0
 * @author SevenThRe
 */

/*
*     GET_LIST: '/tickets/list',
            GET_MY_TICKETS:'/tickets/my',
            POST_CREATE: '/tickets/create',
            GET_TODOS: '/tickets/todos',        // 获取待办工单
            GET_RECENT: '/tickets/recent',      // 获取最近工单
            GET_STATISTICS: '/tickets/statistics',  // 获取工单统计
            GET_DETAIL: id => `/tickets/${id}`,       // 获取工单详情
            PUT_PROCESS: id => `/tickets/${id}/process`,  // 提交工单处理
            PUT_UPLOAD: id => `/tickets/${id}/attachments`,  // 上传工单附件
            PUT_RESOLVE: id => `/tickets/${id}/resolve`,
            POST_TRANSFER: id => `/tickets/${id}/transfer`,
            PUT_CLOSE: id => `/tickets/${id}/close`,
            POST_UPLOAD: '/tickets/attachments',
            GET_ATTACHMENT: id => `/tickets/${id}/attachments`,
            DELETE_ATTACHMENT: id => `/attachments/${id}`,
            DOWNLOAD_ATTACHMENT: id => `/attachments/${id}/download`,
            BATCH_DOWNLOAD: '/tickets/attachments/batch-download',
            *
            * */


@RestController
@RequestMapping("tickets")
public class TicketController {
    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    /**
     * 创建工单
     * @param ticket 工单信息
     * @return 影响行数
     */
    @PostMapping("create" )
    public R create(Ticket ticket) {
        return ticketService.insert(ticket) > 0 ? R.OK() : R.FAIL();
    }

    /**
     * 获取工单列表
     * @param queryDTO 查询条件
     * @return 工单列表
     */
    @RedisOperation(type = RedisOperation.OperationType.QUERY)
    @RequestMapping("list")
    public R list(TicketQueryDTO queryDTO) {
        PageHelper.startPage(queryDTO.pageNum(), queryDTO.pageSize());
        PageInfo<Ticket> pageInfo = new PageInfo<>(ticketService.pageList(queryDTO));
        Map<String, Object> map = new HashMap<>();
        map.put("total", pageInfo.getTotal());
        map.put("list", pageInfo.getList());
        return R.OK(map);
    }

    /**
     * 获取工单详情
     * @param id 工单ID
     * @return 工单详情
     */
    @RequestMapping("/{id}")
    public R<Ticket> detail(@PathVariable Long id) {
        return R.OK(ticketService.getById(id));
    }

    /**
     * 获取待办工单
     * @param userId 用户ID
     * @param queryDTO 查询条件
     * @return 待办工单列表
     */
    @RequestMapping("/todos")
    public R getTodos(@RequestParam("userId") Long userId, TicketQueryDTO queryDTO) {
        return R.OK(ticketService.getTodoTickets(userId, queryDTO));
    }

    /**
     * 获取我的工单
     * @param userId 用户ID
     * @param queryDTO 查询条件
     * @return 最近工单列表
     */
    @RequestMapping("/my")
    public R getMy(@RequestParam Long userId, TicketQueryDTO queryDTO) {
        return R.OK(ticketService.getMyTickets(userId, queryDTO));
    }

    /**
     * 更新工单信息
     * @param ticket 工单信息
     * @return 更新结果
     */
    @PutMapping("/update")
    public R update(@RequestBody Ticket ticket){
        return R.OK(ticketService.update(ticket));
    }

    /**
     * 删除工单
     * @param id 工单ID
     * @return 删除结果
     */
    @DeleteMapping("/{id}")
    public R delete(@PathVariable Long id){
        return R.OK(ticketService.deleteById(id));
    }

    /**
     * 获取部门工单
     * @param deptId 部门ID
     * @param queryDTO 查询条件
     * @return 工单列表
     */
    @GetMapping("/dept")
    public R getDeptTickets(@RequestParam Long deptId, TicketQueryDTO queryDTO){
        return R.OK(ticketService.getDeptTickets(deptId, queryDTO));
    }

    /**
     * 分配处理人
     * @param id 工单ID
     * @param processorId 处理人ID
     * @return 分配结果
     */
    @PutMapping("/{id}/processor")
    public R assignProcessor(@PathVariable Long id, @RequestParam Long processorId)
    {
        return R.OK(ticketService.assignProcessor(id, processorId));
    }
    /**
     * 转交部门
     * @param id 工单ID
     * @param deptId 部门ID
     * @param updateBy 操作人ID
     * @return 转交结果
     */
    @PostMapping("/{id}/transfer")
    public R<Integer> transferDept(@PathVariable Long id, @RequestParam Long deptId, @RequestParam Long updateBy)
    {
        return R.OK(ticketService.transferDept(id, deptId, updateBy));
    }
    /**
     * 获取部门工单统计
     * @param deptId 部门ID
     * @return 统计结果
     */
    @GetMapping("/stats/dept")
    public R<DeptTicketStatsDTO> getDeptStats(@RequestParam Long deptId)
    {

        return R.OK(ticketService.getDeptStats(deptId));
    }

    /**
     * 获取处理人工作量统计
     * @param processorId 处理人ID
     * @return 统计结果
     */
    @GetMapping("/stats/processor")
    public R<ProcessorStatsDTO> getProcessorStats(@RequestParam Long processorId)
    {

        return R.OK(ticketService.getProcessorStats(processorId));
    }
    /**
     * 获取工单类型分布统计
     * @param deptId 部门ID
     * @return 统计列表
     */
    @GetMapping("/stats/types")
    public R<List<TicketTypeStatsDTO>> getTypesStats(@RequestParam Long deptId)
    {
        return R.OK(ticketService.getTypesStats(deptId));
    }
    /**
     * 获取工单趋势统计
     * @param deptId 部门ID
     * @param days 统计天数
     * @return 趋势数据
     */
    @GetMapping("/stats/trend")
    public R<List<TicketTrendDTO>> getTrendStats(@RequestParam Long deptId, @RequestParam Integer days)
    {
        return R.OK(ticketService.getTrendStats(deptId, days));
    }
    /**
     * 获取工作量统计
     * @param deptId 部门ID
     * @return 统计列表
     */
    @GetMapping("/stats/workload")
    public R<List<WorkloadStatsDTO>> getWorkloadStats(@RequestParam Long deptId){
        return R.OK(ticketService.getWorkloadStats(deptId));
    }

    /**
     * 获取处理效率统计
     * @param deptId 部门ID
     * @return 统计列表
     */
    @GetMapping("/stats/efficiency")
    public R<List<EfficiencyStatsDTO>> getEfficiencyStats(@RequestParam Long deptId){
        return R.OK(ticketService.getEfficiencyStats(deptId));
    }

    /**
     * 导出工单列表
     * @param queryDTO 查询条件
     * @return 导出数据
     */
    @GetMapping("/export")
    public R<List<TicketExportDTO>> export(TicketQueryDTO queryDTO){
        return R.OK(ticketService.selectForExport(queryDTO));
    }








}
