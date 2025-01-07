package com.icss.etc.ticket.util;

import cn.hutool.poi.excel.ExcelReader;
import cn.hutool.poi.excel.ExcelWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Excel工具类
 * 基于Hutool的Excel工具类封装,提供通用的Excel导入导出功能
 *
 * @author SeventhRe
 * @version 1.0
 */
@Slf4j
public class ExcelUtil {

    /**
     * Excel导出到响应流
     *
     * @param fileName 文件名(不含后缀)
     * @param data     数据列表
     * @param <T>      数据类型
     */
    public static <T> void export(String fileName, List<T> data, Class<T> clazz, HttpServletResponse response) {
        try {
            // 设置响应头
            setExportResponseHeaders(fileName, response);

            // 创建writer
            ExcelWriter writer = cn.hutool.poi.excel.ExcelUtil.getWriter();

            // 设置只导出有注解的字段
            writer.setOnlyAlias(true);

            // 写入数据
            writer.write(data);

            // 导出
            writer.flush(response.getOutputStream());

            // 关闭
            writer.close();
        } catch (Exception e) {
            log.error("Excel导出失败", e);
            throw new RuntimeException("Excel导出失败: " + e.getMessage());
        }
    }

    /**
     * Excel导入
     * 读取Excel文件内容并转换为指定类型的对象列表
     *
     * @param file  Excel文件
     * @param clazz 目标类型
     * @param <T>   泛型类型
     * @return 导入的数据列表
     */
    public static <T> List<T> importExcel(MultipartFile file, Class<T> clazz) {
        try {
            // 获取输入流
            InputStream inputStream = file.getInputStream();

            // 创建reader
            ExcelReader reader = cn.hutool.poi.excel.ExcelUtil.getReader(inputStream);

            // 读取数据并转换为对象列表
            List<T> list = reader.readAll(clazz);

            // 关闭reader
            reader.close();

            return list;
        } catch (IOException e) {
            log.error("Excel导入失败", e);
            throw new RuntimeException("Excel导入失败: " + e.getMessage());
        }
    }

    /**
     * 设置Excel导出的响应头
     *
     * @param fileName 文件名(不含后缀)
     * @param response HTTP响应对象
     * @throws IOException 如果设置响应头失败
     */
    private static void setExportResponseHeaders(String fileName, HttpServletResponse response) throws IOException {
        // URL编码文件名
        String encodeFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8);

        // 设置响应头
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-disposition",
                String.format("attachment;filename*=utf-8''{%s}.xlsx", encodeFileName));
    }
}