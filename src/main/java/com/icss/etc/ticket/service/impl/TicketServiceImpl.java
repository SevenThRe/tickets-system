package com.icss.etc.ticket.service.impl;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.*;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketDetailVO;
import com.icss.etc.ticket.entity.vo.TicketRecordVO;
import com.icss.etc.ticket.entity.vo.TodoStatsVO;
import com.icss.etc.ticket.entity.vo.ticket.DepartmentStatisticsVO;
import com.icss.etc.ticket.entity.vo.ticket.MonthlyStatisticsVO;
import com.icss.etc.ticket.entity.vo.ticket.TicketStatisticsVO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.enums.OperationType;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.mapper.*;
import com.icss.etc.ticket.service.NotificationService;
import com.icss.etc.ticket.service.TicketService;
import com.icss.etc.ticket.util.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @ClassName
 * @Author SevenThRe
 * @Description
 * @Date 周六 22:35
 * @Version 1.0
 */
@Service
@Slf4j
public class TicketServiceImpl implements TicketService {

    private final TicketMapper ticketMapper;
    private final TicketTypeMapper ticketTypeMapper;
    private final TicketRecordMapper ticketRecordMapper;
    private final NotificationService notificationService;
    private final UserSettingsMapper userSettingsMapper;
    private final UserMapper userMapper;
    private final UserRoleMapper userRoleMapper;
    private final OnlineUserManager onlineUserManager;


    public TicketServiceImpl(TicketMapper ticketMapper,
                             TicketRecordMapper ticketRecordMapper,
                             TicketTypeMapper ticketTypeMapper,
                             NotificationService notificationService,
                             UserMapper userMapper,
                             UserSettingsMapper userSettingsMapper,
                             UserRoleMapper userRoleMapper,
                             OnlineUserManager onlineUserManager) {
        this.ticketMapper = ticketMapper;
        this.ticketRecordMapper = ticketRecordMapper;
        this.notificationService = notificationService;
        this.ticketTypeMapper = ticketTypeMapper;
        this.userMapper = userMapper;
        this.userSettingsMapper = userSettingsMapper;
        this.userRoleMapper = userRoleMapper;
        this.onlineUserManager = onlineUserManager;
    }



    @Override
    public PageInfo<Ticket> getTicketList(TicketQueryDTO queryDTO) {
        if(queryDTO.getPageNum() == null || queryDTO.getPageNum() < 1) {
            queryDTO.setPageNum(1);
        }
        if(queryDTO.getPageSize() == null || queryDTO.getPageSize() < 1) {
            queryDTO.setPageSize(10);
        }
        PageHelper.startPage(queryDTO.getPageNum(), queryDTO.getPageSize());
        List<Ticket> list = ticketMapper.selectTicketList(queryDTO);

        return new PageInfo<>(list);
    }

    @Override
    public TicketDetailVO getTicketDetail(Long ticketId) {
        // 1. 获取工单详情
        TicketDetailVO detail = ticketMapper.selectTicketDetail(ticketId);
        if (detail == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        // 2. 获取处理记录
        List<TicketRecordVO> records = ticketRecordMapper.selectRecordsByTicketId(ticketId);
        detail.setRecords(records);

        return detail;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createTicket(CreateTicketDTO createDTO) {
        // 1. 数据校验
        if(createDTO.getDepartmentId() == null || createDTO.getTypeId() == null) {
            throw new BusinessException(TicketEnum.TICKET_INFO_ILLEGAL,"部门或工单类型不能为空");
        }

        // 2. 创建工单
        Ticket ticket = new Ticket();
        BeanUtils.copyProperties(createDTO, ticket);
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setCreateTime(LocalDateTime.now());
        ticket.setCreateBy(createDTO.getCurrentUserId());
        ticket.setIsDeleted(0);

        if (ticketMapper.insertTicket(ticket) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED,"工单创建失败");
        }

        // 3. 添加创建记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(ticket.getTicketId());
        record.setOperatorId(createDTO.getCurrentUserId());
        record.setOperationType(OperationType.CREATE);
        record.setOperationContent("创建工单");
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        if(ticketRecordMapper.insertRecord(record) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED,"创建工单记录失败");
        }
        log.info("创建工单记录成功: {}", record);
        if(ticket.getProcessorId() != null) {
            notificationService.createAssignNotification(
                    ticket.getTicketId(),
                    ticket.getProcessorId(),
                    String.format("您有新的工单待处理: %s", ticket.getTitle())
            );
        }
        log.info("{} 创建工单成功: {}", ticket.getCreateBy(),ticket);
        return ticket.getTicketId();
    }


    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateTicketStatus(UpdateTicketStatusDTO updateDTO) {
        // 1. 查询工单
        Ticket ticket = ticketMapper.selectTicketById(updateDTO.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST,"工单不存在");
        }

        // 2. 校验状态流转
        validateStatusTransition(ticket.getStatus(), updateDTO.getStatus());

        // 3. 更新状态
        Ticket update = new Ticket();
        update.setTicketId(updateDTO.getTicketId());
        update.setStatus(updateDTO.getStatus());
        update.setUpdateBy(updateDTO.getOperatorId());
        update.setUpdateTime(LocalDateTime.now());

        // 如果是完成状态,设置实际完成时间
        if(updateDTO.getStatus() == TicketStatus.COMPLETED) {
            update.setActualFinishTime(LocalDateTime.now());
        }

        if (ticketMapper.updateTicket(update) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        // 4. 添加状态变更记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(updateDTO.getTicketId());
        record.setOperatorId(updateDTO.getOperatorId());
        record.setOperationType(convertStatusToOperation(updateDTO.getStatus()));
        record.setOperationContent(updateDTO.getContent());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        if(ticketRecordMapper.insertRecord(record) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        switch(updateDTO.getStatus()) {
            case PROCESSING ->
                notificationService.createAssignNotification(
                        updateDTO.getTicketId(),
                        ticket.getCreateBy(),
                        "您的工单已开始处理"
                );
            case COMPLETED ->
                notificationService.createCompleteNotification(
                        updateDTO.getTicketId(),
                        ticket.getCreateBy(),
                        "您的工单已处理完成,请确认"
                );
            case CLOSED ->
                notificationService.createCompleteNotification(
                        updateDTO.getTicketId(),
                        ticket.getProcessorId(),
                        "工单已关闭"
                );

        }
    }

    @Override
    public void addTicketRecord(AddTicketRecordDTO recordDTO) {
        // 检查工单是否存在
        Ticket ticket = ticketMapper.selectTicketById(recordDTO.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }
        Long userId = SecurityUtils.getCurrentUserId();
        // 校验工单是否可以被备注
        if(!Objects.equals(ticket.getCreateBy(), userId)
                && ticket.getStatus() == TicketStatus.CLOSED
                && !Objects.equals(ticket.getProcessorId(), userId)
                && !userRoleMapper.selectByUserId(userId, "ADMIN")){
            log.error("非创建人或处理人不能备注工单");
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED, "校验不通过,不能进行备注");
        }
        // 添加处理记录
        TicketRecord record = new TicketRecord();
        BeanUtils.copyProperties(recordDTO, record);
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);
        if (record.getOperationContent().startsWith("\"") && record.getOperationContent().endsWith("\"")) {
            record.setOperationContent(record.getOperationContent().substring(1, record.getOperationContent().length() - 1));
        }
        // 禁止使用此接口评分
        recordDTO.setEvaluationScore(null);
        if (ticketRecordMapper.insertRecord(record) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }
    }

    /**
     * 校验工单状态流转是否合法
     */
    private void validateStatusTransition(TicketStatus oldStatus, TicketStatus newStatus) {
        // 已关闭的工单不能再更改状态
        if(oldStatus == TicketStatus.CLOSED) {
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION, "已关闭工单不能修改状态");
        }

        // 已完成的工单只能关闭
        if(oldStatus == TicketStatus.COMPLETED && newStatus != TicketStatus.CLOSED) {
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION, "已完成工单只能关闭");
        }

        //TODO: 其他状态校验规则...
    }

    /**
     * 状态变更转换为操作类型
     */
    private OperationType convertStatusToOperation(TicketStatus status) {
        switch(status) {
            case PROCESSING:
                return OperationType.HANDLE;
            case COMPLETED:
                return OperationType.FINISH;
            case CLOSED:
                return OperationType.CLOSE;
            default:
                return OperationType.CREATE;
        }
    }

    /**
     * 工单转交
     * @param request 转交请求
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void transferTicket(TransferTicketRequest request) {
        // 1. 查询工单
        Ticket ticket = ticketMapper.selectTicketById(request.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        // 2. 校验状态
        if (ticket.getStatus() == TicketStatus.COMPLETED ||
                ticket.getStatus() == TicketStatus.CLOSED) {
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION);
        }

        // 3. 更新工单部门
        Ticket update = new Ticket();
        update.setTicketId(request.getTicketId());
        update.setDepartmentId(request.getDepartmentId());
        update.setProcessorId(null); // 清空处理人
        update.setUpdateBy(request.getUpdateBy());
        update.setUpdateTime(LocalDateTime.now());

        if (ticketMapper.updateTicket(update) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }

        // 4. 添加转交记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(request.getTicketId());
        record.setOperatorId(request.getUpdateBy());
        record.setOperationType(OperationType.TRANSFER);
        record.setOperationContent(request.getNote());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        ticketRecordMapper.insertRecord(record);

        // 通知新处理人
        notificationService.createAssignNotification(
                request.getTicketId(),
                request.getUpdateBy(),
                String.format("工单已转交给您处理: %s", ticket.getTitle())
        );

        // 通知原处理人
        if(ticket.getProcessorId() != null) {
            notificationService.createAssignNotification(
                    request.getTicketId(),
                    ticket.getProcessorId(),
                    String.format("工单已转交他人处理: %s", ticket.getTitle())
            );
        }
    }

    /**
     * 新增工单删除方法
     * @param ticketId 工单ID
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteTicket(Long ticketId) {
        // 逻辑删除工单
        Ticket ticket = ticketMapper.selectTicketById(ticketId);
        if(ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
        }

        ticket.setIsDeleted(1);
        ticket.setUpdateTime(LocalDateTime.now());
        ticketMapper.updateTicket(ticket);

        // 删除相关通知
        notificationService.deleteByTicketId(ticketId);

        // 记录删除操作
        TicketRecord record = new TicketRecord();
        record.setTicketId(ticketId);
        record.setOperatorId(SecurityUtils.getCurrentUserId());
        record.setOperationType(OperationType.CLOSE);
        record.setOperationContent("工单已删除");
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);

        ticketRecordMapper.insertRecord(record);
    }



    @Override
    @Transactional(rollbackFor = Exception.class)
    public void evaluateTicket(TicketEvaluationDTO evaluationDTO) {
        // 1. 查询工单
        Ticket ticket = ticketMapper.getTicketById(evaluationDTO.getTicketId());
        if (ticket == null) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED, "工单不可评价或已评价");
        }
        // 2. 校验状态
        if (ticketRecordMapper.selectEvaluationByTicketId(evaluationDTO.getTicketId()) != null)
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION, "工单已评价过");

        if (ticket.getStatus() != TicketStatus.COMPLETED) {
            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION, "只能评价已完成的工单");
        }

        // 3. 添加评价记录
        TicketRecord record = new TicketRecord();
        record.setTicketId(evaluationDTO.getTicketId());
        record.setOperatorId(evaluationDTO.getEvaluatorId());
        record.setOperationType(OperationType.CLOSE);
        record.setOperationContent(evaluationDTO.getContent());
        record.setEvaluationScore(evaluationDTO.getScore());
        record.setEvaluationContent(evaluationDTO.getContent());
        record.setCreateTime(LocalDateTime.now());
        record.setIsDeleted(0);


        if(ticketRecordMapper.insertRecord(record) <= 0) {
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED, "评价保存失败");
        }

        // 4. 更新工单状态为已关闭
        this.updateTicketStatus(new UpdateTicketStatusDTO(
                evaluationDTO.getTicketId(),
                TicketStatus.CLOSED,
                evaluationDTO.getEvaluatorId(),
                "评价完成自动关闭"
        ));

        notificationService.createCompleteNotification(
                evaluationDTO.getTicketId(),
                ticket.getProcessorId(),
                String.format("工单已评价完成,评分: %d分", evaluationDTO.getScore())
        );
    }




    @Override
    public PageInfo<Ticket> getTodoTickets(TicketQueryDTO queryDTO) {
        if (queryDTO.getProcessorId() == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "处理人ID不能为空");
        }

        // 默认查询待处理和处理中的工单
        if (queryDTO.getStatus() == null) {
            queryDTO.setStatus(TicketStatus.PENDING);
        }

        // 设置分页
        PageHelper.startPage(queryDTO.getPageNum(), queryDTO.getPageSize());
        List<Ticket> tickets = ticketMapper.selectTicketList(queryDTO);

        return new PageInfo<>(tickets);
    }

    @Override
    public TicketStatisticsVO getTicketStatistics(Long userId) {
        TicketStatisticsVO statistics = new TicketStatisticsVO();

        // 1. 基础统计数据
        statistics.setTotalCount(ticketMapper.countUserTickets(userId));
        statistics.setStatusCount(this.countByStatus(userId));
        statistics.setAvgProcessTime(ticketMapper.calculateAvgProcessTime(userId));
        statistics.setAvgSatisfaction(ticketMapper.calculateAvgSatisfaction(userId));

        // 2. 月度统计数据
        List<MonthlyStatisticsVO> monthlyStats = ticketMapper.getMonthlyStatistics(userId);
        statistics.setMonthlyStats(monthlyStats);

        // 3. 部门统计数据
        List<DepartmentStatisticsVO> deptStats = ticketMapper.getDepartmentStatistics();
        statistics.setDeptStats(deptStats);

        return statistics;
    }

    @Override
    public Map<String, Integer> countByStatus(Long userId) {
        Map<String, Integer> result = new HashMap<>();
        result.put("PENDING", ticketMapper.countTicketsByStatus(userId, TicketStatus.PENDING));
        result.put("PROCESSING", ticketMapper.countTicketsByStatus(userId, TicketStatus.PROCESSING));
        result.put("COMPLETED", ticketMapper.countTicketsByStatus(userId, TicketStatus.COMPLETED));
        result.put("CLOSED", ticketMapper.countTicketsByStatus(userId, TicketStatus.CLOSED));
        return result;
    }

    @Override
    public Long countByStatus(TicketStatus status) {
        return ticketMapper.countBySS(status);
    }

    @Override
    public List<RecentTicketDTO> getTicketTrends(int days) {
        return ticketMapper.selectRecentTickets(days);
    }

    @Override
    public List<TicketTypeStatsDTO> getTicketTypeDistribution() {
        return ticketMapper.getTicketTypeDistribution();
    }

    @Override
    public List<RecentTicketDTO> getRecentTickets(int limit) {
        return ticketMapper.selectRecentTickets(limit);
    }

    @Override
    public BigDecimal calculateAvgSatisfaction() {
        return ticketMapper.calAvgSatisfaction();
    }

    @Override
    public Ticket  getTicketById(Long ticketId) {
        return ticketMapper.getTicketById(ticketId);
    }

    @Override
    public boolean canEvaluate(Long ticketId, Long userId) {
        Boolean canEvaluate = ticketMapper.checkTicketEvaluable(ticketId, userId);
        return canEvaluate != null && canEvaluate;
    }





    @Override
    public Map<String, Object> getEfficiencyAnalysis() {
        Map<String, Object> result = new HashMap<>();

        // 1. 处理效率排名
        result.put("efficiencyRanking", ticketMapper.getEfficiencyRanking());

        // 2. 部门工作量
        result.put("departmentWorkload", ticketMapper.getDepartmentWorkload());

        return result;
    }


    @Override
    public List<TicketExportDTO> exportTickets(TicketQueryDTO queryDTO) {
        // 调用Mapper查询数据
        return ticketMapper.selectForExport(queryDTO);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void importTickets(List<TicketExportDTO> exportDTOs) {
        for (TicketExportDTO exportDTO : exportDTOs) {
            // 1. 转换为Ticket实体
            Ticket ticket = new Ticket();
            BeanUtils.copyProperties(exportDTO, ticket);

            // 2. 设置默认值
            ticket.setStatus(TicketStatus.PENDING);
            ticket.setCreateBy(SecurityUtils.getCurrentUserId());
            ticket.setCreateTime(LocalDateTime.now());
            ticket.setIsDeleted(0);

            // 3. 保存数据
            ticketMapper.insertTicket(ticket);

            // 4. 添加创建记录
            TicketRecord record = new TicketRecord();
            record.setTicketId(ticket.getTicketId());
            record.setOperatorId(SecurityUtils.getCurrentUserId());
            record.setOperationType(OperationType.CREATE);
            record.setOperationContent("批量导入创建");
            record.setCreateTime(LocalDateTime.now());
            record.setIsDeleted(0);

            ticketRecordMapper.insertRecord(record);
        }
    }

    @Override
    public List<TicketType> getTicketTypeList() {
        return ticketTypeMapper.selectByAll(TicketType.builder().isDeleted(0).status(1).build());
    }

    @Override
    public TodoStatsVO getTodoStats(Long userId) {
        // 先进行参数校验
        if (userId == null) {
            throw new BusinessException(CodeEnum.BAD_REQUEST, "用户ID不能为空");
        }

        try {
            // 查询不同状态的工单数量
            Integer pendingCount = ticketMapper.countTicketsByStatus(userId, TicketStatus.PENDING);
            Integer processingCount = ticketMapper.countTicketsByStatus(userId, TicketStatus.PROCESSING);

            // 查询今日完成数量
            LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIN);
            LocalDateTime todayEnd = LocalDateTime.now().with(LocalTime.MAX);
            Integer todayCompleted = ticketMapper.countCompletedTickets(userId, todayStart, todayEnd);

            // 构建返回对象
            return TodoStatsVO.builder()
                    .pendingCount(pendingCount != null ? pendingCount : 0)
                    .processingCount(processingCount != null ? processingCount : 0)
                    .todayCompleted(todayCompleted != null ? todayCompleted : 0)
                    .build();

        } catch (Exception e) {
            log.error("获取待办统计失败, userId: {}", userId, e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "获取统计数据失败");
        }
    }


//    @Override
//    @Transactional
//    public void assignProcessor(Long ticketId, Long processorId) {
//        // 1. 验证工单状态
//        Ticket ticket = ticketMapper.selectTicketById(ticketId);
//        if (ticket == null || ticket.getIsDeleted() == 1) {
//            throw new BusinessException(TicketEnum.TICKET_NOT_EXIST);
//        }
//
//        // 2. 只有PENDING状态的工单可以分配
//        if (ticket.getStatus() != TicketStatus.PENDING) {
//            throw new BusinessException(TicketEnum.TICKET_STATUS_EXCEPTION, "只能给待处理的工单分配处理人");
//        }
//
//        // 3. 更新处理人
//        Ticket update = new Ticket();
//        update.setTicketId(ticketId);
//        update.setProcessorId(processorId);
//        update.setUpdateTime(LocalDateTime.now());
//        ticketMapper.updateTicket(update);
//
//        // 4. 记录分配操作
//        TicketRecord record = new TicketRecord();
//        record.setTicketId(ticketId);
//        record.setOperationType(OperationType.ASSIGN);
//        record.setOperatorId(SecurityUtils.getCurrentUserId());
//        record.setCreateTime(LocalDateTime.now());
//        ticketRecordMapper.insertRecord(record);
//
//        // 5. 发送通知给处理人
//        notificationService.createAssignNotification(ticketId, processorId, "您有新的工单待处理");
//    }

    /**
     * 自动分配所有待处理工单
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void autoAssignPendingTickets() {
        try {
            // 1. 获取所有待处理的工单
            List<Ticket> pendingTickets = ticketMapper.selectPendingTickets();

            for (Ticket ticket : pendingTickets) {
                this.assignSingleTicket(ticket);
            }
        } catch (Exception e) {
            log.error("批量分配工单失败", e);
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }
    }

    @Override
    public UserPermission checkOperationPermission(CheckOperationDTO checkOperationDTO) {

        return userRoleMapper.checkOperationPermission(checkOperationDTO);
    }

    /**
     * 分配单个工单
     */
    @Transactional(rollbackFor = Exception.class)
    public void assignSingleTicket(Ticket ticket) {
        try {
            // 1. 获取部门内所有可用处理人
            List<User> availableProcessors = selectAvailableProcessors(ticket.getDepartmentId());
            if (availableProcessors.isEmpty()) {
                log.warn("部门编号{}-{}没有可用处理人",ticket.getDepartmentId(), ticket.getDepartmentName());
                throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED, "部门没有可用处理人");
            }

            // 2. 获取处理人工作量
            Map<Long, Integer> workloads = new HashMap<>();
            for (User processor : availableProcessors) {
                int currentWorkload = ticketMapper.countActiveTickets(processor.getUserId());
                workloads.put(processor.getUserId(), currentWorkload);
            }

            // 3. 选择工作量最少的处理人
            Long processorId = workloads.entrySet().stream()
                    .min(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(null);

            if (processorId == null) {
                log.warn("无法为工单{}分配处理人", ticket.getTicketId());
                return;
            }

            // 4. 在一个事务中执行所有操作
            doAssignTicket(ticket.getTicketId(), processorId);

        } catch (Exception e) {
            log.error("分配工单{}失败", ticket.getTicketId(), e);
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }
    }

    /**
     * 执行工单分配的具体操作
     * 所有操作在一个事务中完成，任何一步失败都会回滚整个事务
     */
    @Transactional(rollbackFor = Exception.class)
    public void doAssignTicket(Long ticketId, Long processorId) {
        try {
            // 1. 更新工单信息
            Ticket updateTicket = new Ticket();
            updateTicket.setTicketId(ticketId);
            updateTicket.setProcessorId(processorId);
            updateTicket.setStatus(TicketStatus.PROCESSING);
            updateTicket.setUpdateTime(LocalDateTime.now());

            int rows = ticketMapper.updateTicket(updateTicket);
            if (rows == 0) {
                throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED, "更新工单失败");
            }

            // 2. 创建分配记录
            TicketRecord record = new TicketRecord();
            record.setTicketId(ticketId);
            record.setOperatorId(processorId);
            record.setOperationType(OperationType.ASSIGN);
            record.setOperationContent("系统自动分配");
            record.setCreateTime(LocalDateTime.now());
            record.setIsDeleted(0);

            rows = ticketRecordMapper.insertRecord(record);
            if (rows == 0) {
                throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED, "创建分配记录失败");
            }

            // 3. 发送通知
            notificationService.createAssignNotification(
                    ticketId,
                    processorId,
                    String.format("系统已自动为您分配工单：%d，请及时处理", ticketId)
            );

        } catch (Exception e) {
            log.error("分配工单事务执行失败, ticketId: {}, processorId: {}", ticketId, processorId, e);
            throw new BusinessException(TicketEnum.TICKET_OPERATION_FAILED);
        }
    }

    /**
     * 获取可用的处理人
     */
    private List<User> selectAvailableProcessors(Long departmentId) {
        // 1. 获取部门所有处理人
        List<User> allProcessors = userMapper.selectDepartmentProcessors(departmentId);
        if (allProcessors.isEmpty()) {
            return Collections.emptyList();
        }

        // 2. 获取在线处理人IDs
        Set<Long> onlineUserIds = onlineUserManager.getOnlineUsersByDepartment(
                departmentId,
                allProcessors.stream().map(User::getUserId).collect(Collectors.toList())
        );

        // 3. 过滤出在线的处理人
        return allProcessors.stream()
                .filter(user -> onlineUserIds.contains(user.getUserId()))
                .collect(Collectors.toList());
    }


}