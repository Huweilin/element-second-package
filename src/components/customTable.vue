<template>
  <div>
    <el-form ref="tableForm" class="table-form" :model="tableForm" size="mini"
      :class="{ 'not-rules': !hasRules }">
      <el-table v-bind="elTableProps"
        v-loading="currentTableConfig.isLoading"
        ref="customTableCom"
        header-cell-class-name="custom-header-cell"
        @selection-change="handleSelectionChange"
        @sort-change="onSortChange">
        <!-- 表格配置列 -->
        <el-table-column v-if="currentTableConfig.selection"
          align="center" type="selection" width="55" fixed="left"></el-table-column>
        <el-table-column v-if="currentTableConfig.showIndex"
          align="center" type="index" label="序号" width="80px" :fixed="currentTableConfig.selection ? false : 'left'"></el-table-column>
        <template v-for="(column, columnConfigIndex) of columnConfig">
          <template v-if="column.checked">
            <!-- 有筛选表头 -->
            <template v-if="column.hasFilter">
              <el-table-column
                :sortable="column.sortable"
                :align="column.align || 'center'"
                :key="columnConfigIndex + column.prop"
                :fixed="column.fixed"
                :min-width="column.minWidth"
                :width="column.width"
                :label="column.label"
                :show-overflow-tooltip="!!column['show-overflow-tooltip']"
                :class-name="column['class-name']">
                <el-table-column align="center" :prop="column.prop"
                  :width="getWidthByFilter(column)"
                  :class-name="column['class-name']">
                  <template slot="header" slot-scope="scope">
                    <i v-if="false">{{scope.$index}}</i>
                    <!-- 输入框 -->
                    <el-input v-if="column.filterType === 'input'"
                      size="mini"
                      v-model="searchForm[column.searchField]" placeholder="请输入"
                      @change="onChangedSearchFilter">
                    </el-input>
                    <!-- 选择框 -->
                    <el-select v-else-if="column.filterType === 'select'"
                      size="mini"
                      v-model="searchForm[column.searchField]"
                      clearable filterable
                      placeholder="请输入"
                      @change="onChangedSearchFilter">
                      <el-option
                        v-for="op in column.options"
                        :key="op.value"
                        :label="op.label"
                        :value="op.value">
                      </el-option>
                    </el-select>
                    <!-- 数值 对应绑定变量格式{ left, right, sign } -->
                    <el-input v-else-if="column.filterType === 'number'" v-model="searchForm[column.searchField].left"
                      placeholder="请输入"
                      size="mini"
                      class="input-sign-select"
                      @change="onChangedSearchFilter">
                      <el-select
                        v-model="searchForm[column.searchField].sign"
                        size="mini"
                        slot="prepend"
                        class="sign-select"
                        @change="onChangedSignFilter(searchForm[column.searchField])">
                        <el-option
                          v-for="sign in signOptions"
                          :key="sign.value"
                          :label="sign.name"
                          :value="sign.value"
                        ></el-option>
                      </el-select>
                      <el-input
                        v-if="searchForm[column.searchField].sign == signVals.between"
                        size="mini"
                        slot="append"
                        v-model="searchForm[column.searchField].right"
                        placeholder="请输入"
                        @change="onChangedSearchFilter"
                      ></el-input>
                    </el-input>
                  </template>
                  <template slot-scope="scope">
                    <el-form-item v-if="column.type === 'input'"
                      :prop="'data[' + scope.$index + '].' + column.prop"
                      :rules="column.editRules || []">
                      <el-input v-model="scope.row[column.prop]"
                        size="mini"
                        :disabled="currentTableConfig.aloneEdit && (!editingOldRow || editingOldRow.id != scope.row.id)"
                        @change="onChangeRowField(scope.row, scope.$index, column)"></el-input>
                    </el-form-item>
                    <template v-else-if="column.type === 'text'">{{getColumnVal(scope.row, scope.$index, column, columnConfigIndex)}}</template>
                    <div v-else v-html="getColumnVal(scope.row, scope.$index, column, columnConfigIndex)"></div>
                  </template>
                </el-table-column>
              </el-table-column>
            </template>
            <el-table-column v-else-if="column.type !== 'operations'"
              :sortable="column.sortable"
              :show-overflow-tooltip="!!column['show-overflow-tooltip']"
              :align="column.align || 'center'"
              :key="columnConfigIndex + column.prop"
              :fixed="column.fixed"
              :width="column.width"
              :min-width="column.minWidth"
              :label="column.label"
              :prop="column.prop"
              :class-name="column['class-name']">
              <template slot-scope="scope">
                <el-form-item v-if="column.type === 'input'"
                  :prop="'data[' + scope.$index + '].' + column.prop"
                  :rules="column.editRules || []">
                  <el-input v-model="scope.row[column.prop]" :disabled="currentTableConfig.aloneEdit && (!editingOldRow || editingOldRow.id != scope.row.id)"
                    @change="onChangeRowField(scope.row, scope.$index, column)"
                    @focus="onFocus(scope.row, scope.$index, column)"></el-input>
                </el-form-item>
                <template v-else-if="column.type === 'text'">{{getColumnVal(scope.row, scope.$index, column, columnConfigIndex)}}</template>
                <div v-else v-html="getColumnVal(scope.row, scope.$index, column, columnConfigIndex)"></div>
              </template>
            </el-table-column>
            <el-table-column v-else
              align="center"
              :key="columnConfigIndex + column.label"
              :label="column.label"
              :width="column.width"
              :fixed="column.fixed">
              <template slot="header">
                <span v-if="!currentTableConfig.hasHeaderFilter">{{column.label}}</span>
                <i v-else class="el-icon-s-operation op-col" @click="openDrawer()"></i>
              </template>
              <template slot-scope="scope">
                <template v-for="(config, i) of column.list(scope.row, editingOldRow)">
                  <template v-if="!config.hidden">
                    <el-button v-if="config.event"
                      :key="i + 'operation'"
                      :type="config.type"
                      size="mini"
                      :disabled="!!config.disabled"
                      :loading="config.loading"
                      @click="operation(config.event, scope, column, columnConfigIndex )">{{config.label}}</el-button>
                    <span v-else :key="i + 'operation'">{{config.label}}</span>
                  </template>
                </template>
              </template>
            </el-table-column>
          </template>
        </template>
      </el-table>
    </el-form>
    <!-- 分页 -->
    <pagination v-if="currentTableConfig.showPagination"
      ref="customPagination" :total.sync="pageConfig.total" @change="paginationChange"></pagination>
    <el-drawer v-if="currentTableConfig.hasHeaderFilter"
      custom-class="field-drawer"
      title="选择显示字段"
      :visible.sync="drawer"
      direction="rtl"
      size="500px"
      :append-to-body="false"
      :before-close="handleClose">
      <el-form
        ref="fieldForm"
        class="field-form"
        label-width="30px"
        :inline="true">
        <el-checkbox-group v-model="showFields">
          <template v-for="(item, index) in headerColumns">
            <el-checkbox
              class="field-checkbox"
              :class="currentTableConfig.drawerItemClass"
              name="fields"
              :label="item.prop"
              :key="index"
              :disabled="item.disabled">{{item.label}}</el-checkbox>
          </template>
        </el-checkbox-group>
      </el-form>
      <div class="content-center">
        <el-button size="medium" @click="cancelUpdatedFields()">取 消</el-button>
        <el-button type="primary" size="medium" @click="updatedFields()">确 定</el-button>
      </div>
    </el-drawer>
  </div>
</template>
<script>
import { Table } from 'element-ui'
import { mapGetters } from 'vuex'
import { signVals, signOptions } from '../utils/constants'
const ELTableProps = Object.keys(Table.props)
const defaultTableConfig = {
  showIndex: false,
  selection: false,
  // 是否，每次仅允许同时修改一条(是则行编辑状态由操作列控制)
  aloneEdit: false,
  showPagination: true, // 分页组件
  hasHeaderFilter: false, // 筛选表头
  isLoading: false, // 是否启用加载动画
  drawerItemClass: '',
  pageConfigChange: (config) => {},
  operations: (event, scope, columnConfig, columnConfigIndex) => {}
}
export default {
  name: 'customTable',
  props: {
    ...Table.props,
    tableConfig: {
      type: Object,
      default () {
        return {
          selection: false,
          // 是否，每次仅允许同时修改一条(是则行编辑状态由操作列控制)
          aloneEdit: false,
          showPagination: true, // 分页组件
          hasHeaderFilter: false, // 筛选表头
          isLoading: false // 是否启用加载动画
          // operations()
        }
      }
    },
    /**
     * 参数 [{fixed, width, label, prop, type, editRules, hasFilter, filterType, options, checked, disabled, fieldChange, searchField}]
     * type: text|input|html|operations
     * fieldChange: type为input时 修改触发的方法
     * filterType: input|select|number 为number时searchForm 对应key的value值 = { left: null, sign: null, right: null }
     * searchField: 对应searForm的key值
     * list: () => [{event, label, type, hidden disabled loading}] type为operations操作项时使用
     * editRules: 列数据编辑校验规则
     * searchField: searchForm对应的字段
     */
    columnConfig: {
      type: Array,
      default () {
        return []
      }
    },
    pageConfig: {
      type: Object,
      default () {
        return {
          page: 1,
          total: 0
        }
      }
    },
    /**
     * number类型的筛选为对象{ sign: '符号', left: '', right: '' }
     * 其他类型为null
     */
    searchForm: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      selectedRows: [],
      editingOldRow: null,
      drawerVisible: false,
      signVals,
      signOptions,
      // 表头筛选
      drawer: false,
      showFields: [],
      lastShowFields: [],
      maxTableHeight: null,
      hasRules: false
    }
  },
  computed: {
    currentTableConfig: function () {
      return Object.assign({}, defaultTableConfig, this.tableConfig)
    },
    elTableProps: function () {
      let props = {}
      ELTableProps.forEach(prop => {
        props[prop] = this.$props[prop]
      })
      props['maxHeight'] = this.maxTableHeight
      return props
    },
    tableForm: function () {
      return {
        data: this.data
      }
    },
    /** 表头列-用于筛选展示表头 */
    headerColumns: function () {
      return this.columnConfig.filter(item => item.type !== 'operations')
    },
    /** 可编辑的列组成的数组 */
    canEditColumns: function () {
      let res = []
      this.columnConfig.forEach(item => {
        if (!['text', 'operations'].includes(item.type)) {
          res.push({ prop: item.prop, label: item.label })
        }
      })
      return res
    },
    ...mapGetters(['windowResize'])
  },
  watch: {
    columnConfig: {
      handler (config) {
        this.columnConfig.forEach(item => {
          item['checked'] && this.showFields.push(item.prop)
          item['checked'] && this.lastShowFields.push(item.prop)
        })
      },
      immediate: true
    },
    windowResize: {
      handler (val) {
        this.setTableMaxHeight()
      }
    }
  },
  created () {
    this.columnConfig.forEach(item => {
      if (item.checked === null || item.checked === undefined) {
        item['checked'] = true
      }
      item.fixed = item.fixed || false
      !item.type && (item.type = 'text')
      if (!this.hasRules && item.editRules && item.editRules.length > 0) {
        // 无校验规则则el-form-item的margin-bottom置为0，有校验规则则不变
        this.hasRules = true
      }
    })
  },
  mounted () {
    this.setTableMaxHeight()
  },
  methods: {
    indexFunc (index) {
      return (this.pageConfig.page - 1) * this.pageConfig.size + index + 1
    },
    setTableMaxHeight () {
      this.$nextTick(() => {
        try {
          let win = this.windowResize.height
          let offsetTop = this.$refs.tableForm.$el.offsetTop
          let paginationHeight = this.currentTableConfig.showPagination ? this.$refs.customPagination.$el.offsetHeight : 0
          this.maxTableHeight = (win - offsetTop - paginationHeight) + 'px'
        } catch (err) {
          console.log(err)
        }
      })
    },
    // 表头筛选
    openDrawer (drawer = true) {
      this.drawer = drawer
    },
    handleClose (done) {
      done()
    },
    cancelUpdatedFields () {
      this.drawer = false
      this.showFields = Object.assign([], this.lastShowFields)
    },
    updatedFields () {
      this.columnConfig.forEach(item => {
        item.checked = this.showFields.includes(item.prop)
      })
      this.drawer = false
      this.lastShowFields = Object.assign([], this.showFields)
    },
    handleSelectionChange (val) {
      this.selectedRows = val
      this.$emit('selection-change', val)
    },
    onSortChange (obj) {
      this.$emit('sort-change', obj)
    },
    onChangedSignFilter (searchItem) {
      if (!searchItem.left) {
        return
      }
      if (searchItem.sign == this.signVals.between) {
        if (searchItem.right) {
          this.onChangedSearchFilter()
        }
      } else {
        this.onChangedSearchFilter()
      }
    },
    onChangedSearchFilter () {
      this.$emit('filter-change')
    },
    /** input 聚焦 */
    onFocus (row, index, columnConfig) {
      if (columnConfig.focusEvent && typeof columnConfig.focusEvent === 'function') {
        columnConfig.focusEvent(row, index, columnConfig)
      }
    },
    /** 单元格input change */
    onChangeRowField (row, index, columnConfig) {
      if (columnConfig.changeEvent && typeof columnConfig.changeEvent === 'function') {
        columnConfig.changeEvent(row, index, columnConfig)
      }
    },
    getWidthByFilter (column) {
      let searchForm = this.searchForm
      let defaultWidth = column.width > '200px' ? column.width : '200px'
      let maxWidth = defaultWidth > '300px' ? defaultWidth : '300px'
      if (column.filterType == 'number') {
        return searchForm[column.searchField] && searchForm[column.searchField].sign == signVals.between ? maxWidth : defaultWidth
      }
      return defaultWidth
    },
    getColumnVal (row, rowIndex, columnConfig, columnConfigIndex) {
      if (columnConfig.valFun && typeof columnConfig.valFun === 'function') {
        return columnConfig.valFun(row, columnConfig)
      }
      return row[columnConfig.prop]
    },
    paginationChange (pageConfig) {
      this.currentTableConfig.pageConfigChange(pageConfig)
    },
    /** 操作列方法 */
    operation (event, scope, columnConfig, columnConfigIndex) {
      this.currentTableConfig.operations(event, scope, columnConfig, columnConfigIndex)
    },
    // 组件 公共methods
    // 保存当前编辑行数据
    onChangedEditingRow (row) {
      this.editingOldRow = row ? Object.assign({}, row) : row
    },
    /** 还原编辑行 */
    onCancelEditingRow (row, scopeIndex) {
      let props = this.canEditColumns.map(item => {
        return `data[${scopeIndex}].${item.prop}`
      })
      this.$refs.tableForm.clearValidate(props)
      Object.assign(row, this.editingOldRow)
      this.editingOldRow = null
    },
    /** 校验某一行 return boolean */
    validatorRow (scope, callback) {
      let index = scope.$index
      let props = this.canEditColumns.map(item => {
        return `data[${index}].${item.prop}`
      })
      let valid = true
      this.$refs.tableForm.validateField(props, msg => {
        if (msg) {
          valid = false
        }
      })
      if (callback) {
        callback(valid, scope)
      }
    },
    /** 批量校验
     */
    validateBatch (callback, rows) {
      let props = []
      let batchRows = rows || this.selectedRows
      batchRows.forEach(item => {
        let index = this.data.findIndex(obj => obj.id == item.id)
        let fields = this.canEditColumns.map(column => {
          return `data[${index}].${column.prop}`
        })
        props.push(...fields)
      })
      let valid = true
      this.$refs.tableForm.validateField(props, message => {
        if (message) {
          valid = false
        }
      })
      if (callback) {
        callback(valid)
      }
    },
    /** 校验所有 */
    validatorAll (callback) {
      if (callback) {
        this.$refs.tableForm.validate(callback)
      }
    },
    clearSelection (callback) {
      this.$refs.customTableCom.clearSelection()
      if (callback && typeof callback === 'function') {
        callback()
      }
    }
  }
}
</script>
<style lang="less" scoped>
  .el-form.not-rules {
    .el-form-item {
      margin-bottom: 0;
    }
  }
  /deep/ .custom-header-cell {
    padding: 5px 0;
    .cell {
      div {
        padding: 0;
        line-height: 1;
        vertical-align: middle;
        box-sizing: border-box;
      }
    }
  }
  .input-sign-select {
    display: inline-table;
    .sign-select {
      width: 77px;
    }
    /deep/ .el-input-group__prepend {
      display: table-cell;
      width: 88px;
      .el-input__inner {
        padding-left: 5px;
      }
    }
    /deep/ .el-input-group__append {
      display: table-cell;
      border: none;
      .el-input {
        width: 100px;
      }
    }
  }
  /* 列表及抽屉 */
  .op-col {
    font-size: 22px;
    transform: rotate(90deg);
    cursor: pointer;
  }
  .field-form {
    padding: 20px 0 20px 15px;
  }
  .el-dialog__wrapper /deep/ .field-drawer {
    overflow: auto;
  }
  .field-checkbox {
    width: 220px;
    margin: 0 0 15px 10px;
    /deep/ .el-checkbox__label {
      width: calc(100% - 24px);
      overflow: hidden;
      text-overflow: ellipsis;
      /* white-space: normal; */
      vertical-align: middle;
    }
  }
</style>
