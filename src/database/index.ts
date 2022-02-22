const isProductionEnv = process.env.NODE_ENV === 'production';
require('dotenv').config({ path: isProductionEnv ? '.env' : '.env.test' });

import mongoose, { Document } from 'mongoose';

interface IConnection {
  isConnected: number;
}

interface ExtendedDoc extends Document {
  createdAt: any;
  updatedAt: any;
}

const connection: IConnection = {
  isConnected: 0,
};

async function connect() {
  if (connection.isConnected) {
    // console.log('Already connected.');
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;

    if (connection.isConnected === 1) {
      // console.log('Use previous connection.');
      return;
    }

    await mongoose.disconnect();
  }

  let mongodbUri = '';

  if (process.env.NODE_ENV === 'development' && process.env.MONGODB_URI) {
    mongodbUri = process.env.MONGODB_URI;
  } else if (process.env.NODE_ENV === 'test' && process.env.MONGODB_URI_TESTS) {
    mongodbUri = process.env.MONGODB_URI_TESTS;
  } else {
    const fileName =
      process.env.NODE_ENV === 'production' ? '.env' : '.env.test';
    const varName =
      process.env.NODE_ENV === 'test' ? 'MONGODB_URI_TESTS' : 'MONGODB_URI';
    throw new Error(varName + ' está faltando no arquivo ' + fileName);
  }

  const db = await mongoose.connect(mongodbUri);

  connection.isConnected = db.connections[0].readyState;
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV !== 'development') {
      await mongoose.disconnect();

      connection.isConnected = 0;
    } else {
      console.log('Development environment. Not need to disconnect.');
    }
  }
}

function convertDocToObject(doc: ExtendedDoc) {
  doc._id = doc._id.toString();
  doc.createdAt = doc.createdAt.toString();
  doc.updatedAt = doc.updatedAt.toString();
  return doc;
}

const db = { connect, disconnect, convertDocToObject };

export default db;
