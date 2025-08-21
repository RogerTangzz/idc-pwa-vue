<template>
  <div>
    <h2>资产管理</h2>

    <el-button type="primary" class="mb-2" @click="openDialog()">＋ 添加资产</el-button>
    <el-input v-model="keyword" placeholder="关键词搜索..." clearable class="mb-2" />

    <el-table :data="filteredAssets" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="category" label="类别" />
      <el-table-column prop="location" label="存放位置" />
      <el-table-column prop="status" label="状态" width="90" />
      <el-table-column prop="borrowerId" label="借用人" />
      <el-table-column prop="borrowTime" label="借用时间" />
      <el-table-column prop="returnTime" label="归还时间" />
      <el-table-column prop="remark" label="备注" />

      <el-table-column label="操作" width="320" fixed="right">
        <template #default="scope">
          <el-button size="small" @click="openHistory(scope.row)">记录</el-button>
          <el-button
            size="small"
            type="primary"
            v-if="scope.row.status === '可用'"
            @click="borrow(scope.row)"
          >借出</el-button>
          <el-button
            size="small"
            type="success"
            v-else-if="scope.row.status === '借用'"
            @click="store.returnAsset(scope.row.id)"
          >归还</el-button>
          <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="store.remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑 -->
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '添加资产' : '编辑资产'" width="520px">
      <el-form :model="current" label-width="90px" @submit.prevent>
        <el-form-item label="名称">
          <el-input v-model="current.name" />
        </el-form-item>
        <el-form-item label="类别">
          <el-input v-model="current.category" />
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="current.location" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="current.status">
            <el-option label="可用" value="可用" />
            <el-option label="借用" value="借用" />
            <el-option label="维修中" value="维修中" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="current.remark" />
        </el-form-item>
        <!-- 可选：直接填写借用人（仅当状态为“借用”时显示，主要用于手工录入历史） -->
        <el-form-item v-if="current.status === '借用'" label="借用人">
          <el-input v-model="current.borrowerId" placeholder="用户ID/姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 借还记录 -->
    <el-dialog v-model="historyVisible" title="借还记录" width="520px">
      <el-table :data="currentLogs" style="width: 100%">
        <el-table-column prop="action" label="动作" width="80" />
        <el-table-column prop="userId" label="用户" width="140" />
        <el-table-column prop="time" label="时间" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useAssetStore, type Asset } from '@/stores/useAssetStore'

const store = useAssetStore()

onMounted(() => {
  store.load()
})

/* ---------- 搜索 ---------- */
const keyword = ref('')
const filteredAssets = computed(() => store.search(keyword.value))

/* ---------- 新增/编辑对话框 ---------- */
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const editingId = ref<number | null>(null)
const current = reactive<Omit<Asset, 'id' | 'logs'>>({
  name: '',
  category: '',
  location: '',
  status: '可用',
  remark: '',
  borrowerId: undefined,
  borrowTime: undefined,
  returnTime: undefined
})

function openDialog(asset?: Asset) {
  if (asset) {
    Object.assign(current, {
      name: asset.name,
      category: asset.category,
      location: asset.location,
      status: asset.status,
      remark: asset.remark,
      borrowerId: asset.borrowerId ?? undefined,
      borrowTime: asset.borrowTime ?? undefined,
      returnTime: asset.returnTime ?? undefined
    })
    editingId.value = asset.id
    dialogMode.value = 'edit'
  } else {
    Object.assign(current, {
      name: '',
      category: '',
      location: '',
      status: '可用',
      remark: '',
      borrowerId: undefined,
      borrowTime: undefined,
      returnTime: undefined
    })
    editingId.value = null
    dialogMode.value = 'add'
  }
  dialogVisible.value = true
}

function submit() {
  if (!current.name.trim()) {
    ElMessage.error('请填写资产名称')
    return
  }
  if (dialogMode.value === 'add') {
    store.add({ ...current })
  } else if (editingId.value !== n
