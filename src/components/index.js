// import pagination from './pagination'
// import svgIcon from './svgIcon'
// import customTable from './customTable'
// import commonTable from './commonTable'
// import customQuarterPicker from './customQuarterPicker'
// const options = [
//   // example { name: 'xxx', component: xxx },
//   { name: 'pagination', component: pagination },
//   { name: 'custom-quarter-picker', component: customQuarterPicker },
//   { name: 'custom-table', component: customTable },
//   { name: 'common-table', component: commonTable },
//   { name: 'svg-icon', component: svgIcon }
// ]
// console.log(upperFirst)

// export default (Vue) => {
//   options.map(option => {
//     Vue.component(option.name, option.component)
//   })
// }

// import Vue from 'vue'
// import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import kebabCase from 'lodash/kebabCase'

export default (Vue) => {
  const requireComponent = require.context(
    // 其组件目录的相对路径
    './',
    // 是否查询其子目录
    false,
    // 匹配基础组件文件名的正则表达式
    /[a-zA-Z]\w+\.vue$/
  )
  requireComponent.keys().forEach(fileName => {
    // 获取组件配置
    const componentConfig = requireComponent(fileName)

    // 获取组件的 PascalCase 命名
    const componentName = kebabCase(
      camelCase(
        // 获取和目录深度无关的文件名
        fileName
          .split('/')
          .pop()
          .replace(/\.\w+$/, '')
      )
    )

    // 全局注册组件
    Vue.component(
      componentName,
      // 如果这个组件选项是通过 `export default` 导出的，
      // 那么就会优先使用 `.default`，
      // 否则回退到使用模块的根。
      componentConfig.default || componentConfig
    )
  })
}

// use in main.js
// import PublicComponents from '@/components'
// Vue.use(PublicComponents)
