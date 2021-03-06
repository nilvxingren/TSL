/* 展示类目接口 */

// 前端类目展示
export function getShowList () {
  return `/catalogs/catalogs/v1/showList`
}

// 前端类目添加
export function addCatelog (params) {
  return [`/catalogs/catalogs/v1/showCatalog/`, params]
}

// 前端类目修改
export function putCatelog (params) {
  return [`/catalogs/catalogs/v1/showCatalog/`, params]
}

// 前端类目启用
export function postCatelog (categoryId) {
  return `/catalogs/catalogs/v1/showCatalog/` + `${categoryId}`
}

// 前端类目停用
export function putStopCatelog (categoryId) {
  return `/catalogs/catalogs/v1/showCatalog/` + `${categoryId}`
}

// 前端类目删除
export function deleteCatelog (categoryId) {
  return `/catalogs/catalogs/v1/showCatalog/` + `${categoryId}`
}
// 运营类目展示
export function getList () {
  return `/catalogs/catalogs/v1/list`
}

// 类目展示关联
export function categoryContact (params) {
  return [
    `/catalogs/catalogs/v1/categoryContact`,
    params
  ]
}

// 类目已关联展示
export function categoryOldContact (showCategoryId) {
  return `/catalogs/catalogs/v1/categoryContact/` + `${showCategoryId}`
}
