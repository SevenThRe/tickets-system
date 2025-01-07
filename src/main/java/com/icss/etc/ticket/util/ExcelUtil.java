package com.icss.etc.ticket.util;

import com.icss.etc.ticket.annotation.ExcelColumn;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.lang.reflect.Field;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Excel工具类
 * 基于POI和自定义注解实现的Excel导入导出工具
 *
 * @author SeventhRe
 * @version 1.0
 */
@Slf4j
public class ExcelUtil {

    /**
     * 导出Excel
     *
     * @param fileName 文件名(不含后缀)
     * @param data     数据列表
     * @param clazz    数据类型
     * @param response HTTP响应对象
     * @param <T>      泛型类型
     */
    public static <T> void export(String fileName, List<T> data, Class<T> clazz, HttpServletResponse response) {
        try {
            // 解析类注解信息
            List<ExcelColumnInfo> columnInfos = parseColumnInfo(clazz);

            // 设置响应头
            setExportResponseHeaders(fileName, response);

            // 创建工作簿
            try (Workbook workbook = new XSSFWorkbook()) {
                Sheet sheet = workbook.createSheet("Sheet1");

                // 写入表头
                writeHeader(sheet, workbook, columnInfos);

                // 写入数据
                writeData(sheet, workbook, data, columnInfos);

                // 设置列宽
                setColumnWidth(sheet, columnInfos);

                // 输出
                workbook.write(response.getOutputStream());
            }
        } catch (Exception e) {
            log.error("Excel导出失败", e);
            throw new RuntimeException("Excel导出失败: " + e.getMessage());
        }
    }

    /**
     * 解析类的Excel列注解信息
     */
    private static List<ExcelColumnInfo> parseColumnInfo(Class<?> clazz) {
        List<ExcelColumnInfo> columnInfos = new ArrayList<>();

        // 获取所有字段
        Field[] fields = clazz.getDeclaredFields();
        for (Field field : fields) {
            ExcelColumn annotation = field.getAnnotation(ExcelColumn.class);
            if (annotation != null) {
                columnInfos.add(new ExcelColumnInfo(
                        field,
                        annotation.value(),
                        annotation.index(),
                        annotation.width(),
                        annotation.dateFormat()
                ));
            }
        }

        // 按index排序
        columnInfos.sort(Comparator.comparingInt(ExcelColumnInfo::getIndex));
        return columnInfos;
    }

    /**
     * 写入表头
     */
    private static void writeHeader(Sheet sheet, Workbook workbook, List<ExcelColumnInfo> columnInfos) {
        // 创建标题行
        Row headerRow = sheet.createRow(0);

        // 创建标题样式
        CellStyle headerStyle = createHeaderStyle(workbook);

        // 写入标题
        for (int i = 0; i < columnInfos.size(); i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columnInfos.get(i).getTitle());
            cell.setCellStyle(headerStyle);
        }
    }

    /**
     * 写入数据
     */
    private static <T> void writeData(Sheet sheet, Workbook workbook, List<T> dataList,
                                      List<ExcelColumnInfo> columnInfos) throws Exception {
        // 创建内容样式
        CellStyle contentStyle = createContentStyle(workbook);

        // 遍历数据
        for (int rowNum = 0; rowNum < dataList.size(); rowNum++) {
            Row row = sheet.createRow(rowNum + 1);
            T data = dataList.get(rowNum);

            // 写入每一列
            for (int colNum = 0; colNum < columnInfos.size(); colNum++) {
                Cell cell = row.createCell(colNum);
                cell.setCellStyle(contentStyle);

                ExcelColumnInfo columnInfo = columnInfos.get(colNum);
                Field field = columnInfo.getField();
                field.setAccessible(true);

                // 获取字段值
                Object value = field.get(data);
                if (value != null) {
                    if (value instanceof LocalDateTime) {
                        // 日期格式化
                        String formatted = ((LocalDateTime) value).format(
                                DateTimeFormatter.ofPattern(columnInfo.getDateFormat())
                        );
                        cell.setCellValue(formatted);
                    } else {
                        cell.setCellValue(value.toString());
                    }
                }
            }
        }
    }

    /**
     * 设置列宽
     */
    private static void setColumnWidth(Sheet sheet, List<ExcelColumnInfo> columnInfos) {
        for (int i = 0; i < columnInfos.size(); i++) {
            sheet.setColumnWidth(i, columnInfos.get(i).getWidth() * 256);
        }
    }

    /**
     * 创建表头样式
     */
    private static CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        // 背景色
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        // 边框
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        // 字体
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        // 对齐
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    /**
     * 创建内容样式
     */
    private static CellStyle createContentStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        // 边框
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        // 对齐
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    /**
     * 设置响应头
     */
    private static void setExportResponseHeaders(String fileName, HttpServletResponse response)
            throws IOException {
        String encodeFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-disposition",
                String.format("attachment;filename*=utf-8''{%s}.xlsx", encodeFileName));
    }

    /**
     * Excel列信息内部类
     */
    private static class ExcelColumnInfo {
        private final Field field;
        private final String title;
        private final int index;
        private final int width;
        private final String dateFormat;

        public ExcelColumnInfo(Field field, String title, int index, int width, String dateFormat) {
            this.field = field;
            this.title = title;
            this.index = index;
            this.width = width;
            this.dateFormat = dateFormat;
        }

        public Field getField() {
            return field;
        }

        public String getTitle() {
            return title;
        }

        public int getIndex() {
            return index;
        }

        public int getWidth() {
            return width;
        }

        public String getDateFormat() {
            return dateFormat;
        }
    }
}