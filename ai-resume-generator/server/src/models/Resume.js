import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

class Resume {
  constructor({
    id = uuidv4(),
    user,
    title = 'Untitled Resume',
    sections = [],
    isAIGenerated = false,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    metadata = {}
  } = {}) {
    if (!user) throw new Error('User ID (uid) is required');
    
    this.id = id;
    this.user = user; // Reference to the user who owns this resume
    this.title = title;
    this.sections = sections; // Array of section objects
    this.isAIGenerated = isAIGenerated;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.metadata = metadata; // For any additional data
  }

  // Get the resumes collection
  static getCollection() {
    if (!db) {
      throw new Error('Firestore database instance is not available');
    }
    return db.collection('resumes');
  }

  // Create a new resume
  static async create(resumeData) {
    const resume = new Resume(resumeData);
    await this.getCollection().doc(resume.id).set({
      ...resume,
      // Don't store undefined values
      ...(resume.title ? { title: resume.title } : {}),
      ...(resume.sections ? { sections: resume.sections } : { sections: [] }),
      ...(resume.metadata ? { metadata: resume.metadata } : { metadata: {} }),
      isAIGenerated: resume.isAIGenerated || false,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt
    });
    return resume;
  }

  // Find resume by ID
  static async findById(id) {
    const doc = await this.getCollection().doc(id).get();
    if (!doc.exists) return null;
    
    const data = doc.data();
    return new Resume({
      id: doc.id,
      ...data
    });
  }

  // Find resumes by user ID
  static async findByUserId(userId) {
    const snapshot = await this.getCollection()
      .where('user', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();
      
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return new Resume({
        id: doc.id,
        ...data
      });
    });
  }

  // Update resume
  async update(updateData) {
    this.updatedAt = new Date().toISOString();
    const update = {
      ...updateData,
      updatedAt: this.updatedAt
    };
    
    // Don't update these fields directly
    delete update.id;
    delete update.user;
    delete update.createdAt;
    
    await this.constructor.getCollection().doc(this.id).update(update);
    
    // Update local instance
    Object.assign(this, update);
    return this;
  }

  // Delete resume
  async delete() {
    await this.constructor.getCollection().doc(this.id).delete();
  }

  // Add a section to the resume
  async addSection(section) {
    if (!section.id) {
      section.id = uuidv4();
    }
    
    this.sections = [...(this.sections || []), section];
    await this.update({ sections: this.sections });
    return this;
  }

  // Update a section in the resume
  async updateSection(sectionId, sectionData) {
    this.sections = (this.sections || []).map(section => 
      section.id === sectionId ? { ...section, ...sectionData } : section
    );
    
    await this.update({ sections: this.sections });
    return this;
  }

  // Remove a section from the resume
  async removeSection(sectionId) {
    this.sections = (this.sections || []).filter(section => section.id !== sectionId);
    await this.update({ sections: this.sections });
    return this;
  }
}

export default Resume;
