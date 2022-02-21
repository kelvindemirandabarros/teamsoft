import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);

export default Client;
