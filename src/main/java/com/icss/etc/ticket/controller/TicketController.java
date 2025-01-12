package com.icss.etc.ticket.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.icss.etc.ticket.entity.R;
import com.icss.etc.ticket.entity.Ticket;
import com.icss.etc.ticket.entity.TicketRecord;
import com.icss.etc.ticket.entity.TicketType;
import com.icss.etc.ticket.entity.dto.ticket.*;
import com.icss.etc.ticket.entity.vo.TicketDetailVO;
import com.icss.etc.ticket.entity.vo.ticket.TicketStatisticsVO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.enums.OperationType;
import com.icss.etc.ticket.enums.TicketEnum;
import com.icss.etc.ticket.enums.TicketStatus;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.service.FileService;
import com.icss.etc.ticket.service.TicketService;
import com.icss.etc.ticket.util.ExcelUtil;
import com.icss.etc.ticket.util.SecurityUtils;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/tickets")
@Slf4j
public class TicketController {

    private final TicketService ticketService;

    private final FileService fileService;


    public TicketController(TicketService ticketService , FileService fileService) {
        this.ticketService = ticketService;
        this.fileService = fileService;
    }

    /* My-Ticket.HTML 相关代码 */
    /**
     * 获取工单列表
     */
    @GetMapping("/list")
    public R<PageInfo<Ticket>> getTicketList(TicketQueryDTO queryDTO) {
        try {
            PageInfo<Ticket> pageInfo = ticketService.getTicketList(queryDTO);
            return R.OK(pageInfo);
        } catch (Exception e) {
            log.error("查询工单列表失败:", e);
            return R.FAIL();
        }
    }

    /**
     *  获取工单类型列表
     * @return 工单类型列表
     */
    @GetMapping("/type/list")
    public R<List<TicketType>> getTicketTypeList() {
        try {
            List<TicketType> ticketTypeList = ticketService.getTicketTypeList();
            return R.OK(ticketTypeList);
        } catch (Exception e) {
            log.error("查询工单类型列表失败:", e);
            return R.FAIL();
        }
    }
    // TEST:OK
    /**
     * 获取工单详情
     */
    @GetMapping("/{ticketId}")
    public R<TicketDetailVO> getTicketDetail(@PathVariable Long ticketId) {
        try {
            TicketDetailVO detail = ticketService.getTicketDetail(ticketId);
            return R.OK(detail);
        } catch (BusinessException e) {
            log.error("查询工单详情失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_NOT_EXIST);
        } catch (Exception e) {
            log.error("查询工单详情失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 删除工单
     * @param ticketId 工单ID
     * @return R<Void>
     */
    @DeleteMapping("/{ticketId}")
    public R<Void> deleteTicket(@PathVariable Long ticketId) {
        try {
            ticketService.deleteTicket(ticketId);
            return R.OK();
        } catch (BusinessException e) {
            log.error("删除工单失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("删除工单失败:", e);
            return R.FAIL();
        }
    }

    // TEST:OK
    /**
     * 创建工单
     * @param createDTO 创建工单请求
     *
     */
    @PostMapping(value = "/create" ,consumes = "multipart/form-data")
    public R<Long> createTicket(
            @RequestParam("attachments") MultipartFile file,
            @RequestBody @Valid CreateTicketDTO createDTO) {
        try {
            Long ticketId = ticketService.createTicket(createDTO);
            return R.OK(ticketId);
        } catch (BusinessException e) {
            log.error("创建工单失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("创建工单失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 更新工单状态
     */
    @PutMapping("/status")
    public R<Void> updateTicketStatus(@RequestBody @Valid UpdateTicketStatusDTO updateDTO) {
        try {
            ticketService.updateTicketStatus(updateDTO);
            return R.OK();
        } catch (BusinessException e) {
            log.error("更新工单状态失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("更新工单状态失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 添加处理记录
     */
    @PostMapping("/records")
    public R<Void> addTicketRecord(@RequestBody @Valid AddTicketRecordDTO recordDTO) {
        try {
            ticketService.addTicketRecord(recordDTO);
            return R.OK();
        } catch (BusinessException e) {
            log.error("添加处理记录失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("添加处理记录失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 工单转交
     */
    @PostMapping("/{ticketId}/transfer")
    public R<Void> transferTicket(@RequestBody @Valid TransferTicketRequest request) {
        try {
            ticketService.transferTicket(request);
            return R.OK();
        } catch (BusinessException e) {
            log.error("工单转交失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("工单转交失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 工单评价
     */
    @PostMapping("/{ticketId}/evaluate")
    public R<Void> evaluateTicket(@RequestBody @Valid TicketEvaluationDTO evaluationDTO) {
        try {
            ticketService.evaluateTicket(evaluationDTO);
            return R.OK();
        } catch (BusinessException e) {
            log.error("工单评价失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("工单评价失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 获取我的待办工单
     */
    @GetMapping("/todos")
    public R<PageInfo<Ticket>> getTodoTickets(TicketQueryDTO queryDTO) {
        try {
            PageInfo<Ticket> pageInfo = ticketService.getTodoTickets(queryDTO);
            return R.OK(pageInfo);
        } catch (Exception e) {
            log.error("查询待办工单失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 获取统计数据
     */
    @GetMapping("/statistics")
    public R<TicketStatisticsVO> getStatistics(@RequestParam Long userId) {
        try {
            TicketStatisticsVO statistics = ticketService.getTicketStatistics(userId);
            return R.OK(statistics);
        } catch (Exception e) {
            log.error("获取统计数据失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 根据用户ID获取我的工单列表
     */
    @GetMapping("/my")
    public R<PageInfo<Ticket>> getMyTickets(TicketQueryDTO queryDTO) {
        try {
            // 确保只查询当前用户的工单
            Long userId = SecurityUtils.getCurrentUserId();

            PageInfo<Ticket> pageInfo = ticketService.getTicketList(queryDTO);
            return R.OK(pageInfo);
        } catch (Exception e) {
            log.error("查询我的工单失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 添加工单备注
     */
    @PostMapping("/{ticketId}/note")
    public R<Void> addTicketNote(@PathVariable Long ticketId, @RequestBody String note) {
        try {
            AddTicketRecordDTO recordDTO = new AddTicketRecordDTO();
            recordDTO.setTicketId(ticketId);
            recordDTO.setOperatorId(SecurityUtils.getCurrentUserId());
            recordDTO.setOperationType(OperationType.HANDLE);
            recordDTO.setContent(note);

            ticketService.addTicketRecord(recordDTO);
            return R.OK();
        } catch (BusinessException e) {
            log.error("添加工单备注失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("添加工单备注失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 关闭工单
     */
    @PutMapping("/{ticketId}/close")
    public R<Void> closeTicket(@PathVariable Long ticketId, @RequestBody CloseTicketRequest request) {
        try {
            UpdateTicketStatusDTO updateDTO = new UpdateTicketStatusDTO();
            updateDTO.setTicketId(ticketId);
            updateDTO.setStatus(TicketStatus.CLOSED);
            updateDTO.setOperatorId(request.getOperatorId());
            updateDTO.setContent(request.getContent());

            ticketService.updateTicketStatus(updateDTO);
            return R.OK();
        } catch (BusinessException e) {
            log.error("关闭工单失败: {}", e.getMessage());
            return R.FAIL(TicketEnum.TICKET_OPERATION_FAILED);
        } catch (Exception e) {
            log.error("关闭工单失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 上传工单附件
     */
    @PostMapping("/{ticketId}/attachments")
    public R uploadAttachments(@PathVariable Long ticketId,
                                             @RequestParam("files") MultipartFile[] files) {
        try {
            // 1. 上传文件
            List<String> fileUrls = fileService.uploadFiles(files, ticketId);

            // 2. 添加附件记录
            AddTicketRecordDTO recordDTO = new AddTicketRecordDTO();
            recordDTO.setTicketId(ticketId);
            recordDTO.setOperatorId(SecurityUtils.getCurrentUserId());
            recordDTO.setOperationType(OperationType.HANDLE);
            recordDTO.setContent("上传附件：" + String.join(", ",
                    Arrays.stream(files)
                            .map(MultipartFile::getOriginalFilename)
                            .collect(Collectors.toList())));

            ticketService.addTicketRecord(recordDTO);

            return R.OK(fileUrls);
        } catch (BusinessException e) {
            log.error("上传附件失败: {}", e.getMessage());
            return R.builder().msg(e.getMessage()).code(e.getCode()).build();
        } catch (Exception e) {
            log.error("上传附件失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 获取工单处理进度
     */
    @GetMapping("/{ticketId}/progress")
    public R<List<TicketRecord>> getTicketProgress(@PathVariable Long ticketId) {
        try {
            TicketDetailVO detail = ticketService.getTicketDetail(ticketId);
            return R.OK(detail.getRecords());
        } catch (Exception e) {
            log.error("获取工单进度失败:", e);
            return R.FAIL();
        }
    }

    /**
     * 导出工单数据
     * @param queryDTO 查询条件
     * @param response 响应对象
     */
    @GetMapping("/export")
    public void exportTickets(TicketQueryDTO queryDTO, HttpServletResponse response) {
        try {
            // 1. 获取导出数据
            List<TicketExportDTO> exportData = ticketService.exportTickets(queryDTO);

            // 2. 导出文件
            String fileName = String.format("工单列表_%s",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

            ExcelUtil.export(fileName, exportData, TicketExportDTO.class, response);
        } catch (Exception e) {
            log.error("导出工单失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "导出失败");
        }
    }

    @PostMapping("/import")
    public R<Void> importTickets(@RequestParam("file") MultipartFile file) {
        try {
            // TODO: 实现导入功能
            // 1. 验证文件
            // 2. 解析数据
            // 3. 批量保存
            return R.OK();
        } catch (Exception e) {
            log.error("导入工单失败:", e);
            return R.FAIL();
        }
    }


}