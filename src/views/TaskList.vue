<template>
  <div>
    <h2>任务列表</h2>
    <!-- Add new task button -->
    <el-button type="primary" class="mb-2" @click="openAdd">＋ 添加任务</el-button>
    <!-- Filter controls -->
    <div class="filters">
      <el-input
        v-model="keyword"
        placeholder="关键词搜索..."
        clearable
        class="filter-item"
      />
      <el-select v-model="statusFilter" class="filter-item" clearable placeholder="状态">
        <el-option label="全部状态" value="" />
        <el-option label="新建" value="新建" />
        <el-option label="处理中" value="处理中" />
        <el-option label="已完成" value="已完成" />
      </el-select>
      <el-input
        v-model="locationFilter"
        placeholder="位置搜索"
        clearable
        class="filter-item"
      />
      <el-select v-model="recFilter" class="filter-item" clearable placeholder="周期">
        <el-option label="全部周期" value="" />
        <el-option label="每日" value="每日" />
        <el-option label="每周" value="每周" />
        <el-option label="每月" value="每月" />
      </el-select>
      <el-date-picker
        v-model="dueStart"
        type="date"
        placeholder="截止起始"
        class="filter-item"
      />
      <el-date-picker
        v-model="dueEnd"
        type="date"
        placeholder="截止结束"
        class="filter-item"
      />
      <el-select v-model="sortBy" class="filter-item" placeholder="排序方式">
        <el-option label="按最新创建" value="id-desc" />
        <el-option label="按最早创建" value="id-asc" />
        <el-option label="截止晚到早" value="due-desc" />
        <el-option label="截止早到晚" value="due-asc" />
      </el-select>
      <el-button size="default" @click="resetFilters">重置</el-button>
    </div>
    <!-- Tasks table -->
    <el-table :data="filteredTasks" stripe style="width: 100%;">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="status" label="状态" width="90" />
      <el-table-column prop="location" label="位置" />
      <el-table-column prop="dueDate" label="截止时间" />
      <el-table-column prop="recurrence" label="周期" width="80" />
      <el-table-column prop="createdAt" label="创建时间" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button size="small" @click="openDetails(scope.row)">详情</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Add task dialog -->
    <el-dialog v-model="addDialogVisible" title="添加任务" width="500px">
      <el-form :model="newTask" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="newTask.title" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="newTask.status">
            <el-option label="新建" value="新建" />
            <el-option label="处理中" value="处理中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="newTask.location" />
        </el-form-item>
        <el-form-item label="周期">
          <el-select v-model="newTask.recurrence">
            <el-option label="无" value="" />
            <el-option label="每日" value="每日" />
            <el-option label="每周" value="每周" />
            <el-option label="每月" value="每月" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="newTask.dueDate"
            type="datetime"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="newTask.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addTask">确认</el-button>
      </template>
    </el-dialog>
    <!-- Task details dialog -->
    <el-dialog v-model="detailDialogVisible" title="任务详情" width="500px">
      <template v-if="selectedTask">
        <el-form :model="selectedTask" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="selectedTask.title" />
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="selectedTask.status">
              <el-option label="新建" value="新建" />
              <el-option label="处理中" value="处理中" />
              <el-option label="已完成" value="已完成" />
            </el-select>
          </el-form-item>
          <el-form-item label="位置">
            <el-input v-model="selectedTask.location" />
          </el-form-item>
          <el-form-item label="周期">
            <el-select v-model="selectedTask.recurrence">
              <el-option label="无" value="" />
              <el-option label="每日" value="每日" />
              <el-option label="每周" value="每周" />
              <el-option label="每月" value="每月" />
            </el-select>
          </el-form-item>
          <el-form-item label="截止时间">
            <el-date-picker
              v-model="selectedTask.dueDate"
              type="datetime"
            />
          </el-form-item>
          <el-form-item label="描述">
            <el-input type="textarea" v-model="selectedTask.description" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="updateTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useTaskStore, Task } from '@/stores/useTaskStore'

const store = useTaskStore()

// Load tasks from storage when the component is mounted
onMounted(() => {
  store.load()
})

// Filter state
const keyword = ref('')
const statusFilter = ref('')
const locationFilter = ref('')
const recFilter = ref('')
// Due date filters use Date objects so we can perform proper
// chronological comparisons without relying on string ordering.
const dueStart = ref<Date | null>(null)
const dueEnd = ref<Date | null>(null)
const sortBy = ref('id-desc')

/**
 * Compute a filtered and sorted copy of the task list.  The filters
 * mirror those in the original IDC PWA implementation: keyword search,
 * status filter, location search, recurrence filter and due date range.
 */
const filteredTasks = computed(() => {
  let items = [...store.list]
  // keyword search
  const kw = keyword.value.trim().toLowerCase()
  if (kw) {
    items = items.filter(t => {
      return (
        (t.title && t.title.toLowerCase().includes(kw)) ||
        (t.description && t.description.toLowerCase().includes(kw))
      )
    })
  }
  // status filter
  if (statusFilter.value) {
    items = items.filter(t => t.status === statusFilter.value)
  }
  // location filter
  const loc = locationFilter.value.trim().toLowerCase()
  if (loc) {
    items = items.filter(t => t.location && t.location.toLowerCase().includes(loc))
  }
  // recurrence filter
  if (recFilter.value) {
    items = items.filter(t => t.recurrence === recFilter.value)
  }
  // due date range filter
  if (dueStart.value) {
    items = items.filter(t => t.dueDate && new Date(t.dueDate) >= dueStart.value!)
  }
  if (dueEnd.value) {
    items = items.filter(t => t.dueDate && new Date(t.dueDate) <= dueEnd.value!)
  }
  // sorting
  const sort = sortBy.value
  if (sort === 'id-desc') {
    items.sort((a, b) => b.id - a.id)
  } else if (sort === 'id-asc') {
    items.sort((a, b) => a.id - b.id)
  } else if (sort === 'due-desc') {
    items.sort((a, b) => {
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : 0
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : 0
      return bd - ad
    })
  } else if (sort === 'due-asc') {
    items.sort((a, b) => {
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : 0
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : 0
      return ad - bd
    })
  }
  return items
})

// New task form state
const addDialogVisible = ref(false)
// Use Date for dueDate so that Element Plus date pickers bind correctly.
const newTask = reactive({
  title: '',
  status: '新建' as Task['status'],
  location: '',
  recurrence: '',
  dueDate: null as Date | null,
  description: ''
})

function openAdd() {
  Object.assign(newTask, { title: '', status: '新建' as Task['status'], location: '', recurrence: '', dueDate: null, description: '' })
  addDialogVisible.value = true
}

function addTask() {
  if (!newTask.title) {
    return
  }
  const due = newTask.dueDate ? newTask.dueDate.toISOString() : undefined
  store.add({
    title: newTask.title,
    status: newTask.status,
    location: newTask.location || undefined,
    recurrence: newTask.recurrence || undefined,
    dueDate: due,
    description: newTask.description || undefined
  })
  addDialogVisible.value = false
}

// Details dialog state
const detailDialogVisible = ref(false)
const selectedTask = ref<(Task & { dueDate?: string | Date }) | null>(null)

function openDetails(task: Task) {
  selectedTask.value = {
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : undefined
  }
  detailDialogVisible.value = true
}

function updateTask() {
  if (selectedTask.value) {
    const due = selectedTask.value.dueDate
      ? new Date(selectedTask.value.dueDate).toISOString()
      : undefined
    store.update(selectedTask.value.id, {
      title: selectedTask.value.title,
      status: selectedTask.value.status,
      location: selectedTask.value.location,
      recurrence: selectedTask.value.recurrence,
      dueDate: due,
      description: selectedTask.value.description
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
  locationFilter.value = ''
  recFilter.value = ''
  dueStart.value = null
  dueEnd.value = null
  sortBy.value = 'id-desc'
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
