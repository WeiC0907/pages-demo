//DOM
const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const cartFinalTotal = document.querySelector(".js-finalTotal");

let productData = []
let cartData = [];

// 頁面重製
function init() {
  getProductList();
  getCartList();
}
init()

// 獲取API資料
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
      // console.log(response.data.products);
      productData = response.data.products;
      renderProductList()
    })
}

// 產品重製
function renderProductList() {
  let str = "";
  productData.forEach(function (item) {
    str += combineProductHTMLItem(item);
  });
  productWrap.innerHTML = str;
}

// 回傳字串(消除重複)
function combineProductHTMLItem(item) {
  return `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img src="${item.images}" alt="">
  <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${item.origin_price.toLocaleString('en-US')}</del>
  <p class="nowPrice">NT$${item.price.toLocaleString('en-US')}</p>
  </li>`
}

// 篩選
productSelect.addEventListener("change", function (e) {
  const category = e.target.value
  if (category == "全部") {
    renderProductList();
    return
  }
  let str = "";
  productData.forEach(function (item) {
    if (item.category == category) {
      str += combineProductHTMLItem(item);
    }
  })
  productWrap.innerHTML = str;
})

//加入購物車
productWrap.addEventListener("click", function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "addCardBtn") {
    return;
  }
  let productId = e.target.getAttribute("data-id");
  let numCheck = 1; // 確保購物車是否已有品項

  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  })
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "productId": productId,
      "quantity": numCheck
    }
  }).then(function (response) {
    alert("加入購物車");
    getCartList();
  })
})

//取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      cartFinalTotal.textContent = response.data.finalTotal.toLocaleString('en-US');
      cartData = response.data.carts;
      let str = "";
      cartData.forEach(function (item) {
        str += `<tr>
      <td>
          <div class="cardItem-title">
              <img src="${item.product.images}" alt="">
              <p>${item.product.title}</p>
          </div>
      </td>
      <td>NT$${item.product.price.toLocaleString('en-US')}</td>
      <td>${item.quantity}</td>
      <td>NT$${(item.product.price * item.quantity).toLocaleString('en-US')}</td>
      <td class="discardBtn">
          <a href="#" class="material-icons" data-id="${item.id}">
              clear
          </a>
      </td>
  </tr>`
      });
      cartList.innerHTML = str;
    })
}

//刪除單筆購物車資料
cartList.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    return;
  }
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
    .then(function (reponse) {
      alert("刪除單筆購物車成功");
      getCartList()
    })
})

//刪除全部購物車
const discardAllbtn = document.querySelector(".discardAllBtn");
discardAllbtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      alert("刪除全部購物車成功！")
      getCartList();
    })
    .catch(function (response) {
      alert("購物車已清空")
    })
})

//送出訂單資料
const orderInfoBtn = document.querySelector(".orderInfo-btn");
orderInfoBtn.addEventListener('click', function (e) {
  e.preventDefault();
  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const customerTradeWay = document.querySelector("#tradeWay").value;
  if (customerName == "" || customerPhone == "" || customerEmail == "" || customerAddress == "" || customerTradeWay == "") {
    alert("請輸入訂單資訊");
    return
  }
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, {
    "data": {
      "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": customerTradeWay
      }
    }
  })
    .then(function (response) {
      alert("訂單建立成功");
      document.querySelector("#customerName").value = "";
      document.querySelector("#customerPhone").value = "";
      document.querySelector("#customerEmail").value = "";
      document.querySelector("#customerAddress").value = "";
      document.querySelector("#tradeWay").value = "ATM";
      getCartList();
    })
})