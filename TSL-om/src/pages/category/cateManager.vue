<style scoped>
#cateManager {
  position: relative;
}
.my-breadcrumb {
  margin: 0px 10px;
}
.my-tree {
  margin: 10px;
  border: 1px solid #dddee1;
  padding: 0px 10px;
  width: 200px;
  position: absolute;
  top: 20px;
  left: 0px;
}
.my-content {
  width: 900px;
  position: absolute;
  top: 20px;
  left: 220px;
}
.add-btn {
  margin: 10px 0px;
}
.my-table {
  margin: 0px 10px 10px 0px;
}
.my-label {
  width: 20%;
  line-height: 32px;
  display: inline-block;
  margin-left: 10%;
}
.my-input {
  width: 60%;
  margin-bottom: 10px;
}
.my-radioGroup {
  width: 60%;
}
.my-radio {
  width: 45%;
}
</style>
<template>
  <div id="cateManager">
    <Breadcrumb class="my-breadcrumb">
      <BreadcrumbItem>运营类目管理</BreadcrumbItem>
      <BreadcrumbItem>类目管理</BreadcrumbItem>
    </Breadcrumb>
    <Tree :data="cateData" class="my-tree" @on-select-change="selectTree" ref="tree1"></Tree>
    <div class="my-content" v-show="currCate.length !== 0">
      <Button class="add-btn" @click="edit">新增</Button>
      <Table :columns="columns1" :data="data1" class="my-table" v-if="currCate.length"></Table>
    </div>
    <Modal v-model="editing" :title="modalTitle" width="700">
      <Form :label-width="100" :model="editObj" :rules="ruleValidate1" ref="form1">
        <FormItem label="类目名称：" prop="name">
          <Input v-model="editObj.name"></Input>
        </FormItem>
        <FormItem label="排序号：" prop="code">
          <Input  ref="code" v-model.trim="code" :maxlength="4" style="width: 80px;"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button @click="onOk" type="primary" :loading="loading">确定</Button>
        <Button @click="onCancel">取消</Button>
      </div>
    </Modal>
  </div>
</template>
<script type="text/ecmascript-6">
  import * as cateAPI from '../../services/operationCate.es6'
  import * as pmAPI from '../../services/productManager.es6'
  export default {
    name: 'cateManager',
    data () {
      return {
        // tree
        currCate: [],
        cateData: [
          {
            title: '商品分类',
            level: 0,
            expand: true,
            children: []
          }
        ],
        // table
        blurTimeout: '',
        columns1: [
          {title: '类目名称', key: 'name'},
          {
            title: '状态',
            render: (h, params) => {
              let status = ''
              switch (parseInt(params.row.status)) {
                case 1: status = '启用'
                  break
                case 2: status = '停用'
                  break
              }
              return status
            }
          },
          {
            title: '排序号',
            render: (h, params) => {
              if (this.data1[params.index].codeEditing) {
                return h('div', [
                  h('Icon', {
                    props: {type: 'checkmark-circled'}
                  }),
                  h('Input', {
                    props: {value: params.row.code, size: 'small', maxlength: 4},
                    style: {width: '60px', 'margin-left': '2px'},
                    on: {
                      'on-change': (val) => {
                        params.row.tempcode = val.target.value.replace(/[' ']/g, '')
                        params.row.changed = true
                      },
                      'on-blur': () => {
                        this.blurTimeout = setTimeout(() => {
                          if (this.data1[params.index].codeEditing === false) {
                            return
                          }
                          if (!params.row.changed) {
                            this.data1[params.index].codeEditing = false
                          } else if (params.row.tempcode.length === 0) {
                            this.$Message.warning({content: '请输入排序数值'})
                          } else if (!/^\d+$/.test(params.row.tempcode)) {
                            this.$Message.warning({content: '排序值应为数字'})
                          } else {
                            let params1 = {
                              id: params.row.id,
                              name: params.row.name,
                              level: params.row.level,
                              code: params.row.tempcode
                            }
                            if (params.row.parentId) {
                              params1.parentId = params.row.parentId
                            }
                            this.editCate(params1, (response) => {
                              if (response.data.code === 200) {
                                this.data1[params.index].code = params.row.tempcode
                                this.data1[params.index].codeEditing = false
                                this.$Message.success({content: '操作成功'})
                                this.afterOperate()
                              } else {
                                this.$Message.success({content: '操作失败'})
                              }
                            })
                          }
                        }, 300)
                      },
                      'on-enter': () => {
                        if (!params.row.changed) {
                          this.data1[params.index].codeEditing = false
                        } else if (params.row.tempcode.length === 0) {
                          this.$Message.warning({content: '请输入排序数值'})
                        } else if (!/^\d+$/.test(params.row.tempcode)) {
                          this.$Message.warning({content: '排序值应为数字'})
                        } else {
                          let params1 = {
                            id: params.row.id,
                            name: params.row.name,
                            level: params.row.level,
                            code: params.row.tempcode
                          }
                          if (params.row.parentId) {
                            params1.parentId = params.row.parentId
                          }
                          this.editCate(params1, (response) => {
                            if (response.data.code === 200) {
                              this.data1[params.index].code = params.row.tempcode
                              this.data1[params.index].codeEditing = false
                              this.$Message.success({content: '操作成功'})
                              this.afterOperate()
                            } else {
                              this.$Message.success({content: '操作失败'})
                            }
                          })
                        }
                      }
                    }
                  })
                ])
              } else {
                return h('div', {
                  on: {
                    'dblclick': () => {
                      this.data1[params.index].codeEditing = true
                    }
                  }
                }, [
                  h('Icon', {
                    props: {type: 'edit'}
                  }),
                  h('span', {
                    style: {'margin-left': '10px'}
                  }, params.row.code)
                ])
              }
            }
          },
          {
            title: '操作',
            render: (h, params) => {
              let om = [
                h('Button', {
                  props: {
                    type: 'text',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.edit(params)
                    }
                  }
                }, '修改'),
                h('Button', {
                  props: {type: 'text', size: 'small'},
                  on: {
                    click: () => {
                      if (parseInt(params.row.status) === 1) {
                        this.$http.put(cateAPI.offCate(params.row.id))
                            .then(response => {
                              if (response.data.code === 200) {
                                this.data1[params.index].status = 2
                                this.$Message.success({content: '操作成功'})
                                this.afterOperate()
                              } else {
                                this.$Message.error({content: '操作失败'})
                              }
                            })
                      } else if (parseInt(params.row.status) === 2) {
                        this.$http.post(cateAPI.onCate(params.row.id))
                            .then(response => {
                              if (response.data.code === 200) {
                                this.data1[params.index].status = 1
                                this.$Message.success({content: '操作成功'})
                                this.afterOperate()
                              } else {
                                this.$Message.error({content: '操作失败'})
                              }
                            })
                      }
                    }
                  }
                }, parseInt(params.row.status) === 1 ? '停用' : '启用')
              ]
              let delCate = [
                h('div', [
                  h('Button', {
                    props: {type: 'text', size: 'small'},
                    on: {click: () => {
                      if (params.row.status === 1) {
                        this.$Message.warning('该类目正在使用,无法删除')
                      } else {
                        this.deleteCate(params)
                      }
                    }}
                  }, '删除')
                ])]
              om.push(delCate)
              return h('div', {}, om)
//              return h('div', [
//                h('Button', {
//                  props: {type: 'text', size: 'small'},
//                  on: {click: () => {
//                    this.edit(params)
//                  }}
//                }, '修改'),
//                h('Button', {
//                  props: {type: 'text', size: 'small'},
//                  on: {click: () => {
//                    if (params.row.status === 1) {
//                      this.$Message.warning('该类目正在使用,无法删除')
//                    } else {
//                      this.deleteCate(params)
//                    }
//                  }}
//                }, '删除'),
//                h('Button', {
//                  props: {type: 'text', size: 'small'},
//                  on: {
//                    click: () => {
//                      if (parseInt(params.row.status) === 1) {
//                        this.$http.put(cateAPI.offCate(params.row.id)).then(response => {
//                          if (response.data.code === 200) {
//                            this.data1[params.index].status = 2
//                            this.$Message.success({content: '操作成功'})
//                            this.afterOperate()
//                          } else {
//                            this.$Message.error({content: '操作失败'})
//                          }
//                        })
//                      } else if (parseInt(params.row.status) === 2) {
//                        this.$http.post(cateAPI.onCate(params.row.id)).then(response => {
//                          if (response.data.code === 200) {
//                            this.data1[params.index].status = 1
//                            this.$Message.success({content: '操作成功'})
//                            this.afterOperate()
//                          } else {
//                            this.$Message.error({content: '操作失败'})
//                          }
//                        })
//                      }
//                    }
//                  }
//                }, parseInt(params.row.status) === 1 ? '停用' : '启用')
//              ])
            }
          }
        ],
        data1: [],
        // modal
        editing: false,
        loading: false,
        ruleValidate1: {
          name: [{required: true, message: '类目名称不可为空', trigger: 'blur'}]
        },
        editObj: {
          id: '',
          name: '',
          code: 1
        }
      }
    },
    mounted: function () {
      this.getCate((response) => {
        this.handleToCateData(response.data.operateCategory)
      })
    },
    methods: {
      isEmpty (val) {
        if (!/^['']*$/.test(val) && !/^[' ']+$/.test(val)) {
          return false
        } else {
          return true
        }
      },
      getCate (callback) {
        this.$http.get(cateAPI.getCate()).then((response) => {
          if (response.data.code === 200) {
            if (typeof callback === 'function') {
              callback(response)
            }
          }
        })
      },
      handleToCateData (val, callback) {
        let expands = []
        for (let i of this.cateData[0].children) {
          if (i.expand) { expands.push(i.id) }
        }
        let arr = JSON.parse(JSON.stringify(val))
        let operateCategory = []
        for (let i in arr) {
          let cate1 = {
            id: arr[i].id,
            title: arr[i].name,
            level: arr[i].level,
            status: arr[i].status,
            code: arr[i].code,
            children: [],
            expand: expands.indexOf(arr[i].id) !== -1,
            selected: (this.currCate[0] || {id: ''}).id === arr[i].id
          }
          for (let j in arr[i].secondCategory) {
            let cate2 = {
              id: arr[i].secondCategory[j].id,
              parentId: arr[i].id,
              title: arr[i].secondCategory[j].name,
              level: arr[i].secondCategory[j].level,
              status: arr[i].secondCategory[j].status,
              code: arr[i].secondCategory[j].code,
              children: [],
              children1: [],
              selected: (this.currCate[0] || {id: ''}).id === arr[i].secondCategory[j].id
            }
            for (let k in arr[i].secondCategory[j].threeCategory) {
              let cate3 = {
                id: arr[i].secondCategory[j].threeCategory[k].id,
                parentId: arr[i].secondCategory[j].id,
                title: arr[i].secondCategory[j].threeCategory[k].name,
                level: arr[i].secondCategory[j].threeCategory[k].level,
                status: arr[i].secondCategory[j].threeCategory[k].status,
                code: arr[i].secondCategory[j].threeCategory[k].code
              }
              cate2.children1.push(cate3)
            }
            cate1.children.push(cate2)
          }
          operateCategory.push(cate1)
        }
        this.cateData[0].children = operateCategory
        if (typeof callback === 'function') {
          callback()
        }
      },
      // 操作后刷新数据
      afterOperate () {
        this.getCate((response) => {
          this.handleToCateData(response.data.operateCategory, () => {
            // let newCate = JSON.parse(JSON.stringify(this.currCate))
            let newCate = []
            if (this.currCate[0].level === 0) {
              newCate[0] = JSON.parse(JSON.stringify(this.cateData[0]))
            } else if (this.currCate[0].level === 1) {
              for (let i of this.cateData[0].children) {
                if (this.currCate[0].id === i.id) {
                  newCate[0] = JSON.parse(JSON.stringify(i))
                }
              }
            } else if (this.currCate[0].level === 2) {
              for (let i of this.cateData[0].children) {
                for (let j of i.children) {
                  if (this.currCate[0].id === j.id) {
                    newCate[0] = JSON.parse(JSON.stringify(j))
                  }
                }
              }
            }
            this.selectTree(newCate)
          })
        })
      },
      selectTree (val) {
//        console.log(val)
        if (val.length) {
          // 设置表格数据
          let arr = []
          if (val[0].children) {
            if (val[0].level === 2) {
              arr = JSON.parse(JSON.stringify(val[0].children1))
            } else {
              arr = JSON.parse(JSON.stringify(val[0].children))
            }
          }
          for (let i in arr) {
            arr[i].name = arr[i].title
            delete arr[i].title
            arr[i].codeEditing = false
          }
          this.currCate = val
          this.data1 = arr
        } else {
          this.currCate = []
          this.data1 = []
        }
        console.log(this.data1)
      },
      edit (params) {
        if (params.row) {
          this.editObj = {
            id: params.row.id,
            name: params.row.name,
            level: params.row.level,
            code: params.row.code,
            iconUrl: params.row.iconUrl
          }
          if (params.row.parentId) {
            this.editObj.parentId = params.row.parentId
          }
        }
        this.editing = true
      },
      onOk () {
        this.loading = true
        this.$refs.form1.validate((valid) => {
          console.log(valid)
          if (valid) {
            for (let i of this.data1) {
              if (i.name === this.editObj.name && i.id !== this.editObj.id) {
                this.loading = false
                this.$Message.warning({content: '名称已存在'})
                return
              }
            }
            if (this.isEmpty(this.editObj.id)) {
              console.log('addCate')
              this.addCate((response) => {
                if (response.data.code === 200) {
                  this.$Message.success({content: '新增类目成功'})
                  this.loading = false
                  this.editing = false
                  this.afterOperate()
                } else {
                  this.$Message.success({content: '新增类目失败'})
                  this.loading = false
                }
              })
            } else {
              console.log('edit')
              this.editCate(this.editObj, (response) => {
                if (response.data.code === 200) {
                  this.$Message.success({content: '编辑类目成功'})
                  this.loading = false
                  this.editing = false
                  this.afterOperate()
                } else {
                  this.$Message.success({content: '编辑类目失败'})
                  this.loading = false
                }
              })
            }
          } else {
            this.loading = false
          }
        })
      },
      onCancel () {
        this.editObj =
        {
          id: '',
          name: ''
        }
        this.editing = false
      },
      addCate (callback) {
        let params = {
          name: this.editObj.name,
          level: parseInt(this.currCate[0].level) + 1,
          code: this.editObj.code
        }
        if (params.level !== 1) {
          params.parentId = this.currCate[0].id
        }
        this.$http.post(...cateAPI.addCate(params)).then((response) => {
          if (callback) {
            if (typeof callback === 'function') {
              callback(response)
            }
          }
        })
      },
      editCate (params, callback) {
        this.$http.put(...cateAPI.editCate(params)).then((response) => {
          if (callback) {
            if (typeof callback === 'function') {
              callback(response)
            }
          }
        })
      },
      deleteCate (params) {
        this.$Modal.remove()
        console.log(params)
        if (params.row.level === 1) {
          if (params.row.children.length > 0) {
            console.log('1')
            this.$Modal.warning({title: '提示', content: '请确保该类目下没有子类目、通用参数、SKU属性、商品后重试'})
            return
          }
        }
        if (params.row.level === 2) {
          if (params.row.children1.length > 0) {
            console.log('2')
            this.$Modal.warning({title: '提示', content: '请确保该类目下没有子类目、通用参数、SKU属性、商品后重试'})
            return
          }
        }
        this.getCommonAttr(params.row.id, (response) => {
          if (response.data.catalogAttr.length > 0) {
            console.log('3')
            this.$Modal.warning({title: '提示', content: '请确保该类目下没有子类目、通用参数、SKU属性、商品后重试'})
          } else {
            this.getSkuAttr(params.row.id, (response) => {
              if (response.data.catalogAttr.length > 1) {
                console.log('4')
                this.$Modal.warning({title: '提示', content: '请确保该类目下没有子类目、通用参数、SKU属性、商品后重试'})
                return
              } else if (response.data.catalogAttr.length === 1) {
                if (response.data.catalogAttr[0].name === '颜色' && response.data.catalogAttr[0].values.length !== 1 && response.data.catalogAttr[0].values[0] !== '默认') {
                  console.log('5')
                  this.$Modal.warning({title: '提示', content: '请确保该类目下没有子类目、通用参数、SKU属性、商品后重试'})
                  return
                }
              }
              this.getForSell(1, 1, {categoryId: params.row.id}, (response) => {
                if (response.data.pageInfo.list.length > 0) {
                  console.log('6')
                  this.$Modal.warning({title: '提示', content: '请确保该类目下没有子类目、通用参数、SKU属性、商品后重试'})
                } else {
                  this.getOnSell(1, 1, {categoryId: params.row.id}, (response) => {
                    if (response.data.pageInfo.list.length > 0) {
                      console.log('7')
                      this.$Modal.warning({title: '提示', content: '请确保该类目下没有子类目、通用参数、SKU属性、商品后重试'})
                    } else {
                      this.$Modal.confirm({
                        title: '删除',
                        content: '是否删除类目',
                        onOk: () => {
                          this.deleteCate1(params.row.id, (response) => {
                            if (response.data.code === 200) {
                              this.$Message.success('删除成功')
                              this.afterOperate()
                            } else {
                              this.$Message.error('删除失败')
                            }
                          })
                        }
                      })
                    }
                  })
                }
              })
            })
          }
        })
      },
      getCommonAttr (id, callback) {
        this.$http.get(cateAPI.getCommonAttr(id)).then(response => {
          if (typeof callback === 'function') {
            callback(response)
          }
        }).catch(error => {
          console.log(error)
        })
      },
      getSkuAttr (id, callback) {
        this.$http.get(cateAPI.getSkuAttr(id)).then(response => {
          if (typeof callback === 'function') {
            callback(response)
          }
        }).catch(error => {
          console.log(error)
        })
      },
      getForSell (pageNum, pageSize, params, callback) {
        this.$http.post(...pmAPI.forSell(pageNum, pageSize, params)).then(response => {
          if (typeof callback === 'function') {
            callback(response)
          }
        }).catch(error => {
          console.log(error)
        })
      },
      getOnSell (pageNum, pageSize, params, callback) {
        this.$http.post(...pmAPI.onsell(pageNum, pageSize, params)).then(response => {
          if (typeof callback === 'function') {
            callback(response)
          }
        }).catch(error => {
          console.log(error)
        })
      },
      deleteCate1 (id, callback) {
        this.$http.delete(cateAPI.deleteCate(id)).then(response => {
          if (typeof callback === 'function') {
            callback(response)
          }
        })
      }
    },
    computed: {
      // 弹窗标题
      modalTitle () {
        if (this.editObj.id.length === 0) {
          return '新增类目'
        } else {
          return '编辑类目'
        }
      },
      // ----------排序号-弹窗
      code: {
        get () {
          return this.editObj.code
        },
        set (code) {
          this.editObj.code = code.replace(/[^0-9]/g, '') || 1
          if (this.$refs.code) {
            setTimeout(() => {
              this.$refs.code.currentValue = code.replace(/[^0-9]/g, '') || 1
            }, 60)
          }
        }
      }
    },
    watch: {
      editing (val) {
        if (val === false) {
          this.editObj.id = ''
          this.editObj.name = ''
          this.editObj.code = 1
          this.$refs.form1.resetFields()
        }
      }
    }
  }
</script>
