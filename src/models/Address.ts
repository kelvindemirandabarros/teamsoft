import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
    },
    logradouro: {
      type: String,
      required: true,
    },
    numero: {
      type: String,
      required: true,
    },
    complemento: {
      type: String,
      required: false,
    },
    bairro: {
      type: String,
      required: true,
    },
    cidade: {
      type: String,
      required: true,
    },
    estado: {
      type: String,
      required: true,
    },
    cep: {
      type: String,
      required: true,
    },
    latitude: {
      type: String,
      required: false,
    },
    longitude: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Address =
  mongoose.models.Address || mongoose.model('Address', addressSchema);

export default Address;
