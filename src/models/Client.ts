import mongoose, { Schema } from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
    },
    cnpj: {
      type: String,
      required: true,
    },
    razaoSocial: {
      type: String,
      required: true,
    },
    nomeContato: {
      type: String,
      required: true,
    },
    telefone: {
      type: String,
      required: true,
    },
    addresses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);

export default Client;
