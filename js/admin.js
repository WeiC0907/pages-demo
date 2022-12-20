let orderData = [];
const orderList = document.querySelector('.js-orderList')
init()

// 頁面重製
function init() {
    getOrderList()
}

// 獲得訂單資料
function getOrderList() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        headers: {
            'authorization': token
        }
    })
        .then(function (response) {
            orderData = response.data.orders;

            let str = "";
            orderData.forEach(function (item) {
                // 組時間字串
                const timeStamp = newDate = new Date(item.createdAt * 1000); // 需要帶到毫秒所以乘上 1000
                const thisTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()}/${timeStamp.getDate()}`;

                // 組產品字串
                let productStr = ""
                item.products.forEach(function (productItem) {
                    productStr += `<p>${productItem.title} * ${productItem.quantity}</p>`
                })
                // 判斷訂單處理狀態
                let orderStatus = "";
                if (item.paid == true) {
                    orderStatus = "已處理";
                } else {
                    orderStatus = "未處理";
                }
                // 組訂單字串    
                str += `<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${thisTime}</td>
            <td class="orderStatus">
                <a href="#" class="js-orderStatus" data-status="${item.paid}" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
                <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
            })
            orderList.innerHTML = str;
            renderC3_Lv2()
        })
}
 

// C3圖表輸出
function renderC3_Lv2() {
    // 遍歷資料成物件
    let obj = {};
    orderData.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (obj[productItem.title] === undefined) {
                obj[productItem.title] = productItem.quantity * productItem.price;
            } else {
                obj[productItem.title] += productItem.quantity * productItem.price;
            }
        })
    })
    
    // 轉換成陣列
    let originAry = Object.keys(obj);

    // 整理成C3需要資料格式
    let rankSortAry = [];
    originAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
    })
    
    // 使用sort排序
    rankSortAry.sort(function(a, b){
        return b[1] - a[1];
    })
    
    // 第四筆以後資料統整為其他
    if (rankSortAry.length > 3){
        let ortherTotal = 0;
        rankSortAry.forEach(function(item, index){
            if(index > 2){
                ortherTotal += rankSortAry[index][1]; // 第四筆以後金額加總
            }
        })
        rankSortAry.splice(3, rankSortAry.length - 1 ); // 剪除四筆以後的資料
        rankSortAry.push(["其他", ortherTotal]); // 加入其他
    };
    // 放入 C3 圖表
    c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: rankSortAry,
        },
        color: {
            pattern:["#301E5f", "#5434A7", "#9D7FEA", "#DACBFF"]
        }
    });

}

// 事件監聽
orderList.addEventListener("click", function (e) {
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");
    if (targetClass == "js-orderStatus") {
        let status = e.target.getAttribute("data-status");
        orderStatusChange(status, id)
        return
    }
    if (targetClass == "delSingleOrder-Btn js-orderDelete") {
        deleteOrderItem(id)
        return
    }
})

// 資料切換
function orderStatusChange(status, id) {
    let newStatus
    if (status == true) {
        newStatus = false
    } else {
        newStatus = true
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
        "data": {
            "id": id,
            "paid": newStatus
        }
    }, {
        headers: {
            'authorization': token
        }
    })
        .then(function (response) {
            alert("修改訂單狀態成功")
            getOrderList()
        })
}

// 刪除單筆資料
function deleteOrderItem(id) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`, {
        headers: {
            'authorization': token
        }
    })
        .then(function (response) {
            alert("訂單刪除成功")
            getOrderList()
        })
}

// 刪除全部資料
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click", function (e) {
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`, {
        headers: {
            'authorization': token
        }
    })
        .then(function (response) {
            alert("刪除全部訂單成功")
            getOrderList()
        })
})