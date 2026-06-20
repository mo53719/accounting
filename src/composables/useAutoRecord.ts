// composables/useAutoRecord.ts
// =====================================================================
// ⚠️ 旧 API 兼容层
// 真实实现在 src/services/autoRecord.js（全局单例）
// 推荐直接 import { autoRecordService } from '@/services/autoRecord'
// =====================================================================

import { autoRecordService } from '../services/autoRecord'

export function useAutoRecord() {
  return {
    isAutoRecordEnabled: { value: autoRecordService.getState().enabled },
    isPermissionGranted: { value: autoRecordService.getState().permissionGranted },
    autoRecordSource: { value: autoRecordService.getState().lastRecord?.source || '' },
    checkPermission: autoRecordService.checkPermission.bind(autoRecordService),
    requestPermission: autoRecordService.requestPermission.bind(autoRecordService),
    startAutoRecord: autoRecordService.start.bind(autoRecordService),
    stopAutoRecord: autoRecordService.stop.bind(autoRecordService),
    initAutoRecord: autoRecordService.init.bind(autoRecordService),
  }
}
