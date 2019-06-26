import 'bluebird-global'
import * as sdk from 'botpress/sdk'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'

import { Config } from '../config'
import { HOOK_SIGNATURES } from '../typings/hooks'

import { EditableFile, FileType, TypingDefinitions } from './typings'

const FILENAME_REGEX = /^[0-9a-zA-Z_\-.]+$/

export default class Editor {
  private bp: typeof sdk
  private _botId: string
  private _typings: TypingDefinitions
  private _config: Config

  constructor(bp: typeof sdk, botId: string, config: Config) {
    this.bp = bp
    this._botId = botId
    this._config = config
  }

  isGlobalAllowed() {
    return this._config.allowGlobal
  }

  async fetchFiles() {
    return {
      actionsGlobal: this._config.allowGlobal && this._filterBuiltin(await this._loadActions()),
      hooksGlobal: this._config.allowGlobal && this._filterBuiltin(await this._loadHooks()),
      actionsBot: this._filterBuiltin(await this._loadActions(this._botId))
    }
  }

  private _filterBuiltin(files: EditableFile[]) {
    return this._config.includeBuiltin ? files : files.filter(x => !x.content.includes('//CHECKSUM:'))
  }

  _validateMetadata({ name, botId, type, hookType }: Partial<EditableFile>) {
    if (!botId || !botId.length) {
      if (!this._config.allowGlobal) {
        throw new Error(`Global files are restricted, please check your configuration`)
      }
    } else {
      if (botId !== this._botId) {
        throw new Error(`Please switch to the correct bot to change its actions.`)
      }
    }

    if (type !== 'action' && type !== 'hook') {
      throw new Error('Invalid file type, only actions/hooks are allowed at the moment')
    }

    if (type === 'hook' && !HOOK_SIGNATURES[hookType]) {
      throw new Error('Invalid hook type.')
    }

    if (!FILENAME_REGEX.test(name)) {
      throw new Error('Filename has invalid characters')
    }
  }

  async saveFile(file: EditableFile): Promise<void> {
    this._validateMetadata(file)
    const { location, botId, content, hookType } = file
    const ghost = botId ? this.bp.ghost.forBot(this._botId) : this.bp.ghost.forGlobal()

    if (file.type === 'action') {
      return ghost.upsertFile('/actions', location, content)
    } else if (file.type === 'hook') {
      return ghost.upsertFile(`/hooks/${hookType}`, location.replace(hookType, ''), content)
    }
  }

  async deleteFile(file: EditableFile): Promise<void> {
    this._validateMetadata(file)
    const { location, botId, hookType } = file
    const ghost = botId ? this.bp.ghost.forBot(this._botId) : this.bp.ghost.forGlobal()

    if (file.type === 'action') {
      return ghost.deleteFile('/actions', location)
    }
    if (file.type === 'hook') {
      return ghost.deleteFile(`/hooks/${hookType}`, location.replace(hookType, ''))
    }
  }

  async renameFile(file: EditableFile, newName: string): Promise<EditableFile> {
    this._validateMetadata(file)
    const { location, botId, hookType } = file
    const ghost = botId ? this.bp.ghost.forBot(this._botId) : this.bp.ghost.forGlobal()

    const newLocation = location.replace(file.name, newName)

    let fileAlreadyExist
    if (file.type === 'action') {
      fileAlreadyExist = await ghost.fileExists('/actions', newLocation)
    } else if (file.type === 'hook') {
      fileAlreadyExist = await ghost.fileExists(`/hooks/${hookType}`, location.replace(hookType, ''))
    }

    if (fileAlreadyExist) {
      return
    }

    await this.deleteFile(file)

    file.location = newLocation
    file.name = newName

    await this.saveFile(file)
    return file
  }

  async loadTypings() {
    if (this._typings) {
      return this._typings
    }

    const sdkTyping = fs.readFileSync(path.join(__dirname, '/../botpress.d.js'), 'utf-8')
    const nodeTyping = fs.readFileSync(path.join(__dirname, `/../typings/node.d.js`), 'utf-8')

    this._typings = {
      'process.d.ts': this._buildRestrictedProcessVars(),
      'node.d.ts': nodeTyping.toString(),
      'botpress.d.ts': sdkTyping.toString().replace(`'botpress/sdk'`, `sdk`)
    }

    return this._typings
  }

  private async _loadActions(botId?: string): Promise<EditableFile[]> {
    const ghost = botId ? this.bp.ghost.forBot(botId) : this.bp.ghost.forGlobal()

    return Promise.map(ghost.directoryListing('/actions', '*.js'), async (filepath: string) => {
      return {
        name: path.basename(filepath),
        type: 'action' as FileType,
        location: filepath,
        content: await ghost.readFileAsString('/actions', filepath),
        botId
      }
    })
  }

  private async _loadHooks(): Promise<EditableFile[]> {
    const ghost = this.bp.ghost.forGlobal()

    return Promise.map(ghost.directoryListing('/hooks', '*.js'), async (filepath: string) => {
      return {
        name: path.basename(filepath),
        type: 'hook' as FileType,
        location: filepath,
        hookType: filepath.substr(0, filepath.indexOf('/')),
        content: await ghost.readFileAsString('/hooks', filepath)
      }
    })
  }

  private _buildRestrictedProcessVars() {
    const exposedEnv = {
      ..._.pickBy(process.env, (_value, name) => name.startsWith('EXPOSED_')),
      ..._.pick(process.env, 'TZ', 'LANG', 'LC_ALL', 'LC_CTYPE')
    }
    const root = this._extractInfo(_.pick(process, 'HOST', 'PORT', 'EXTERNAL_URL', 'PROXY'))
    const exposed = this._extractInfo(exposedEnv)

    return `
    declare var process: RestrictedProcess;
    interface RestrictedProcess {
      ${root.map(x => {
        return `/** Current value: ${x.value} */
${x.name}: ${x.type}
`
      })}

      env: {
        ${exposed.map(x => {
          return `/** Current value: ${x.value} */
  ${x.name}: ${x.type}
  `
        })}
      }
    }`
  }

  private _extractInfo(keys) {
    return Object.keys(keys).map(name => {
      return { name, value: keys[name], type: typeof keys[name] }
    })
  }
}
