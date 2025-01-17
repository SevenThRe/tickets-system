// 初始化页面
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


function _renderDeptDetails(response) {
    let totalCount = response.data.length;
    $('#totalCount').text(totalCount);
    $('#totalMembers').text(totalCount)
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
    if (response.pagination) {
        renderPagination(response.pagination);
    }

    // 计算平均工作量
    let totalWorkload = 0;
    $.each(response.data, function(index, member) {
        totalWorkload += member.currentWorkload;
    });
    let averageWorkload = totalWorkload / response.data.length;
    $('#avgWorkload').text(averageWorkload.toFixed(2));

    // 计算平均处理效率
    let totalEfficiency = 0;
    $.each(response.data, function(index, member) {
        if (member.processingEfficiency!== null) {
            // 替换大写字母
            member.processingEfficiency = member.processingEfficiency.replace(/[A-Z]/g, function(match) {
                return String.fromCharCode(match.charCodeAt(0) - 65);
            });
            // 将字符串转换为整数
            member.processingEfficiency = parseInt(member.processingEfficiency);
            // 处理 NaN 情况
            if (isNaN(member.processingEfficiency)) {
                member.processingEfficiency = 0;
            }
            // 累加处理效率
            totalEfficiency += member.processingEfficiency;
        } else {
            // 如果 member.processingEfficiency 为 null，将其视为 0
            member.processingEfficiency = 0;
            totalEfficiency += 0;
        }
    });
    const averageEfficiency = totalEfficiency / response.data.length;
    $('#avgEfficiency').text(averageEfficiency.toFixed(2));

    // 计算平均满意度
    var totalSatisfaction = 0;
    $.each(response.data, function(index, member) {
        // 过滤所有的null
        totalSatisfaction += member.satisfaction;
    });
    $('#avgSatisfaction').html(this._renderStars(totalSatisfaction / response.data.length));

}

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
            if (response.code===200) {
               _renderDeptDetails(response);
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
    $("#userId1").val(member.userId).prop({disabled:true});
    $("#username1").val(member.username).prop({disabled:true});
    $("#realName1").val(member.realName).prop({disabled:true});
    $("#departmentName1").val(member.departmentName).prop({disabled:true});
    $("#email1").val(member.email).prop({disabled:true});
    $("#phone1").val(member.phone).prop({disabled:true});
    $("#roleName1").val(member.roleName).prop({disabled:true});
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

$(document).ready(function() {

});
// 查看成员详情
$(document).on('click', '.view-member-btn', function() {
    var memberId = $(this).data('member-id');
    $.ajax({
        url: '/api/departments/member/' + memberId,
        type: 'GET',
        success: function (response) {
            // 更新成员 ID 信息
           seleselectModal(response.data)
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

//刷新
function shuaXin(){
    window.location.reload();
}

// 关闭成员详情抽屉
$('#closeDrawerBtn').on('click', function() {
    $('#memberDrawer').removeClass('open');
});


function _renderStars(score) {
    const fullStar = '<i class="bi bi-star-fill star"></i>';
    const halfStar = '<i class="bi bi-star-half star"></i>';
    const emptyStar = '<i class="bi bi-star star star-empty"></i>';

    let stars = '';
    const totalStars = 5;

    for(let i = 1; i <= totalStars; i++) {
        if(i <= Math.floor(score)) {
            stars += fullStar;
        } else if(i - 0.5 <= score) {
            stars += halfStar;
        } else {
            stars += emptyStar;
        }
    }

    return stars;
}
