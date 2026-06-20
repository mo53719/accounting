<template>
  <div class="page">
    <!-- 顶部 header -->
    <div class="page-header">
      <button class="back-btn" @click="router.back()" aria-label="返回">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div>
        <h1 class="page-title">分类管理</h1>
        <p class="page-subtitle">为账单精细化归类</p>
      </div>
    </div>

    <!-- 主体 -->
    <div class="page-body">
      <!-- Tab 切换：支出分类 / 收入分类 -->
      <div class="tab-switch">
        <button
          :class="['tab-item', { active: activeTab === 'expense' }]"
          @click="activeTab = 'expense'"
          type="button"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M5 12h14"/>
          </svg>
          <span>支出分类</span>
        </button>
        <button
          :class="['tab-item', { active: activeTab === 'income' }]"
          @click="activeTab = 'income'"
          type="button"
        >
          <svg class="tab-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
          <span>收入分类</span>
        </button>
      </div>

      <!-- 分类列表 -->
      <div class="category-list">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="cat-card"
        >
          <div class="cat-icon" :class="cat.type">
            <img v-if="isImageIcon(cat.icon)" :src="cat.icon" class="icon-img" />
            <svg
              v-else
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              v-html="svgPaths[cat.icon] || svgPaths['star']"
            />
          </div>
          <div class="cat-content">
            <div class="cat-name">{{ cat.name }}</div>
            <div class="cat-caption">{{ cat.isPreset ? '预设分类' : '自定义分类' }}</div>
          </div>
          <button
            v-if="!cat.isPreset"
            class="cat-action"
            @click="openModal(cat)"
            aria-label="编辑"
            type="button"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/>
            </svg>
          </button>
          <button
            v-if="!cat.isPreset"
            class="cat-action cat-action-danger"
            @click="handleDelete(cat.id)"
            aria-label="删除"
            type="button"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/>
            </svg>
          </button>
          <!-- 行右侧 mini 贴纸 -->
          <IllustrationImage
            v-if="currentThemeSet !== 'standard' && !cat.isPreset"
            :theme="currentThemeSet" slot="stickerCorner"
            :module-id="`cat-manage-row-${cat.id}`"
            css-class="cat-sticker"
          />
        </div>

        <!-- 空态 -->
        <div v-if="categories.length === 0" class="empty-card">
          <div class="empty-illust">
            <IllustrationImage
              v-if="currentThemeSet !== 'standard'"
              :theme="currentThemeSet" slot="emptyBills"
              css-class="empty-state-img"
            />
            <svg v-else viewBox="0 0 80 80" width="80" height="80" fill="none" stroke="var(--primary-light)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="16" y="20" width="48" height="44" rx="6" fill="var(--card-bg)" stroke="var(--primary)"/>
              <line x1="24" y1="32" x2="56" y2="32" stroke="var(--primary-light)"/>
              <line x1="24" y1="42" x2="48" y2="42" stroke="var(--primary-light)"/>
              <line x1="24" y1="52" x2="40" y2="52" stroke="var(--primary-light)"/>
              <circle cx="56" cy="52" r="3" fill="var(--primary)" stroke="none"/>
            </svg>
          </div>
          <div class="empty-title">暂无{{ activeTab === 'expense' ? '支出' : '收入' }}分类</div>
          <div class="empty-desc">点击下方按钮添加你的第一个分类</div>
          <button class="btn-primary empty-cta" @click="openModal()" type="button">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>添加分类</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部 添加分类 按钮 -->
    <div class="add-bar">
      <button class="btn-primary add-btn" @click="openModal()" type="button">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>添加分类</span>
      </button>
    </div>

    <!-- 添加/编辑分类模态框 -->
    <div v-if="showModal" class="modal-mask" @click.self="closeModal">
      <div class="modal-card">
        <!-- 弹窗右上角：海贼王 mini 贴纸 -->
        <IllustrationImage
          v-if="currentThemeSet !== 'standard'" :theme="currentThemeSet" slot="stickerCorner"
          :module-id="`cat-manage-modal-${editingId || 'new'}`"
          css-class="modal-sticker"
          :style-obj="{ top: '6px', right: '6px', width: '26px', height: '26px', borderRadius: '6px' }"
        />
        <div class="modal-header">
          <h3>{{ editingId ? '编辑分类' : '添加分类' }}</h3>
          <span class="modal-close" @click="closeModal" aria-label="关闭">×</span>
        </div>
        <div class="modal-body">
          <div class="form-block">
            <label class="form-label">选择图标</label>
            <div class="icon-grid">
              <button
                v-for="iconKey in iconKeys"
                :key="iconKey"
                :class="['icon-cell', { 'icon-cell-active': form.icon === iconKey }]"
                @click="form.icon = iconKey"
                type="button"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  v-html="svgPaths[iconKey]"
                />
              </button>
              <!-- 上传的图片图标 -->
              <button
                v-if="uploadedCategoryIcon"
                :class="['icon-cell', 'icon-cell-image', { 'icon-cell-active': form.icon === uploadedCategoryIcon }]"
                @click="form.icon = uploadedCategoryIcon"
                type="button"
              >
                <img :src="uploadedCategoryIcon" class="icon-img" />
              </button>
              <!-- 上传按钮 -->
              <label :class="['icon-cell', 'icon-cell-upload']">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                <input type="file" accept="image/*" class="hidden-file" @change="onCategoryIconFileChange" />
              </label>
            </div>
            <button
              v-if="uploadedCategoryIcon"
              class="link-btn"
              @click="uploadedCategoryIcon = ''; if (isImageIcon(form.icon)) form.icon = 'star'"
              type="button"
            >移除上传的图片</button>
          </div>

          <div class="form-block">
            <label class="form-label">分类名称</label>
            <input v-model="form.name" class="form-input" placeholder="请输入分类名称" maxlength="6" />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-ghost" type="button">取消</button>
          <button @click="handleSave" class="btn-primary" type="button">{{ editingId ? '保存' : '添加' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCategoryStore, type CustomCategory } from '../stores/category'
import { ICON_PRESETS, SVG_ICON_PATHS } from '../utils/format'
import IllustrationImage from '../components/IllustrationImage.vue'
import { currentThemeSet } from '../composables/useTheme'

const router = useRouter()
const categoryStore = useCategoryStore()

const activeTab = ref<'expense' | 'income'>('expense')
const showModal = ref(false)
const editingId = ref<string | null>(null)
const uploadedCategoryIcon = ref('')

const form = ref<{ icon: string; name: string }>({
  icon: ICON_PRESETS[0] as string,
  name: '',
})

const categories = computed(() => categoryStore.getAllCategories(activeTab.value))
const iconKeys = computed(() => ICON_PRESETS as unknown as string[])
const svgPaths = SVG_ICON_PATHS

function isImageIcon(icon: string) {
  return icon && icon.startsWith('data:image')
}
function readImageFile(file: File, onSuccess: (dataUrl: string) => void) {
  const reader = new FileReader()
  reader.onload = e => {
    const result = e.target?.result
    if (typeof result === 'string') onSuccess(result)
  }
  reader.readAsDataURL(file)
}
function onCategoryIconFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  if (file.size > 2 * 1024 * 1024) {
    alert('图片大小不能超过 2MB')
    return
  }
  readImageFile(file, (dataUrl) => {
    uploadedCategoryIcon.value = dataUrl
    form.value.icon = dataUrl
    input.value = ''
  })
}

function openModal(cat?: CustomCategory) {
  if (cat && !cat.isPreset) {
    editingId.value = cat.id
    form.value = { icon: cat.icon, name: cat.name }
    uploadedCategoryIcon.value = isImageIcon(cat.icon) ? cat.icon : ''
  } else {
    editingId.value = null
    form.value = { icon: ICON_PRESETS[0] as string, name: '' }
    uploadedCategoryIcon.value = ''
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingId.value = null
  uploadedCategoryIcon.value = ''
}

function handleDelete(id: string) {
  if (!confirm('确定删除该分类？')) return
  categoryStore.removeCustomCategory(id)
}

function handleSave() {
  if (!form.value.name.trim()) return
  if (editingId.value) {
    categoryStore.updateCustomCategory(editingId.value, {
      name: form.value.name.trim(),
      icon: form.value.icon,
    })
  } else {
    categoryStore.addCustomCategory({
      name: form.value.name.trim(),
      icon: form.value.icon,
      type: activeTab.value,
    })
  }
  closeModal()
}
</script>

<style scoped>
.page {
  background: var(--page-bg);
  min-height: 100vh;
}

.page-header {
  padding: 50px 16px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}
.page-header-sticker {
  position: absolute;
  top: 50px;
  right: 16px;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  flex-shrink: 0;
}
.cat-sticker {
  position: absolute;
  right: 12px;
  bottom: 6px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  opacity: 0.75;
  pointer-events: none;
}
.modal-sticker {
  position: absolute;
  z-index: 2;
}
.empty-state-img {
  width: 240px;
  height: 150px;
  object-fit: cover;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  animation: float 3s ease-in-out infinite;
  user-select: none;
  -webkit-user-drag: none;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  color: var(--text-h1);
  background: none;
  border: none;
  padding: 0;
  border-radius: 50%;
  transition: background 0.15s ease;
  flex-shrink: 0;
}
.back-btn:active {
  background: var(--primary-light);
  transform: scale(0.96);
}
.page-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-h1);
  line-height: 1.3;
}
.page-subtitle {
  font-size: 12px;
  color: var(--text-weak);
  margin-top: 2px;
}

.page-body {
  padding: 0 16px 120px;
}

/* Tab 切换 */
.tab-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  font-size: 13px;
  color: var(--text-body);
  background: var(--card-bg);
  border: 1px solid var(--divider);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}
.tab-item.active {
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 500;
  border-color: transparent;
}
.tab-item:active {
  transform: scale(0.96);
}

/* 分类列表 */
.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  transition: transform 0.15s ease;
  position: relative;
}
.cat-card:active {
  transform: scale(0.99);
}

.cat-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.cat-icon .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.cat-icon.expense {
  background: var(--expense-light);
  color: var(--expense);
}
.cat-icon.income {
  background: var(--income-light);
  color: var(--income);
}

.cat-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cat-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  line-height: 1.3;
}
.cat-caption {
  font-size: 11px;
  color: var(--text-weak);
  line-height: 1.3;
}

.cat-action {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--page-bg);
  color: var(--text-body);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
  border: none;
}
.cat-action:active {
  transform: scale(0.96);
  background: var(--primary-light);
  color: var(--primary);
}
.cat-action-danger {
  background: var(--expense-light);
  color: var(--expense);
}

/* 空态 */
.empty-card {
  background: var(--card-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-soft);
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.empty-illust {
  margin-bottom: 12px;
  display: flex;
}
.empty-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h1);
  margin-bottom: 4px;
}
.empty-desc {
  font-size: 12px;
  color: var(--text-weak);
  margin-bottom: 16px;
}
.empty-cta {
  padding: 10px 18px;
  font-size: 13px;
  gap: 6px;
}

/* 底部添加按钮 */
.add-bar {
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 50;
  pointer-events: none;
}
.add-btn {
  pointer-events: auto;
  padding: 12px 28px;
  font-size: 14px;
  font-weight: 500;
  gap: 6px;
  box-shadow: var(--shadow-hover);
}

/* 模态框表单 */
.form-block {
  margin-bottom: 16px;
}
.form-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-weak);
  margin-bottom: 8px;
}
.form-input {
  background: var(--page-bg);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: 10px 14px;
  font-size: 14px;
  outline: none;
  width: 100%;
  color: var(--text-h1);
  transition: border-color 0.15s ease;
  font-family: inherit;
}
.form-input:focus {
  border-color: var(--primary);
  background: var(--card-bg);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
.icon-cell {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  border: 1.5px solid transparent;
  background: var(--page-bg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-body);
  transition: all 0.15s ease;
}
.icon-cell:active {
  transform: scale(0.96);
}
.icon-cell-active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary);
}
.icon-cell-image .icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-sm);
}
.icon-cell-upload {
  color: var(--text-weak);
  background: var(--card-bg);
  border-color: var(--divider);
  border-style: dashed;
  position: relative;
}
.icon-cell-upload:hover { color: var(--primary); border-color: var(--primary); }
.hidden-file {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
.link-btn {
  display: block;
  margin-top: 10px;
  background: none;
  border: none;
  color: var(--text-weak);
  font-size: 12px;
  cursor: pointer;
  padding: 4px 0;
  font-family: inherit;
}
.link-btn:hover { color: var(--primary); }
</style>
