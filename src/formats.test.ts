import { validateSettingsExport, SettingsExport, FormatDefinition } from "./formats"

describe("validateSettingsExport", () => {
  const validSettings: SettingsExport = {
    version: 1,
    defaultFormatName: "Plain text",
    formats: [
      { label: "Plain text", format: "%text% %url%", filter: "" },
      { label: "HTML", format: "<a href=\"%url%\">%htmlEscapedText%</a>", filter: "" },
    ]
  }

  describe("valid settings", () => {
    it("should validate a complete valid settings object", () => {
      const result = validateSettingsExport(validSettings)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it("should validate settings with empty formats array", () => {
      const settings: SettingsExport = {
        version: 1,
        defaultFormatName: "Default",
        formats: []
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(true)
    })

    it("should validate settings with formats that have no filter", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [
          { label: "Plain text", format: "%text% %url%" }
        ]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(true)
    })

    it("should validate settings with empty filter string", () => {
      const settings: SettingsExport = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [
          { label: "Plain text", format: "%text% %url%", filter: "" }
        ]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(true)
    })
  })

  describe("invalid input types", () => {
    it("should reject null", () => {
      const result = validateSettingsExport(null)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Settings must be a JSON object")
    })

    it("should reject undefined", () => {
      const result = validateSettingsExport(undefined)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Settings must be a JSON object")
    })

    it("should reject a string", () => {
      const result = validateSettingsExport("not an object")
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Settings must be a JSON object")
    })

    it("should reject a number", () => {
      const result = validateSettingsExport(123)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Settings must be a JSON object")
    })

    it("should reject an array", () => {
      const result = validateSettingsExport([1, 2, 3])
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing or invalid 'version' field")
    })
  })

  describe("version field validation", () => {
    it("should reject missing version field", () => {
      const settings = {
        defaultFormatName: "Plain text",
        formats: [] as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing or invalid 'version' field")
    })

    it("should reject non-numeric version", () => {
      const settings = {
        version: "1",
        defaultFormatName: "Plain text",
        formats: [] as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing or invalid 'version' field")
    })

    it("should reject unsupported version number", () => {
      const settings = {
        version: 2,
        defaultFormatName: "Plain text",
        formats: [] as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Unsupported settings version: 2")
    })

    it("should reject version 0", () => {
      const settings = {
        version: 0,
        defaultFormatName: "Plain text",
        formats: [] as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Unsupported settings version: 0")
    })
  })

  describe("defaultFormatName field validation", () => {
    it("should reject missing defaultFormatName", () => {
      const settings = {
        version: 1,
        formats: [] as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing or invalid 'defaultFormatName' field")
    })

    it("should reject non-string defaultFormatName", () => {
      const settings = {
        version: 1,
        defaultFormatName: 123,
        formats: [] as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing or invalid 'defaultFormatName' field")
    })

    it("should accept empty string as defaultFormatName", () => {
      const settings = {
        version: 1,
        defaultFormatName: "",
        formats: [] as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(true)
    })
  })

  describe("formats field validation", () => {
    it("should reject missing formats field", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text"
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing or invalid 'formats' field")
    })

    it("should reject non-array formats", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: "not an array"
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing or invalid 'formats' field")
    })

    it("should reject formats with null value", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: null as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing or invalid 'formats' field")
    })
  })

  describe("format item validation", () => {
    it("should reject format item that is not an object", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: ["not an object"] as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Format at index 0 is not an object")
    })

    it("should reject format item that is null", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [null] as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Format at index 0 is not an object")
    })

    it("should reject format item missing label", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [{ format: "%text%", filter: "" }] as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Format at index 0 is missing 'label' field")
    })

    it("should reject format item with non-string label", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [{ label: 123, format: "%text%", filter: "" }] as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Format at index 0 is missing 'label' field")
    })

    it("should reject format item missing format", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [{ label: "Test", filter: "" }] as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Format at index 0 is missing 'format' field")
    })

    it("should reject format item with non-string format", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [{ label: "Test", format: 123, filter: "" }] as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Format at index 0 is missing 'format' field")
    })

    it("should reject format item with invalid filter type", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [{ label: "Test", format: "%text%", filter: 123 }] as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Format at index 0 has invalid 'filter' field")
    })

    it("should report correct index for invalid format item", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Plain text",
        formats: [
          { label: "Valid", format: "%text%", filter: "" },
          { label: "Valid2", format: "%url%", filter: "" },
          { label: 123, format: "%text%", filter: "" }  // Invalid at index 2
        ] as unknown as FormatDefinition[]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(false)
      expect(result.error).toBe("Format at index 2 is missing 'label' field")
    })
  })

  describe("complex/edge cases", () => {
    it("should validate settings with many formats", () => {
      const formats: FormatDefinition[] = []
      for (let i = 0; i < 100; i++) {
        formats.push({ label: `Format ${i}`, format: `%text% ${i}`, filter: "" })
      }
      const settings: SettingsExport = {
        version: 1,
        defaultFormatName: "Format 0",
        formats
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(true)
    })

    it("should validate settings with special characters in strings", () => {
      const settings: SettingsExport = {
        version: 1,
        defaultFormatName: "Test <>&\"'",
        formats: [
          { label: "Special chars: <>&\"'", format: "<a href=\"%url%\">test</a>", filter: "s/\\[at\\]/@/gi" }
        ]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(true)
    })

    it("should validate settings with unicode characters", () => {
      const settings: SettingsExport = {
        version: 1,
        defaultFormatName: "日本語",
        formats: [
          { label: "日本語フォーマット", format: "%text% 🔗 %url%", filter: "" }
        ]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(true)
    })

    it("should handle deeply nested but invalid structure", () => {
      const settings = {
        version: 1,
        defaultFormatName: "Test",
        formats: [
          { 
            label: "Test", 
            format: "%text%",
            filter: "",
            extra: { nested: { deep: "value" } }  // Extra fields should be ignored
          }
        ]
      }
      const result = validateSettingsExport(settings)
      expect(result.valid).toBe(true)
    })
  })
})
