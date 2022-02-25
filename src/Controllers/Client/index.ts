import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';

import Db from '../../database';
import Client from '../../models/Client';
import Address from '../../models/Address';

export default {
  async create(request: Request, response: Response) {
    const { cnpj, razaoSocial, nomeContato, telefone } = request.body;

    const minChar = 2;

    const clientSchema = Joi.object({
      cnpj: Joi.string()
        .pattern(/[0-9]{2}.[0-9]{3}.[0-9]{3}\/[0-9]{4}-[0-9]{2}/)
        .required()
        .messages({
          'string.base': `O campo 'cnpj' deve ser string.`,
          'string.pattern.base': `O campo 'cnpj' deve estar no formato Xx.XxX.xXx/XxXx-Xx`,
          'any.required': `O campo 'cnpj' é obrigatório.`,
        }),
      razaoSocial: Joi.string()
        .min(2)
        .required()
        .messages({
          'string.base': `O campo 'razaoSocial' deve ser string.`,
          'string.min': `O campo 'razaoSocial' deve conter no mínimo ${minChar} caracteres.`,
          'any.required': `O campo 'razaoSocial' é obrigatório.`,
        }),
      nomeContato: Joi.string()
        .min(2)
        .required()
        .messages({
          'string.base': `O campo 'nomeContato' deve ser string.`,
          'string.min': `O campo 'nomeContato' deve conter no mínimo ${minChar} caracteres.`,
          'any.required': `O campo 'nomeContato' é obrigatório.`,
        }),
      telefone: Joi.string()
        .pattern(/^\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}\-[0-9]{4}$/)
        .required()
        .messages({
          'string.base': `O campo 'telefone' deve ser string.`,
          'string.pattern.base': `O campo 'telefone' deve estar no formato (DDD) XxXx-XxXx para telefones fixos ou (DDD) 9XxXx-XxXx para celulares.`,
          'any.required': `O campo 'telefone' é obrigatório.`,
        }),
    });

    const { error } = clientSchema.validate(
      {
        cnpj,
        razaoSocial,
        nomeContato,
        telefone,
      },
      { abortEarly: false }
    );

    if (error) {
      return response.status(400).json({
        message: 'Não foi possível adicionar o Cliente.',
        details: error.details.map((error) => {
          return { field: error.path[0], error: error.message };
        }),
      });
    }

    try {
      await Db.connect();

      const cnpjAlreadyUsed = await Client.findOne({
        cnpj,
      });

      if (cnpjAlreadyUsed) {
        await Db.disconnect();

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

      return response.status(201).json({
        message: 'Cliente criado com sucesso.',
        client: newClient,
      });
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível adicionar o Cliente neste momento. Por favor, tente novamente em breve.',
        errorMessage: error,
      });
    }
  },

  async read(request: Request, response: Response) {
    try {
      await Db.connect();

      const clients = await Client.aggregate([
        {
          $lookup: {
            from: 'addresses',
            localField: '_id',
            foreignField: 'clientId',
            as: 'addresses',
          },
        },
      ]);

      await Db.disconnect();

      return response.json({
        clients,
      });
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível ler os Clientes neste momento. Por favor, tente novamente em breve.',
        errorMessage: error,
      });
    }
  },

  async readOne(request: Request, response: Response) {
    const { id } = request.params;

    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      return response
        .status(400)
        .json({ message: 'Este ID de Cliente não é válido.' });
    }

    try {
      await Db.connect();

      const clients = await Client.aggregate([
        {
          $lookup: {
            from: 'addresses',
            localField: '_id',
            foreignField: 'clientId',
            as: 'addresses',
          },
        },
      ]);

      const client = clients.find((client) => {
        return client._id.toString() === id;
      });

      // const client = await Client.findById(id);
      // await client.populate('addresses');

      if (!client) {
        await Db.disconnect();

        return response
          .status(400)
          .json({ message: 'Este Cliente não foi encontrado.' });
      }

      await Db.disconnect();

      return response.json(client);
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível ler o Cliente neste momento. Por favor, tente novamente em breve.',
        errorMessage: error,
      });
    }
  },

  async update(request: Request, response: Response) {
    const { id } = request.params;

    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      return response
        .status(400)
        .json({ message: 'Este ID de Cliente não é válido.' });
    }

    const { cnpj, razaoSocial, nomeContato, telefone } = request.body;

    const minChar = 2;

    const clientSchema = Joi.object({
      cnpj: Joi.string()
        .pattern(/[0-9]{2}.[0-9]{3}.[0-9]{3}\/[0-9]{4}-[0-9]{2}/)
        .messages({
          'string.base': `O campo 'cnpj' deve ser string.`,
          'string.pattern.base': `O campo 'cnpj' deve estar no formato Xx.XxX.xXx/XxXx-Xx`,
        }),
      razaoSocial: Joi.string()
        .min(2)
        .messages({
          'string.base': `O campo 'razaoSocial' deve ser string.`,
          'string.min': `O campo 'razaoSocial' deve conter no mínimo ${minChar} caracteres.`,
        }),
      nomeContato: Joi.string()
        .min(2)
        .messages({
          'string.base': `O campo 'nomeContato' deve ser string.`,
          'string.min': `O campo 'nomeContato' deve conter no mínimo ${minChar} caracteres.`,
        }),
      telefone: Joi.string()
        .pattern(/^\([1-9]{2}\) (?:[2-8]|9[1-9])[0-9]{3}\-[0-9]{4}$/)
        .messages({
          'string.base': `O campo 'telefone' deve ser string.`,
          'string.pattern.base': `O campo 'telefone' deve estar no formato (DDD) XxXx-XxXx para telefones fixos ou (DDD) 9XxXx-XxXx para celulares.`,
        }),
    })
      .or('cnpj', 'razaoSocial', 'nomeContato', 'telefone')
      .messages({
        'object.missing': `Pelo menos um dos campos 'cnpj', 'razaoSocial', 'nomeContato' ou 'telefone' deve conter uma informação nova.`,
      });

    const { error } = clientSchema.validate(
      {
        cnpj,
        razaoSocial,
        nomeContato,
        telefone,
      },
      { abortEarly: false }
    );

    if (error) {
      return response.status(400).json({
        message: 'Não foi possível atualizar o Cliente.',
        details: error.details.map((error) => {
          return { field: error.path[0] || 'Requisição', error: error.message };
        }),
      });
    }

    try {
      await Db.connect();

      const client = await Client.findById(id).exec();

      if (!client) {
        await Db.disconnect();

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

      return response.json({
        message: 'O Cliente foi atualizado com sucesso.',
      });
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível atualizar o Cliente neste momento. Por favor, tente novamente em breve.',
        errorMessage: error,
      });
    }
  },

  async delete(request: Request, response: Response) {
    const { id } = request.params;

    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      return response
        .status(400)
        .json({ message: 'Este ID de Cliente não é válido.' });
    }

    try {
      await Db.connect();

      const client = await Client.findByIdAndDelete(id).exec();

      const addresses = await Address.find({ clientId: id });
      if (addresses) {
        await Address.deleteMany({ clientId: id });
      }

      await Db.disconnect();

      if (!client) {
        return response
          .status(400)
          .json({ message: 'Este Cliente não foi encontrado.' });
      }

      return response.json({ message: 'O Cliente foi excluído com sucesso.' });
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível excluir o Cliente neste momento. Por favor, tente novamente em breve.',
        errorMessage: error,
      });
    }
  },
};
