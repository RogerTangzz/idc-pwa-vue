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
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="success" @click="store.returnAsset(scope.row.id)" v-if="scope.row.status === '借用中'">归还</el-button>
          <el-button size="small" type="danger" @click="store.remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="dialogVisible" :title="dialogMode === 'add' ? '添加资产' : '编辑资产'" width="500px">
      <el-form :model="current" label-width="80px">
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
            <el-option label="在库" value="在库" />
            <el-option label="借用中" value="借用中" />
            <el-option label="维修" value="维修" />
          </el-select>
        </el-form-item>
        <el-form-item label="借用人">
          <el-input v-model="current.borrowerId" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="current.remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAssetStore, Asset } from '@/stores/useAssetStore'

const store = useAssetStore()

onMounted(() => {
  store.load()
})

const keyword = ref('')

const filteredAssets = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return store.list
  return store.list.filter(a => {
    return (
      (a.name && a.name.toLowerCase().includes(kw)) ||
      (a.category && a.category.toLowerCase().includes(kw)) ||
      (a.location && a.location.toLowerCase().includes(kw)) ||
      (a.remark && a.remark.toLowerCase().includes(kw))
    )
  })
})

const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const current = reactive<Omit<Asset, 'id'>>({
  name: '',
  category: '',
  location: '',
  status: '在库',
  borrowerId: '',
  borrowTime: '',
  returnTime: '',
  remark: ''
})
const editingId = ref<number | null>(null)

function openDialog(asset?: Asset) {
  if (asset) {
    Object.assign(current, {
      name: asset.name,
      category: asset.category,
      location: asset.location,
      status: asset.status,
      borrowerId: asset.borrowerId,
      borrowTime: asset.borrowTime,
      returnTime: asset.returnTime,
      remark: asset.remark
    })
    editingId.value = asset.id
    dialogMode.value = 'edit'
  } else {
    Object.assign(current, {
      name: '',
      category: '',
      location: '',
      status: '在库',
      borrowerId: '',
      borrowTime: '',
      returnTime: '',
      remark: ''
    })
    editingId.value = null
    dialogMode.value = 'add'
  }
  dialogVisible.value = true
}

function submit() {
  if (dialogMode.value === 'add') {
    store.add({ ...current })
  } else if (editingId.value !== null) {
    store.update(editingId.value, { ...current })
  }
  dialogVisible.value = false
}
</script>

<style scoped>
h2 {
  margin-bottom: 12px;
}
.mb-2 {
  margin-bottom: 8px;
}
</style>
