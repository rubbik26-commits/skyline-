#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { performance } = require("perf_hooks")

class PerformanceMonitorScript {
  constructor() {
    this.metricsFile = path.join(process.cwd(), "logs", "performance-metrics.json")
    this.reportFile = path.join(process.cwd(), "logs", "performance-report.html")
    this.startTime = performance.now()
    this.metrics = {
      timestamp: new Date().toISOString(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuUsage: process.cpuUsage(),
        memoryUsage: process.memoryUsage(),
      },
      build: {
        buildTime: process.env.VERCEL_BUILD_TIME || "unknown",
        cacheHit: !!process.env.VERCEL_CACHE_HIT,
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID || "local",
      },
      performance: {
        startTime: this.startTime,
        measurements: [],
      },
    }
  }

  log(message) {
    const timestamp = new Date().toISOString()
    console.log(`[v0] [${timestamp}] ${message}`)
  }

  measureTask(taskName, taskFn) {
    const start = performance.now()
    this.log(`Starting task: ${taskName}`)

    try {
      const result = taskFn()
      const end = performance.now()
      const duration = end - start

      this.metrics.performance.measurements.push({
        task: taskName,
        duration,
        success: true,
        timestamp: new Date().toISOString(),
      })

      this.log(`Completed task: ${taskName} (${duration.toFixed(2)}ms)`)
      return result
    } catch (error) {
      const end = performance.now()
      const duration = end - start

      this.metrics.performance.measurements.push({
        task: taskName,
        duration,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })

      this.log(`Failed task: ${taskName} (${duration.toFixed(2)}ms) - ${error.message}`)
      throw error
    }
  }

  async measureAsyncTask(taskName, taskFn) {
    const start = performance.now()
    this.log(`Starting async task: ${taskName}`)

    try {
      const result = await taskFn()
      const end = performance.now()
      const duration = end - start

      this.metrics.performance.measurements.push({
        task: taskName,
        duration,
        success: true,
        timestamp: new Date().toISOString(),
      })

      this.log(`Completed async task: ${taskName} (${duration.toFixed(2)}ms)`)
      return result
    } catch (error) {
      const end = performance.now()
      const duration = end - start

      this.metrics.performance.measurements.push({
        task: taskName,
        duration,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      })

      this.log(`Failed async task: ${taskName} (${duration.toFixed(2)}ms) - ${error.message}`)
      throw error
    }
  }

  analyzeFileSystem() {
    return this.measureTask("File System Analysis", () => {
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        directories: [],
        largeFiles: [],
      }

      const scanDirectory = (dir, relativePath = "") => {
        try {
          const items = fs.readdirSync(dir)

          items.forEach((item) => {
            const fullPath = path.join(dir, item)
            const itemRelativePath = path.join(relativePath, item)

            try {
              const stat = fs.statSync(fullPath)

              if (stat.isDirectory()) {
                if (!item.startsWith(".") && item !== "node_modules") {
                  stats.directories.push({
                    path: itemRelativePath,
                    size: stat.size,
                  })
                  scanDirectory(fullPath, itemRelativePath)
                }
              } else {
                stats.totalFiles++
                stats.totalSize += stat.size

                if (stat.size > 1024 * 1024) {
                  // Files larger than 1MB
                  stats.largeFiles.push({
                    path: itemRelativePath,
                    size: stat.size,
                    sizeFormatted: `${(stat.size / 1024 / 1024).toFixed(2)}MB`,
                  })
                }
              }
            } catch (error) {
              // Skip files we can't read
            }
          })
        } catch (error) {
          // Skip directories we can't read
        }
      }

      scanDirectory(process.cwd())

      stats.totalSizeFormatted = `${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`
      return stats
    })
  }

  analyzeDependencies() {
    return this.measureTask("Dependency Analysis", () => {
      try {
        const packageJsonPath = path.join(process.cwd(), "package.json")
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

        const deps = packageJson.dependencies || {}
        const devDeps = packageJson.devDependencies || {}

        return {
          totalDependencies: Object.keys(deps).length,
          totalDevDependencies: Object.keys(devDeps).length,
          dependencies: deps,
          devDependencies: devDeps,
          scripts: packageJson.scripts || {},
        }
      } catch (error) {
        return { error: error.message }
      }
    })
  }

  generateReport() {
    const totalDuration = performance.now() - this.startTime

    this.metrics.performance.totalDuration = totalDuration
    this.metrics.performance.endTime = performance.now()

    // Calculate summary statistics
    const measurements = this.metrics.performance.measurements
    const successfulTasks = measurements.filter((m) => m.success)
    const failedTasks = measurements.filter((m) => !m.success)

    this.metrics.summary = {
      totalTasks: measurements.length,
      successfulTasks: successfulTasks.length,
      failedTasks: failedTasks.length,
      averageDuration:
        successfulTasks.length > 0
          ? successfulTasks.reduce((sum, m) => sum + m.duration, 0) / successfulTasks.length
          : 0,
      totalDuration,
    }

    return this.metrics
  }

  saveMetrics() {
    const logsDir = path.dirname(this.metricsFile)
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }

    fs.writeFileSync(this.metricsFile, JSON.stringify(this.metrics, null, 2))
    this.log(`Metrics saved to: ${this.metricsFile}`)
  }

  generateHTMLReport() {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - ${this.metrics.timestamp}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #495057; }
        .metric-label { color: #6c757d; font-size: 0.9em; margin-top: 5px; }
        .task-list { margin: 20px 0; }
        .task-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #e9ecef; }
        .task-success { color: #28a745; }
        .task-error { color: #dc3545; }
        .section { margin: 30px 0; }
        .section h2 { color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
        pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Report</h1>
            <p>Generated: ${this.metrics.timestamp}</p>
            <p>Total Duration: ${this.metrics.summary.totalDuration.toFixed(2)}ms</p>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Summary</h2>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value">${this.metrics.summary.totalTasks}</div>
                        <div class="metric-label">Total Tasks</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value task-success">${this.metrics.summary.successfulTasks}</div>
                        <div class="metric-label">Successful</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value task-error">${this.metrics.summary.failedTasks}</div>
                        <div class="metric-label">Failed</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">${this.metrics.summary.averageDuration.toFixed(2)}ms</div>
                        <div class="metric-label">Average Duration</div>
                    </div>
                </div>
            </div>
            
            <div class="section">
                <h2>⚡ Task Performance</h2>
                <div class="task-list">
                    ${this.metrics.performance.measurements
                      .map(
                        (task) => `
                        <div class="task-item">
                            <span class="${task.success ? "task-success" : "task-error"}">
                                ${task.success ? "✅" : "❌"} ${task.task}
                            </span>
                            <span>${task.duration.toFixed(2)}ms</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
            
            <div class="section">
                <h2>💻 System Information</h2>
                <pre>${JSON.stringify(this.metrics.system, null, 2)}</pre>
            </div>
            
            <div class="section">
                <h2>🏗️ Build Information</h2>
                <pre>${JSON.stringify(this.metrics.build, null, 2)}</pre>
            </div>
        </div>
    </div>
</body>
</html>
    `

    fs.writeFileSync(this.reportFile, html)
    this.log(`HTML report generated: ${this.reportFile}`)
  }

  async run() {
    try {
      this.log("=== Performance Monitoring Started ===")

      // Analyze file system
      const fsStats = this.analyzeFileSystem()
      this.metrics.fileSystem = fsStats

      // Analyze dependencies
      const depStats = this.analyzeDependencies()
      this.metrics.dependencies = depStats

      // Simulate some performance tests
      await this.measureAsyncTask("Simulated API Call", async () => {
        return new Promise((resolve) => setTimeout(resolve, Math.random() * 100))
      })

      this.measureTask("JSON Processing", () => {
        const largeObject = { data: new Array(10000).fill(0).map((_, i) => ({ id: i, value: Math.random() })) }
        return JSON.stringify(largeObject)
      })

      // Generate final report
      const report = this.generateReport()
      this.saveMetrics()
      this.generateHTMLReport()

      this.log("=== Performance Monitoring Completed ===")
      this.log(`📊 Total tasks: ${report.summary.totalTasks}`)
      this.log(`✅ Successful: ${report.summary.successfulTasks}`)
      this.log(`❌ Failed: ${report.summary.failedTasks}`)
      this.log(`⏱️  Total duration: ${report.summary.totalDuration.toFixed(2)}ms`)

      return report
    } catch (error) {
      this.log(`Fatal error during performance monitoring: ${error.message}`)
      throw error
    }
  }
}

// Run the monitor if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitorScript()

  monitor
    .run()
    .then((report) => {
      console.log("\n✅ Performance monitoring completed successfully!")
      console.log(`📊 Tasks completed: ${report.summary.successfulTasks}/${report.summary.totalTasks}`)
      console.log(`⏱️  Total duration: ${report.summary.totalDuration.toFixed(2)}ms`)
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Performance monitoring failed:", error.message)
      process.exit(1)
    })
}

module.exports = PerformanceMonitorScript
