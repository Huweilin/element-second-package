<template>
  <div>
    <el-table v-bind="elTableProps"
      v-loading="currentTableConfig.isLoading"
      ref="customTableCom"
      header-cell-class-name="custom-header-cell"
      @selection-change="handleSelectionChange"
      @sort-change="onSortChange">
      <slot></slot>
    </el-table>
    <!-- 分页 -->
    <pagination v-if="currentTableConfig.showPagination"
      ref="commonPagination" :total.sync="pageConfig.total" @change="paginationChange"></pagination>
    <!-- 筛选表头 -->
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
          <template v-for="(item, index) in controlColumns">
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
const ELTableProps = Object.keys(Table.props)
const defaultTableConfig = {
  showPagination: true,
  isLoading: false, // 是否启用加载动画
  hasHeaderFilter: false, // 筛选表头
  drawerItemClass: '',
  pageConfigChange: (config) => {}
}
export default {
  name: 'commonTable',
  props: {
    ...Table.props,
    tableConfig: {
      type: Object,
      default () {
        return {}
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
    // 筛选表头相关
    controlColumns: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      maxTableHeight: null,
      // 表头筛选
      drawer: false,
      showFields: [],
      lastShowFields: []
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
    ...mapGetters(['windowResize'])
  },
  watch: {
    controlColumns: {
      handler (config) {
        this.controlColumns.forEach(item => {
          this.showFields.push(item.prop)
          this.lastShowFields.push(item.prop)
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
  mounted () {
    this.setTableMaxHeight()
  },
  methods: {
    setTableMaxHeight () {
      this.$nextTick(() => {
        try {
          let win = this.windowResize.height
          let offsetTop = this.$refs.customTableCom.$el.offsetTop
          let paginationHeight = this.currentTableConfig.showPagination ? this.$refs.commonPagination.$el.offsetHeight : 0
          this.maxTableHeight = (win - offsetTop - paginationHeight) + 'px'
        } catch (err) {
          console.log(err)
        }
      })
    },
    handleSelectionChange (val) {
      this.$emit('selection-change', val)
    },
    onSortChange (obj) {
      this.$emit('sort-change', obj)
    },
    paginationChange (pageConfig) {
      this.currentTableConfig.pageConfigChange(pageConfig)
    },
    // 筛选表头相关
    toggleDrawer (drawer = true) {
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
      this.controlColumns.forEach(item => {
        item.checked = this.showFields.includes(item.prop)
      })
      this.drawer = false
      this.lastShowFields = Object.assign([], this.showFields)
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
