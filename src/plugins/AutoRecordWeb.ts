import { WebPlugin } from '@capacitor/core'

export interface AutoRecordPlugin {
  checkPermission(): Promise<{ granted: boolean }>
  requestPermission(): Promise<void>
  startListening(): Promise<{ started: boolean }>
  stopListening(): Promise<{ stopped: boolean }>
  addListener?(eventName: string, listenerFunc: (...args: any[]) => any): Promise<any>
}

// Web 端空实现，避免浏览器报错
export class AutoRecordWeb extends WebPlugin implements AutoRecordPlugin {
  async checkPermission(): Promise<{ granted: boolean }> {
    console.info('AutoRecord: 通知监听仅在 Android 端可用')
    return { granted: false }
  }

  async requestPermission(): Promise<void> {
    console.info('AutoRecord: 请在 Android 设备上使用此功能')
  }

  async startListening(): Promise<{ started: boolean }> {
    console.info('AutoRecord: 请在 Android 设备上使用此功能')
    return { started: false }
  }

  async stopListening(): Promise<{ stopped: boolean }> {
    return { stopped: true }
  }
}
