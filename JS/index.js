const cardList = document.querySelector(".cardWrap")
const productSelect = document.querySelector(".selector")

let productData = []

function init(){
  getCardList()
}
function getCardList() {
  axios({
    url:"https://livejs-api.hexschool.io/api/livejs/v1/customer/shop/products"
  })
  .then(res => {
    productData = res.data.products
    renderProductList(productData)
  })
}
function combineProductHTMLItem(dataAry){
  let str = dataAry.map(item => {
    return `
      <li class="card">
        <span>新品</span>
        <img src="${item.images}" alt="商品圖" />
        <a href="" class="addCar-btn">加入購物車</a>
        <p class="card-name">${item.title}</p>
        <p><del class="origin-price">NT$${item.origin_price}</del></p>
        <p class="price">NT$${item.price}</p>
      </li>
    `
  }).join("")
  return str
}
function renderProductList() {
  cardList.innerHTML = combineProductHTMLItem(productData)
}
productSelect.addEventListener("change",function(e){
  const category = e.target.value
  if(category === "全部") {
    renderProductList()
    return
  }
  let dataAry = productData.filter(item => item.category === category)
  cardList.innerHTML = combineProductHTMLItem(dataAry)
})

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


init()