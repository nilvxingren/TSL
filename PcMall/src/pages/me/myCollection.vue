<template>
    <div id="pl">
        <header1></header1>
        <header2></header2>
        <div class="goods-content">
            <v-title :titleTpye="titleTpye"></v-title>
            <div class="madeOrder" v-show="madeOrderStatus">
                <img src="../../assets/icons/icon_info_b.png" alt="">
                <span>您还收藏了99 件订制货品。</span>
                <a href="javascript:void(0);" class="lookMore">查看</a>
                <Icon type="ios-close" @click="madeOrderStatus = false"/>
            </div>
            <div class="goods-items">
                <!-- <div class="no-datas" v-if="(datas || []).length === 0">暂无数据</div> -->
                <div class="no-data-mask" v-if="datas.length === 0">
                    <loading  v-if="loading"></loading>
                    <img src="../../assets/images/nullShoppingCart.svg" alt="购物袋缺省">
                    <p>目前您没有任何收藏。</p>
                    <Button class="btn" @click.native="$router.push({path: '/home'})">继续购物</Button>
                </div>
                <div v-else>
                    <div class="select">
                       <Checkbox v-model="haveStock">仅看有货</Checkbox>
                       <div class="right">
                           <div v-show="status" >
                                <span><Checkbox v-model='checkAll' @on-change='checkAll_'></Checkbox>全选</span>
                                <span @click="removeCollections">删除</span>
                                <!-- <span><img src="../../assets/icons/add@3x.png">添加到购物袋</span> -->
                                <span class="last" @click="status = false">完成</span>
                           </div>
                           <div v-show="!status" >
                               <span class="last" @click="status = true">批量操作</span>
                           </div>
                       </div>
                    </div>
                    <ul>
                        <li v-for="(item, index) in datas" :key="index" :class="{borderActive:!status&&isShow==index,borderSelect:status&&item.select == 0,cursorActive:status}" @click="status && selectPro(item,index)">
                            <div class="pic" @mouseover="isShow=index" @mouseleave="isShow=0.1">
                                <div class="pic-img" @click="!status && goPd(item)">
                                    <img :src="item.defaultPicture" alt="" >
                                    <div class="img-mask" :class="{imgCursor:status}" v-show="item.status === 2 || item.stock === 0">
                                        <div class="circle">
                                            <span class="middle" v-show="item.status === 2">售罄</span>
                                            <span class="middle" v-show="item.status === 1 && item.stock === 0">无库存</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- <i class="activeIcon" :class="index == isShow ? 'isShow': ''"></i> -->
                                <i v-if="status && item.select == 0" class="activeIcon" ></i>
                                <i v-else-if="status" class="activeIcon__" ></i>
                                <i v-else class="activeIcon_" @click="oneDelete(index)" :class="{isShow:isShow==index}"><Icon type="ios-trash-outline" size="20" /></i>
                            </div>
                            <div class="goods-items-footer">
                                <div class="vertical-middel">
                                    <img v-show="!status && item.status !== 2 && item.stock !== 0" @click="postCartItem(item.productId)" src="../../assets/icons/add@3x.png" alt="添加到购物袋" title="添加到购物袋">
                                    <p class="explain">{{handleName(item.name)}}</p>
                                    <p class="price">{{ '￥' + handlePrice(item.price) }}</p>
                                    <!-- <p class="price_">￥1.009</p> -->
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <v-footer></v-footer>
    </div>
</template>

<script>
import header1 from '@/pages/homePages/header1'
import header2 from '@/pages/homePages/header2'
import vFooter from '@/pages/homePages/footer.vue'
import vTitle from '@/pages/homePages/title.vue'
import loading from '@/pages/homePages/loading.vue'
import * as myAPI from '../../services/API/mineServices.es6'
import * as pdAPI from '@/services/API/pdServices.es6'
import * as tool from '@/services/myTool.es6'
import { debounce } from 'vux'
    export default {
        name: 'shoppingCart',
        components: {
            header1,
            header2,
            vFooter,
            vTitle,
            debounce,
            loading
        },
        data () {
            return {
                madeOrderStatus: false,
                loading: true,
                titleTpye: ['首页','我的','收藏'],//珠宝类型的头部
                single: false,
                isShow: 0.1,//三角形样式
                color: '#352665',
                // haveStock: '',
                haveStock: false,
                status: false, // 页面编辑|查看状态
                datas: [],
                flags: [],
                listLayout: 'row-layout',
                pageNum: 1,
                pageSize: 500,
                size: 0,
                total: 0,
                pages: 0,
                // ----------选择
                checkAll: false,
                checkNum:0
            }
        },
        mounted: function () {
            this.getCollection(this.pageNum, this.pageSize)
        },
        methods: {
            checkAll_(val){
                if(val){
                    this.checkNum = this.flags.length
                    this.datas.forEach(item=>{
                        this.$set(item,"select",0)
                    })
                    for (let i in this.flags) {
                        this.flags[i] = '1'
                    }
                }else{
                    this.checkNum = 0
                    this.datas.forEach(item=>{
                        this.$set(item,"select",1)
                    })
                    for (let i in this.flags) {
                        this.flags[i] = ''
                    }
                    this.datas = JSON.parse(JSON.stringify(this.datas))
                }
            },
            oneDelete(index){
                this.flags[index] = '1'
                this.removeCollections()
            },
            selectPro(item,index){
                if(item.select==0){
                    this.checkNum-=1
                    this.flags[index] = ''
                    this.$set(item,"select",1)
                }else{ 
                    this.checkNum+=1
                    this.flags[index] = '1'
                    this.$set(item,"select",0)
                }
                if(this.checkNum!==this.flags.length){
                    this.checkAll = false
                }else{
                    this.checkAll = true
                }
            },
            getCollection (pageNum, pageSize, callback) {
                let thenCallback = (res) => {
                if (res.data.code === 200) {
                    this.loading = false 
                    this.flags = []
                    res.data.pageInfo.list.forEach(element => {
                        this.flags.push('')
                    })
                    this.total = res.data.pageInfo.total
                    this.pages = res.data.pageInfo.pages
                    this.datas = res.data.pageInfo.list

                    // if (this.pageNum === 1) {
                    //     this.flags = []
                    //     res.data.pageInfo.list.forEach(element => {
                    //         this.flags.push('')
                    //     })
                    //     this.size = res.data.pageInfo.size
                    //     this.total = res.data.pageInfo.total
                    //     this.pages = res.data.pageInfo.pages
                    //     this.datas = res.data.pageInfo.list
                    //     this.$refs.scroller.reset({top: 0})
                    // } else {
                    //     res.data.pageInfo.list.forEach(element => {
                    //         this.flags.push('')
                    //     })
                    //     this.size += res.data.pageInfo.size
                    //     this.total = res.data.pageInfo.total
                    //     this.pages = res.data.pageInfo.pages
                    //     this.datas = this.datas.concat(res.data.pageInfo.list)
                    //     this.$refs.scroller.reset()
                    // }
                }
            }
            let catchCallback = () => {
            // this.$refs.scroller.donePullup()
            // this.$refs.scroller.donePulldown()
            }
            if (this.haveStock) {
                this.loading = true 
                this.$http.get(...myAPI.getProductCollectHasStock({pageNum: pageNum, pageSize: pageSize})).then(res => {
                    thenCallback(res)
            }).catch(() => {
                catchCallback()
            })
            } else {
                this.loading = true 
                this.$http.get(...myAPI.getProductCollect({pageNum: pageNum, pageSize: pageSize})).then(res => {
                    thenCallback(res)
                }).catch(() => {
                    catchCallback()
                })
            }
        },
            removeCollections () {
                if (this.flags.indexOf('1') === -1) {
                    // this.$vux.toast.show({text: '未选择商品', type: 'text', width: '200px'})
                    this.$Message.error({content:'未选择商品',duration:3})
                return
                }
                let action = () => {
                    let collectIds = []
                    for (let i in this.flags) {
                        if (this.flags[i] === '1') {
                            collectIds.push(this.datas[i].id)
                        }
                    }
                    this.$http.post(...myAPI.deleteProductCollects(collectIds)).then(res => {
                        if (res.data.code === 200) {
                            let datas = []
                        for (let i of this.datas) {
                            if (collectIds.indexOf(i.id) === -1) {
                                datas.push(i)
                            }
                        }
                        let flags = []
                        datas.forEach(e => {
                            flags.push('')
                        })
                        this.datas = datas
                        this.flags = flags
                        }
                    })
                }
                this.$Modal.confirm({
                    title: '',
                    content: '<p>是否确认移除商品 </p>',
                    okText: '确认',
                    cancelText: '取消',
                    onOk:()=>{
                        action()
                    },
                })
            },
            // ----------pd
            goPd (item) {
                if (item.status === 1) {
                    this.$router.push({path: `/pd/${item.productId}`})
                }
            },
            handleName (name) {
                return tool.handleName(name)
            },
            handlePrice (price) {
                return tool.handlePrice(price)
            },
            // ----------加入购物车
            postCartItem (skuId) {
                if (!skuId) { return }
                let cartItemData = {
                    memberId: null,
                    merchantId: '123',
                    productId: skuId,
                    productItemId: null,
                    quantity: 1
                }
                this.$http.post(...pdAPI.postCartItem(cartItemData), {certified: true}).then((response) => {
                    if (response.data.code === 200) {
                        this.$Message.success({content:'加入购物袋成功',duration:3})
                    } else {
                        this.$Message.error({content:response.data.message,duration:3})
                    }
                })
            }
        },
        computed: {
            listStyle () {
                return this.status ? `min-height: ${document.body.clientHeight - 141}px;` : `min-height: ${document.body.clientHeight - 91}px;`
            }
        },
        watch: {
            status (flag) {
                if (!flag) {
                    for (let i in this.flags) {
                        this.flags[i] = flag || ''
                    }
                    this.datas.forEach(item=>{
                        this.$set(item,"select",1)
                    })
                    this.checkNum =  0
                    this.checkAll = false
                } 
                // debounce(() => {
                //     if (this.$refs.scroller) {
                //         this.$refs.scroller.reset()
                //     }
                // }, 500)()
            },
            haveStock: debounce(function (flag) {
                this.pageNum = 1
                this.datas = []
                this.getCollection(this.pageNum, this.pageSize)
            }, 300)
        }
    }
</script>

<style scoped lang="stylus">
@import "~styles/common/common.styl";
     #pl
        background: #fafafa;
        color: #111;
        .goods-content
            padding: 0 60px;
            .madeOrder
                position: relative
                margin 20px 0
                padding 5px 10px 5px 15px
                width 100%
                border 1px solid  #4A8AE9
                background-color #F2FAFE
                img
                    position relative
                    top: 2px
                    $mr(5px)
                    width 15px
                    height 15px
                .lookMore
                    $ml(20px)
                    color #4A90E2
                    cursor pointer
                i
                    float right
                    font-size 26px
                    line-height 22px
                    color #b4b4b4
                    cursor pointer
            .goods-items
                .select
                    $ml(17px)
                    $mt(10px)
                    height 30px
                    span 
                        display:inline-block
                        padding 4px 8px
                        $mr(10px)
                        background-color #fff
                        color $blue
                        cursor pointer
                        img
                            width 18px
                            height 18px
                            $mr(4px)
                            vertical-align sub
                    .last
                        $mr(17px)
                        padding 4px 20px
                    .right
                        float right
                .no-data-mask
                    padding 120px 0
                    text-align center
                    p
                        margin 10px 0
                        color #c8c8c8
                    button
                        width 120px
                        height 40px
                        color #fff
                        background-color $blue
                ul
                    display inline-block
                    .borderActive
                        $border(1,2px)
                    .borderSelect
                        $border(1,2px)
                    .cursorActive
                        cursor pointer
                    li
                        float left
                        width 240px
                        margin 20px 15px 0
                        border 2px solid transparent
                        .pic
                            height 240px
                            background-color #fff
                            cursor pointer
                            position relative
                            .pic-img
                                width 100%
                                height 100%
                                display inline-block
                                text-align center
                                position relative
                                img
                                    width 100%
                                    height 100%
                                .img-mask 
                                    width: 100%
                                    height: 100%
                                    background-color rgba(0, 0, 0, 0.4)
                                    position: absolute
                                    top 0px
                                    left 0px
                                    cursor context-menu
                                    .circle 
                                        width 90%
                                        height 90%
                                        margin 5%
                                        border-radius 50%
                                        background-color rgba(255,255,255,0.5)
                                    .middle 
                                        position: absolute
                                        top 50%
                                        left 50%
                                        transform translate(-50%, -50%)
                                        font-size 22px
                                .imgCursor
                                    cursor pointer
                            .activeIcon__,.activeIcon_,.activeIcon
                                position absolute
                                right 0
                                top 0
                                display none
                                border 20px solid transparent
                                border-top-color #352665
                                border-right-color #352665
                            .activeIcon_
                                i
                                    position absolute
                                    right -20px
                                    top -18px
                                    color #fff
                            .activeIcon,.activeIcon__
                                display inline-block
                                &::before
                                    position absolute
                                    top -7px
                                    left 6px
                                    content ''
                                    display inline-block
                                    width 2px
                                    height 5px
                                    background-color #fff
                                    transform rotate(-45deg)
                                &::after
                                    position absolute
                                    top -12px
                                    left 11px
                                    content ''
                                    display inline-block
                                    width 2px
                                    height 10px
                                    background-color #fff
                                    transform rotate(45deg)
                            .activeIcon__
                                border-top-color #ccc
                                border-right-color #ccc
                            .isShow
                                display inline-block
                        .goods-items-footer
                            position relative
                            height 100px
                            .vertical-middel
                                position absolute
                                top 50%
                                transform translateY(-50%)
                                width 100%
                                img 
                                    float right
                                    width 25px
                                    height 25px
                                    position absolute
                                    right 0
                                    cursor pointer
                                    z-index 200
                                .explain
                                    padding 0 36px
                                    line-height 16px
                                    font-size 14px
                                    text-align center
                                    color #000
                                .price
                                    text-align center
                                    color $blue
                                    $mt(4px)
                                .price_
                                    text-align center
                                    color #ccc
    
</style>