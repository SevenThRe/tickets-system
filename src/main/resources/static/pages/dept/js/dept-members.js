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
                        <td><button type="button" class="btn btn-sm btn-primary view-member-btn" data-member-id="${member.userId}">查看</button></td></tr>`;
                    $('#memberTableBody').append(row);
                });
                $('#memberTableBody').on('click', '.view-member-btn', function() {
                    // var memberId = $(this).data('member-id');
                    var memberId = $(this).data('member-id');
                    var member = response.data.find(m => m.userId === memberId); // 查找对应的成员信息

                    // memberId
                    seleselectModal(member);
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
// 弹出框查看详情
function seleselectModal(member){
    $("#Modal").modal('show');
    console.log(member);
    $("#userId1").val(member.userId|| '无');
    $("#realName1").val(member.realName || '无');
    $("#currentWorkload1").val(member.currentWorkload|| '0');
    $("#processingEfficiency1").val(member.processingEfficiency|| 'D');
    $("#averageProcessingTime1").val(member.averageProcessingTime|| '0小时');
    $("#satisfaction1").val(member.satisfaction|| 'N/A');
    $("#monthlyPerformance1").val(member.monthlyPerformance|| 'N/A');
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
        url: '/api/departments/members/' + memberId,
        type: 'GET',
        success: function (response) {
            // 更新成员 ID 信息
            $('#memberID1').text(response.userId || '无');
            // 更新成员名称信息
            $('#memberName1').text(response.name || '无');
            // 更新成员职位信息
            $('#memberPosition1').text(response.position || '无');
            // 更新总票数信息，并将其转换为数字，如果无法转换则显示 0
            $('#totalTickets1').text(parseInt(response.totalTickets) || 0);
            // 更新当前工作量信息，并将其转换为数字，如果无法转换则显示 0
            $('#currentWorkload1').text(parseFloat(response.currentWorkload) || 0);
            // 更新平均处理时间信息，并添加小时后缀
            $('#avgProcessTime1').text((response.avgProcessTime || 0) + '小时');
            // 更新完成率信息
            $('#completionRate1').text(response.completionRate || 0);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            if (typeof NotifyUtil === 'object' && typeof NotifyUtil.error === 'function') {
                if (jqXHR.status === 404) {
                    NotifyUtil.error('未找到成员信息，请检查成员 ID 是否正确。');
                } else if (jqXHR.status === 500) {
                    NotifyUtil.error('服务器内部错误，请联系管理员。');
                } else {
                    NotifyUtil.error('查看成员详情失败：' + jqXHR.responseText);
                }
            } else {
                console.error('查看成员详情失败：', jqXHR.status, jqXHR.responseText);
            }
        }
    });
})



// 关闭成员详情抽屉
$('#closeDrawerBtn').on('click', function() {
    $('#memberDrawer').removeClass('open');
});
