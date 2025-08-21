<template>
  <div>
    <h2>资产管理</h2>
    <el-table :data="assets" style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="status" label="状态" width="80" />
      <el-table-column label="操作" width="220">
        <template #default="scope">
          <el-button size="small" @click="openHistory(scope.row)">记录</el-button>
          <el-button
            size="small"
            type="primary"
            v-if="scope.row.status === 'available'"
            @click="borrowAsset(scope.row)"
          >借出</el-button>
          <el-button
            size="small"
            type="success"
            v-else
            @click="returnAsset(scope.row)"
          >归还</el-button>
        </template>
      </el-table-column>
    </el-table>
    <AssetHistoryDialog
      v-if="currentAsset"
      v-model:visible="historyVisible"
      :logs="currentAsset.logs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import AssetHistoryDialog from '@/components/AssetHistoryDialog.vue'

interface Log {
  borrowerId: string
  borrowTime: string
  returnTime?: string
}

interface Asset {
  id: number
  name: string
  status: 'available' | 'borrowed'
  borrowerId?: string
  logs: Log[]
}

const assets = ref<Asset[]>([
  { id: 1, name: '服务器', status: 'available', logs: [] },
  { id: 2, name: '交换机', status: 'available', logs: [] }
])

const historyVisible = ref(false)
const currentAsset = ref<Asset | null>(null)

function openHistory(asset: Asset) {
  currentAsset.value = asset
  historyVisible.value = true
}

async function borrowAsset(asset: Asset) {
  const { value: borrowerId } = await ElMessageBox.prompt('请输入借用人ID', '借出资产', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })
  asset.status = 'borrowed'
  asset.borrowerId = borrowerId
  asset.logs.push({
    borrowerId,
    borrowTime: new Date().toLocaleString(),
    returnTime: ''
  })
}

function returnAsset(asset: Asset) {
  asset.status = 'available'
  const log = [...asset.logs].reverse().find(l => !l.returnTime)
  if (log) {
    log.returnTime = new Date().toLocaleString()
  }
  asset.borrowerId = undefined
}
</script>

<style scoped>
h2 {
  margin-bottom: 12px;
}
</style>
