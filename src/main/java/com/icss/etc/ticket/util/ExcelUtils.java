package com.icss.etc.ticket.util;

/**
 * {@code ExcelUtils}
 * 导出Excel工具类
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */

import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.List;

/**
 * Excel导出工具类
 * 提供Excel文件生成和导出的通用方法
 */
public class ExcelUtils {
    private static final Logger logger = LoggerFactory.getLogger(ExcelUtils.class);

    /**
     * 生成Excel工作簿
     * @param sheetName 工作表名称
     * @param headers 表头数组
     * @param dataList 数据列表
     * @param callback 数据处理回调
     * @return Excel工作簿
     */
    public static <T> Workbook createWorkbook(String sheetName,
                                              String[] headers,
                                              List<T> dataList,
                                              ExcelDataCallback<T> callback) {
        // 创建工作簿
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(sheetName);

        // 设置表头样式
        CellStyle headerStyle = createHeaderStyle(workbook);

        // 创建表头
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // 填充数据
        if (dataList != null) {
            for (int i = 0; i < dataList.size(); i++) {
                Row dataRow = sheet.createRow(i + 1);
                callback.setData(dataRow, dataList.get(i));
            }
        }

        // 自动调整列宽
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        return workbook;
    }

    /**
     * 创建表头样式
     * @param workbook 工作簿
     * @return 单元格样式
     */
    private static CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        // 设置背景色
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        // 设置边框
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        // 设置字体
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    /**
     * 导出Excel到响应流
     * @param response HTTP响应对象
     * @param fileName 文件名
     * @param workbook Excel工作簿
     */
    public static void export(HttpServletResponse response,
                              String fileName,
                              Workbook workbook) throws IOException {
        response.setContentType("application/vnd.ms-excel");
        response.setHeader("Content-Disposition",
                "attachment;filename=" + URLEncoder.encode(fileName, "UTF-8"));

        try (OutputStream out = response.getOutputStream()) {
            workbook.write(out);
            out.flush();
        } finally {
            workbook.close();
        }
    }
}
