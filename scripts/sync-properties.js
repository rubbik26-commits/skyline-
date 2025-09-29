#!/usr/bin/env node

const https = require("https")
const fs = require("fs")
const path = require("path")

class PropertySyncManager {
  constructor() {
    this.apiEndpoints = {
      primary: process.env.PROPERTY_API_URL || "https://api.example.com/properties",
      backup: process.env.BACKUP_API_URL || "https://backup-api.example.com/properties",
      nyc: "https://data.cityofnewyork.us/resource/hg8x-zxpr.json",
    }
    this.outputDir = path.join(process.cwd(), "data", "properties")
    this.logFile = path.join(process.cwd(), "logs", "property-sync.log")
  }

  log(message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}\n`
    console.log(`[v0] ${message}`)

    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    fs.appendFileSync(this.logFile, logMessage)
  }

  async fetchFromAPI(url, options = {}) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, options, (response) => {
        let data = ""

        response.on("data", (chunk) => {
          data += chunk
        })

        response.on("end", () => {
          try {
            const jsonData = JSON.parse(data)
            resolve(jsonData)
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`))
          }
        })
      })

      request.on("error", (error) => {
        reject(error)
      })

      request.setTimeout(30000, () => {
        request.destroy()
        reject(new Error("Request timeout"))
      })
    })
  }

  async syncNYCOpenData() {
    try {
      this.log("Starting NYC Open Data sync...")

      const permits = await this.fetchFromAPI(this.apiEndpoints.nyc + "?$limit=1000")

      if (!permits || !Array.isArray(permits)) {
        throw new Error("Invalid response from NYC Open Data API")
      }

      this.log(`Fetched ${permits.length} building permits from NYC Open Data`)

      // Process and validate permits
      const processedPermits = permits
        .filter((permit) => permit.house_no && permit.street_name)
        .map((permit) => ({
          id: permit.job_doc_no || `permit_${Date.now()}_${Math.random()}`,
          address: `${permit.house_no} ${permit.street_name}`,
          borough: permit.borough,
          workType: permit.work_type,
          permitType: permit.permit_type,
          filingDate: permit.filing_date,
          issuedDate: permit.issued_date,
          jobDescription: permit.job_description,
          coordinates:
            permit.latitude && permit.longitude
              ? {
                  lat: Number.parseFloat(permit.latitude),
                  lng: Number.parseFloat(permit.longitude),
                }
              : null,
          source: "NYC_OPEN_DATA",
          lastUpdated: new Date().toISOString(),
        }))

      // Save to file
      const outputFile = path.join(this.outputDir, "nyc-permits.json")
      this.ensureDirectoryExists(this.outputDir)

      fs.writeFileSync(outputFile, JSON.stringify(processedPermits, null, 2))
      this.log(`Saved ${processedPermits.length} processed permits to ${outputFile}`)

      return processedPermits
    } catch (error) {
      this.log(`Error syncing NYC Open Data: ${error.message}`)
      throw error
    }
  }

  async syncPropertyData() {
    try {
      this.log("Starting property data synchronization...")

      // Try primary API first
      let properties = []
      try {
        this.log("Attempting to fetch from primary API...")
        properties = await this.fetchFromAPI(this.apiEndpoints.primary)
        this.log(`Successfully fetched ${properties.length} properties from primary API`)
      } catch (error) {
        this.log(`Primary API failed: ${error.message}. Trying backup API...`)

        try {
          properties = await this.fetchFromAPI(this.apiEndpoints.backup)
          this.log(`Successfully fetched ${properties.length} properties from backup API`)
        } catch (backupError) {
          this.log(`Backup API also failed: ${backupError.message}`)
          throw new Error("Both primary and backup APIs failed")
        }
      }

      // Validate and process properties
      const processedProperties = properties
        .filter((prop) => prop.id && prop.address)
        .map((prop) => ({
          ...prop,
          lastUpdated: new Date().toISOString(),
          source: "EXTERNAL_API",
        }))

      // Save to file
      const outputFile = path.join(this.outputDir, "external-properties.json")
      this.ensureDirectoryExists(this.outputDir)

      fs.writeFileSync(outputFile, JSON.stringify(processedProperties, null, 2))
      this.log(`Saved ${processedProperties.length} processed properties to ${outputFile}`)

      return processedProperties
    } catch (error) {
      this.log(`Error syncing property data: ${error.message}`)
      throw error
    }
  }

  ensureDirectoryExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      this.log(`Created directory: ${dir}`)
    }
  }

  async generateSyncReport(nycData, propertyData) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        nycPermits: nycData?.length || 0,
        externalProperties: propertyData?.length || 0,
        totalRecords: (nycData?.length || 0) + (propertyData?.length || 0),
      },
      performance: {
        syncDuration: Date.now() - this.startTime,
        memoryUsage: process.memoryUsage(),
      },
      errors: this.errors || [],
    }

    const reportFile = path.join(this.outputDir, "sync-report.json")
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))
    this.log(`Generated sync report: ${reportFile}`)

    return report
  }

  async run() {
    this.startTime = Date.now()
    this.errors = []

    try {
      this.log("=== Property Sync Started ===")

      // Sync NYC Open Data
      let nycData = null
      try {
        nycData = await this.syncNYCOpenData()
      } catch (error) {
        this.errors.push(`NYC Open Data sync failed: ${error.message}`)
      }

      // Sync external property data
      let propertyData = null
      try {
        propertyData = await this.syncPropertyData()
      } catch (error) {
        this.errors.push(`Property data sync failed: ${error.message}`)
      }

      // Generate report
      const report = await this.generateSyncReport(nycData, propertyData)

      this.log("=== Property Sync Completed ===")
      this.log(`Total records processed: ${report.summary.totalRecords}`)
      this.log(`Sync duration: ${report.performance.syncDuration}ms`)

      if (this.errors.length > 0) {
        this.log(`Errors encountered: ${this.errors.length}`)
        this.errors.forEach((error) => this.log(`  - ${error}`))
      }

      return report
    } catch (error) {
      this.log(`Fatal error during sync: ${error.message}`)
      throw error
    }
  }
}

// Run the sync if called directly
if (require.main === module) {
  const syncManager = new PropertySyncManager()

  syncManager
    .run()
    .then((report) => {
      console.log("\n✅ Property sync completed successfully!")
      console.log(`📊 Total records: ${report.summary.totalRecords}`)
      console.log(`⏱️  Duration: ${report.performance.syncDuration}ms`)
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Property sync failed:", error.message)
      process.exit(1)
    })
}

module.exports = PropertySyncManager
