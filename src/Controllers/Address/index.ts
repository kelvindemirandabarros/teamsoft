import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';

import Db from '../../database';
import Client from '../../models/Client';
import Address from '../../models/Address';

export default {
  async create(request: Request, response: Response) {
    const { clientId } = request.body;

    const isValidId = mongoose.isValidObjectId(clientId);

    if (!isValidId) {
      return response
        .status(400)
        .json({ message: 'Este ID de Cliente não é válido.' });
    }

    const { logradouro, numero, complemento, bairro, cidade, estado, cep } =
      request.body;

    const addressSchema = Joi.object({
      logradouro: Joi.string()
        .min(5)
        .required()
        .messages({
          'string.base': `O campo 'logradouro' deve ser string.`,
          'string.min': `O campo 'logradouro' deve conter no mínimo ${5} caracteres.`,
          'any.required': `O campo 'logradouro' é obrigatório.`,
        }),
      numero: Joi.string()
        .min(1)
        .required()
        .messages({
          'string.base': `O campo 'numero' deve ser string.`,
          'string.empty': `O campo 'numero' deve conter no mínimo ${1} caracteres.`,
          'any.required': `O campo 'numero' é obrigatório.`,
        }),
      complemento: Joi.string()
        .min(3)
        .messages({
          'string.base': `O campo 'complemento' deve ser string.`,
          'string.min': `O campo 'complemento' deve conter no mínimo ${3} caracteres.`,
        }),
      bairro: Joi.string()
        .min(3)
        .required()
        .messages({
          'string.base': `O campo 'bairro' deve ser string.`,
          'string.min': `O campo 'bairro' deve conter no mínimo ${3} caracteres.`,
          'any.required': `O campo 'bairro' é obrigatório.`,
        }),
      cidade: Joi.string()
        .min(3)
        .required()
        .messages({
          'string.base': `O campo 'cidade' deve ser string.`,
          'string.min': `O campo 'cidade' deve conter no mínimo ${3} caracteres.`,
          'any.required': `O campo 'cidade' é obrigatório.`,
        }),
      estado: Joi.string()
        .min(2)
        .required()
        .messages({
          'string.base': `O campo 'estado' deve ser string.`,
          'string.min': `O campo 'estado' deve conter no mínimo ${2} caracteres.`,
          'any.required': `O campo 'estado' é obrigatório.`,
        }),
      cep: Joi.string()
        .pattern(/[0-9]{5}-[0-9]{3}/)
        .required()
        .messages({
          'string.base': `O campo 'cep' deve ser string.`,
          'string.pattern.base': `O campo 'cep' deve estar no formato XxXxX-xXx`,
          'any.required': `O campo 'cep' é obrigatório.`,
        }),
    });

    const { error } = addressSchema.validate(
      {
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
      },
      {
        abortEarly: false,
      }
    );

    if (error) {
      return response.status(400).json({
        message: 'Não foi possível adicionar o Endereço do Cliente.',
        details: error.details.map((error) => {
          return { field: error.path[0], error: error.message };
        }),
      });
    }

    try {
      await Db.connect();

      const client = await Client.findById(clientId);

      if (!client) {
        return response
          .status(400)
          .json({ message: 'Este Cliente não foi encontrado.' });
      }

      const newAddress = new Address({
        clientId,
        logradouro,
        numero,
        complemento: complemento ? complemento : '',
        bairro,
        cidade,
        estado,
        cep,
      });

      await newAddress.save();

      await Db.disconnect();

      return response.status(201).json({
        message: 'O Endereço do Cliente foi adicionado com sucesso.',
        address: newAddress,
      });
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível adicionar o Endereço do Cliente neste momento. Por favor, tente novamente em breve.',
        errorMessage: error,
      });
    }
  },

  async read(request: Request, response: Response) {
    try {
      await Db.connect();

      const addresses = await Address.find({});

      await Db.disconnect();

      return response.json({
        addresses,
      });
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível ler os Endereços dos Clientes neste momento. Por favor, tente novamente em breve.',
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
        .json({ message: 'Este ID de Endereço não é válido.' });
    }

    try {
      await Db.connect();

      const address = await Address.findById(id).exec();

      await Db.disconnect();

      if (!address) {
        return response
          .status(400)
          .json({ message: 'Este Endereço não foi encontrado.' });
      }

      return response.json(address);
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível ler o Endereço do Cliente neste momento. Por favor, tente novamente em breve.',
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
        .json({ message: 'Este ID de Endereço não é válido.' });
    }

    const { logradouro, numero, complemento, bairro, cidade, estado, cep } =
      request.body;

    const addressSchema = Joi.object({
      logradouro: Joi.string()
        .min(5)
        .messages({
          'string.base': `O campo 'logradouro' deve ser string.`,
          'string.min': `O campo 'logradouro' deve conter no mínimo ${5} caracteres.`,
        }),
      numero: Joi.string()
        .min(1)
        .messages({
          'string.base': `O campo 'numero' deve ser string.`,
          'string.empty': `O campo 'numero' deve conter no mínimo ${1} caracteres.`,
        }),
      complemento: Joi.string()
        .min(3)
        .messages({
          'string.base': `O campo 'complemento' deve ser string.`,
          'string.min': `O campo 'complemento' deve conter no mínimo ${3} caracteres.`,
        }),
      bairro: Joi.string()
        .min(3)
        .messages({
          'string.base': `O campo 'bairro' deve ser string.`,
          'string.min': `O campo 'bairro' deve conter no mínimo ${3} caracteres.`,
        }),
      cidade: Joi.string()
        .min(3)
        .messages({
          'string.base': `O campo 'cidade' deve ser string.`,
          'string.min': `O campo 'cidade' deve conter no mínimo ${3} caracteres.`,
        }),
      estado: Joi.string()
        .min(2)
        .messages({
          'string.base': `O campo 'estado' deve ser string.`,
          'string.min': `O campo 'estado' deve conter no mínimo ${2} caracteres.`,
        }),
      cep: Joi.string()
        .pattern(/[0-9]{5}-[0-9]{3}/)
        .messages({
          'string.base': `O campo 'cep' deve ser string.`,
          'string.pattern.base': `O campo 'cep' deve estar no formato XxXxX-xXx`,
        }),
    })
      .or(
        'logradouro',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'estado',
        'cep'
      )
      .messages({
        'object.missing': `Pelo menos um dos campos 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado' ou 'cep' deve conter uma informação nova.`,
      });

    const { error } = addressSchema.validate(
      {
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
      },
      {
        abortEarly: false,
      }
    );

    if (error) {
      return response.status(400).json({
        message: 'Não foi possível atualizar o Endereço do Cliente.',
        details: error.details.map((error) => {
          return { field: error.path[0] || 'Requisição', error: error.message };
        }),
      });
    }

    try {
      await Db.connect();

      const address = await Address.findById(id);

      if (!address) {
        await Db.disconnect();

        return response
          .status(400)
          .json({ message: 'Este Endereço não foi encontrado.' });
      }

      if (logradouro) {
        address.logradouro = logradouro;
      }
      if (numero) {
        address.numero = numero;
      }
      if (complemento) {
        address.complemento = complemento;
      }
      if (bairro) {
        address.bairro = bairro;
      }
      if (cidade) {
        address.cidade = cidade;
      }
      if (estado) {
        address.estado = estado;
      }
      if (cep) {
        address.cep = cep;
      }

      await address.save();

      await Db.disconnect();

      return response.status(200).json({
        message: 'O Endereço do Cliente foi atualizado com sucesso.',
      });
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível atualizar o Endereço do Cliente neste momento. Por favor, tente novamente em breve.',
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
        .json({ message: 'Este ID de Endereço não é válido.' });
    }

    try {
      await Db.connect();

      const address = await Address.findByIdAndDelete(id).exec();

      await Db.disconnect();

      if (!address) {
        return response
          .status(400)
          .json({ message: 'Este Endereço não foi encontrado.' });
      }

      return response.json({
        message: 'O Endereço do Cliente foi excluído com sucesso.',
      });
    } catch (error) {
      return response.status(500).json({
        message:
          'Não foi possível excluir o Endereço do Cliente neste momento. Por favor, tente novamente em breve.',
        errorMessage: error,
      });
    }
  },
};
