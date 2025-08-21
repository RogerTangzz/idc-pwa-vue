<template>
  <!--
    TagList provides management of simple category tags.  Users can
    create, edit and delete tags.  A table lists existing tags with
    their names and descriptions.  Tags are persisted via the
    useTagStore Pinia store which in turn stores data in
    localStorage.
  -->
  <div>
    <h2>{{ t('tagList.title') }}</h2>
    <el-button
      type="primary"
      class="mb-2"
      @click="openAdd"
      :aria-label="t('tagList.addTag')"
    >
      ＋ {{ t('tagList.addTag') }}
    </el-button>
    <el-table :data="store.list" stripe style="width: 100%">
      <el-table-column prop="id" :label="t('tagList.id')" width="60" />
      <el-table-column prop="name" :label="t('tagList.name')" />
      <el-table-column prop="description" :label="t('tagList.description')" />
      <el-table-column prop="createdAt" :label="t('tagList.createdAt')" />
      <el-table-column :label="t('tagList.actions')" width="160">
        <template #default="scope">
          <el-button
            size="small"
            @click="openEdit(scope.row)"
            :aria-label="t('tagList.edit')"
          >
            {{ t('tagList.edit') }}
          </el-button>
          <el-button
            size="small"
            type="danger"
            @click="store.remove(scope.row.id)"
            :aria-label="t('tagList.delete')"
          >
            {{ t('tagList.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- Add dialog -->
    <el-dialog v-model="addDialogVisible" :title="t('tagList.addDialogTitle')" width="400px">
      <el-form :model="newTag" label-width="70px">
        <el-form-item :label="t('tagList.name')">
          <el-input
            ref="newTagNameInput"
            v-model="newTag.name"
            :aria-label="t('tagList.name')"
          />
        </el-form-item>
        <el-form-item :label="t('tagList.description')">
          <el-input v-model="newTag.description" :aria-label="t('tagList.description')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false" :aria-label="t('tagList.cancel')">
          {{ t('tagList.cancel') }}
        </el-button>
        <el-button type="primary" @click="addTag" :aria-label="t('tagList.confirm')">
          {{ t('tagList.confirm') }}
        </el-button>
      </template>
    </el-dialog>
    <!-- Edit dialog -->
    <el-dialog v-model="editDialogVisible" :title="t('tagList.editDialogTitle')" width="400px">
      <template v-if="selectedTag">
        <el-form :model="selectedTag" label-width="70px">
          <el-form-item :label="t('tagList.name')">
            <el-input
              ref="selectedTagNameInput"
              v-model="selectedTag.name"
              :aria-label="t('tagList.name')"
            />
          </el-form-item>
          <el-form-item :label="t('tagList.description')">
            <el-input v-model="selectedTag.description" :aria-label="t('tagList.description')" />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="editDialogVisible = false" :aria-label="t('tagList.close')">
          {{ t('tagList.close') }}
        </el-button>
        <el-button type="primary" @click="updateTag" :aria-label="t('tagList.save')">
          {{ t('tagList.save') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import type { InputInstance } from 'element-plus'
import { useTagStore, Tag } from '@/stores/useTagStore'
import { t } from '@/locales'

const store = useTagStore()
onMounted(() => {
  store.load()
})

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const newTag = reactive<Omit<Tag, 'id' | 'createdAt'>>({ name: '', description: '' })
const selectedTag = ref<Tag | null>(null)
const newTagNameInput = ref<InputInstance>()
const selectedTagNameInput = ref<InputInstance>()

function openAdd() {
  Object.assign(newTag, { name: '', description: '' })
  addDialogVisible.value = true
  nextTick(() => newTagNameInput.value?.focus())
}

function addTag() {
  if (!newTag.name) return
  store.add({ name: newTag.name, description: newTag.description })
  addDialogVisible.value = false
}

function openEdit(tag: Tag) {
  selectedTag.value = { ...tag }
  editDialogVisible.value = true
  nextTick(() => selectedTagNameInput.value?.focus())
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