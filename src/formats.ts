
const formatsKey = 'format_preferences';
const defaultFormatKey = 'defaultFormat';

export interface FormatDefinition {
  label: string
  format: string
  filter: string
}

export interface SettingsExport {
  version: number
  defaultFormatName: string
  formats: FormatDefinition[]
}

export class Format {
  defaultFormatName: string
  formats: FormatDefinition[]

  async load(): Promise<[string, FormatDefinition[]]> {
    return Promise.all([
      new Promise<string>(resolve => {
        chrome.storage.sync.get(defaultFormatKey, (v) => {
          this.defaultFormatName = (v[defaultFormatKey] || "Plain text")
          resolve(this.defaultFormatName)
        })
      }),
      new Promise<FormatDefinition[]>(resolve => {
        chrome.storage.sync.get(formatsKey, (v) => {
          this.formats = (v[formatsKey] || [
            { label: "Plain text", format: '%text% %url%' },
            { label: "HTML", format: '<a href="%url%">%htmlEscapedText%</a>' },
            { label: "markdown", format: '[%text_md%](%url%)' },
            { label: "mediaWiki", format: '[%url% %text%]' },
          ])
          resolve(this.formats)
        })
      })
    ])
  }

  setDefaultFormatName(value: string) {
    this.defaultFormatName = value
    chrome.storage.sync.set({
      [defaultFormatKey]: value
    });
  };

  getDefaultFormatName(): string {
    return this.defaultFormatName
  }

  getDefaultFormat(): FormatDefinition {
    const found = this.formats.find(f => {
      return f.label === this.defaultFormatName
    })
    return found || this.formats[0]
  }
  getFormats(): FormatDefinition[] {
    return this.formats
  }
  format(index: number): FormatDefinition {
    return this.formats[index]
  }

  setFormats(formats: FormatDefinition[]) {
    this.formats = formats
    chrome.storage.sync.set({
      [formatsKey]: formats
    });
  };

  exportSettings(): SettingsExport {
    return {
      version: 1,
      defaultFormatName: this.defaultFormatName,
      formats: this.formats
    }
  }

  importSettings(settings: SettingsExport): { success: boolean; error?: string } {
    const validation = validateSettingsExport(settings)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    this.setFormats(settings.formats)
    this.setDefaultFormatName(settings.defaultFormatName)
    return { success: true }
  }
}

export function validateSettingsExport(data: unknown): { valid: boolean; error?: string } {
  if (typeof data !== "object" || data === null) {
    return { valid: false, error: "Settings must be a JSON object" }
  }

  const settings = data as Record<string, unknown>

  if (typeof settings.version !== "number") {
    return { valid: false, error: "Missing or invalid 'version' field" }
  }

  if (settings.version !== 1) {
    return { valid: false, error: `Unsupported settings version: ${settings.version}` }
  }

  if (typeof settings.defaultFormatName !== "string") {
    return { valid: false, error: "Missing or invalid 'defaultFormatName' field" }
  }

  if (!Array.isArray(settings.formats)) {
    return { valid: false, error: "Missing or invalid 'formats' field" }
  }

  for (let i = 0; i < settings.formats.length; i++) {
    const format = settings.formats[i]
    if (typeof format !== "object" || format === null) {
      return { valid: false, error: `Format at index ${i} is not an object` }
    }
    if (typeof format.label !== "string") {
      return { valid: false, error: `Format at index ${i} is missing 'label' field` }
    }
    if (typeof format.format !== "string") {
      return { valid: false, error: `Format at index ${i} is missing 'format' field` }
    }
    // filter is optional, but if present must be a string
    if (format.filter !== undefined && typeof format.filter !== "string") {
      return { valid: false, error: `Format at index ${i} has invalid 'filter' field` }
    }
  }

  return { valid: true }
}

export function downloadSettingsAsJson(settings: SettingsExport, filename: string = "createlink-settings.json"): void {
  const json = JSON.stringify(settings, null, 2)
  const blob = new Blob([json], { type: "application/json" })
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function readSettingsFromFile(file: File): Promise<SettingsExport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string)
        const validation = validateSettingsExport(data)
        if (!validation.valid) {
          reject(new Error(validation.error))
        } else {
          resolve(data as SettingsExport)
        }
      } catch (e) {
        reject(new Error("Invalid JSON file"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

const fmt = new Format()
export default fmt
