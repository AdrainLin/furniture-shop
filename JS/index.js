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

//--購物車-加入--//
const carTbody = document.querySelector(".shopCar-table tbody")
let carData

cardList.addEventListener("click",function(e){
  e.preventDefault()
  if(!e.target.classList.contains("addCar-btn")) return
  let productId = e.target.dataset.id
  console.log(productId)
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
      alert("加入購物")
    })
})

//--購物車-渲染--//
const finalTotal = document.querySelector(".total-price")
function getcarList() {
  axios
    .get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
    .then(res => {
      
      carData = res.data.carts
      console.log(res)
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
  axios
    .delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${carId}`)
    .then(res => {
      getcarList()
      alert("刪除成功")
    })
})

//--購物車-清空購物車--//
const delAllBtn = document.querySelector(".delAll-btn") 
delAllBtn.addEventListener("click",function(e){
  e.preventDefault()
  axios
    .delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
    .then(res => {
      alert("清空購物車")
      getcarList()
    }).catch(e => {
      alert("購物車已清空嚕,再去逛逛吧")
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
sideNav.addEventListener('mouseover',function(e){
  if(e.target.tagName === 'LI') {
   
  }
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
