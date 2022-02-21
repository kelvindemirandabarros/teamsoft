const productionEnv = process.env.NODE_ENV === 'production';
require('dotenv').config({ path: productionEnv ? '.env' : '.env.test' });

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
    console.log('Already connected.');
    return;
  }

  if (mongoose.connections.length > 0) {
    connection.isConnected = mongoose.connections[0].readyState;

    if (connection.isConnected === 1) {
      console.log('Use previous connection.');
      return;
    }

    await mongoose.disconnect();
  }

  let mongodbUri = '';

  if (process.env.MONGODB_URI) {
    mongodbUri = process.env.MONGODB_URI;
  } else {
    const fileName =
      process.env.NODE_ENV === 'production' ? '.env' : '.env.test';
    throw new Error('MONGODB_URI está faltando no arquivo ' + fileName);
  }

  const db = await mongoose.connect(mongodbUri);

  console.log('New connection.');
  connection.isConnected = db.connections[0].readyState;
}

async function disconnect() {
  if (connection.isConnected) {
    if (process.env.NODE_ENV === 'production') {
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
