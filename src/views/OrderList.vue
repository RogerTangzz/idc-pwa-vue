<template>
  <div>
    <h2>工单列表</h2>
    <el-button type="primary" class="mb-2" @click="openAdd">＋ 添加工单</el-button>
    <!-- Filter controls -->
    <div class="filters">
      <el-input v-model="keyword" placeholder="关键词搜索..." clearable class="filter-item" />
      <el-select v-model="statusFilter" placeholder="状态" clearable class="filter-item">
        <el-option label="全部状态" value="" />
        <el-option label="新建" value="新建" />
        <el-option label="处理中" value="处理中" />
        <el-option label="已完成" value="已完成" />
      </el-select>
      <el-select v-model="priorityFilter" placeholder="优先级" clearable class="filter-item">
        <el-option label="全部优先级" value="" />
        <el-option label="高" value="高" />
        <el-option label="中" value="中" />
        <el-option label="低" value="低" />
      </el-select>
      <el-input v-model="reporterFilter" placeholder="上报人搜索" clearable class="filter-item" />
      <el-date-picker v-model="startDateFilter" type="date" placeholder="开始日期" class="filter-item" />
      <el-date-picker v-model="endDateFilter" type="date" placeholder="结束日期" class="filter-item" />
      <el-button size="default" @click="resetFilters">重置</el-button>
    </div>
    <!-- Orders table -->
    <el-table :data="filteredOrders" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="priority" label="优先级" width="80" />
      <el-table-column prop="reporter" label="上报人" />
      <el-table-column prop="assignee" label="处理人" />
      <el-table-column prop="status" label="状态" width="90" />
      <el-table-column prop="startDate" label="开始日期" />
      <el-table-column prop="endDate" label="结束日期" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="maintainerSignature" label="维修人签认" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button size="small" @click="openDetails(scope.row)">详情</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Add order dialog -->
    <el-dialog v-model="addDialogVisible" title="添加工单" width="500px">
      <el-form :model="newOrder" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newOrder.title" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newOrder.priority">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="上报人">
          <el-input v-model="newOrder.reporter" />
        </el-form-item>
        <el-form-item label="处理人">
          <el-input v-model="newOrder.assignee" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="newOrder.status">
            <el-option label="新建" value="新建" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="newOrder.startDate" type="date" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="newOrder.endDate" type="date" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="newOrder.description" />
        </el-form-item>
        <el-form-item label="维修人签认">
          <el-input v-model="newOrder.maintainerSignature" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addOrder">确认</el-button>
      </template>
    </el-dialog>
    <!-- Order details dialog -->
    <el-dialog v-model="detailDialogVisible" title="工单详情" width="500px">
      <template v-if="selectedOrder">
        <el-form :model="selectedOrder" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="selectedOrder.title" />
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="selectedOrder.priority">
              <el-option label="高" value="高" />
              <el-option label="中" value="中" />
              <el-option label="低" value="低" />
            </el-select>
          </el-form-item>
          <el-form-item label="上报人">
            <el-input v-model="selectedOrder.reporter" />
          </el-form-item>
          <el-form-item label="处理人">
            <el-input v-model="selectedOrder.assignee" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="selectedOrder.status">
              <el-option label="新建" value="新建" />
              <el-option label="处理中" value="处理中" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker v-model="selectedOrder.startDate" type="date" />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker v-model="selectedOrder.endDate" type="date" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input type="textarea" v-model="selectedOrder.description" />
          </el-form-item>
          <el-form-item label="维修人签认">
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
import { useOrderStore, Order } from '@/stores/useOrderStore'

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
const endDateFilter = ref<string | null>(null)

const filteredOrders = computed(() => {
  let items = [...store.list]
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    items = items.filter(o => {
      return (
        o.title.toLowerCase().includes(kw) ||
        (o.description && o.description.toLowerCase().includes(kw))
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
    items = items.filter(o => o.reporter.toLowerCase().includes(rep))
  }
  if (startDateFilter.value) {
    items = items.filter(o => o.startDate && o.startDate >= startDateFilter.value)
  }
  if (endDateFilter.value) {
    items = items.filter(o => o.endDate && o.endDate <= endDateFilter.value)
  }
  return items
})

const addDialogVisible = ref(false)
const newOrder = reactive<Omit<Order, 'id' | 'createdAt' | 'synced'>>({
  title: '',
  priority: '中',
  reporter: '',
  assignee: '',
  status: '新建',
  startDate: '',
  endDate: '',
  description: '',
  maintainerSignature: ''
})

function openAdd() {
  Object.assign(newOrder, { title: '', priority: '中', reporter: '', assignee: '', status: '新建', startDate: '', endDate: '', description: '', maintainerSignature: '' })
  addDialogVisible.value = true
}

function addOrder() {
  if (!newOrder.title || !newOrder.reporter) return
  store.add({
    title: newOrder.title,
    priority: newOrder.priority,
    reporter: newOrder.reporter,
    assignee: newOrder.assignee || undefined,
    status: newOrder.status,
    startDate: newOrder.startDate || undefined,
    endDate: newOrder.endDate || undefined,
    description: newOrder.description || undefined,
    maintainerSignature: newOrder.maintainerSignature || undefined
  })
  addDialogVisible.value = false
}

const detailDialogVisible = ref(false)
const selectedOrder = ref<Order | null>(null)

function openDetails(order: Order) {
  selectedOrder.value = { ...order }
  detailDialogVisible.value = true
}

function updateOrder() {
  if (selectedOrder.value) {
    store.update(selectedOrder.value.id, {
      title: selectedOrder.value.title,
      priority: selectedOrder.value.priority,
      reporter: selectedOrder.value.reporter,
      assignee: selectedOrder.value.assignee,
    status: selectedOrder.value.status,
    startDate: selectedOrder.value.startDate,
    endDate: selectedOrder.value.endDate,
    description: selectedOrder.value.description,
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
  endDateFilter.value = null
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
</style>