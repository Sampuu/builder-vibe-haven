import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  orderBy, 
  writeBatch,
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { HelpRequest } from '@shared/types';
import { firebaseDb } from './firebase-db';

/**
 * Firebase Backup and Recovery System for HelpRequests Collection
 * Ensures data persistence and provides recovery mechanisms
 */
export class FirebaseBackupService {
  private static readonly BACKUP_COLLECTION = 'helpRequests_backup';
  private static readonly HELP_REQUESTS_COLLECTION = 'helpRequests';

  /**
   * Create a backup of all help requests
   */
  static async backupHelpRequests(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      console.log('📦 Starting helpRequests backup...');
      
      // Get all help requests
      const q = query(
        collection(db, this.HELP_REQUESTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const helpRequests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        backupTimestamp: serverTimestamp()
      }));

      if (helpRequests.length === 0) {
        return { success: true, message: 'No help requests found to backup', count: 0 };
      }

      // Create backup documents
      const batch = writeBatch(db);
      helpRequests.forEach(request => {
        const backupRef = doc(collection(db, this.BACKUP_COLLECTION));
        batch.set(backupRef, request);
      });

      await batch.commit();

      console.log(`✅ Backup completed: ${helpRequests.length} help requests backed up`);
      return { 
        success: true, 
        message: `Successfully backed up ${helpRequests.length} help requests`,
        count: helpRequests.length
      };
    } catch (error) {
      console.error('❌ Backup failed:', error);
      return { 
        success: false, 
        message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Restore help requests from backup
   */
  static async restoreHelpRequests(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      console.log('🔄 Starting helpRequests restoration...');
      
      // Get backup data
      const backupQuery = query(
        collection(db, this.BACKUP_COLLECTION),
        orderBy('backupTimestamp', 'desc')
      );
      
      const backupSnapshot = await getDocs(backupQuery);
      
      if (backupSnapshot.empty) {
        return { success: false, message: 'No backup data found' };
      }

      // Filter unique help requests (latest backup of each)
      const backupData = new Map();
      backupSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.id && !backupData.has(data.id)) {
          backupData.set(data.id, data);
        }
      });

      // Check existing help requests to avoid duplicates
      const existingQuery = query(collection(db, this.HELP_REQUESTS_COLLECTION));
      const existingSnapshot = await getDocs(existingQuery);
      const existingIds = new Set(existingSnapshot.docs.map(doc => doc.id));

      // Restore non-existing help requests
      const batch = writeBatch(db);
      let restoredCount = 0;

      backupData.forEach((requestData, originalId) => {
        if (!existingIds.has(originalId)) {
          // Remove backup-specific fields
          const { backupTimestamp, ...cleanData } = requestData;
          delete cleanData.id; // Remove id so Firestore generates a new one
          
          const restoreRef = doc(collection(db, this.HELP_REQUESTS_COLLECTION));
          batch.set(restoreRef, {
            ...cleanData,
            restoredAt: serverTimestamp(),
            restoredFromBackup: true
          });
          restoredCount++;
        }
      });

      if (restoredCount === 0) {
        return { success: true, message: 'All help requests already exist, no restoration needed' };
      }

      await batch.commit();

      console.log(`✅ Restoration completed: ${restoredCount} help requests restored`);
      return { 
        success: true, 
        message: `Successfully restored ${restoredCount} help requests`,
        count: restoredCount
      };
    } catch (error) {
      console.error('❌ Restoration failed:', error);
      return { 
        success: false, 
        message: `Restoration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get backup statistics
   */
  static async getBackupStats(): Promise<{
    helpRequestsCount: number;
    backupCount: number;
    lastBackup?: Date;
  }> {
    try {
      // Count current help requests
      const helpRequestsSnapshot = await getDocs(collection(db, this.HELP_REQUESTS_COLLECTION));
      const helpRequestsCount = helpRequestsSnapshot.size;

      // Count backup entries
      const backupSnapshot = await getDocs(collection(db, this.BACKUP_COLLECTION));
      const backupCount = backupSnapshot.size;

      // Get last backup timestamp
      let lastBackup: Date | undefined;
      if (!backupSnapshot.empty) {
        const latestBackup = query(
          collection(db, this.BACKUP_COLLECTION),
          orderBy('backupTimestamp', 'desc')
        );
        const latestSnapshot = await getDocs(latestBackup);
        if (!latestSnapshot.empty) {
          const timestamp = latestSnapshot.docs[0].data().backupTimestamp;
          lastBackup = timestamp?.toDate();
        }
      }

      return {
        helpRequestsCount,
        backupCount,
        lastBackup
      };
    } catch (error) {
      console.error('Failed to get backup stats:', error);
      return {
        helpRequestsCount: 0,
        backupCount: 0
      };
    }
  }

  /**
   * Create sample help requests for testing
   */
  static async createSampleData(): Promise<{ success: boolean; message: string; count?: number }> {
    try {
      const sampleRequests: Omit<HelpRequest, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          userId: 'sample-user-1',
          type: 'medical',
          urgency: 'high',
          description: 'Need immediate medical assistance for elderly person with chest pain',
          location: '123 Main Street, Downtown',
          contactPhone: '+1-555-0101',
          status: 'submitted',
          specialRequests: 'Please bring oxygen tank'
        },
        {
          userId: 'sample-user-2', 
          type: 'supplies',
          urgency: 'medium',
          description: 'Running low on food and water after storm damage',
          location: '456 Oak Avenue, Riverside',
          contactPhone: '+1-555-0102',
          status: 'acknowledged'
        },
        {
          userId: 'sample-user-3',
          type: 'transport',
          urgency: 'critical',
          description: 'Pregnant woman needs immediate transport to hospital',
          location: '789 Pine Road, Hillside',
          contactPhone: '+1-555-0103', 
          status: 'in-progress',
          estimatedArrival: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
        }
      ];

      let createdCount = 0;
      for (const requestData of sampleRequests) {
        const result = await firebaseDb.helpRequests.create(requestData);
        if (result.success) {
          createdCount++;
        }
      }

      return {
        success: true,
        message: `Created ${createdCount} sample help requests`,
        count: createdCount
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create sample data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Automatic backup scheduler (call this periodically)
   */
  static async scheduleAutoBackup(): Promise<void> {
    const BACKUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
    
    setInterval(async () => {
      console.log('🔄 Running scheduled backup...');
      await this.backupHelpRequests();
    }, BACKUP_INTERVAL);
  }

  /**
   * Verify collection integrity
   */
  static async verifyCollectionIntegrity(): Promise<{
    isValid: boolean;
    issues: string[];
    helpRequestsCount: number;
  }> {
    const issues: string[] = [];
    let helpRequestsCount = 0;

    try {
      // Check if helpRequests collection exists and is accessible
      const helpRequestsSnapshot = await getDocs(collection(db, this.HELP_REQUESTS_COLLECTION));
      helpRequestsCount = helpRequestsSnapshot.size;

      if (helpRequestsCount === 0) {
        issues.push('HelpRequests collection is empty');
      }

      // Check for required fields in documents
      let invalidDocuments = 0;
      helpRequestsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const requiredFields = ['userId', 'type', 'urgency', 'description', 'location', 'contactPhone', 'status'];
        
        for (const field of requiredFields) {
          if (!data[field]) {
            invalidDocuments++;
            break;
          }
        }
      });

      if (invalidDocuments > 0) {
        issues.push(`${invalidDocuments} documents have missing required fields`);
      }

      return {
        isValid: issues.length === 0,
        issues,
        helpRequestsCount
      };
    } catch (error) {
      issues.push(`Collection access error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        isValid: false,
        issues,
        helpRequestsCount: 0
      };
    }
  }
}

export default FirebaseBackupService;
