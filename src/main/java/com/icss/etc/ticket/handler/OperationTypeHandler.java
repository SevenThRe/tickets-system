package com.icss.etc.ticket.handler;

import com.icss.etc.ticket.enums.OperationType;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.springframework.stereotype.Component;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * {@code OperationTypeHandler}
 *
 * @author SevenThRe
 * @version 1.0
 * @since 1.0
 */
@Component
public class OperationTypeHandler extends BaseTypeHandler<OperationType> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, OperationType parameter, JdbcType jdbcType) throws SQLException {
        ps.setInt(i, parameter.getValue());
    }

    @Override
    public OperationType getNullableResult(ResultSet rs, String columnName) throws SQLException {
        int value = rs.getInt(columnName);
        return OperationType.fromValue(value);
    }

    @Override
    public OperationType getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        int value = rs.getInt(columnIndex);
        return OperationType.fromValue(value);
    }

    @Override
    public OperationType getNullableResult(java.sql.CallableStatement cs, int columnIndex) throws SQLException {
        int value = cs.getInt(columnIndex);
        return OperationType.fromValue(value);
    }
}
