package com.icss.etc.ticket.util;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

/**
 * TODO 类作用描述
 *
 * @author 陈明
 * @Date 2025/1/14
 */
@Component
public class GradeCalculator {
    private static final List<Double> ranges = Arrays.asList(15.0, 40.0, 60.0);
    private static final List<String> grades = Arrays.asList("A", "B", "C", "D");

    public static String getGrade(double avgProcessTime) {
        Optional<String> grade = IntStream.range(0, ranges.size())
                .filter(i -> avgProcessTime < ranges.get(i))
                .mapToObj(grades::get)
                .findFirst();
        return grade.orElse("D");
    }

    public static Optional<Double> getRangeByGrade(String grade) {
        int index = grades.indexOf(grade);
        if (index == 0) {
            return Optional.of(0.0);
        } else if (index > 0 && index < ranges.size()) {
            return Optional.of(ranges.get(index - 1));
        } else if (index == ranges.size()) {
            return Optional.of(ranges.get(index - 1));
        } else {
            return Optional.empty();
        }
    }


}