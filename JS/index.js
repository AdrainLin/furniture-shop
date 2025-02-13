const cardList = document.querySelector(".cardWrap")
const productSelect = document.querySelector(".selector")

let productData = []

function init(){
  getProductList()
  getcarList()
}
init()

//--取得所有商品--//
function getProductList() {
  axios({
    url:`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`
  })
  .then(res => {
    productData = res.data.products
    renderProductList(productData)
    
  })
}
//--組商品清單字串--//
function combineProductHTMLItem(dataAry){
  let str = dataAry.map(item => {
    return `
      <li class="card">
        <span>新品</span>
        <img src="${item.images}" alt="商品圖" />
        <a href="" class="addCar-btn" data-id="${item.id}">加入購物車</a>
        <p class="card-name">${item.title}</p>
        <p><del class="origin-price">NT$${item.origin_price}</del></p>
        <p class="price">NT$${item.price}</p>
      </li>
    `
  }).join("")
  return str
}

//--渲染商品清單--//
function renderProductList() {
  cardList.innerHTML = combineProductHTMLItem(productData)
}

//--商品篩選功能--//
productSelect.addEventListener("change",function(e){
  const category = e.target.value
  if(category === "全部") {
    renderProductList()
    return
  }
  let dataAry = productData.filter(item => item.category === category)
  cardList.innerHTML = combineProductHTMLItem(dataAry)
})
//--吐司提示訊息--//
const toast = document.querySelector("#toast");
const toastMsg = toast.querySelector("span");
let toastTimeout;
function showToast(msg) {
  toastMsg.textContent = msg
  toast.classList.add("show");
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  toastTimeout = setTimeout(hideToast, 1500);
}

function hideToast() {
  toast.classList.remove("show");
}

//--購物車-加入--//
const carTbody = document.querySelector(".shopCar-table tbody")
let carData

cardList.addEventListener("click",function(e){
  e.preventDefault()

  if(!e.target.classList.contains("addCar-btn")) return
  showToast("成功加入購物車")

  let productId = e.target.dataset.id
  let num = 1 
  carData.forEach(item => {
    if(productId === item.product.id){
      num = item.quantity += 1
    }
  });
  let body = {}
  body.data = {
    productId:productId,
    quantity:num
  }
  axios
    .post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,body)
    .then(res => {
      getcarList()
    })
    .catch(e => {
      showToast("出現了一點問題,請稍後再重新加入")
    })
})

//--購物車-渲染--//
const finalTotal = document.querySelector(".total-price")
function getcarList() {
  axios
    .get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
    .then(res => {
      
      carData = res.data.carts
      
      if(carData.length == 0) {
        carTbody.innerHTML = `<tr><td>暫時還沒有商品,再去逛逛吧</td></tr>`
        finalTotal.innerHTML = `NT$0`
        return
      }
      carTbody.innerHTML = carData.map(item => {
        let quantity = item.quantity
        let product = item.product
        let carId = item.id
        let {images,title,price} = product
        return `
          <tr>
            <td>
              <div class="cardItem-title">
                <img src="${images}" alt="" />
                <p>${title}</p>
              </div>
            </td>
            <td>NT$${price}</td>
            <td>${quantity}</td>
            <td>NT$${price*quantity}</td>
            <td class="del-carBtn">
              <a class="material-symbols-outlined" data-id=${carId}> close </a>
            </td>
          </tr>
        `
      }).join("")
      finalTotal.innerHTML = `NT$${res.data.finalTotal}`
    })
}

//--購物車-刪除--//
carTbody.addEventListener("click",function(e){
  e.preventDefault()
  const carId = e.target.dataset.id
  if(!carId) return
  showToast("成功刪除訂單")
  axios
    .delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${carId}`)
    .then(res => {
      getcarList()
    })
    .catch(e => {
      showToast("出現了一點問題,請稍後再刪除訂單")
    })
})

//--購物車-清空購物車--//
const delAllBtn = document.querySelector(".delAll-btn") 
delAllBtn.addEventListener("click",function(e){
  e.preventDefault()
  if(carData.length) showToast("成功清空購物車")
  clearCar()
})
//清空購物車
function clearCar() {
  axios
    .delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
    .then(res => {
      getcarList()
    }).catch(e => {
      if(carData.length == 0){
        showToast("購物車內沒有商品! 再去逛逛吧")
      }else{
        showToast("出現了一點問題,稍後再試看看")
      }
    })
}

//--前端表單驗證--//

const orederInfoBtn = document.querySelector(".sendOrder-btn")
const orderInfoForm = document.querySelector(".orderInfo-form")
const bookName = orderInfoForm.querySelector("[name=bookName]")
const bookPhone = orderInfoForm.querySelector("[name=bookPhone]")
const bookEmail = orderInfoForm.querySelector("[name=bookEmail]")
const bookAddress = orderInfoForm.querySelector("[name=bookAddress]")
const bookPayment = orderInfoForm.querySelector("[name=payMethod]")

orederInfoBtn.addEventListener("click", function (e) {
  e.preventDefault()
  const orderInfo = {
    name:bookName.value,
    phone:bookPhone.value,
    email:bookEmail.value,
    address:bookAddress.value,
    payment:bookPayment.value
  }
  //回傳0表示驗證通過
  let errMsg = verify(orderInfo,carData)
  if(errMsg){
    showToast(errMsg)
  }else {
    sendOrder(orderInfo)
  }
})
//送出訂單
function sendOrder({phone,...otherInfo}) {
  otherInfo.tel = orderInfo.phone
  const postData = {
    data:{
      user:otherInfo
    }
  }
  axios
    .post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`,postData)
    .then(res => {
      showToast("訂單建立成功")
      orderInfoForm.reset()
      getcarList()
    })
    .catch(e => {
      console.log(e)
    })
}
//驗證mail格式
function isValidEmail(email) {
  const emailRex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRex.test(email)
}
//驗證手機格式
function isValidPhone(phone) {
  const phoneRex = /^09[0-9]{8}$/
  return phoneRex.test(phone)
}
//驗證地址格式
function isValidAddress(address) {
  //僅匹配漢字或數字,排除特殊符號,限制長度為5-100
  const addressRex = /^[\p{Script=Han}\p{Number}]{5,100}$/u
  return addressRex.test(address)
}
//驗證表單
function verify({name,phone,email,address},carData) {

  // 檢查購物車是否有商品
  if (carData.length === 0) return "購物車內沒有商品"
  // 檢查欄位是否空白
  if (!name || !phone || !email || !address) return "請填寫完整資料"
  // 驗證手機格式
  if (!isValidPhone(phone)) return "手機格式有誤喔"
  // 驗證email格式
  if (!isValidEmail(email)) return "email格式有誤喔"
  // 驗證地址格式
  if (!isValidAddress(address)) return "地址格式有誤喔"

  return 0;
}
//去除空白
orderInfoForm.querySelectorAll("input").forEach(item => {
  item.addEventListener("input",function(e){
    setTimeout(() => {
      e.target.value = e.target.value.replace(/\s+/g,"")
    },120)
  })
})

//--側邊導航欄--//
const sideNav = document.querySelector(".sideNav")

let scrollHeight = document.documentElement.scrollHeight;

sideNav.addEventListener('click',function(e){
  let index = e.target.dataset.index
  let targetBlock 
  if(index != 0) {
    targetBlock = document.querySelector(`section[data-index='${index}']`)
  }else{
    targetBlock = document.querySelector(".topBar")
  }
  scrollYAnimate(window,targetBlock.offsetTop)
})

//側邊導航欄-滑動動畫
function scrollYAnimate(obj,target,callback){
  clearInterval(obj.timer)
    obj.timer = setInterval(()=>{

      let step = (target - obj.pageYOffset) / 10   
      step = step < 0 ? Math.floor(step) : Math.ceil(step)
      window.scroll(0,obj.pageYOffset + step)

      if(Math.abs(obj.pageYOffset - target) <= 0.5) {
        clearInterval(obj.timer)
        callback && callback()
       }
  },12)
}