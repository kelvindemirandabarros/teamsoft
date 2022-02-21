import { Request, Response } from 'express';
import mongoose from 'mongoose';

import Db from '../database';
import Client from '../models/Client';

export default {
  async create(request: Request, response: Response) {
    const { cnpj, razaoSocial, nomeContato, telefone } = request.body;

    await Db.connect();

    const cnpjAlreadyUsed = await Client.findOne({
      cnpj,
    });

    if (cnpjAlreadyUsed) {
      return response.status(400).json({
        message: 'Este CNPJ já foi cadastrado.',
      });
    }

    const newClient = new Client({
      cnpj,
      razaoSocial,
      nomeContato,
      telefone,
    });

    await newClient.save();

    await Db.disconnect();

    return response.json({
      message: 'Cliente criado com sucesso.',
    });
  },

  async read(request: Request, response: Response) {
    await Db.connect();

    const clients = await Client.find({});

    await Db.disconnect();

    return response.json({
      clients,
    });
  },

  async readOne(request: Request, response: Response) {
    const { id } = request.params;

    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      return response
        .status(400)
        .json({ message: 'Este ID de Client não é válido.' });
    }

    await Db.connect();

    const client = await Client.findById(id).exec();

    await Db.disconnect();

    if (!client) {
      return response
        .status(400)
        .json({ message: 'Este Cliente não foi encontrado.' });
    }

    return response.json(client);
  },

  async update(request: Request, response: Response) {
    const { id } = request.params;

    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      return response
        .status(400)
        .json({ message: 'Este ID de Client não é válido.' });
    }

    const { cnpj, razaoSocial, nomeContato, telefone } = request.body;

    await Db.connect();

    const client = await Client.findById(id).exec();

    if (!client) {
      return response
        .status(400)
        .json({ message: 'Este Cliente não foi encontrado.' });
    }

    if (cnpj) {
      client.cnpj = cnpj;
    }
    if (razaoSocial) {
      client.razaoSocial = razaoSocial;
    }
    if (nomeContato) {
      client.nomeContato = nomeContato;
    }
    if (telefone) {
      client.telefone = telefone;
    }

    await client.save();

    await Db.disconnect();

    return response.json({ message: 'O Cliente foi atualizado com sucesso.' });
  },

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      return response
        .status(400)
        .json({ message: 'Este ID de Client não é válido.' });
    }

    await Db.connect();

    const client = await Client.findByIdAndDelete(id).exec();

    await Db.disconnect();

    if (!client) {
      return response
        .status(400)
        .json({ message: 'Este Cliente não foi encontrado.' });
    }

    return response.json({ message: 'O Cliente foi excluído com sucesso.' });
  },
};
