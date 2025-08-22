<template>
  <div>
    <h2>工单列表</h2>
    <el-button type="primary" class="mb-2" @click="openAdd">+ 添加工单</el-button>

    <!-- Filter controls -->
    <div class="filters">
      <el-input v-model="keyword" placeholder="关键词搜索..." clearable class="filter-item" />
      <el-select v-model="statusFilter" placeholder="状态" clearable class="filter-item">
        <el-option label="全部状态" value="" />
        <el-option v-for="o in statusOptions" :key="o" :label="o" :value="o" />
      </el-select>
      <el-select v-model="priorityFilter" placeholder="优先级" clearable class="filter-item">
        <el-option label="全部优先级" value="" />
        <el-option v-for="o in priorityOptions" :key="o" :label="o" :value="o" />
      </el-select>
      <el-input v-model="reporterFilter" placeholder="上报人搜索" clearable class="filter-item" />
      <el-date-picker
        v-model="startDateFilter"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="开始日期"
        class="filter-item"
      />
      <el-date-picker
        v-model="clearTimeFilter"
        type="date"
        value-format="YYYY-MM-DD"
        placeholder="设备故障排除时间"
        class="filter-item"
      />
      <el-button size="default" @click="resetFilters">重置</el-button>
    </div>

    <!-- Orders table -->
    <el-table :data="filteredOrders" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="title" label="标题">
        <template #default="scope">
          <div>
            <div>{{ scope.row.title }}</div>
            <div v-if="scope.row.description" class="description">{{ scope.row.description }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="90" />
      <el-table-column prop="reporter" label="上报人" />
      <el-table-column prop="specialty" label="设备专业" />
      <el-table-column prop="assignee" label="处理人" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="startDate" label="开始日期" />
      <el-table-column prop="clearTime" label="设备故障排除时间" />
      <el-table-column prop="faultDescription" label="故障状况描述（含位置）" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="附件" width="180">
        <template #default="scope">
          <el-link
            v-for="(a, i) in (scope.row.attachments || [])"
            :key="i"
            :href="a"
            target="_blank"
            class="mr-1"
          >附件{{ i + 1 }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="maintainerSignature" label="维修人签名" />
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button size="small" @click="openDetails(scope.row)">详情</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add order dialog -->
    <el-dialog v-model="addDialogVisible" title="添加工单" width="600px">
      <el-form :model="newOrder" label-width="120px">
        <el-form-item label="标题">
          <el-input v-model="newOrder.title" />
        </el-form-item>

        <el-form-item label="优先级">
          <el-select v-model="newOrder.priority">
            <el-option v-for="p in priorityOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>

        <el-form-item label="上报人">
          <el-input v-model="newOrder.reporter" />
        </el-form-item>

        <el-form-item label="设备专业">
          <el-select v-model="newOrder.specialty">
            <el-option v-for="s in specialtyOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>

        <el-form-item label="处理人">
          <el-input v-model="newOrder.assignee" />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="newOrder.status">
            <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始日期">
          <el-date-picker v-model="newOrder.startDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>

        <el-form-item label="设备故障排除时间">
          <el-date-picker v-model="newOrder.clearTime" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>

        <el-form-item label="应急处置方案">
          <el-input type="textarea" v-model="newOrder.emergencyMethod" />
        </el-form-item>

        <el-form-item label="故障状况描述（含位置）">
          <el-input type="textarea" v-model="newOrder.faultDescription" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input type="textarea" v-model="newOrder.description" />
        </el-form-item>

        <el-form-item label="附件">
          <el-upload
            :auto-upload="false"
            multiple
            :on-change="handleNewUpload"
            :on-remove="handleNewRemove"
          >
            <el-button type="primary">选择文件</el-button>
          </el-upload>
          <div v-if="newOrder.attachments.length" class="mt-2">
            <el-link
              v-for="(a, i) in newOrder.attachments"
              :key="i"
              :href="a"
              target="_blank"
              class="mr-1"
            >附件{{ i + 1 }}</el-link>
          </div>
        </el-form-item>

        <el-form-item label="维修人签名">
          <el-input v-model="newOrder.maintainerSignature" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addOrder">确认</el-button>
      </template>
    </el-dialog>

    <!-- Order details dialog -->
    <el-dialog v-model="detailDialogVisible" title="工单详情" width="600px">
      <template v-if="selectedOrder">
        <el-form :model="selectedOrder" label-width="120px">
          <el-form-item label="标题">
            <el-input v-model="selectedOrder.title" />
          </el-form-item>

          <el-form-item label="优先级">
            <el-select v-model="selectedOrder.priority">
              <el-option v-for="p in priorityOptions" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item>

          <el-form-item label="上报人">
            <el-input v-model="selectedOrder.reporter" />
          </el-form-item>

          <el-form-item label="设备专业">
            <el-select v-model="selectedOrder.specialty">
              <el-option v-for="s in specialtyOptions" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>

          <el-form-item label="处理人">
            <el-input v-model="selectedOrder.assignee" />
          </el-form-item>

          <el-form-item label="状态">
            <el-select v-model="selectedOrder.status">
              <el-option v-for="s in statusOptions" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>

          <el-form-item label="开始日期">
            <el-date-picker v-model="selectedOrder.startDate" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>

          <el-form-item label="设备故障排除时间">
            <el-date-picker v-model="selectedOrder.clearTime" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>

          <el-form-item label="应急处置方案">
            <el-input type="textarea" v-model="selectedOrder.emergencyMethod" />
          </el-form-item>

          <el-form-item label="故障状况描述（含位置）">
            <el-input type="textarea" v-model="selectedOrder.faultDescription" />
          </el-form-item>

          <el-form-item label="描述">
            <el-input type="textarea" v-model="selectedOrder.description" />
          </el-form-item>

          <el-form-item label="附件">
            <el-upload
              :auto-upload="false"
              multiple
              :on-change="handleDetailUpload"
              :on-remove="handleDetailRemove"
            >
              <el-button type="primary">选择文件</el-button>
            </el-upload>
            <div v-if="selectedOrder.attachments?.length" class="mt-2">
              <el-link
                v-for="(a, i) in selectedOrder.attachments"
                :key="i"
                :href="a"
                target="_blank"
                class="mr-1"
              >附件{{ i + 1 }}</el-link>
            </div>
          </el-form-item>

          <el-form-item label="维修人签名">
            <el-input v-model="selectedOrder.maintainerSignature" />
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="updateOrder">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useOrderStore, type Order } from '@/stores/useOrderStore'
import type { UploadFile } from 'element-plus'
import { ElMessage } from 'element-plus'

const statusOptions = ['新建', '处理中', '已完成']
const priorityOptions = ['低', '中', '高']
const specialtyOptions = ['暖通', '配电', '消防弱电']

const store = useOrderStore()

onMounted(() => {
  store.load()
})

// filter state
const keyword = ref('')
const statusFilter = ref('')
const priorityFilter = ref('')
const reporterFilter = ref('')
const startDateFilter = ref<string | null>(null)
const clearTimeFilter = ref<string | null>(null)

const filteredOrders = computed(() => {
  let items = [...store.list]
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    items = items.filter(o => {
      return (
        (o.title && o.title.toLowerCase().includes(kw)) ||
        (o.description && o.description.toLowerCase().includes(kw)) ||
        (o.faultDescription && o.faultDescription.toLowerCase().includes(kw))
      )
    })
  }
  if (statusFilter.value) {
    items = items.filter(o => o.status === statusFilter.value)
  }
  if (priorityFilter.value) {
    items = items.filter(o => o.priority === priorityFilter.value)
  }
  const rep = reporterFilter.value.trim().toLowerCase()
  if (rep) {
    items = items.filter(o => (o.reporter || '').toLowerCase().includes(rep))
  }
  if (startDateFilter.value) {
    items = items.filter(o => o.startDate && o.startDate >= startDateFilter.value!)
  }
  if (clearTimeFilter.value) {
    items = items.filter(o => o.clearTime && o.clearTime <= clearTimeFilter.value!)
  }
  return items
})

// add dialog state
const addDialogVisible = ref(false)
const newOrder = reactive<Omit<Order, 'id' | 'createdAt' | 'synced'>>({
  title: '',
  priority: '中',
  reporter: '',
  specialty: '暖通',
  assignee: '',
  status: '新建',
  startDate: '',
  clearTime: '',
  emergencyMethod: '',
  faultDescription: '',
  description: '',
  attachments: [] as string[],
  maintainerSignature: ''
})

const MAX_FILE_SIZE = 1024 * 1024 // 1MB

function readAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function openAdd() {
  Object.assign(newOrder, {
    title: '',
    priority: '中',
    reporter: '',
    specialty: '暖通',
    assignee: '',
    status: '新建',
    startDate: '',
    clearTime: '',
    emergencyMethod: '',
    faultDescription: '',
    description: '',
    attachments: [] as string[],
    maintainerSignature: ''
  })
  addDialogVisible.value = true
}

function addOrder() {
  if (!newOrder.title || !newOrder.reporter) return
  store.add({
    title: newOrder.title,
    priority: newOrder.priority,
    reporter: newOrder.reporter,
    specialty: newOrder.specialty,
    assignee: newOrder.assignee || undefined,
    status: newOrder.status,
    startDate: newOrder.startDate || undefined,
    clearTime: newOrder.clearTime || undefined,
    emergencyMethod: newOrder.emergencyMethod || undefined,
    faultDescription: newOrder.faultDescription || undefined,
    description: newOrder.description || undefined,
    attachments: newOrder.attachments,
    maintainerSignature: newOrder.maintainerSignature || undefined
  })
  addDialogVisible.value = false
}

// details dialog state
const detailDialogVisible = ref(false)
const selectedOrder = ref<Order | null>(null)

function openDetails(order: Order) {
  selectedOrder.value = { ...order, attachments: order.attachments ? [...order.attachments] : [] }
  detailDialogVisible.value = true
}

function updateOrder() {
  if (selectedOrder.value) {
    store.update(selectedOrder.value.id, {
      title: selectedOrder.value.title,
      priority: selectedOrder.value.priority,
      reporter: selectedOrder.value.reporter,
      specialty: selectedOrder.value.specialty,
      assignee: selectedOrder.value.assignee,
      status: selectedOrder.value.status,
      startDate: selectedOrder.value.startDate,
      clearTime: selectedOrder.value.clearTime,
      emergencyMethod: selectedOrder.value.emergencyMethod,
      faultDescription: selectedOrder.value.faultDescription,
      description: selectedOrder.value.description,
      attachments: selectedOrder.value.attachments,
      maintainerSignature: selectedOrder.value.maintainerSignature
    })
  }
  detailDialogVisible.value = false
}

function remove(id: number) {
  store.remove(id)
}

function resetFilters() {
  keyword.value = ''
  statusFilter.value = ''
  priorityFilter.value = ''
  reporterFilter.value = ''
  startDateFilter.value = null
  clearTimeFilter.value = null
}

// --- attachments handlers ---
async function handleNewUpload(file: UploadFile, fileList: UploadFile[]) {
  if (!file.raw) return
  if (file.raw.size > MAX_FILE_SIZE) {
    ElMessage.error('文件大小超过 1MB 限制')
    fileList.splice(fileList.indexOf(file), 1)
    return
  }
  const data = await readAsDataURL(file.raw)
  file.url = data
  newOrder.attachments.push(data)
}
function handleNewRemove(file: UploadFile) {
  if (file.url) {
    const idx = newOrder.attachments.indexOf(file.url)
    if (idx !== -1) newOrder.attachments.splice(idx, 1)
  }
}
async function handleDetailUpload(file: UploadFile, fileList: UploadFile[]) {
  if (!selectedOrder.value || !file.raw) return
  if (file.raw.size > MAX_FILE_SIZE) {
    ElMessage.error('文件大小超过 1MB 限制')
    fileList.splice(fileList.indexOf(file), 1)
    return
  }
  const data = await readAsDataURL(file.raw)
  file.url = data
  if (!selectedOrder.value.attachments) selectedOrder.value.attachments = []
  selectedOrder.value.attachments.push(data)
}
function handleDetailRemove(file: UploadFile) {
  if (selectedOrder.value && file.url) {
    const list = selectedOrder.value.attachments
    if (list) {
      const idx = list.indexOf(file.url)
      if (idx !== -1) list.splice(idx, 1)
    }
  }
}
</script>

<style scoped>
h2 {
  margin-bottom: 16px;
}
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.filter-item {
  min-width: 140px;
  flex: 1;
}
.description {
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.mr-1 { margin-right: 8px; }
.mt-2 { margin-top: 8px; }
</style>
