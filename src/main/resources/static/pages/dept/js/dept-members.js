// 初始化页面
var deptId = 0;
let userId = JSON.parse(localStorage.getItem('userInfo')).userId;
let pageNum =1;
let pageSize = 10;
let total=0;
$(document).ready(function() {
    // 初始化成员列表
    loadMemberList();

    // 绑定成员列表搜索框输入事件
    $('#searchKeyword').on('input', function() {
        loadMemberList();
    });


    // 绑定成员列表筛选框选择事件
    $('#workloadFilter, #performanceFilter').on('change', function() {
        loadMemberList();
    });

    // 绑定成员列表筛选框选择事件
    $('#workloadFilter, #performanceFilter').on('change', function() {
        loadMemberList();
    });

    // 绑定成员列表筛选框选择事件
    $('#workloadFilter, #performanceFilter').on('change', function() {
        loadMemberList();
    });

    // 绑定成员列表筛选框选择事件
    $('#workloadFilter, #performanceFilter').on('change', function() {
        loadMemberList();
    });
    // 绑定搜索按钮点击事件
    $('#searchBtn').on('click', function() {
        loadMemberList();
    });

    // 绑定刷新按钮点击事件
    $('#refreshBtn').on('click', function() {
        loadMemberList();
    });

    // 绑定导出按钮点击事件
    $('#exportBtn').on('click', function() {
        exportMemberList();
    });

    // 绑定分页点击事件
    $('#pagination').on('click', '.page-link', function(e) {
        e.preventDefault();
        var page = $(this).data('page');
        loadMemberList(page);
    });
});



// 加载成员列表
function loadMemberList(page) {
    page = page || 1;
    var keyword = $('#searchKeyword').val();
    var workloadFilter = $('#workloadFilter').val();
    var performanceFilter = $('#performanceFilter').val();

    $.ajax({
        url: '/api/departments/meblist',
        type: 'GET',
        data: {
            userId,
            pageNum,
            pageSize,
            keyword: keyword,
            workloadFilter: workloadFilter,
            performanceFilter: performanceFilter
        },
        success: function(response) {
            if (response && response.data && response.data.length > 0) {
                // 尝试从 data 数组的长度中获取总计数
                var totalCount = response.data.length;
                $('#totalCount').text(totalCount);
                $('#memberTableBody').empty();
                $.each(response.data, function(index, member) {
                    const row = `<tr>
                        <td>${member.userId || 'N/A'}</td>
                        <td>${member.realName || 'N/A'}</td>
                        <td>${member.currentWorkload || '0'}</td>
                        <td>${member.processingEfficiency|| 'N/A'}</td>
                        <td>${member.averageProcessingTime || 'N/A'}小时</td>
                        <td>${member.satisfaction || 'N/A'}</td>
                        <td>${member.monthlyPerformance || 'N/A'}</td>
                        <td><button type="button" class="btn btn-sm btn-primary view-member-btn" data-member-id="${member.employeeId || 'N/A'}">查看</button></td></tr>`;
                    $('#memberTableBody').append(row);
                });
                if (response.pagination) {
                    renderPagination(response.pagination);
                }
            } else {
               NotifyUtil.error('返回的数据格式有误');
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            NotifyUtil.error('加载成员列表失败：' + jqXHR.responseText);
        }
    });
}

// 渲染分页控件
function renderPagination(pagination) {
    if (pagination) {
        $('#pagination').empty();
        var pages = Math.ceil(pagination.totalCount / pagination.pageSize);
        for (var i = 1; i <= pages; i++) {
            var activeClass = i === pagination.currentPage? 'active' : '';
            var pageLink = '<li class="page-item ' + activeClass + '"><a class="page-link" href="#" data-page="' + i + '">' + i + '</a></li>';
            $('#pagination').append(pageLink);
        }
    } else {
        NotifyUtil.error('pagination 对象未定义或为空');
    }
}

// 导出成员列表
function exportMemberList() {
    var keyword = $('#searchKeyword').val();
    var workloadFilter = $('#workloadFilter').val();
    var performanceFilter = $('#performanceFilter').val();

    $.ajax({
        url: '/api/members/export?keyword=' + keyword + '&workloadFilter=' + workloadFilter + '&performanceFilter=' + performanceFilter,
        type: 'GET',
        success: function () {
            console.log('成员列表导出成功');
            if (typeof NotifyUtil === 'object' && typeof NotifyUtil.success === 'function') {
                NotifyUtil.success('成员列表导出成功');
            } else {
                NotifyUtil.error('成员列表导出成功');
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            NotifyUtil.error('导出成员列表失败：' + jqXHR.responseText);
        }
    });
}

// 查看成员详情
$(document).on('click', '.view-member-btn', function() {
    var memberId = $(this).data('member-id');
    $.ajax({
        url: '/api/members/' + memberId,
        type: 'GET',
        success: function (response) {
            $('#memberName').text(response.name);
            $('#memberPosition').text(response.position);
            $('#totalTickets').text(response.totalTickets);
            $('#currentWorkload').text(response.currentWorkload);
            $('#avgProcessTime').text(response.avgProcessTime + '小时');
            $('#completionRate').text(response.completionRate + '%');
            $('#memberAvatar').attr('src', response.avatar);

            // 加载近期工单
            $('#recentTicketsList').empty();
            $.each(response.recentTickets, function (index, ticket) {
                var ticketItem = '<div class="ticket-item">' +
                    '<h6 class="ticket-title">' + ticket.title + '</h6>' +
                    '<p class="ticket-status">' + ticket.status + '</p>' +
                    '<p class="ticket-time">' + ticket.processTime + '小时</p>' +
                    '</div>';
                $('#recentTicketsList').append(ticketItem);
            });

            // 加载效率分析图表
            var efficiencyData = {
                labels: response.efficiencyChart.labels,
                datasets: [{
                    label: '效率趋势',
                    data: response.efficiencyChart.data,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            };
            var efficiencyOptions = {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            };
            var ctx = $('#memberEfficiencyChart').get(0).getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: efficiencyData,
                options: efficiencyOptions
            });

            // 显示成员详情抽屉
            $('#memberDrawer').addClass('open');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            NotifyUtil.error('加载成员详情失败：' + jqXHR.responseText);
        }
    });
})

// 关闭成员详情抽屉
$('#closeDrawerBtn').on('click', function() {
    $('#memberDrawer').removeClass('open');
});
