<template>
    <div>
        <div class="keng"></div>
        <div class="header">
            <div class="header-left">
                <Dropdown @mouseenter.native="handleOpen" @mouseleave.native="handleOpen" trigger="custom"  :visible="visible" style="margin-left: 6px;padding-left:10px" class="header-left-day" :class="{bgColor:bgColor}" >
                    <a href="javascript:void(0)" >
                        <span>每日金价</span>
                        <Icon :type="type" size="16"></Icon>
                    </a>  
                    <DropdownMenu  slot="list" class="dayprice" >
                        <iframe  src="http://goldprice.tslj.cn/goldPrice/html/sc/gold_price_cn.php" width="100%" height="100%"></iframe>
                            <!-- <h3>香港金价（每两）</h3>
                            <table>
                                <tr>
                                    <th>  </th>
                                    <th>卖出（HKD）</th>
                                    <th>买入（HKD）</th>
                                </tr>
                                <tr>
                                    <td>足金饰品</td>
                                    <td>12940</td>
                                    <td>11440</td>
                                </tr>
                                <tr>
                                    <td>铂金饰品</td>
                                    <td>-</td>
                                    <td>7190</td>
                                </tr>
                                <tr>
                                    <td>足金金条</td>
                                    <td>11840</td>
                                    <td>11300</td>
                                </tr>
                            </table>
                            <h3>内定金价（每克）</h3>
                            <table>
                                <tr>
                                    <th>  </th>
                                    <th>卖出（HKD）</th>
                                    <th>  </th>
                                </tr>
                                <tr>
                                    <td>足金饰品</td>
                                    <td>12940</td>
                                    <td></td>
                                </tr>
    
                                <tr>
                                    <td>足金金条</td>
                                    <td>11840</td>
                                    <td></td>
                                </tr>
                            </table>
                            <p>*以上进价仅供参考，请以具体门店报价为准<br>
                                最后更新：2018/09/25 09:40:00
                            </p> -->
                    </DropdownMenu>
                </Dropdown>
            </div>     
            <div class="header-right">
                <a href="javascript:void()" onclick="qimoChatClick()">     
                    <i><img src="../../assets/icons/icon_call.png" ></i>
                    <span>在线客服</span>
                </a>

                <router-link tag="a" to="/login" v-if="!userInfoSession">     
                    <!-- <Icon type="ios-contact-outline" size="20"/> -->
                    <i><img src="../../assets/icons/icon_user.png" ></i>
                    <span>{{nickName}}</span>
                </router-link>
                <router-link tag="a" to="/mine" v-else>     
                    <!-- <Icon type="ios-contact-outline" size="20"/> -->
                    <i><img src="../../assets/icons/icon_user.png" ></i>
                    <span>{{nickName}}</span>
                </router-link>
                <router-link tag="a" to="/myCollection" >              
                    <!-- <Icon type="md-heart-outline" size="20"/> -->
                    <i><img src="../../assets/icons/icon_fav.png" ></i>
                    <span>我的收藏</span>
                </router-link>
                <router-link tag="a" to="/shoppingCart">              
                    <!-- <Icon  type="ios-lock-outline" size="20"/> -->
                    <i><img src="../../assets/icons/icon_bag.png" width="24" style="vertical-align:middle"></i>
                    <span>购物袋</span>
                </router-link>  
                <!-- <Dropdown  @mouseenter.native="handleClick" @mouseleave.native="handleClick" trigger="custom" :visible="visible2" style="margin-left: -10px;padding-left:10px" :class="{bgColor:bgColor2}" >
                    <a href="javascript:void(0)" >              
                        <Icon  type="ios-lock-outline" size="20"/>
                        <span>购物袋</span>
                    </a>
                    <DropdownMenu slot="list" class="shopCart" @click.native.stop="stop">
                        <div>
                            <Table height="250" size="small" ref="selection" :show-header=true :columns="columns4" :data="data1"></Table>
                            <span class="checkAll">全选</span>
                            <span class="allPrice">总计：￥{{allPrice.toFixed(2)}}</span>
                            <router-link to="/shoppingCart" tag="Button" class="btn1">查看购物袋<Icon type="ios-arrow-forward" color="#352665"/></router-link>
                            <Button class="btn2">结算<Icon type="ios-arrow-forward" /></Button>
                        </div>
                    </DropdownMenu>
                </Dropdown> -->
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                visible: false,
                visible2: false,
                bgColor:false,
                bgColor2:false,
                type:"ios-arrow-down",
                columns4: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'                     
                    },
                    {
                        title: '购物袋',
                        // key: 'src',
                        width: 80,
                        render: (h, params) => {
                            return h('div', {
                                style: {
                                    height: '80px',
                                    textAlign: 'center',
                                    width: '80px',
                                    marginLeft: '-18px',
                                    border: '1px solid #352665',
                                    marginTop: '10px',
                                    marginBottom: '10px',
                                }
                            },[
                                h('img', {
                                    style: {
                                        width: '100%',
                                        height: '100%'
                                    },
                                    attrs: {
                                        src: params.row.src //图片路径
                                    }
                                }),
                                // h('img', params.row.name)
                            ]);
                        }
                    },
                    {
                        title: ' ',
                        key: 'title',
                        render: (h, params) => {
                            return h('div', [
                                h('p', {
                                    style: {
                                        fontSize: '12px',
                                        lineHeight: '18px',
                                        height: '40px',
                                        color:'#000'
                                    }
                                },params.row.title),//商品 名称
                                h('p', {
                                    style: {
                                        lineHeight: '30px',
                                        color: '#352665'
                                    }
                                } ,[
                                    h('span',{
                                        style: {
                                            fontSize: '12px',
                                        }
                                    },params.row.spec),//规格
                                    h('span',{
                                        style: {
                                            float: 'right'
                                        }
                                    },`${params.row.price}*${params.row.num}`)//价格*数量
                                ])
                            ]);
                        }
                    }                
                ],
                data1: [
                    {
                        src: require('../../assets/images/jiezhi.png'),
                        title: '十二生肖系列红白色双色18k金吊坠项链女套链货号十二生肖系列88888',
                        spec: '纯白-1.62mm-2008',
                        price: '8988.00',
                        num: 2
                    },
                    {
                        src: require('../../assets/images/xianglian.png'),
                        title: '22222222222222222222222',
                        spec: '纯黑-3.62mm-2000',
                        price: '222222.00',
                        num: 4
                    },
                    {
                        src: require('../../assets/images/diaozhui.png'),
                        title: '33333333333333333333333',
                        spec: '纯黄-1.62mm-9999',
                        price: '33333333.00',
                        num: 1
                    },
                    {
                        src: require('../../assets/images/erhuan.png'),
                        title: '44444444444444444444444',
                        spec: '纯白-1.62mm-2008',
                        price: '45454545.00',
                        num: 7
                    }
                ],
                allPrice:0,  
                nickName:'登录/注册',
                userInfoSession: sessionStorage.getItem('userInfo')
            }
        },
        methods: {   
            handleOpen () {
                this.bgColor = !this.bgColor
                this.visible =  !this.visible
                this.type = this.type === "ios-arrow-down"?"ios-arrow-up":"ios-arrow-down"
            },
            handleClick() {
                this.bgColor2 = !this.bgColor2
                this.visible2 =  !this.visible2
            },
            handleSelectAll (status) {
                this.$refs.selection.selectAll(status);
            },
            onSelect($event) {
                this.visible2  = true
                this.allPrice = 0
                $event.forEach(element => {
                    this.allPrice += parseInt(element.price) * element.num
                })
            },
            stop(){}
        },
        mounted () {
            this.bus.$on('userNickName', ()=>{ //监听用户修改后的昵称
                this.nickName = JSON.parse(sessionStorage.getItem('userInfo')).nickName
            })
            let userInfo = JSON.parse(sessionStorage.getItem('userInfo'))
            if(JSON.parse(sessionStorage.getItem('userInfo')) !==null){
                this.nickName = userInfo.nickName === null? '未命名': userInfo.nickName
            }else{
                this.nickName =  '登录/注册'
            }
        },
        computed: {
            // allPeice(){
            //     return 
            // }
        },
        watch: {
            // visible2(){
            //     console.log('sfasfsafas')
            // }
        }
    }
</script>

<style>
    .header .header-left .ivu-select-dropdown{
        padding: 0;
        margin: 0;
        left: 100px!important
    }
    .header .header-right .ivu-select-dropdown{
        padding: 0;
        margin: 0;
        left: 724px!important
    }
    .shopCart .ivu-table td{
        border: none
    }
    .shopCart th .ivu-table-cell.ivu-table-cell-with-selection{
        position: absolute;
        top: 267px;
        left: 5px;
    }
    /*滚动条样式*/
    .header .ivu-table-overflowY::-webkit-scrollbar{
        /*滚动条整体样式*/
        width: 4px; /*高宽分别对应横竖滚动条的尺寸*/
        height: 2px;
        position: relative;
        left: -42px;
    }
    .header .ivu-table-overflowY::-webkit-scrollbar-thumb{
        /*滚动条里面小方块样式*/
        border-radius: 6px;
        background: #979797;
    }
    .header .ivu-table-overflowY::-webkit-scrollbar-track{
        /*滚动条里面轨道样式*/
        background: transparent;
    }
</style>

<style lang="stylus" scoped>
@import "~styles/common/common.styl";  
    .keng
        height 40px
    .header
        position fixed
        top 0
        z-index 999
        width 1200px
        height 40px
        line-height 40px
        background-color #fff
        .header-left
            $ml(60px)
            float left
            i 
                color $blue
            .bgColor
                background-color $blue
                span,i 
                    color #fff
            .header-left-day              
                position relative
                .dayprice
                    position absolute
                    padding-left 10px     
                    width 350px
                    height 473px
                    $border(b,1px)
                    padding 0
                    text-align center
                    background-color #fff
                    left -166px
                    h3
                        font-size 16px
                        line-height 50px
                        text-align center
                        color $blue
                    table                                    
                        font-size 12px
                        display inline-block
                        tr:nth-of-type(1)
                            color #000  
                            display block
                            $border(border-bottom,1px)
                            th
                                width 100px
                           
                        td
                            width 100px
                            text-align center
                            line-height 25px
                            color $blue
                    p
                        font-size 12px
                        line-height 18px
                        $mt(10px)
                        color $blue                  
        span,a
            color #000
            margin-right 10px
        .header-right
            float right
            a
                $mr(20px)
                i
                    img
                        width 24px
                        vertical-align middle
</style>