import { admin } from '../config/firebase.js';
import bcrypt from 'bcryptjs';

const db = admin.firestore();
const auth = admin.auth();

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Define the collection name
const USERS_COLLECTION = 'users';

class User {
  constructor({ 
    uid,
    email, 
    displayName = '',
    photoURL = '',
    role = 'user',
    password,
    passwordHash,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
    resumeIds = []
  } = {}) {
    if (!uid) throw new Error('User ID (uid) is required');
    if (!email) throw new Error('Email is required');
    
    this.uid = uid;
    this.email = email;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.role = role;
    this.password = password; // Only used temporarily during creation/update
    this.passwordHash = passwordHash; // This is what gets stored in the database
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.resumeIds = resumeIds;
  }

  // Get the users collection
  static getCollection() {
    const collection = db.collection(USERS_COLLECTION);
    if (!collection) {
      throw new Error('Failed to get users collection');
    }
    return collection;
  }

  // Get user by ID
  static async getById(uid) {
    try {
      const userDoc = await this.getCollection().doc(uid).get();
      if (!userDoc.exists) {
        return null;
      }
      
      return new User({
        uid,
        ...userDoc.data()
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Match user password
  async matchPassword(enteredPassword) {
    if (!this.passwordHash) {
      console.error('No password hash found for user');
      return false;
    }
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  }

  // Create a new user
  static async create(userData) {
    const user = new User(userData);
    
    // Hash password if provided
    if (user.password) {
      user.passwordHash = await hashPassword(user.password);
      delete user.password; // Don't store the plain password
    }

    const userDataToSave = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: user.role,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      resumeIds: user.resumeIds || []
    };

    await this.getCollection().doc(user.uid).set(userDataToSave);
    return user;
  }

  // Find user by a specific field
  static async findOne(query) {
    try {
      console.log('Finding user with query:', JSON.stringify(query));
      
      if (!query || typeof query !== 'object') {
        throw new Error('Invalid query object');
      }
      
      let querySnapshot;
      
      if (query.uid) {
        // If querying by UID, we can use the document ID directly
        const doc = await this.getCollection().doc(query.uid).get();
        if (!doc.exists) {
          console.log(`No user found with UID: ${query.uid}`);
          return null;
        }
        return new User({ uid: doc.id, ...doc.data() });
      } else if (query.email) {
        // If querying by email, we need to query the collection
        querySnapshot = await this.getCollection()
          .where('email', '==', query.email.toLowerCase().trim())
          .limit(1)
          .get();
      } else {
        throw new Error('Unsupported query. Must provide uid or email');
      }
      
      if (querySnapshot.empty) {
        console.log('No matching user found for query:', query);
        return null;
      }
      
      // Get the first matching document
      const doc = querySnapshot.docs[0];
      return new User({ uid: doc.id, ...doc.data() });
    } catch (error) {
      console.error('Error in User.findOne:', error);
      throw error;
    }
  }
  
  // Find user by UID
  static async findById(uid) {
    try {
      console.log(`Looking up user with UID: ${uid}`);
      
      if (!uid) {
        console.error('No UID provided to findById');
        return null;
      }
      
      const doc = await this.getCollection().doc(uid).get();
      
      if (!doc.exists) {
        console.log(`No user found with UID: ${uid}`);
        return null;
      }
      
      const data = doc.data();
      console.log('Retrieved user data:', data);
      
      const user = new User({ 
        uid: doc.id, 
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role || 'user',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        resumeIds: data.resumeIds || []
      });
      
      console.log('Created user instance:', user);
      return user;
      
    } catch (error) {
      console.error('Error in findById:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      if (!email) {
        console.error('No email provided to findByEmail');
        return null;
      }
      
      console.log('Searching for user with email:', email);
      const collection = this.getCollection();
      
      // Find by email (case-insensitive)
      const query = collection.where('email', '==', email.toLowerCase().trim()).limit(1);
      console.log('Query created, executing...');
      
      const snapshot = await query.get();
      console.log('Query executed, snapshot:', {
        empty: snapshot.empty,
        size: snapshot.size,
        exists: !snapshot.empty
      });
      
      if (snapshot.empty) {
        console.log('No user found with email:', email);
        return null;
      }
      
      // Get the first matching user (should only be one due to email uniqueness)
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      console.log('Retrieved user data by email:', data);
      
      return new User({
        uid: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: data.role || 'user',
        passwordHash: data.passwordHash,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        resumeIds: data.resumeIds || []
      });
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw error;
    }
  }

  // Create or update user from Firebase auth
  static async fromFirebaseUser(firebaseUser) {
    let user = await this.findById(firebaseUser.uid);
    
    if (!user) {
      // Create new user
      user = new this({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        photoURL: firebaseUser.photoURL || '',
        role: 'user'
      });
      await user.save();
    } else {
      // Update existing user with latest Firebase data
      const updates = {};
      if (firebaseUser.email && user.email !== firebaseUser.email) updates.email = firebaseUser.email;
      if (firebaseUser.displayName && user.displayName !== firebaseUser.displayName) updates.displayName = firebaseUser.displayName;
      if (firebaseUser.photoURL && user.photoURL !== firebaseUser.photoURL) updates.photoURL = firebaseUser.photoURL;
      
      if (Object.keys(updates).length > 0) {
        Object.assign(user, updates);
        await user.save();
      }
    }
    
    return user;
  }

  // Save user
  async save() {
    this.updatedAt = new Date().toISOString();
    
    // Hash password if it was updated
    if (this.password) {
      this.passwordHash = await hashPassword(this.password);
      delete this.password; // Don't store the plain password
    }

    const userDataToSave = {
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      role: this.role,
      passwordHash: this.passwordHash,
      updatedAt: this.updatedAt,
      resumeIds: this.resumeIds || []
    };

    await this.constructor.getCollection().doc(this.uid).set(userDataToSave, { merge: true });
    return this;
  }

  // Update user
  async update(updateData) {
    this.updatedAt = new Date().toISOString();
    const update = {
      ...updateData,
      updatedAt: this.updatedAt
    };
    
    // Don't update these fields directly
    delete update.uid;
    delete update.email;
    delete update.createdAt;
    
    await this.constructor.getCollection().doc(this.uid).update(update);
    
    // Update local instance
    Object.assign(this, update);
    return this;
  }

  // Delete user
  async delete() {
    await this.constructor.getCollection().doc(this.uid).delete();
  }

  // Add resume ID to user
  async addResumeId(resumeId) {
    if (!this.resumeIds.includes(resumeId)) {
      this.resumeIds = [...this.resumeIds, resumeId];
      await this.constructor.getCollection().doc(this.uid).update({
        resumeIds: this.resumeIds,
        updatedAt: new Date().toISOString()
      });
    }
    return this;
  }
}

export default User;