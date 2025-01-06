package com.icss.etc.ticket.handler;

import com.icss.etc.ticket.enums.Priority;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.springframework.stereotype.Component;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class PriorityTypeHandler extends BaseTypeHandler<Priority> {
    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, Priority parameter, JdbcType jdbcType) throws SQLException {
        ps.setInt(i, parameter.getValue());
    }

    @Override
    public Priority getNullableResult(ResultSet rs, String columnName) throws SQLException {
        int ordinal = rs.getInt(columnName);
        if (ordinal < 0 || ordinal >= Priority.values().length) {
            return null; // or throw an exception, or handle it as needed
        }

        return Priority.values()[ordinal];
    }

    @Override
    public Priority getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        int ordinal = rs.getInt(columnIndex);

        if (ordinal < 0 || ordinal >= Priority.values().length) {
            return null; // or throw an exception, or handle it as needed
        }
        return Priority.values()[ordinal];
    }

    @Override
    public Priority getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        int ordinal = cs.getInt(columnIndex);


        if (ordinal < 0 || ordinal >= Priority.values().length) {
            return null; // or throw an exception, or handle it as needed
        }
        return Priority.values()[ordinal];
    }
}