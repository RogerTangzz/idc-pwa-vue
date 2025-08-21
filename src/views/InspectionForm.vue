<template>
  <div>
    <h2>{{ isEdit ? '编辑巡检' : '新建巡检' }}</h2>

    <!-- 基本信息 -->
    <el-form :model="meta" label-width="100px" @submit.prevent>
      <el-form-item label="标题">
        <el-input v-model="meta.title" placeholder="例如：8月例行巡检" />
      </el-form-item>

      <el-form-item label="巡检人">
        <el-input v-model="meta.inspector" placeholder="巡检人姓名" />
      </el-form-item>

      <el-form-item label="接力人">
        <el-input v-model="meta.relayInspector" placeholder="接力/复核人员（可选）" />
      </el-form-item>

      <el-form-item label="日期">
        <el-date-picker
          v-model="meta.date"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择日期"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="meta.notes" type="textarea" placeholder="可选" />
      </el-form-item>
    </el-form>

    <!-- 分组明细（兼容 codex 的分组视图） -->
    <div v-for="(items, section) in sections" :key="section" class="floor-group">
      <h3>{{ section }}</h3>
      <div v-for="(item, idx) in items" :key="item.id ?? idx" class="question-item">
        <el-form label-width="100px" @submit.prevent>
          <el-form-item :label="`${item.name ?? '项目'} - ${item.content ?? ''}`">
            <div class="row">
              <!-- 可编辑项目/内容 -->
              <el-input v-model="item.name" placeholder="项目" class="w-160" />
              <el-input v-model="item.content" placeholder="内容" class="w-200" />

              <!-- 仅当字段存在时展示输入（兼容模板/旧数据） -->
              <el-input-number
                v-if="item.temperature !== undefined"
                v-model="item.temperature"
                placeholder="温度"
                controls-position="right"
                class="w-120"
              />
              <el-input-number
                v-if="item.humidity !== undefined"
                v-model="item.humidity"
                placeholder="湿度"
                controls-position="right"
                class="w-120"
              />
              <el-input-number
                v-if="item.pressure !== undefined"
                v-model="item.pressure"
                placeholder="压力"
                controls-position="right"
                class="w-120"
              />

              <el-radio-group v-model="item.status">
                <el-radio label="正常">正常</el-radio>
                <el-radio label="异常">异常</el-radio>
              </el-radio-group>

              <el-input
                v-if="item.status === '异常'"
                v-model="item.abnormalNote"
                placeholder="异常摘要"
                class="w-240"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div class="mt-2">当前异常数：{{ abnormalCount }}</div>

    <el-button type="primary" class="mt-2" @click="onSubmit">
      {{ isEdit ? '保存' : '提交' }}
    </el-button>
    <el-button class="mt-2" @click="onCancel">取消</el-button>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useInspectionStore, type Inspection, type InspectionItem } from '@/stores/useInspectionStore'

const store = useInspectionStore()
const router = useRouter()
const route = useRoute()
const isEdit = computed(() => route.params.id !== undefined)

// -------- 楼层模板（新建时使用；字段为规范模型的可选扩展） --------
function makeTemplate(): Record<string, InspectionItem[]> {
  let id = 1
  const mk = (p: Partial<InspectionItem> & { content: string; status?: '正常' | '异常' }): InspectionItem => ({
    id: id++,
    content: p.content,
    status: p.status ?? '正常',
    name: p.name,
    temperature: p.temperature ?? null,
    humidity: p.humidity ?? null,
    pressure: p.pressure ?? null,
    abnormalNote: p.abnormalNote,
    section: p.section
  })
  return {
    一楼: [
      mk({ name: '配电柜', content: '运行情况', temperature: null, humidity: null, pressure: null, section: '一楼' }),
      mk({ name: '空调', content: '送风', temperature: null, humidity: null, section: '一楼' })
    ],
    二楼: [mk({ name: '消防', content: '设备状态', section: '二楼' })],
    三楼: [mk({ name: '机柜', content: '门锁', section: '三楼' })],
    四楼: [mk({ name: '环境', content: '温度湿度', temperature: null, humidity: null, section: '四楼' })],
    屋顶: [mk({ name: '排风', content: '风机', section: '屋顶' })]
  }
}

// -------- UI State --------
const meta = reactive<{ title: string; inspector?: string; relayInspector?: string; date: string; notes?: string }>({
  title: '',
  inspector: '',
  relayInspector: '',
  date: '',
  notes: ''
})
const sections = reactive<Record<string, InspectionItem[]>>(makeTemplate())

// 仅用于页面显示；持久化由 store 重算
const abnormalCount = computed(() =>
  Object.values(sections).flat().filter(i => i.status === '异常').length
)

onMounted(() => {
  store.load()
  if (isEdit.value) {
    const id = Number(route.params.id)
    const rec = store.getById(id)
    if (!rec) {
      router.push('/inspections')
      return
    }
    // 元信息
    meta.title = rec.title
    meta.inspector = rec.inspector
    meta.relayInspector = rec.relayInspector
    meta.date = rec.date
    meta.notes = rec.notes

    // 分组视图：按 section 分组（没有 section 的归入“默认”）
    const grouped: Record<string, InspectionItem[]> = {}
    rec.items.forEach((it) => {
      const key = it.section || '默认'
      if (!grouped[key]) grouped[key] = []
      grouped[key].push({ ...it }) // 深拷贝，避免直接改 store
    })
    // 用分组替换模板
    Object.keys(sections).forEach(k => delete sections[k])
    Object.entries(grouped).forEach(([k, v]) => (sections[k] = v))
  }
})

// 扁平化为 items[]，并补齐 section 与 id
function toFlatItems(): InspectionItem[] {
  const flat: InspectionItem[] = []
  let nextItemId =
    Math.max(0, ...Object.values(sections).flat().map(i => (typeof i.id === 'number' ? i.id : 0))) + 1

  for (const [section, arr] of Object.entries(sections)) {
    for (const it of arr) {
      flat.push({
        id: typeof it.id === 'number' ? it.id : nextItemId++,
        content: String(it.content ?? ''),
        status: it.status === '异常' ? '异常' : '正常',
        name: it.name ? String(it.name) : undefined,
        temperature: typeof it.temperature === 'number' ? it.temperature : (it.temperature === null ? null : undefined),
        humidity: typeof it.humidity === 'number' ? it.humidity : (it.humidity === null ? null : undefined),
        pressure: typeof it.pressure === 'number' ? it.pressure : (it.pressure === null ? null : undefined),
        abnormalNote: it.abnormalNote ? String(it.abnormalNote) : undefined,
        section
      })
    }
  }
  return flat
}

function normDate(v: any): string {
  if (!v) return ''
  if (typeof v === 'string') return v
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  return String(v)
}

function onSubmit() {
  if (!meta.title.trim()) {
    ElMessage.error('请填写标题')
    return
  }
  const payload = {
    title: meta.title.trim(),
    inspector: meta.inspector?.trim() || undefined,
    relayInspector: meta.relayInspector?.trim() || undefined,
    date: normDate(meta.date),
    notes: meta.notes?.trim() || undefined,
    items: toFlatItems()
  }

  if (isEdit.value) {
    const id = Number(route.params.id)
    store.update(id, payload as Partial<Inspection>)
    ElMessage.success('已保存')
  } else {
    store.add(payload as Omit<Inspection, 'id' | 'abnormal' | 'synced'>)
    ElMessage.success('已创建')
  }
  router.push('/inspections')
}

function onCancel() {
  router.push('/inspections')
}
</script>

<style scoped>
h2 { margin-bottom: 12px; }
.mt-2 { margin-top: 12px; }
.floor-group { margin-bottom: 24px; }
.question-item { margin-bottom: 12px; }
.row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.w-120 { width: 120px; }
.w-160 { width: 160px; }
.w-200 { width: 200px; }
.w-240 { width: 240px; }
</style>
