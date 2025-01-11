package com.icss.etc.ticket.service.impl;

import com.icss.etc.ticket.entity.dto.ticket.TicketExportDTO;
import com.icss.etc.ticket.enums.CodeEnum;
import com.icss.etc.ticket.exceptions.BusinessException;
import com.icss.etc.ticket.service.TicketImportService;
import com.icss.etc.ticket.service.TicketService;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * {@code TicketImportServiceImpl}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Service
@Slf4j
public class TicketImportServiceImpl implements TicketImportService {
    @Autowired
    private TicketService ticketService;

    public void importFromExcel(MultipartFile file) {
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            List<TicketExportDTO> tickets = new ArrayList<>();

            // 跳过表头行
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    tickets.add(parseRow(row));
                }
            }

            ticketService.importTickets(tickets);
        } catch (Exception e) {
            log.error("导入工单失败:", e);
            throw new BusinessException(CodeEnum.INTERNAL_ERROR, "导入失败");
        }
    }

    private TicketExportDTO parseRow(Row row) {
        TicketExportDTO dto = new TicketExportDTO();
        try {
            dto.setTitle(getCellStringValue(row.getCell(1)));
            dto.setContent(getCellStringValue(row.getCell(2)));
            dto.setDepartmentName(getCellStringValue(row.getCell(3)));
            dto.setPriorityName(getCellStringValue(row.getCell(6)));
            dto.setExpectFinishTime(getCellDateValue(row.getCell(8)));
        } catch (Exception e) {
            log.error("解析行数据失败:", e);
            throw new BusinessException(CodeEnum.BAD_REQUEST, "数据格式错误");
        }
        return dto;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue();
    }

    private LocalDateTime getCellDateValue(Cell cell) {
        if (cell == null) return null;
        try {
            return cell.getLocalDateTimeCellValue();
        } catch (Exception e) {
            return null;
        }
    }
}
