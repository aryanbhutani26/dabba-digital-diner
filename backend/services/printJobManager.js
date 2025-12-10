import { EventEmitter } from 'events';
import moment from 'moment';

class PrintJobManager extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map(); // In-memory storage (use Redis in production)
    this.completedJobs = new Map();
    this.maxCompletedJobs = 1000; // Keep last 1000 completed jobs
    this.cleanupInterval = null;
    
    this.startCleanup();
  }

  // Create a new print job
  createJob(orderId, orderNumber, printerId, type, data, priority = 1) {
    const jobId = `${orderNumber}-${type}-${Date.now()}`;
    
    const job = {
      id: jobId,
      orderId,
      orderNumber,
      printerId,
      type, // 'kitchen' or 'bill'
      data,
      priority,
      status: 'pending', // pending, processing, completed, failed, cancelled
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledFor: null, // For delayed printing
      error: null,
      metadata: {
        dataSize: Buffer.byteLength(data),
        estimatedPrintTime: this.estimatePrintTime(data)
      }
    };

    this.jobs.set(jobId, job);
    this.emit('jobCreated', job);
    
    console.log(`📋 Created print job ${jobId} for order ${orderNumber}`);
    return job;
  }

  // Update job status
  updateJobStatus(jobId, status, error = null) {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    const oldStatus = job.status;
    job.status = status;
    job.updatedAt = new Date();
    
    if (error) {
      job.error = error;
    }

    if (status === 'processing') {
      job.startedAt = new Date();
    } else if (status === 'completed') {
      job.completedAt = new Date();
      job.duration = job.startedAt ? Date.now() - job.startedAt.getTime() : null;
      
      // Move to completed jobs
      this.completedJobs.set(jobId, job);
      this.jobs.delete(jobId);
    } else if (status === 'failed') {
      job.failedAt = new Date();
      job.attempts++;
    }

    this.emit('jobStatusChanged', { job, oldStatus, newStatus: status });
    
    console.log(`📊 Job ${jobId} status: ${oldStatus} → ${status}`);
    return true;
  }

  // Get job by ID
  getJob(jobId) {
    return this.jobs.get(jobId) || this.completedJobs.get(jobId);
  }

  // Get jobs by order ID
  getJobsByOrder(orderId) {
    const activeJobs = Array.from(this.jobs.values()).filter(job => job.orderId === orderId);
    const completedJobs = Array.from(this.completedJobs.values()).filter(job => job.orderId === orderId);
    return [...activeJobs, ...completedJobs];
  }

  // Get jobs by status
  getJobsByStatus(status) {
    if (status === 'completed') {
      return Array.from(this.completedJobs.values());
    }
    return Array.from(this.jobs.values()).filter(job => job.status === status);
  }

  // Get jobs by printer
  getJobsByPrinter(printerId) {
    const activeJobs = Array.from(this.jobs.values()).filter(job => job.printerId === printerId);
    const completedJobs = Array.from(this.completedJobs.values()).filter(job => job.printerId === printerId);
    return [...activeJobs, ...completedJobs];
  }

  // Get queue statistics
  getQueueStats() {
    const activeJobs = Array.from(this.jobs.values());
    const completedJobs = Array.from(this.completedJobs.values());
    
    const stats = {
      total: activeJobs.length + completedJobs.length,
      pending: activeJobs.filter(job => job.status === 'pending').length,
      processing: activeJobs.filter(job => job.status === 'processing').length,
      completed: completedJobs.length,
      failed: activeJobs.filter(job => job.status === 'failed').length,
      cancelled: activeJobs.filter(job => job.status === 'cancelled').length,
      
      // Performance metrics
      avgProcessingTime: this.calculateAverageProcessingTime(),
      successRate: this.calculateSuccessRate(),
      
      // By printer
      byPrinter: this.getStatsByPrinter(),
      
      // Recent activity (last hour)
      recentActivity: this.getRecentActivity()
    };

    return stats;
  }

  // Calculate average processing time
  calculateAverageProcessingTime() {
    const completedJobs = Array.from(this.completedJobs.values())
      .filter(job => job.duration !== null)
      .slice(-100); // Last 100 jobs

    if (completedJobs.length === 0) return 0;

    const totalTime = completedJobs.reduce((sum, job) => sum + job.duration, 0);
    return Math.round(totalTime / completedJobs.length);
  }

  // Calculate success rate
  calculateSuccessRate() {
    const recentJobs = Array.from(this.completedJobs.values()).slice(-100);
    if (recentJobs.length === 0) return 100;

    const successful = recentJobs.filter(job => job.status === 'completed').length;
    return Math.round((successful / recentJobs.length) * 100);
  }

  // Get statistics by printer
  getStatsByPrinter() {
    const stats = {};
    const allJobs = [...Array.from(this.jobs.values()), ...Array.from(this.completedJobs.values())];

    for (const job of allJobs) {
      if (!stats[job.printerId]) {
        stats[job.printerId] = {
          total: 0,
          completed: 0,
          failed: 0,
          pending: 0,
          processing: 0
        };
      }

      stats[job.printerId].total++;
      stats[job.printerId][job.status]++;
    }

    return stats;
  }

  // Get recent activity (last hour)
  getRecentActivity() {
    const oneHourAgo = moment().subtract(1, 'hour').toDate();
    const allJobs = [...Array.from(this.jobs.values()), ...Array.from(this.completedJobs.values())];
    
    return allJobs
      .filter(job => job.createdAt >= oneHourAgo)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50);
  }

  // Estimate print time based on data size
  estimatePrintTime(data) {
    // Rough estimation: 1KB = ~100ms print time
    const sizeKB = Buffer.byteLength(data) / 1024;
    return Math.max(1000, Math.round(sizeKB * 100)); // Minimum 1 second
  }

  // Cancel a job
  cancelJob(jobId, reason = 'Cancelled by admin') {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'processing') {
      return false; // Cannot cancel processing jobs
    }

    job.status = 'cancelled';
    job.error = reason;
    job.updatedAt = new Date();
    
    this.emit('jobCancelled', job);
    console.log(`❌ Cancelled job ${jobId}: ${reason}`);
    return true;
  }

  // Retry a failed job
  retryJob(jobId) {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'failed') {
      return false;
    }

    if (job.attempts >= job.maxAttempts) {
      console.log(`⚠️ Job ${jobId} has exceeded max retry attempts`);
      return false;
    }

    job.status = 'pending';
    job.error = null;
    job.updatedAt = new Date();
    
    this.emit('jobRetried', job);
    console.log(`🔄 Retrying job ${jobId} (attempt ${job.attempts + 1}/${job.maxAttempts})`);
    return true;
  }

  // Schedule a job for later printing
  scheduleJob(jobId, scheduledFor) {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    job.scheduledFor = new Date(scheduledFor);
    job.status = 'scheduled';
    job.updatedAt = new Date();
    
    this.emit('jobScheduled', job);
    console.log(`⏰ Scheduled job ${jobId} for ${job.scheduledFor}`);
    return true;
  }

  // Get jobs ready for processing
  getReadyJobs() {
    const now = new Date();
    return Array.from(this.jobs.values())
      .filter(job => {
        if (job.status === 'pending') return true;
        if (job.status === 'scheduled' && job.scheduledFor <= now) return true;
        return false;
      })
      .sort((a, b) => {
        // Sort by priority first, then by creation time
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      });
  }

  // Batch processing for multiple orders
  createBatchJob(orders, printerId, type) {
    const batchId = `batch-${Date.now()}`;
    const jobs = [];

    for (const order of orders) {
      const job = this.createJob(
        order._id || order.orderNumber,
        order.orderNumber,
        printerId,
        type,
        order.printData, // Assume print data is pre-generated
        1 // Batch jobs have normal priority
      );
      
      job.batchId = batchId;
      jobs.push(job);
    }

    console.log(`📦 Created batch job ${batchId} with ${jobs.length} orders`);
    this.emit('batchJobCreated', { batchId, jobs });
    
    return { batchId, jobs };
  }

  // Cleanup old completed jobs
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupCompletedJobs();
    }, 60000); // Cleanup every minute
  }

  cleanupCompletedJobs() {
    if (this.completedJobs.size <= this.maxCompletedJobs) return;

    // Sort by completion time and keep only the most recent
    const sortedJobs = Array.from(this.completedJobs.entries())
      .sort(([, a], [, b]) => b.completedAt.getTime() - a.completedAt.getTime());

    // Remove oldest jobs
    const toRemove = sortedJobs.slice(this.maxCompletedJobs);
    for (const [jobId] of toRemove) {
      this.completedJobs.delete(jobId);
    }

    if (toRemove.length > 0) {
      console.log(`🧹 Cleaned up ${toRemove.length} old completed jobs`);
    }
  }

  // Export job history for analysis
  exportJobHistory(startDate, endDate, format = 'json') {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const allJobs = [...Array.from(this.jobs.values()), ...Array.from(this.completedJobs.values())];
    const filteredJobs = allJobs.filter(job => 
      job.createdAt >= start && job.createdAt <= end
    );

    if (format === 'csv') {
      return this.exportToCSV(filteredJobs);
    }

    return {
      period: { start, end },
      totalJobs: filteredJobs.length,
      jobs: filteredJobs,
      summary: this.generateSummary(filteredJobs)
    };
  }

  exportToCSV(jobs) {
    const headers = [
      'Job ID', 'Order Number', 'Printer', 'Type', 'Status',
      'Created At', 'Completed At', 'Duration (ms)', 'Attempts', 'Error'
    ];

    const rows = jobs.map(job => [
      job.id,
      job.orderNumber,
      job.printerId,
      job.type,
      job.status,
      job.createdAt.toISOString(),
      job.completedAt ? job.completedAt.toISOString() : '',
      job.duration || '',
      job.attempts,
      job.error || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  generateSummary(jobs) {
    const summary = {
      total: jobs.length,
      byStatus: {},
      byPrinter: {},
      byType: {},
      avgDuration: 0,
      successRate: 0
    };

    let totalDuration = 0;
    let completedCount = 0;

    for (const job of jobs) {
      // By status
      summary.byStatus[job.status] = (summary.byStatus[job.status] || 0) + 1;
      
      // By printer
      summary.byPrinter[job.printerId] = (summary.byPrinter[job.printerId] || 0) + 1;
      
      // By type
      summary.byType[job.type] = (summary.byType[job.type] || 0) + 1;
      
      // Duration calculation
      if (job.duration) {
        totalDuration += job.duration;
        completedCount++;
      }
    }

    summary.avgDuration = completedCount > 0 ? Math.round(totalDuration / completedCount) : 0;
    summary.successRate = jobs.length > 0 ? Math.round(((summary.byStatus.completed || 0) / jobs.length) * 100) : 0;

    return summary;
  }

  // Destroy and cleanup
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.jobs.clear();
    this.completedJobs.clear();
    this.removeAllListeners();
    
    console.log('🗑️ Print job manager destroyed');
  }
}

// Singleton instance
const printJobManager = new PrintJobManager();

export { printJobManager };