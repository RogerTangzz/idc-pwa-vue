<template>
  <!--
    TagList provides management of simple category tags.  Users can
    create, edit and delete tags.  A table lists existing tags with
    their names and descriptions.  Tags are persisted via the
    useTagStore Pinia store which in turn stores data in
    localStorage.
  -->
  <div>
    <h2>标签管理</h2>
    <el-button type="primary" class="mb-2" @click="openAdd">＋ 添加标签</el-button>
    <el-table :data="store.list" stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="createdAt" label="创建时间" />
      <el-table-column label="操作" width="160">
        <template #default="scope">
          <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="store.remove(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Add dialog -->
    <el-dialog v-model="addDialogVisible" title="添加标签" width="400px">
      <el-form :model="newTag" label-width="70px">
        <el-form-item label="名称">
          <el-input v-model="newTag.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newTag.description" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addTag">确认</el-button>
      </template>
    </el-dialog>
    <!-- Edit dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑标签" width="400px">
      <template v-if="selectedTag">
        <el-form :model="selectedTag" label-width="70px">
          <el-form-item label="名称">
            <el-input v-model="selectedTag.name" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="selectedTag.description" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="editDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="updateTag">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useTagStore, Tag } from '@/stores/useTagStore'

const store = useTagStore()
onMounted(() => {
  store.load()
})

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const newTag = reactive<Omit<Tag, 'id' | 'createdAt'>>({ name: '', description: '' })
const selectedTag = ref<Tag | null>(null)

function openAdd() {
  Object.assign(newTag, { name: '', description: '' })
  addDialogVisible.value = true
}

function addTag() {
  if (!newTag.name) return
  store.add({ name: newTag.name, description: newTag.description })
  addDialogVisible.value = false
}

function openEdit(tag: Tag) {
  selectedTag.value = { ...tag }
  editDialogVisible.value = true
}

function updateTag() {
  if (selectedTag.value) {
    store.update(selectedTag.value.id, {
      name: selectedTag.value.name,
      description: selectedTag.value.description
    })
    editDialogVisible.value = false
  }
}
</script>

<style scoped>
h2 {
  margin-bottom: 12px;
}
</style>