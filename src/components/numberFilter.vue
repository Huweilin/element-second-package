<template>
  <el-form ref="form" :model="form" :inline="true" size="mini" :rules="formRules" :disabled="disabled">
    <el-form-item prop="selectedMethod" class="mb-0">
      <el-select class="short-select" v-model="form.selectedMethod" size="mini" @change="onChangeMethod">
        <el-option v-for="(op, ind) in displayOptions" :key="ind" :label="op.label" :value="op.value"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item class="mb-0">
      <el-form-item class="mb-0 inline-block mr-0" prop="value1" label-width="0px">
        <div>
          <span v-if="currentItem['leftPlaceholder']">{{currentItem['leftPlaceholder']}}</span>
          <el-input-number class="short-input" v-model="form.value1" :controls="false" :placeholder="placeholder"
            @change="onChangeNum($event, 'value1')"></el-input-number>
          <!-- <el-input v-model="form.value1" class="short-input" :placeholder="placeholder" @change="onChangeNum($event, 'value1')" @focus="onFocus('value1')"></el-input> -->
        </div>
      </el-form-item>
      <template v-if="currentItem['type'] == optionTypes['two']">
        <span> ~ </span>
        <el-form-item class="mb-0 inline-block" prop="value2" label-width="0px"
          :rules="value2Rules">
          <el-input-number class="short-input" v-model="form.value2" :controls="false" :placeholder="placeholder"
            @change="onChangeNum($event, 'value1')"></el-input-number>
          <!-- <el-input v-model="form.value2" class="short-input" :placeholder="placeholder" @change="onChangeNum($event, 'value2')" @focus="onFocus('value2')"></el-input> -->
        </el-form-item>
      </template>
    </el-form-item>
  </el-form>
</template>
<script>
export default {
  name: 'numberFilter',
  props: {
    disabled: Boolean,
    /** value空值有要求
     * 空字符串不更新form
     * null | undefined 则重置form
    */
    value: String,
    /** 需隐藏的选项 类型为Array<String> */
    hiddenOptions: {
      type: Array,
      default () {
        return ['最大的N个', '最小的N个']
      }
    },
    placeholder: {
      type: String,
      default: '请输入'
    },
    canEmpty: {
      type: Boolean,
      default: false
    },
    // 拼接符号
    spliceSign: {
      type: String,
      default: ','
    },
    options: {
      type: Array,
      default () {
        return [
          { label: '介于', value: '介于', type: 2 },
          { label: '大于', value: '大于' },
          { label: '小于', value: '小于' },
          { label: '等于', value: '等于' },
          { label: '最大的N个', value: '最大的N个', leftPlaceholder: 'N = ' },
          { label: '最小的N个', value: '最小的N个', leftPlaceholder: 'N = ' }
        ]
      }
    }
  },
  data () {
    return {
      optionTypes: {
        two: 2 // 代表有两个选择框
      },
      form: {
        selectedMethod: null,
        value1: undefined,
        value2: undefined
      }
    }
  },
  computed: {
    currentItem () {
      let item = this.options.find(item => item.value == this.form.selectedMethod)
      return item || {}
    },
    displayOptions () {
      return this.options.filter(op => !this.hiddenOptions.some(val => op.value == val))
    },
    formRules () {
      return {
        // selectedMethod: [{ required: true, message: '请选择', trigger: ['change', 'blur'] }],
        value1: this.canEmpty ? [] : [{ required: true, validator: this.$utils.checkNumberAndExist, trigger: ['change', 'blur'] }]
      }
    },
    value2Rules () {
      return this.canEmpty ? [] : [{ required: true, validator: this.$utils.checkNumber, trigger: ['change', 'blur'] }]
    }
  },
  watch: {
    value: {
      handler (val, oldVal) {
        // 数据以,分割
        if (val) {
          if (val === oldVal) {
            return
          }
          let arr = val.split(this.spliceSign)
          arr[0] && (this.form.selectedMethod = arr[0])
          this.form.value1 = arr[1] ? arr[1] : undefined
          this.form.value2 = arr[2] ? arr[2] : undefined
        } else if (val !== '') {
          // 为null | undefined则说明是要重置状态
          this.restForm()
        } else {
          // 为空字符串则保持已选的form值不变
        }
      },
      immediate: true
    }
  },
  created () {
    this.form.selectedMethod = this.displayOptions[0] && this.displayOptions[0].value
  },
  methods: {
    restForm () {
      let method = this.form.selectedMethod || (this.displayOptions[0] && this.displayOptions[0].value)
      this.form.selectedMethod = method
      this.form.value1 = undefined
      this.form.value2 = undefined
    },
    onChangeMethod (op) {
      // this.form.value1 = undefined
      this.form.value2 = undefined
      this.transformValueByForm()
    },
    onChangeNum (op, prop) {
      this.transformValueByForm()
    },
    transformValueByForm () {
      this.$refs.form.validate(valid => {
        let spliceSign = this.spliceSign
        let str = ''
        if (this.form.value1) {
          if (this.form.selectedMethod === '介于') {
            if (this.form.value2) {
              str += this.form.selectedMethod + `${spliceSign}${this.form.value1 || ''}${spliceSign}${this.form.value2 || ''}`
            }
          } else {
            str += this.form.selectedMethod + `${spliceSign}${this.form.value1 || ''}`
          }
        }
        this.emitVal(str)
      })
    },
    emitVal (value) {
      this.$emit('change', value)
      this.$emit('input', value)
    },
    /**
     * @returns { Promise } 返回校验结果
     */
    validate () {
      let valid = false
      this.$refs.form.validate(val => {
        valid = val
      })
      return valid
    }
  }
}
</script>
<style lang="less" scoped>
  .short-select {
    width: 105px;
  }
  .short-input {
    width: 100px;
  }
  .m-l-3 {
    margin-left: 3px;
  }
</style>
