package com.icss.etc.ticket.handler;

import com.icss.etc.ticket.enums.NotifyType;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.springframework.stereotype.Component;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
/**
 * {@code NotifyType} 类型处理器
 * 类型处理器
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
public class NotifyTypeHandler extends BaseTypeHandler<NotifyType> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, NotifyType parameter, JdbcType jdbcType) throws SQLException {
        ps.setInt(i, parameter.getValue());
    }

    @Override
    public NotifyType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        int value = rs.getInt(columnName);
        return NotifyType.fromValue(value);
    }

    @Override
    public NotifyType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        int value = rs.getInt(columnIndex);
        return NotifyType.fromValue(value);
    }

    @Override
    public NotifyType getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        int value = cs.getInt(columnIndex);
        return NotifyType.fromValue(value);
    }
}