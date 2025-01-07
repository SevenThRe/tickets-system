package com.icss.etc.ticket.util;

import org.apache.poi.ss.usermodel.Row; /**
 * Excel数据处理回调接口
 * @param <T> 数据类型
 */
@FunctionalInterface
public interface ExcelDataCallback<T> {
    /**
     * 设置Excel行数据
     * @param row Excel行对象
     * @param data 数据对象
     */
    void setData(Row row, T data);
}
