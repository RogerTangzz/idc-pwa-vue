<template>
  <div>
    <h2>{{ isEdit ? '编辑巡检' : '新建巡检' }}</h2>
    <el-form label-width="100px" @submit.prevent>
      <div v-for="(items, floor) in form" :key="floor" class="floor-group">
        <h3>{{ floor }}</h3>
        <div v-for="(item, idx) in items" :key="idx" class="question-item">
          <el-form-item :label="item.项目 + ' - ' + item.内容">
            <div class="flex">
              <el-input-number
                v-if="item.温度 !== undefined"
                v-model="item.温度"
                placeholder="温度"
                controls-position="right"
              />
              <el-input-number
                v-if="item.湿度 !== undefined"
                v-model="item.湿度"
                placeholder="湿度"
                controls-position="right"
              />
              <el-input-number
                v-if="item.压力 !== undefined"
                v-model="item.压力"
                placeholder="压力"
                controls-position="right"
              />
              <el-radio-group v-model="item.状态">
                <el-radio label="正常">正常</el-radio>
                <el-radio label="异常">异常</el-radio>
              </el-radio-group>
              <el-input
                v-model="item.异常摘要"
                placeholder="异常摘要"
                v-if="item.状态 === '异常'"
              />
            </div>
          </el-form-item>
        </div>
      </div>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="cancel">取消</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInspectionStore, InspectionItem } from '@/stores/useInspectionStore'

const template: Record<string, InspectionItem[]> = {
  '一楼': [
    { 项目: '配电柜', 内容: '运行情况', 温度: null, 湿度: null, 压力: null, 状态: '正常', 异常摘要: '' },
    { 项目: '空调', 内容: '送风', 温度: null, 湿度: null, 状态: '正常', 异常摘要: '' }
  ],
  '二楼': [
    { 项目: '消防', 内容: '设备状态', 状态: '正常', 异常摘要: '' }
  ],
  '三楼': [
    { 项目: '机柜', 内容: '门锁', 状态: '正常', 异常摘要: '' }
  ],
  '四楼': [
    { 项目: '环境', 内容: '温度湿度', 温度: null, 湿度: null, 状态: '正常', 异常摘要: '' }
  ],
  '屋顶': [
    { 项目: '排风', 内容: '风机', 状态: '正常', 异常摘要: '' }
  ]
}

const router = useRouter()
const route = useRoute()
const store = useInspectionStore()

onMounted(() => {
  store.load()
})

const isEdit = route.params.id !== undefined

function cloneTemplate() {
  return reactive(JSON.parse(JSON.stringify(template)) as Record<string, InspectionItem[]>)
}

let form = cloneTemplate()

if (isEdit) {
  const existing = store.list.find(r => r.id === Number(route.params.id))
  if (existing) {
    form = reactive(JSON.parse(JSON.stringify(existing.data)) as Record<string, InspectionItem[]>)
  }
}

function computeAbnormalCount(data: Record<string, InspectionItem[]>) {
  let count = 0
  Object.values(data).forEach(items => {
    items.forEach(item => {
      if (item.状态 === '异常') count++
    })
  })
  return count
}

function onSubmit() {
  const abnormal = computeAbnormalCount(form)
  if (isEdit) {
    store.update(Number(route.params.id), { data: form, abnormalCount: abnormal })
  } else {
    store.add({ data: form, abnormalCount: abnormal })
  }
  router.push('/inspections')
}

function cancel() {
  router.push('/inspections')
}
</script>

<style scoped>
.floor-group { margin-bottom: 24px; }
.question-item { margin-bottom: 12px; }
.flex { display: flex; align-items: center; gap: 8px; }
</style>
