<template>
  <div id="shoppingCart">
    <x-header title="购物袋" :left-options="leftOption">
      <div slot="right" v-show="!editFlag && shoppingCarts.length !== 0" @click="editFlag = true;">编辑</div>
      <div slot="right" v-show="editFlag && shoppingCarts.length !== 0" @click="editFlag = false;">完成</div>
    </x-header>
    <div class="madeOrder" v-show="madeOrderStatus">
      <span>您挑选的 99 件订制货品尚未付款发货。</span>
      <a href="javascript:void(0);" class="lookMore">查看</a>
    </div>
    <Scroller lock-x height="-96" v-show="shoppingCarts">
      <div slot="default">
        <div class="merchant" v-for="item in shoppingCarts" :key="item.merchantInfo.id">
          <div class="promotion" v-for="promotion in item.promotions" :key="promotion.promotionInfo.id">
            <div class="promotion-info" v-show="promotion.promotionInfo.id">
              <div>
                <span v-if="promotion.promotionInfo.type === 1" v-for="(item, index) in promotion.promotionInfo.pdsArray" :key="index">满{{item.fullLimit / 100}}减{{item.subtract / 100}}</span>
                <span v-if="promotion.promotionInfo.type === 2" v-for="(item, index) in promotion.promotionInfo.pdsArray" :key="index">满{{item.fullLimit / 100}}折{{item.discount / 10}}</span>
                <span v-if="promotion.promotionInfo.type === 3">打{{promotion.promotionInfo.discount / 10}}折</span>
                <span v-if="promotion.promotionInfo.type === 4">直降{{promotion.promotionInfo.directAmount / 100}}元</span>
              </div>
              <a href="javascript:void(0)" v-if="promotion.promotionInfo.type === 1 || promotion.promotionInfo.type === 2" @click="$router.push({path: '/pl/*'})">去凑单></a>
            </div>
            <div class="product-item" :style="productItemStyle(product.promotionList)" v-for="product in promotion.productItems" :key="product.id">
              <check-icon class="check-icon" :value.sync="checkedObj[product.id]" type="plain"></check-icon>
              <div class="img-box">
                <img :src="product.defaultPicture" alt="" @click="$router.push({path: `/pd/${product.id}`})">
                <div class="mask" v-show="product.status === 2 || product.stock === 0">
                  <div class="circle">
                    <p v-show="product.status === 2">售罄</p>
                    <p v-show="product.status === 1 && product.stock === 0">无库存</p>
                  </div>
                </div>
              </div>
              <div class="info-box">
                <p class="name">{{toolFun('name', product.name)}}</p>
                <p v-show="!editFlag" class="specs">{{toolFun('specs', product.specs)}}</p>
                <!-- 打开specs弹窗 -->
                <p v-show="editFlag && product.status === 1" class="specs-btn" @click="openSpecsPopup(product)">
                  {{toolFun('specs', product.specs)}}
                  <x-icon v-show="toolFun('specs', product.specs)" type="ios-arrow-down" size="12" style="position:absolute;right:5px;top:5px;"></x-icon>
                </p>
                <span class="price">￥{{toolFun('price', product.price)}}</span>
                <span v-show="!editFlag && product.amount > product.stock" class="amount-tips">抱歉，该商品最大购买数量为{{product.stock}}件</span>
                <span v-show="!editFlag" class="amount">X{{product.amount}}</span>
                <!-- 编辑数量 -->
                <my-inline-x-number v-show="editFlag" class="amount" style="{right:-14px;bottom:-13px;}" v-model="product.amount" @on-change="putNum(product)" width="50px" :min="1" :max="product ? product.stock : 0"></my-inline-x-number>
              </div>
              <div class="promotion-box" @click="promotionPopupFlag = true;promotionPopupData = product.promotionList;promotionPopupSkuId = product.id" v-show="(product.promotionList || []).length">
                <span>{{promotion.promotionInfo.name}}</span>
                <a href="javascript:void(0)">促销></a>
              </div>
            </div>
          </div>
        </div>
        <div style="height:10px;"></div>
      </div>
    </Scroller>
    <!-- 无数据内容 -->
    <div class="no-data-mask" v-show="shoppingCarts.length === 0">
      <img src="../../assets/images/nullShoppingCart.svg" alt="购物袋缺省">
      <p>您的购物袋什么都没有哦！</p>
      <x-button class="btn" @click.native="$router.push({path: '/home'})">去逛逛</x-button>
    </div>
    <!-- 底部 -->
    <div class="footer" v-show="shoppingCarts.length !== 0">
      <div class="cont">
        <div class="checkedAll-mask" @click="checkAll"></div>
        <check-icon :value.sync="checkedAll" type="plain" class="check-all"></check-icon><span class="check-name">全选</span>
        <span class="name">总计：</span><span class="value">￥{{sum}}</span>
      </div>
      <div class="btn" v-show="!editFlag" @click="checkout">结算</div>
      <div class="btn" v-show="editFlag" @click="deleteConfirm">删除</div>
    </div>
    <!-- 促销弹窗 -->
    <div v-transfer-dom>
      <Popup v-model="promotionPopupFlag" height="50%" :popup-style="{'overflow-y': 'visible'}">
        <div class="promotion-popup">
          <div class="title">促销</div>
          <div class="item" v-for="item in promotionPopupData" :key="item.id" @click="changePromotion(item.id)">
            <div>
              <span v-if="item.type === 1" v-for="(item2, index) in item.pdsArray" :key="index">满{{item2.fullLimit / 100}}减{{item2.subtract / 100}}</span>
              <span v-if="item.type === 2" v-for="(item2, index) in item.pdsArray" :key="index">满{{item2.fullLimit / 100}}折{{item2.discount / 10}}</span>
              <span v-if="item.type === 3">打{{item.discount / 10}}折</span>
              <span v-if="item.type === 4">直降{{item.directAmount / 100}}元</span>
            </div>
            <x-icon type="ios-arrow-right" fill="#bbb" style="position:absolute;right:5px;top:5px;"></x-icon>
          </div>
        </div>
      </Popup>
    </div>
    <!-- specs弹窗 -->
    <div v-transfer-dom>
      <Popup v-model="specsPopupFlag" height="75%" :popup-style="{'overflow-y': 'visible'}">
        <div slot="default" class="specs-popup">
            <div class="skuInfo">
              <div class="default-picture-wrapper">
                <div class="default-picture-inner">
                  <img :src="specsPopupData.defaultPicture" alt="">
                </div>
              </div>
              <div class="sku-info">
                <div class="sku-info-price"><span>￥</span>{{specsPopupData ? toolFun('price', specsPopupData.price) : 0}}</div>
              </div>
            </div>
            <scroller lock-x :height="specScrollerHeight">
              <div class="spec-wrapper">
                <div class="spec-inner" v-for="(item, index) in specArray" :key="item.specId">
                  <span class="spec-name">{{toolFun('name', item.specName)}}</span>
                  <Checker
                    v-model="specArrayOn[index]"
                    type="radio"
                    radio-required
                    default-item-class="default-item-class"
                    selected-item-class="selected-item-class"
                    disabled-item-class="disabled-item-class">
                    <checker-item
                      v-for="(item2, index2) in item.specValueArray"
                      :key="index2"
                      :value="item2"
                      :disabled="!item.specValueFlags[index2]">{{item2.specValueName}}</checker-item>
                  </Checker>
                </div>
                <group id="pd-popup-group" gutter="5px" class="spec-inner">
                  <span class="spec-name">数量</span>
                  <inline-x-number v-model="specsPopupData.amount" style="display:inline-block;float:right;" :min="1" :max="specsPopupData ? specsPopupData.stock : 0" width="50px"></inline-x-number>
                </group>
              </div>
            </scroller>
            <div class="btn-confirm" @click="finishChangeSize">确定</div>
          </div>
      </Popup>
    </div>
  </div>
</template>
<script type="text/ecmascript-es6">
  import res from './data.es6'
  import * as scAPI from '@/services/API/shoppingCartServices.es6'
  import * as pdAPI from '@/services/API/pdServices.es6'
  import { XHeader, Scroller, XButton, CheckIcon, TransferDomDirective as TransferDom, Popup, debounce, Checker, CheckerItem, Group, InlineXNumber } from 'vux'
  import MyInlineXNumber from './my-inline-x-number.vue'
  import * as tool from '@/services/myTool.es6'
  let getSkuCancel
  export default {
    name: 'shoppingCart',
    directives: { TransferDom },
    components: { XHeader, Scroller, XButton, CheckIcon, Popup, debounce, Checker, CheckerItem, Group, InlineXNumber, MyInlineXNumber },
    data () {
      return {
        madeOrderStatus: true,
        list: [], // 原数据
        shoppingCarts: [], // 处理后展示用的数据
        sum: 0, // 总计价格
        checkedAll: false, // 全选状态
        checkedObj: {}, // 已选项的容器对象 {id: Boolean}
        promotionPopupFlag: false, // 选择促销弹窗Boolean
        promotionPopupData: [], // 选择促销弹窗的项数组
        promotionPopupSkuId: '', // 选择促销弹窗对应的SkuId
        editFlag: false, // 是否处在编辑状态
        // --------------------specs规格选择popup--------------------
        specsPopupFlag: false,
        specsPopupData_bs: {},
        specsPopupData: {}, // 弹窗商品
         // sku
        specArray: [],
        // ----------已选sku组合[{specId,specName,specValueId,specValueName}]
        specArrayOn: [],
        usedSpecValueArray: [],
        skuSpecArray: [],
        leftOption: {
          backText: ''
        }
      }
    },
    methods: {
      toolFun (type, value) {
        if (type === 'name') {
          return tool.handleName(value)
        } else if (type === 'price') {
          // 转换价格单位
          return tool.handlePrice(value)
        } else if (type === 'specs') {
          // 拼接商品规格字符串
          let specs = value || []
          let msg = ''
          specs.forEach(e => {
            msg = msg + (msg || ' ') + ((e.specName === 'WeightOfGold&IsOnly1' ? e.specValueName + 'g' : e.specValueName) || '')
          })
          return msg
        }
      },
      // 商品项的高度（+促销高度）
      productItemStyle (promotionList) {
        return (promotionList || []).length ? 'height:130px' : 'height:100px'
      },
      // 底部全选按钮事件
      checkAll: debounce(function () {
        let checkedObj = JSON.parse(JSON.stringify(this.checkedObj))
        for (let i in checkedObj) {
          checkedObj[i] = !this.checkedAll
        }
        this.checkedObj = checkedObj
      }, 150),
      // 本地-获取购物车数据
      getCartDataLocal () {
        if (localStorage.getItem('cartProductItems') === '[]') {
          localStorage.removeItem('cartProductItems')
        }
        if (localStorage.getItem('cartProductItems')) {
          let productItems = JSON.parse(localStorage.getItem('cartProductItems'))
          for (let i in productItems) {
            productItems[i].defaultPromotionId = ''
          }
          let list = [{ merchantInfo: {id: ''}, productItem: productItems }]
          this.handleRes(list)
        } else {
          this.handleRes([])
        }
      },
      // 接口-获取购物车数据
      getCartData () {
        this.$http.get(scAPI.getshoppingCart1()).then(res => {
          if (res.data.code === 200) {
            if (res.data.list) {
              this.list = res.data.list
              this.handleRes(res.data.list)
            }
          }
        })
      },
      handleRes (list = []) {
        let datas = []
        list.forEach(e => {
          let data = {
            merchantInfo: e.merchantInfo,
            promotions: []
          }
          let noPromotionData = ''
          let obj = {} // 去重促销
          for (let i of e.productItem) {
            // 未参加促销的商品
            if (i.defaultPromotionId === '') {
              let promotion = {}
              if (noPromotionData === '') {
                promotion.promotionInfo = {id: ''}
                promotion.productItems = [i]
                noPromotionData = promotion
              } else {
                noPromotionData.productItems.push(i)
              }
            } else if (!obj[i.defaultPromotionId]) {
              // 参加促销的商品
              let promotion = {}
              for (let j of i.promotionList) {
                if (j.id === i.defaultPromotionId) {
                  promotion.promotionInfo = j
                }
              }
              promotion.productItems = [i]
              data.promotions.push(promotion)
              obj[i.defaultPromotionId] = 1
            } else {
              for (let index in data.promotions) {
                if (data.promotions[index].promotionInfo.id === i.defaultPromotionId) {
                  data.promotions[index].productItems.push(i)
                }
              }
            }
          }
          if (noPromotionData) { data.promotions.push(noPromotionData) }
          datas.push(data)
        })
        this.setChecked(datas)
        this.shoppingCarts = datas
        this.checkedObj = JSON.parse(JSON.stringify(this.checkedObj))
      },
      // 设置check-icon的绑定对象
      setChecked (datas) {
        for (let i of datas) {
          for (let j of i.promotions) {
            for (let k of j.productItems) {
              typeof this.checkedObj[k.id] === Boolean ? this.checkedObj[k.id] = !this.checkedObj[k.id] : this.checkedObj[k.id] = false
            }
          }
        }
      },
      // 改变商品使用促销
      changePromotion (promotionId) {
        let list = JSON.parse(JSON.stringify(this.list))
        for (let i in list) {
          for (let j in list[i].productItem) {
            if (list[i].productItem[j].id === this.promotionPopupSkuId) {
              list[i].productItem[j].defaultPromotionId = promotionId
            }
          }
        }
        this.handleRes(list)
        this.list = list
        this.promotionPopupFlag = false
      },
      // 计算总价
      getSum () {
        let sum = 0
        console.log(this.shoppingCarts)
        for (let i of this.shoppingCarts) {
          for (let j of i.promotions) {
            let iSum = 0
            let checked = 0
            for (let k of j.productItems) {
              if (this.checkedObj[k.id]) {
                iSum += k.price * k.amount
                checked++
              }
            }
            if (checked === 0) {
            } else if (j.promotionInfo.id === '') {
              iSum = tool.handlePrice(iSum)
            } else if (j.promotionInfo.type === 1) { // 满减
              for (let index = 0; index < j.promotionInfo.pdsArray.length; index++) {
                if (iSum >= j.promotionInfo.pdsArray[index].fullLimit) {
                  iSum = iSum - j.promotionInfo.pdsArray[index].subtract
                  index = j.promotionInfo.pdsArray.length
                }
              }
              iSum = tool.handlePrice(iSum)
              console.log('type1', iSum)
            } else if (j.promotionInfo.type === 2) { // 满折
              for (let index = 0; index < j.promotionInfo.pdsArray.length; index++) {
                if (iSum >= j.promotionInfo.pdsArray[index].fullLimit) {
                  iSum = iSum * j.promotionInfo.pdsArray[index].discount * 0.01
                  index = j.promotionInfo.pdsArray.length
                }
              }
              iSum = tool.handlePrice(iSum)
              console.log('type2', iSum)
            } else if (j.promotionInfo.type === 3) { // 单品折扣
                iSum = parseInt(iSum * j.promotionInfo.discount * 0.01) + iSum % 100
              if (j.promotionInfo.typeAlone === 1) { // 元级取整
                iSum = tool.handlePrice(iSum)
                iSum = parseInt(iSum)
                console.log('typeAlone1', iSum)
                // iSum = iSum.toString().replace(/[.][0-9]*/, '')
              } else if (j.promotionInfo.typeAlone === 2) { // 角级取整
                // iSum = iSum.toString().replace(/[.][0-9]*/, iSum.toString().match(/[.][0-9]{1}/))
                iSum = tool.handlePrice(iSum)
                iSum = parseFloat(iSum).toFixed(1)
                console.log('typeAlone2', iSum)
              }
            } else if (j.promotionInfo.type === 4) { // 直减
              iSum = iSum - j.promotionInfo.directAmount
              iSum = tool.handlePrice(iSum)
              console.log('type4', iSum)
            }
            sum = sum + parseFloat(iSum)
          }
        }
        this.sum = sum
      },
      putNum: debounce(function (product) {
        if (sessionStorage.getItem('userInfo')) {
          let params = { oldSkuId: product.id, quantity: product.amount, skuId: '' }
          this.$http.put(...scAPI.putCartItems([params])).then((response) => {
            if (response.data.code === 200) {}
          })
          .catch((error) => {
            console.log(error.response)
          })
        } else {
          let productItems = JSON.parse(localStorage.getItem('cartProductItems'))
          for (let i in productItems) {
            if (productItems[i].id === product.id) {
              productItems[i].amount = product.amount
            }
          }
          localStorage.setItem('cartProductItems', JSON.stringify(productItems))
          this.getCartDataLocal()
        }
      }, 200),
      deleteConfirm () {
        let checked = []
        for (let i in this.checkedObj) {
          if (this.checkedObj[i]) {
            checked.push(i)
          }
        }
        if (checked.length === 0) {
          this.$vux.toast.show({
            text: '未选择删除商品',
            type: 'text',
            width: '200px'
          })
        } else {
          this.$vux.confirm.show({
            content: '确认删除该商品?',
            onConfirm: () => {
              this.deleteProduct(checked)
            }
          })
        }
      },
      deleteProduct (checked) {
        if (sessionStorage.getItem('userInfo')) {
          this.$http.post(...scAPI.deleteCartItems(checked)).then((response) => {
            if (response.data.code === 200) {
              this.$vux.toast.show({
                text: '删除成功',
                type: 'text',
                width: '200px'
              })
              this.getCartData()
              location.reload()
            }
          }).catch((error) => {
            console.log(error.response)
          })
        } else {
          let cartProductItems1 = JSON.parse(localStorage.getItem('cartProductItems'))
          let cartProductItems2 = []
          for (let i in cartProductItems1) {
            if (checked.indexOf(cartProductItems1[i].id) === -1) {
              cartProductItems2.push(cartProductItems1[i])
              // this.quantityParam.splice(i, 1)
            }
          }
          localStorage.setItem('cartProductItems', JSON.stringify(cartProductItems2))
          this.getCartDataLocal()
        }
      },
      checkout () {
        let checked = []
        let params = [] // [{productId, quantity}]
        for (let i in this.checkedObj) {
          if (this.checkedObj[i]) {
            checked.push(i)
          }
        }
        if (checked.length === 0) {
          this.$vux.toast.show({ text: '未选择结算商品', type: 'text', width: '200px' })
          return
        } else {
          for (let i of this.shoppingCarts) {
            for (let j of i.promotions) {
              for (let k of j.productItems) {
                if (checked.indexOf(k.id) !== -1) {
                  if (k.status !== 1) {
                    this.$vux.toast.show({ text: '商品售罄', type: 'text', width: '200px' })
                    return
                  } else if (k.amount > k.stock) {
                    this.$vux.toast.show({ text: '库存不足', type: 'text', width: '200px' })
                    return
                  } else {
                    // params.push({productId: k.id, quantity: k.amount, promotionId: j.promotionInfo.id})
                    let existThisId = false
                    let existNullId = false
                    params.forEach(e => {
                      if (e.promotionId === j.promotionInfo.id) {
                        existThisId = true
                      } else if (e.promotionId === '') {
                        existNullId = true
                      }
                    })
                    if (j.promotionInfo.id && existThisId) {
                      for (let i in params) {
                        if (params[i].promotionId === j.promotionInfo.id) {
                          params[i].productItem.push({productId: k.id, quantity: k.amount})
                        }
                      }
                    } else if (j.promotionInfo.id && !existThisId) {
                      params.push({
                        promotionId: j.promotionInfo.id,
                        productItem: [{productId: k.id, quantity: k.amount}]
                      })
                    } else if (!j.promotionInfo.id && existNullId) {
                      for (let i in params) {
                        if (params[i].promotionId === '') {
                          params[i].productItem.push({productId: k.id, quantity: k.amount})
                        }
                      }
                    } else if (!j.promotionInfo.id && !existNullId) {
                      params.push({
                        promotionId: '',
                        productItem: [{productId: k.id, quantity: k.amount}]
                      })
                    }
                  }
                }
              }
            }
          }
          if (sessionStorage.getItem('userInfo')) {
            sessionStorage.setItem('settlementProductItems', JSON.stringify(params))
            this.$router.push({path: '/createOrder'})
          } else {
            this.$vux.confirm.show({
              content: '用户未登录',
              confirmText: '去登录',
              onConfirm: () => {
                sessionStorage.setItem('settlementProductItems', JSON.stringify(params))
                this.$router.push({path: '/signin'})
              }
            })
          }
        }
      },
      // ====================选择规格====================
      openSpecsPopup (product) {
        this.specsPopupFlag = true
        this.specsPopupData_bs = JSON.parse(JSON.stringify(product))
        this.specsPopupData = JSON.parse(JSON.stringify(product))
        if (this.specsPopupData) {
          if (this.specsPopupData.specs.length === 0) {
            this.$vux.toast.show({
              text: '无规格可选',
              type: 'text',
              width: '200px'
            })
          } else {
            this.getSpuInfo(this.specsPopupData.spuId, (res) => {
              this.specArrayOn = this.specsPopupData.specs
              this.skuSpecArray = res.data.spuInfo.skuSpecArray
              this.getSpecArray(res.data.spuInfo.specArray)
              this.specFlag = true
            })
          }
        }
      },
      // 获取商品所有规格 spu接口
      getSpuInfo (spuId, callback) {
        this.$http.get(...pdAPI.getSpuInfo(spuId)).then((response) => {
          if (response.data.code === 200) {
            if (typeof callback === 'function') {
              callback(response)
            }
          }
        })
      },
      // ----------处理spec属性数组，属性值对象加上specId和specName
      getSpecArray (data) {
        let specArray = []
        for (let i of data) {
          let spec1 = {
            specId: i.specId,
            specName: i.specName,
            specValueArray: [],
            specValueFlags: []
          }
          for (let j of i.specValueArray) {
            spec1.specValueArray.push({
              specId: i.specId,
              specName: i.specName,
              specValueId: j.specValueId,
              specValueName: j.specValueName
            })
            spec1.specValueFlags.push(false)
          }
          specArray.push(spec1)
        }
        this.specArray = specArray
        this.handleSpecState()
      },
      // ----------处理spec置灰
      handleSpecState () {
        this.$vux.loading.show()
        // ----------取出正在使用的sku组合包含的属性值
        let usedSpecValueArray = []
        let qobj = {}
        for (let i of this.skuSpecArray) {
          for (let j of i) {
            if (qobj[JSON.stringify(j)] !== 1) {
              usedSpecValueArray.push(JSON.stringify(j))
              qobj[JSON.stringify(j)] = 1
            }
          }
        }
        this.usedSpecValueArray = usedSpecValueArray
        qobj = {}
        // ----------将会使用的设为true,即完全没有使用到的属性值设为false
        for (let i of usedSpecValueArray) {
          for (let j in this.specArray) {
            for (let k in this.specArray[j].specValueArray) {
              if (i === JSON.stringify(this.specArray[j].specValueArray[k])) {
                this.specArray[j].specValueFlags[k] = true
              }
            }
          }
        }
        // ----------根据当前选择的属性值，置灰不能成为组合的属性值
        // 本次置灰的属性值
        let thisValueArray = []
        for (let i of this.specArrayOn) {
          for (let j of this.skuSpecArray) {
            if (JSON.stringify(j).indexOf(JSON.stringify(i)) !== -1) {
              for (let k of j) {
                if (JSON.stringify(i) !== JSON.stringify(k) && !qobj[JSON.stringify(k)]) {
                  thisValueArray.push(JSON.stringify(k))
                  qobj[JSON.stringify(k)] = 1
                }
              }
            }
          }
        }
        for (let i in this.specArray) {
          for (let j in this.specArray[i].specValueArray) {
            if (thisValueArray.length > 0 && thisValueArray.indexOf(JSON.stringify(this.specArray[i].specValueArray[j])) === -1) {
              this.specArray[i].specValueFlags[j] = false
            }
          }
        }
        this.$vux.loading.hide()
      },
      // 获取new skuid
      postSpuInfo: debounce(function (callback) {
        this.$http.post(...pdAPI.specGetSku(this.specArrayOn).concat({
          cancelToken: new this.$http.CancelToken(function (cancel) {
            if (typeof getSkuCancel === 'function') {
              getSkuCancel()
            }
            getSkuCancel = cancel
          })
        })).then((response) => {
          if (response.data.code === 200) {
            let skuInfo = response.data.skuInfo
            this.specsPopupData = Object.assign(skuInfo.sku, {specs: skuInfo.spec})
          }
          if (typeof callback === 'function') {
            callback()
          }
        })
        .catch((error) => {
          console.log(error.response)
        })
      }, 300),
      // 点击确认
      finishChangeSize () {
        for (let i in this.quantityParam) {
          if (this.productMsg[this.index1].productItem[this.index2].id === this.quantityParam[i].oldSkuId) {
            this.quantityParam[i].skuId = this.popupProduct.id
          }
        }
        this.putSku()
      },
      // 修改商品规格接口
      putSku () {
        if (sessionStorage.getItem('userInfo')) {
          let params = {
            oldSkuId: this.specsPopupData_bs.id,
            quantity: this.specsPopupData.amount,
            skuId: this.specsPopupData.id
          }
          this.$http.put(...scAPI.putCartItems([params])).then((response) => {
            if (response.data.code === 200) {
              this.specsPopupFlag = false
              this.getCartData()
            }
          })
          .catch((error) => {
            console.log(error.response)
          })
        } else {
          let productItems = JSON.parse(localStorage.getItem('cartProductItems'))
          for (let i in productItems) {
            if (productItems[i].id === this.specsPopupData_bs.id) {
              productItems[i] = this.specsPopupData
            }
          }
          localStorage.setItem('cartProductItems', JSON.stringify(productItems))
          this.specsPopupFlag = false
          this.getCartDataLocal()
        }
      },
      // 点击完成
      finishEdit () {
        this.editFlag = false
      }
    },
    mounted: function () {
      let userInfo = sessionStorage.getItem('userInfo')
      if (userInfo) {
        this.memberId = JSON.parse(userInfo).memberId
        if (localStorage.getItem('cartProductItems') === '[]') {
          localStorage.removeItem('cartProductItems')
        }
        if (localStorage.getItem('cartProductItems')) {
          tool.preCartToCart(this, () => {
            if (sessionStorage.getItem('settlementProductItems')) {
              this.$router.push('/createOrder')
            } else {
              this.getCartData()
            }
          })
        } else {
          this.getCartData()
        }
      } else {
        this.getCartDataLocal()
      }
    },
    computed: {
      checkedStr () {
        return JSON.parse(JSON.stringify(this.checkedObj))
      },
      specScrollerHeight () {
        return document.body.clientHeight * 0.75 - 101 - 50 + 'px'
      },
      specArrayOnStr () {
        return JSON.stringify(this.specArrayOn)
      }
    },
    watch: {
      checkedStr: debounce (function (str1, str2) {
        if (str1 !== str2) {
          let num1 = 0 // 商品数
          let num2 = 0 // 勾选数
          for (let i in this.checkedObj) {
            num1++
            if (this.checkedObj[i]) { num2++ }
          }
          this.checkedAll = num1 === num2 ? true : false
        }
        this.getSum()
      }, 150),
      promotionPopupFlag (flag) {
        if (flag === false) {
          this.promotionPopupData = []
          this.promotionPopupSkuId = ''
        }
      },
      specArrayOnStr (newV, oldV) {
        if (oldV !== '[]' && newV !== '[]') {
          if (newV !== oldV) {
            this.handleSpecState()
            this.postSpuInfo()
          }
        }
      },
      specsPopupFlag (flag) {
        if (flag === false) {
          this.specsPopupData_bs = {}
          this.specsPopupData = {} // 弹窗商品
          // sku
          this.specArray = []
          // ----------已选sku组合[{specId,specName,specValueId,specValueName}]
          this.specArrayOn = []
          this.usedSpecValueArray = []
          this.skuSpecArray = []
        }
      },
      productAmount: {
        get (product) {
          return product.amount
        },
        set (product) {

        }
      }
    }
  }
</script>
<style lang="scss" rel="stylesheet/scss" scoped>
// ----------
.madeOrder{
  position: relative;
  padding: 8px 10px 8px 15px;
  font-size: 14px;
  color: #6A6A6A;
  background-color: #FFF4E8;
  .lookMore{
    float: right;
    margin-right: 5px;
    color: #4A90E2;
    cursor: pointer;
  }
}
.promotion {
  margin: 10px 0;
  background-color: #fff;
}
.promotion-info {
  min-height: 25px;
  padding-bottom: 5px;
  overflow: hidden;
  div {
    width: calc(100% - 50px);
  }
  span {
    font-size: 8px;
    display: block;
    float: left;
    border: 1px solid #E4393C;
    color: #E4393C;
    border-radius: 6px;
    padding: 0px 5px;
    margin: 0 0 0 5px;
    transform: translateY(10px);
  }
  a {
    font-size: 12px;
    color: #E4393C;
    float: right;
    margin: 5px 10px 0 0;
  }
}
.product-item {
  border-top: 1px solid #ccc;
  // height: 100px;
  position: relative;
  .check-icon {
    position: absolute;
    top: 40px;
    left: 5px;
    transform: translateY(-50%);
  }
  .img-box {
    position: relative;
    display: block;
    width: 78px;
    height: 78px;
    float: left;
    margin: 10px 0 0 43px;
    border: 1px solid #eee;
    border-radius: 3px;
    overflow: hidden;
    img { display: block; width: 100%; height: 100%; }
    .mask, .circle { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); }
    .circle { border-radius: 50%; background-color: rgba(255, 255, 255, 0.5) }
    p {
      line-height: 78px;
      text-align: center;
    }
  }
  .info-box {
    position: relative;
    float: left;
    width: calc(100% - 143px); // 80 + 43 + 20
    height: 80px;
    margin: 10px;
    .name {
      width: 100%;
      line-height: 18px;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .specs {
      margin: 2px 0 0 0;
      font-size: 12px;
      color: #888;
    }
    .specs-btn {
      width: calc(100% - 15px);
      height: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      padding: 0 15px 0 0;
      margin: 2px 0 0 0;
      font-size: 12px;
      background: #eee;
      border-radius: 3px;
      text-indent: 10px;
      position: relative;
    }
    .price {
      font-size: 14px;
      position: absolute;
      bottom: 0;
      left: 0;
    }
    .amount {
      font-size: 12px;
      position: absolute;
      bottom: 0;
      right: 0;
    }
    .amount-tips {
      position: absolute;
      bottom: -10px;
      left: 0;
      font-size: 10px;
      color: red;
    }
  }
  .promotion-box {
    background-color: #FFF4E8;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    div {
      width: calc(100% - 50px);
    }
    span {
      font-size: 14px;
      display: block;
      float: left;
      color: #E4393C;
      border-radius: 6px;
      padding: 0px 5px;
      margin: 5px 0 0 5px;
    }
    a {
      font-size: 12px;
      color: #E4393C;
      float: right;
      margin: 5px 10px 0 0;
    }
  }
  .promotion-box:before,
  .promotion-box:after {
    content: "";
    display: block;
    width: 0;
    height: 0;
    border-bottom: 10px solid #F9D2D3;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid transparent;
    position: absolute;
    top: -20px;
    left: 10px;
  }
  .promotion-box:after {
    border-bottom: 10px solid #FFF4E8;
    top: -19px;
  }
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  height: 50px;
  width: 100%;
  box-shadow: 0px 1px 3px #aaa;
  background-color: #fff;
  .cont {
    float: left;
    width: calc(100% - 90px);
    height: 50px;
    .checkedAll-mask {
      position: absolute;
      height: 30px;
      width: 35px;
      top: 10px;
    }
    .check-name { line-height: 50px; color: #888; }
    .name { line-height: 50px; margin: 0 0 0 20px; }
    .value { line-height: 50px; color: red; }
  }
  .btn {
    float: left;
    width: 90px;
    line-height: 50px;
    text-align: center;
    color: #fff;
    background-color: $tsl-color;
  }
}
// ----------无数据时显示
.no-data-mask {
  position: absolute;
  top: 46px;
  left: 0;
  width: 100%;
  height: 100%;
  img {
    display: block;
    margin: 15% 0 0 50%;
    transform: translateX(-50%);
  }
  p {
    margin: 20px 0;
    text-align: center;
    font-size: 12px;
    color: #7f7f7f;
  }
  .btn {
    width: 80%;
    color: #fff;
    background-color: $tsl-color;
  }
}
// ----------促销更改弹窗
.promotion-popup {
  background-color: #fff;
  height: 100%;
  .title {
    height: 40px;
    line-height: 40px;
    text-align: center;
  }
  .item {
    position: relative;
    border-top: 1px solid #eee;
    div {
      min-height: 40px;
      overflow: hidden;
      width: calc(100% - 50px);
    }
    span {
      display: block;
      float: left;
      border: 1px solid #E4393C;
      color: #E4393C;
      font-size: 10px;
      border-radius: 6px;
      padding: 0px 5px;
      margin: 10px 0 0 5px;
    }
  }
}
// ----------specs规格选择弹窗
.specs-popup {
  width: 100%;
  height: 100%;
  border-radius: 6px 6px 0px 0px;
  background-color: #fff;
  .skuInfo {
    height: 80px;
    padding: 10px 0px 10px 0px;
    border-bottom: 1px solid #d9d9d9;
  }
  .skuInfo .default-picture-wrapper {
    position: absolute;
    top: -20px;
    left: 10px;
    width: 98px;
    height: 98px;
    border-radius: 10px;
    border: 1px solid #eee;
    background-color: #fff;
  }
  .skuInfo .default-picture-inner {
    margin: 5px;
    width: 88px;
    height: 88px;
    border-radius: 10px;
    overflow: hidden;
    background-color: #eee;
    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }
  .sku-info {
    margin: 0px 0px 0px 115px;
    .sku-info-price {
      font-size: 14px;
      color: $tsl-color;
      letter-spacing: 1.15px;
    }
    .sku-info-stock {
      font-size: 12px;
      color: #4d4d4d;
      letter-spacing: .5px;
    }
  }
  .spec-wrapper {
    padding: 10px 10px 0px 10px;
    height: calc(100% - 30px);
    overflow-y: scroll;
    .spec-inner {
      margin: 0px 0px 10px 0px;
    }
  }
  .spec-name {
    font-size: 14px;
    color: #535353;
    letter-spacing: .6px;
  }
  .default-item-class, .selected-item-class, .disabled-item-class {
    margin: 12px 15px 0 0;
    height: 30px;
    line-height: 30px;
    border: 1px solid #eee;
    padding: 0 15px;
    border-radius: 6px;
    font-size: 14px;
    color: #7f7f7f;
    letter-spacing: .6px;
  }
  .selected-item-class {
    border: 1px solid $tsl-color;
    color: $tsl-color;
  }
  .disabled-item-class {
    border: 1px solid #eee;
    color: #eee;
  }
  .btn-confirm {
    text-align: center;
    line-height: 50px;
    background-color: $tsl-color;
    color: #fff;
    width: 100%;
  }
}
</style>

