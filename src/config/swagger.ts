const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClubFacts API',
      version: '1.0.0',
      description: 'API documentation for ClubFacts Node.js project',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'user123',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
          },
          required: ['id', 'email', 'name'],
        },
        OrderItem: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              example: 'prod123',
            },
            quantity: {
              type: 'number',
              example: 2,
            },
            price: {
              type: 'number',
              format: 'float',
              example: 29.99,
            },
          },
          required: ['productId', 'quantity', 'price'],
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'ord123',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
              example: 'pending',
            },
            total: {
              type: 'number',
              format: 'float',
              example: 59.98,
            },
            items: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/OrderItem',
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
          },
          required: ['id', 'status', 'total', 'items'],
        },
        WhatsAppInstance: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'my-instance',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'disconnected'],
              example: 'active',
            },
            qrCode: {
              type: 'string',
              example: 'data:image/png;base64,...',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
          },
          required: ['name', 'status'],
        },
        WhatsAppMessage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'msg123',
            },
            instanceName: {
              type: 'string',
              example: 'my-instance',
            },
            to: {
              type: 'string',
              example: '+5511999999999',
            },
            message: {
              type: 'string',
              example: 'Hello, this is a test message',
            },
            status: {
              type: 'string',
              enum: ['sent', 'pending', 'failed', 'scheduled'],
              example: 'sent',
            },
            scheduleAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-12-12T10:00:00Z',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
          },
          required: ['id', 'instanceName', 'to', 'message', 'status'],
        },
        MessagingChannel: {
          type: 'string',
          enum: ['whatsapp_evolution', 'whatsapp_oficial', 'sms', 'email', 'telegram', 'facebook'],
          example: 'whatsapp_evolution',
          description: 'Messaging channel type',
        },
        MessagingInstanceData: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            userId: {
              type: 'string',
              example: 'user123',
            },
            channel: {
              $ref: '#/components/schemas/MessagingChannel',
            },
            channelInstanceId: {
              type: 'string',
              example: 'my-whatsapp-instance',
              description: 'Unique ID in the channel (e.g., instance name for WhatsApp)',
            },
            channelPhoneOrId: {
              type: 'string',
              example: '5585999999999',
              description: 'Phone number for WhatsApp, ID for Telegram, email for Email, etc',
            },
            status: {
              type: 'string',
              enum: ['connected', 'disconnected', 'connecting', 'error', 'pending'],
              example: 'connected',
            },
            qrCode: {
              type: 'string',
              example: 'data:image/png;base64,...',
              description: 'QR code for channels that require it (e.g., WhatsApp)',
            },
            metadata: {
              type: 'object',
              example: {},
              description: 'Channel-specific metadata',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
            lastConnectedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
          },
          required: ['id', 'userId', 'channel', 'channelInstanceId', 'channelPhoneOrId', 'status'],
        },
        MessagingMessage: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            },
            userId: {
              type: 'string',
              example: 'user123',
            },
            instanceId: {
              type: 'string',
              example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
              description: 'Reference to MessagingInstance',
            },
            channel: {
              $ref: '#/components/schemas/MessagingChannel',
            },
            remoteJid: {
              type: 'string',
              example: '5585999999999',
              description: 'Recipient (phone, ID, email, etc)',
            },
            message: {
              type: 'string',
              example: 'Hello!',
            },
            channelMessageId: {
              type: 'string',
              example: 'whatsapp-msg-id-123',
              description: 'ID generated by the channel provider',
            },
            direction: {
              type: 'string',
              enum: ['sent', 'received'],
              example: 'sent',
            },
            status: {
              type: 'string',
              enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
              example: 'sent',
            },
            mediaUrl: {
              type: 'string',
              example: 'https://example.com/image.jpg',
            },
            mediaType: {
              type: 'string',
              enum: ['image', 'audio', 'document', 'video'],
              example: 'image',
            },
            retries: {
              type: 'integer',
              example: 0,
            },
            maxRetries: {
              type: 'integer',
              example: 3,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-15T10:30:00Z',
            },
          },
          required: ['id', 'userId', 'instanceId', 'channel', 'remoteJid', 'message', 'direction', 'status'],
        },
      },
    },
  },
  apis: [
    './src/presentation/routes/*.routes.ts',
    './src/presentation/controllers/**/*.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
